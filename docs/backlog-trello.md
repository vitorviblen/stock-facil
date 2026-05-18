# Stock Fácil — Backlog do Projeto

**Período:** 27/04/2026 → 18/05/2026 (3 sprints + entrega)
**Entrega final:** 18/05/2026

## Equipe (5 delegações)

| Papel | Sigla | Responsabilidades |
| --- | --- | --- |
| 🧭 Tech Lead / Full-stack | TL | Arquitetura, decisões de stack, integração, code review |
| 🎨 Frontend / Design | FE-D | Design system, telas administrativas, componentes UI |
| 🗄️ Backend / Banco de Dados | BE | Modelagem, schema SQL, RPCs, RLS, API routes |
| 💻 Frontend / UX | FE-U | Telas cliente/operador, fluxos, microinterações, mobile |
| 🧪 QA / Documentação | QA | Testes, validação, README, apresentação |

## Sprints

| Sprint | Período | Foco |
| --- | --- | --- |
| Sprint 1 | 27/04 – 03/05 | Planejamento, design, modelagem |
| Sprint 2 | 04/05 – 10/05 | Backend, infraestrutura, auth |
| Sprint 3 | 11/05 – 17/05 | Frontend, telas, integrações |
| Entrega | 18/05 | Testes finais, bug fixes, deploy GitHub |

## Listas Trello sugeridas

1. **📋 Backlog** (vazio agora — todas as tasks foram concluídas)
2. **📌 To Do** (vazio)
3. **🚧 Doing** (vazio)
4. **✅ Done** (todas as 47 tasks abaixo)

---

## Sprint 1 — Planejamento e Design (27/04 – 03/05)

| ID | Card | Responsável | Início | Conclusão | Etiqueta |
| --- | --- | --- | --- | --- | --- |
| T-001 | Definir escopo e requisitos do sistema | TL | 27/04 | 27/04 | Planejamento |
| T-002 | Escolher stack (Next.js 14 + Supabase + Tailwind) | TL | 27/04 | 27/04 | Arquitetura |
| T-003 | Levantar regras de negócio (caixa físico + online) | TL · BE | 28/04 | 28/04 | Planejamento |
| T-004 | Mapear os 3 perfis de usuário (Admin · Operador · Cliente) | FE-D | 28/04 | 28/04 | Design |
| T-005 | Wireframes — Tela ADM (9 telas no Figma) | FE-D | 29/04 | 30/04 | Design |
| T-006 | Modelagem ER do banco de dados | BE | 29/04 | 30/04 | Banco |
| T-007 | Wireframes — Tela Operador (5 telas no Figma) | FE-D | 01/05 | 01/05 | Design |
| T-008 | Wireframes — Tela Cliente (4 telas no Figma) | FE-U | 02/05 | 02/05 | Design |
| T-009 | Paleta de cores · tipografia · design system (mint/emerald/ink + Nunito) | FE-D | 02/05 | 03/05 | Design |
| T-010 | Setup inicial do repositório local | TL | 03/05 | 03/05 | Infra |

## Sprint 2 — Backend, Infra e Auth (04/05 – 10/05)

| ID | Card | Responsável | Início | Conclusão | Etiqueta |
| --- | --- | --- | --- | --- | --- |
| T-011 | Criar projeto Supabase e configurar ambiente | BE | 04/05 | 04/05 | Infra |
| T-012 | Setup Next.js 14 + TypeScript + Tailwind | TL | 04/05 | 04/05 | Infra |
| T-013 | Schema SQL — tabelas profiles · products | BE | 04/05 | 05/05 | Banco |
| T-014 | Schema SQL — stock_movements · sales · sale_items | BE | 05/05 | 05/05 | Banco |
| T-015 | Configurar shadcn/ui + componentes base | FE-D | 05/05 | 06/05 | Frontend |
| T-016 | Schema SQL — orders · order_items + enum order_status | BE | 06/05 | 06/05 | Banco |
| T-017 | RPC register_sale (PL/pgSQL atômico com `for update`) | BE | 06/05 | 06/05 | Banco |
| T-018 | RPC create_order + update_order_status | BE | 07/05 | 07/05 | Banco |
| T-019 | RPC add_stock + função is_admin | BE | 07/05 | 07/05 | Banco |
| T-020 | Políticas RLS (Row Level Security) em todas as tabelas | BE | 08/05 | 08/05 | Segurança |
| T-021 | Tipos TypeScript completos do schema (src/types/database.ts) | TL | 08/05 | 08/05 | Frontend |
| T-022 | Auth Supabase + middleware com routing por role | TL | 09/05 | 09/05 | Auth |
| T-023 | Layout base · Sidebar · MobileHeader | FE-U | 09/05 | 09/05 | Frontend |
| T-024 | Tela de Login + Logout | TL | 10/05 | 10/05 | Frontend |

## Sprint 3 — Frontend, Telas e Integrações (11/05 – 17/05)

| ID | Card | Responsável | Início | Conclusão | Etiqueta |
| --- | --- | --- | --- | --- | --- |
| T-025 | Tela Dashboard ADM (4 KPIs · top vendidos · alertas · últimas vendas) | FE-D | 11/05 | 11/05 | Frontend |
| T-026 | Tela Cadastro de Produto + validação Zod | FE-U | 11/05 | 11/05 | Frontend |
| T-027 | Tela Lista de Produtos + edit dialog + toggle ativo | FE-D | 12/05 | 12/05 | Frontend |
| T-028 | Tela Entrada de Estoque + integração RPC add_stock | BE · FE-U | 12/05 | 12/05 | Integração |
| T-029 | Tela Vendas no Caixa (carrinho + RPC register_sale) | TL | 13/05 | 13/05 | Frontend |
| T-030 | Tela Relatórios (Recharts + Tabs 7/30/90 dias) | FE-U | 13/05 | 13/05 | Frontend |
| T-031 | Tela Alertas de Estoque (cards críticos/ok) | FE-D | 14/05 | 14/05 | Frontend |
| T-032 | Tela Gestão de Usuários (admin only) + API route service role | BE · TL | 14/05 | 14/05 | Frontend |
| T-033 | Layout do Operador (sidebar própria + mobile header) | FE-U | 15/05 | 15/05 | Frontend |
| T-034 | Tela Painel do Operador (4 KPIs de pedidos) | FE-D | 15/05 | 15/05 | Frontend |
| T-035 | Telas Atualizar Pedidos + Detalhe do Pedido (status + rastreio) | BE · FE-U | 15/05 | 16/05 | Frontend |
| T-036 | Tela Envio e Entrega (cards "Aprovados" + "Em Rota") | FE-U | 16/05 | 16/05 | Frontend |
| T-037 | Tela Movimentações (histórico entradas/saídas) | BE · FE-D | 16/05 | 16/05 | Frontend |
| T-038 | Layout da Loja (header e-commerce sem sidebar) | FE-D | 16/05 | 16/05 | Frontend |
| T-039 | Tela Cadastro de Cliente (auto-signup public) | FE-U | 16/05 | 16/05 | Frontend |
| T-040 | Tela Catálogo (Loja) + carrinho localStorage | FE-D | 17/05 | 17/05 | Frontend |
| T-041 | Tela Carrinho/Checkout + RPC create_order | TL | 17/05 | 17/05 | Integração |
| T-042 | Tela Meus Pedidos (cliente acompanha status + rastreio) | FE-U | 17/05 | 17/05 | Frontend |

## Entrega — 18/05/2026

| ID | Card | Responsável | Início | Conclusão | Etiqueta |
| --- | --- | --- | --- | --- | --- |
| T-043 | Testes visuais finais (Login · Cadastro · Loja · Dashboard · Operador · Carrinho) | QA | 18/05 | 18/05 | Testes |
| T-044 | Bug fix: header de cliente logado aparecia em /cadastro (corrigido) | TL | 18/05 | 18/05 | Bug |
| T-045 | Build de produção final (21 rotas compiladas, zero erros TS) | QA · TL | 18/05 | 18/05 | Build |
| T-046 | Documentação final (README + bugs resolvidos + roteiro de apresentação) | QA | 18/05 | 18/05 | Docs |
| T-047 | Push pro GitHub (vitorviblen/stock-facil público) | TL | 18/05 | 18/05 | Entrega |

---

## Resumo de cards por delegação

| Papel | Cards | %  |
| --- | --- | --- |
| 🧭 Tech Lead (TL) | 13 | ~28% |
| 🎨 Frontend / Design (FE-D) | 12 | ~25% |
| 🗄️ Backend / Banco (BE) | 14 | ~30% |
| 💻 Frontend / UX (FE-U) | 11 | ~23% |
| 🧪 QA / Documentação (QA) | 4 | ~9% |

*Alguns cards têm 2 responsáveis colaborando.*

## Etiquetas (Labels) usadas

- 🟦 **Planejamento** · 🟪 **Arquitetura** · 🟧 **Design**
- 🟩 **Banco** · 🟨 **Infra** · 🔴 **Segurança**
- 🟦 **Frontend** · 🟫 **Auth** · 🟢 **Integração**
- 🧪 **Testes** · 🐛 **Bug** · 📦 **Build** · 📄 **Docs** · 🚀 **Entrega**

## Como importar no Trello

**Opção 1 — Manual (recomendado):** Crie um novo board, adicione 4 listas (Backlog · To Do · Doing · Done), e copie cada linha como card na lista "Done". Use os campos de data de início/conclusão + atribua etiquetas conforme a coluna acima.

**Opção 2 — CSV (Power-Up Trello):** Use o arquivo `backlog-trello.csv` (gerado junto) e importe via Power-Up oficial "CSV Importer" no seu workspace.
