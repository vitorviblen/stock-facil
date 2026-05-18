# Stock Fácil

Sistema acadêmico de controle de estoque e vendas. Trabalho de faculdade do **Vitor Bessa Nunes**.

## Stack

- **Framework:** Next.js 14 (App Router) + TypeScript
- **UI:** Tailwind CSS + shadcn/ui (componentes manuais) + Lucide icons
- **Backend:** Supabase (Postgres + Auth + Row Level Security)
- **Charts:** Recharts
- **Forms:** react-hook-form + Zod
- **Notifications:** Sonner
- **Fonte:** Nunito

## Paleta

| Cor | Hex | Uso |
| --- | --- | --- |
| Stock Mint | `#00FFC3` | Destaque, botões primários, badges |
| Stock Emerald | `#00AD85` | Acentos, totais positivos, bordas |
| Stock Ink | `#051923` | Sidebar, fundos dark |
| Destructive | vermelho | Alertas críticos, estoque baixo |

## Funcionalidades

- ✅ **Login** com Supabase Auth
- ✅ **Dashboard** com KPIs (faturamento, vendas, ticket médio, estoque crítico) e top produtos
- ✅ **Cadastro de Produtos** com validação e geração automática de código (`#01`, `#02`...)
- ✅ **Lista de Produtos** com toggle ativo/inativo, edição via dialog, destaque pra estoque baixo
- ✅ **Entrada de Estoque** com RPC atômica `add_stock` (atualiza qtd + cria movimento)
- ✅ **Registro de Vendas** com carrinho local + RPC atômica `register_sale` (cria venda + itens + baixa estoque + movimentação)
- ✅ **Relatórios** com gráfico de área (Recharts) + filtros 7/30/90 dias + KPIs
- ✅ **Alertas de Estoque** com cards críticos + saudáveis + botão "Repor"
- ✅ **Gestão de Usuários** (admin only) — cria operadores/admins via API route com service role
- ✅ **Layout responsivo** — sidebar fixo em desktop, drawer em mobile

## Configuração inicial

### 1. Instalar dependências

```bash
cd /Users/vitor_vbn/stock
npm install
```

### 2. Criar projeto Supabase

1. Vá em [supabase.com](https://supabase.com) → New project (free tier)
2. Anote a `URL` e as `anon key` / `service_role key` (Settings → API)
3. Abra **SQL Editor**, cole o conteúdo de `supabase/schema.sql` e rode

### 3. Configurar variáveis de ambiente

Copie `.env.example` para `.env.local`:

```bash
cp .env.example .env.local
```

E preencha:

```
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<sua-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<sua-service-role-key>
```

> ⚠️ A `SERVICE_ROLE_KEY` é só usada no server (route handler de criação de usuários). Nunca exponha no client.

### 4. Criar primeiro usuário admin

Como o cadastro fica trancado por admin, o primeiro precisa ser criado direto no Supabase:

1. Authentication → Users → Add user → email + senha
2. SQL Editor → rode:

```sql
update profiles set role = 'admin' where email = 'seu-email@empresa.com';
```

### 5. Rodar

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) → será redirecionado para `/login` → entra e vai pro Dashboard.

## Estrutura

```
src/
├── app/
│   ├── (app)/              # rotas autenticadas (com Sidebar)
│   │   ├── layout.tsx      # Sidebar + MobileHeader
│   │   ├── dashboard/
│   │   ├── produtos/
│   │   │   └── novo/
│   │   ├── estoque/entrada/
│   │   ├── vendas/
│   │   ├── relatorios/
│   │   ├── alertas/
│   │   └── usuarios/
│   ├── api/users/route.ts  # POST cria usuário via admin SDK
│   ├── login/page.tsx
│   ├── layout.tsx          # root (fonte + toaster)
│   └── globals.css
├── components/
│   ├── ui/                 # shadcn (Button, Card, Dialog, Table...)
│   ├── layout/             # Sidebar, MobileHeader
│   ├── products/           # ProductsTable, EditProductDialog
│   ├── stock/              # EntradaForm
│   ├── sales/              # VendasForm
│   ├── reports/            # RelatoriosView (com Recharts)
│   └── users/              # UsersView
├── lib/
│   ├── supabase/
│   │   ├── client.ts       # browser client
│   │   ├── server.ts       # server component / route handler
│   │   └── middleware.ts   # auth redirect
│   └── utils.ts            # cn, formatCurrency, formatDate
├── types/database.ts       # tipos do schema Supabase
└── middleware.ts           # roteamento auth
```

## Segurança

- **RLS** habilitado em todas as tabelas — segurança no banco, não só no front
- **Função `is_admin()`** SECURITY DEFINER pra checks de permissão
- **RPC atômicas** (`register_sale`, `add_stock`) garantem ACID — venda + baixa de estoque + auditoria acontecem juntas ou nada acontece
- **Auditoria completa** em `stock_movements` — toda entrada/saída fica registrada com user_id e timestamp
- **Service role key** só usada no server (`/api/users`), nunca no client

## Apresentação na faculdade — 3 pontos pra destacar

1. **Row Level Security (RLS)** — segurança aplicada no Postgres com policies declarativas, não só no front. Padrão de produção.
2. **Transações atômicas** — `register_sale()` em PL/pgSQL com `for update` garante que estoque, venda e movimentação são consistentes mesmo com concorrência.
3. **Auditoria** — `stock_movements` registra cada operação com `user_id` + `reference_id` + `notes`, permitindo trilha completa.

## Entrega

Pra trabalho acadêmico: subir no GitHub e demonstrar localmente com `npm run dev`. Sem deploy em cloud.

## Escopo

O Figma original tem **3 perfis** (Tela ADM, Tela Operador, Tela Cliente). Este projeto implementa **somente a Tela ADM** (9 telas / backoffice administrativo). As outras 2 são iterações futuras — o schema do banco já suporta (basta adicionar `orders` + rotas).
