# Stock Fácil — Roteiro de Apresentação

> Trabalho de faculdade · Sistema de controle de estoque, vendas e pedidos
> Equipe: 5 papéis (TL · FE-D · BE · FE-U · QA)
> Entrega: 18/05/2026

## ✅ Checklist antes da apresentação

### A — No dia anterior (em casa, com notebook)

- [ ] Criar projeto no Supabase ([supabase.com](https://supabase.com))
- [ ] Copiar **URL** + **anon key** + **service_role key** (Project Settings → API)
- [ ] SQL Editor → cola `supabase/schema.sql` → Run
- [ ] Criar 3 usuários em Authentication → Add user:
  - `admin@teste.com` / senha `123456`
  - `op@teste.com` / senha `123456`
  - `cliente@teste.com` / senha `123456`
- [ ] SQL Editor — promover papéis:
  ```sql
  update profiles set role='admin'    where email='admin@teste.com';
  update profiles set role='operator' where email='op@teste.com';
  update profiles set role='cliente'  where email='cliente@teste.com';
  ```
- [ ] SQL Editor — popular produtos:
  ```sql
  insert into products (name, cost_price, sale_price, quantity, min_stock) values
    ('Arroz Tio Urbano 5kg', 18.50, 28.00, 100, 10),
    ('Feijão Carioca 1kg', 4.50, 7.00, 58, 20),
    ('Leite Integral 1L', 3.20, 5.50, 42, 25),
    ('Óleo de Soja 900ml', 5.20, 8.50, 95, 15),
    ('Açúcar Cristal 1kg', 2.80, 4.20, 5, 10),
    ('Café Pilão 500g', 12.00, 15.90, 30, 10);
  ```
- [ ] **Deploy na Vercel** (instruções abaixo) com as 3 env vars
- [ ] Testar a URL pública: login com `cliente@teste.com` → loja → finalizar compra
- [ ] Anotar a URL final num papel (caso o computador da faculdade não abra Google)

### B — No dia da apresentação (sem notebook)

- [ ] Levar URL anotada (ex: `https://stock-facil.vercel.app`)
- [ ] Levar as 3 credenciais anotadas (admin/op/cliente)
- [ ] Pendrive com README + screenshots (backup se cair internet)
- [ ] Link do GitHub: `github.com/vitorviblen/stock-facil`
- [ ] Link do Trello: `trello.com/b/d50qDezI/stock-fácil`

## 🚀 Deploy na Vercel (3 min)

### Opção 1 — Via web (sem terminal)

1. Entra em [vercel.com](https://vercel.com) → "Sign up with GitHub" (login com vitorviblen)
2. "Add New Project" → seleciona `stock-facil`
3. Em **Environment Variables**, adiciona as 3:
   - `NEXT_PUBLIC_SUPABASE_URL` = sua URL Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = sua anon key
   - `SUPABASE_SERVICE_ROLE_KEY` = sua service_role key
4. Clica **Deploy** → espera 2 min
5. Vai aparecer URL tipo `stock-facil-vitorviblen.vercel.app` ✅

### Opção 2 — Via CLI (mais rápido se já tem terminal)

```bash
cd /Users/vitor_vbn/stock
npx vercel
# segue as perguntas: link to existing project? No
# project name? stock-facil
# directory? ./
# settings? No

# Adicionar envs
npx vercel env add NEXT_PUBLIC_SUPABASE_URL
npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
npx vercel env add SUPABASE_SERVICE_ROLE_KEY

# Deploy produção
npx vercel --prod
```

## 🎤 Roteiro de demonstração (8-10 min)

### Slide 0 — Abertura (30s)

> "Apresento o **Stock Fácil**, um sistema de controle de estoque, vendas e pedidos online. O sistema tem 3 perfis de usuário: administrador, operador logístico e cliente final. Tudo integrado num só banco de dados."

### Slide 1 — Mostra o repositório no GitHub (1 min)

Abre `github.com/vitorviblen/stock-facil`:

- "São **21 telas funcionando** em produção"
- "Stack profissional: **Next.js 14 + TypeScript + Supabase + Tailwind**"
- "O README documenta tudo, incluindo 3 pontos técnicos importantes"
- Bate o olho no Trello (47 cards) pra mostrar gestão de projeto

### Slide 2 — Demo ao vivo (5 min) — **abre a URL Vercel**

**Cliente faz pedido** (1:30 min)
1. Entra com `cliente@teste.com` / `123456`
2. Vai pra `/loja` → mostra os 6 produtos com badges (Em estoque, Últimas unidades, Esgotado)
3. Adiciona 2 produtos no carrinho
4. Vai pra `/carrinho` → preenche endereço → escolhe **SEDEX** → "Finalizar"
5. Redireciona pra `/meus-pedidos` → status **Pendente**

> "O cliente acabou de fazer o pedido. **O estoque já foi reservado no banco** — se outro cliente tentar comprar o mesmo produto, não vai conseguir."

**Operador despacha** (1:30 min)
1. Sair → entra com `op@teste.com` / `123456`
2. Vai automaticamente pra `/operador` → mostra os 4 KPIs (1 pendente)
3. Clica em `/operador/pedidos` → vê o pedido novo
4. Clica em "Atualizar" → muda status pra **Aprovado** → Salvar
5. Volta → muda pra **Em rota** + adiciona código `BR123456789BR` → Salvar

> "Cada mudança fica registrada no histórico — auditoria completa de quem fez o quê e quando."

**Admin vê o panorama** (1 min)
1. Sair → entra com `admin@teste.com` / `123456`
2. Dashboard mostra os KPIs do dia
3. Vai em `/alertas` → mostra **Açúcar Cristal** crítico (5 un, mínimo 10) com botão "Repor"
4. Vai em `/relatorios` → gráfico Recharts com Tabs 7/30/90 dias

**Cliente vê atualização** (30s)
1. Sair → entra com `cliente@teste.com`
2. `/meus-pedidos` → status agora é **Em rota** + código de rastreio aparece

> "Tudo em tempo real, sem precisar atualizar a página da pra ver — o cliente já tem a info do operador."

### Slide 3 — Os 3 diferenciais técnicos (2 min)

**1. Segurança no banco mesmo (RLS)**
> "A regra de que cliente só vê os próprios pedidos não está só na tela — está dentro do Postgres. Mesmo que alguém tente acessar a API direto, o banco não retorna. Isso é padrão de empresa de verdade."

**2. Transações atômicas**
> "Quando uma venda acontece, três coisas precisam rolar: criar a venda, baixar o estoque, registrar no histórico. A função `register_sale` faz as 3 juntas. Se uma falhar, nenhuma acontece. Garante consistência do banco."

**3. Auditoria completa**
> "Toda entrada e saída do estoque fica registrada na tabela `stock_movements` com: produto, tipo (entrada/saída), quantidade, quem fez, data e referência (qual venda gerou). Dá pra rastrear tudo."

### Slide 4 — Encerramento (30s)

> "O sistema rodou estável durante toda a demonstração. Todas as 21 rotas compilaram sem erros, e o Trello mostra as 47 tarefas que distribuímos entre os 5 papéis em 3 sprints."

> "Repositório: github.com/vitorviblen/stock-facil"

## ⚠️ Plano B se algo falhar

| Problema | Solução |
| --- | --- |
| Vercel fora do ar | Mostra screenshots do README + projeto no GitHub |
| Supabase fora do ar | Idem |
| Sem internet | Mostra códigos no GitHub (cache do navegador funciona) + Trello |
| Esqueceu a senha | `admin@teste.com` / `op@teste.com` / `cliente@teste.com` — todas senha `123456` |

## 📋 Cola rápida pra levar

```
URL:    https://stock-facil-vitorviblen.vercel.app  (anote a real)
GitHub: github.com/vitorviblen/stock-facil
Trello: trello.com/b/d50qDezI

Admin:    admin@teste.com    / 123456
Operador: op@teste.com       / 123456
Cliente:  cliente@teste.com  / 123456

Demo: Cliente compra → Operador despacha → Admin vê dashboard → Cliente vê status atualizado
```
