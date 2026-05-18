# Integração de Pagamento — Exemplo (não implementado)

Esse arquivo é só **documentação de onde a integração de pagamento entraria** no Stock Fácil. Não foi implementada porque:

1. Sistema é acadêmico (controle de estoque, não e-commerce)
2. Complexidade alta (webhook, idempotência, reconciliação)
3. Sem necessidade real pra trabalho de faculdade

Mas a arquitetura **suporta** integração futura. Aqui vai o esqueleto pra Cakto (gateway brasileiro que o Vitor já usa em outros projetos).

## Fluxo proposto

```
Cliente termina venda em /vendas
        ↓
[Stock Fácil] Cria sale com status="pending"
        ↓
[Stock Fácil] Chama POST api.cakto.com.br/orders → recebe checkout_url
        ↓
Cliente paga no checkout Cakto (PIX/cartão)
        ↓
[Cakto webhook] POST /api/webhooks/cakto → atualiza sale.status="paid"
        ↓
[Stock Fácil] Só AGORA roda register_sale() pra baixar estoque
```

## Schema adicional (não aplicado)

```sql
-- Adicionar à tabela sales:
alter table sales add column status text not null default 'paid';
alter table sales add column external_order_id text;  -- ID na Cakto
alter table sales add column payment_method text;     -- pix, credit_card

-- Tabela de webhooks recebidos (auditoria + idempotência):
create table payment_webhooks (
  id uuid primary key default gen_random_uuid(),
  provider text not null,            -- 'cakto', 'stripe', etc
  event_id text not null,            -- ID único do webhook
  event_type text not null,          -- 'order.paid', 'order.cancelled'
  payload jsonb not null,
  processed_at timestamptz,
  created_at timestamptz default now(),
  unique(provider, event_id)         -- evita processar 2x
);
```

## Route handler exemplo

```ts
// src/app/api/webhooks/cakto/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export async function POST(request: Request) {
  const signature = request.headers.get("x-cakto-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 401 });
  }

  // 1. Validar assinatura HMAC (Cakto envia hash do payload + secret)
  const body = await request.text();
  const expected = await hmacSha256(body, process.env.CAKTO_WEBHOOK_SECRET!);
  if (signature !== expected) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(body);

  // 2. Idempotência: salva no banco antes de processar
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error: insertError } = await supabase
    .from("payment_webhooks")
    .insert({
      provider: "cakto",
      event_id: event.id,
      event_type: event.type,
      payload: event,
    });

  if (insertError?.code === "23505") {
    // duplicado — já processamos, retorna OK
    return NextResponse.json({ ok: true, duplicated: true });
  }

  // 3. Processar evento
  switch (event.type) {
    case "order.paid":
      // Aqui chama register_sale() pra baixar estoque + criar movimento
      // (a venda já estava criada com status='pending')
      break;

    case "order.cancelled":
      // Marca sale como cancelada
      break;
  }

  return NextResponse.json({ ok: true });
}

async function hmacSha256(data: string, secret: string): Promise<string> {
  // ... implementação com crypto.subtle (Web Crypto API)
  return "";
}
```

## Por que não foi implementado

Cada um desses tópicos é uma sessão inteira:

- ⚠️ Validação de assinatura HMAC (cada gateway é diferente)
- ⚠️ Tratamento de retry do webhook (gateways reentregam se receberem 5xx)
- ⚠️ Reconciliação (e se o webhook nunca chegou?)
- ⚠️ Refund / cancelamento parcial
- ⚠️ Múltiplos métodos (PIX, cartão, boleto têm fluxos diferentes)
- ⚠️ Testes (sandbox da Cakto requer conta + setup)

Pra trabalho acadêmico, o `register_sale()` rodando direto (sem pagamento) é didaticamente equivalente. Pra produção, daria um sprint dedicado.

## Referências (Cakto)

- Vitor tem 2 contas Cakto ([[../../../cofre-openclaw/projects/stock-facil-faculdade/index|index]] do projeto)
- Auto-memory: `reference_cakto_api.md` — OAuth2 + 14 webhooks + endpoints
- Documentação oficial: developers.cakto.com.br (procurar no inbox/Notion)
