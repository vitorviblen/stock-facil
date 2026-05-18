-- ============================================================================
-- STOCK FÁCIL - Schema do Banco de Dados (Supabase)
-- ============================================================================
-- Pra rodar: vá em Supabase > SQL Editor > cole tudo > Run
-- ============================================================================

-- 1) Profiles (estende auth.users com papel/perfil)
create type user_role as enum ('admin', 'operator', 'cliente');

create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  email text not null,
  role user_role not null default 'operator',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Trigger: cria profile automaticamente quando user faz signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'operator')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- 2) Produtos
create table products (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  cost_price numeric(10,2) not null default 0,
  sale_price numeric(10,2) not null default 0,
  quantity integer not null default 0,
  min_stock integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Sequência para code automático (#01, #02...)
create sequence product_code_seq start 1;
create or replace function set_product_code()
returns trigger as $$
begin
  if new.code is null or new.code = '' then
    new.code := '#' || lpad(nextval('product_code_seq')::text, 2, '0');
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_set_product_code
  before insert on products
  for each row execute procedure set_product_code();

-- 3) Movimentações de Estoque (histórico audita-tudo)
create type movement_type as enum ('in', 'out', 'adjustment');

create table stock_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete restrict,
  type movement_type not null,
  quantity integer not null check (quantity > 0),
  user_id uuid not null references auth.users(id),
  reference_id uuid,           -- ex: id da venda
  notes text,
  created_at timestamptz not null default now()
);

create index idx_movements_product on stock_movements(product_id);
create index idx_movements_created on stock_movements(created_at desc);

-- 4) Vendas
create table sales (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  total numeric(10,2) not null default 0,
  created_at timestamptz not null default now()
);

create table sale_items (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references sales(id) on delete cascade,
  product_id uuid not null references products(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  unit_price numeric(10,2) not null,
  subtotal numeric(10,2) not null
);

create index idx_sale_items_sale on sale_items(sale_id);
create index idx_sales_created on sales(created_at desc);

-- 5) Função: registrar venda atomicamente (atualiza estoque + cria movimento)
create or replace function register_sale(
  p_user_id uuid,
  p_items jsonb        -- [{ product_id, quantity, unit_price }, ...]
)
returns uuid as $$
declare
  v_sale_id uuid;
  v_total numeric(10,2) := 0;
  v_item jsonb;
  v_product_id uuid;
  v_quantity integer;
  v_unit_price numeric(10,2);
  v_subtotal numeric(10,2);
  v_current_stock integer;
begin
  -- Cria venda
  insert into sales (user_id, total) values (p_user_id, 0) returning id into v_sale_id;

  -- Processa itens
  for v_item in select * from jsonb_array_elements(p_items) loop
    v_product_id := (v_item->>'product_id')::uuid;
    v_quantity := (v_item->>'quantity')::integer;
    v_unit_price := (v_item->>'unit_price')::numeric(10,2);
    v_subtotal := v_quantity * v_unit_price;

    -- Verifica estoque
    select quantity into v_current_stock from products where id = v_product_id for update;
    if v_current_stock < v_quantity then
      raise exception 'Estoque insuficiente para o produto %', v_product_id;
    end if;

    -- Cria item
    insert into sale_items (sale_id, product_id, quantity, unit_price, subtotal)
    values (v_sale_id, v_product_id, v_quantity, v_unit_price, v_subtotal);

    -- Baixa estoque
    update products set quantity = quantity - v_quantity, updated_at = now() where id = v_product_id;

    -- Registra movimento
    insert into stock_movements (product_id, type, quantity, user_id, reference_id, notes)
    values (v_product_id, 'out', v_quantity, p_user_id, v_sale_id, 'Venda');

    v_total := v_total + v_subtotal;
  end loop;

  -- Atualiza total da venda
  update sales set total = v_total where id = v_sale_id;
  return v_sale_id;
end;
$$ language plpgsql security definer;

-- 6) Pedidos online (Cliente cria, Operador atualiza)
create type order_status as enum ('pending', 'approved', 'shipped', 'delivered', 'cancelled');

create table orders (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,                  -- ex: #1042
  customer_id uuid not null references auth.users(id),
  operator_id uuid references auth.users(id), -- quem está cuidando
  status order_status not null default 'pending',
  total numeric(10,2) not null default 0,
  shipping_address text,
  shipping_method text,                       -- 'PAC', 'SEDEX', etc
  tracking_code text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create sequence order_code_seq start 1000;
create or replace function set_order_code()
returns trigger as $$
begin
  if new.code is null or new.code = '' then
    new.code := '#' || nextval('order_code_seq')::text;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_set_order_code
  before insert on orders
  for each row execute procedure set_order_code();

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid not null references products(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  unit_price numeric(10,2) not null,
  subtotal numeric(10,2) not null
);

create index idx_orders_customer on orders(customer_id);
create index idx_orders_status on orders(status);
create index idx_orders_created on orders(created_at desc);
create index idx_order_items_order on order_items(order_id);

-- 6.1) Função: criar pedido a partir do carrinho do cliente
create or replace function create_order(
  p_customer_id uuid,
  p_items jsonb,
  p_shipping_address text,
  p_shipping_method text default 'PAC'
)
returns uuid as $$
declare
  v_order_id uuid;
  v_total numeric(10,2) := 0;
  v_item jsonb;
  v_product_id uuid;
  v_quantity integer;
  v_unit_price numeric(10,2);
  v_subtotal numeric(10,2);
  v_current_stock integer;
begin
  insert into orders (customer_id, total, shipping_address, shipping_method, status)
  values (p_customer_id, 0, p_shipping_address, p_shipping_method, 'pending')
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_product_id := (v_item->>'product_id')::uuid;
    v_quantity := (v_item->>'quantity')::integer;

    -- Pega preço atual do produto (não confia no client)
    select sale_price, quantity into v_unit_price, v_current_stock
    from products where id = v_product_id for update;

    if v_current_stock < v_quantity then
      raise exception 'Estoque insuficiente para o produto %', v_product_id;
    end if;

    v_subtotal := v_quantity * v_unit_price;

    insert into order_items (order_id, product_id, quantity, unit_price, subtotal)
    values (v_order_id, v_product_id, v_quantity, v_unit_price, v_subtotal);

    -- Reserva o estoque (baixa imediata)
    update products set quantity = quantity - v_quantity, updated_at = now()
    where id = v_product_id;

    insert into stock_movements (product_id, type, quantity, user_id, reference_id, notes)
    values (v_product_id, 'out', v_quantity, p_customer_id, v_order_id, 'Pedido online');

    v_total := v_total + v_subtotal;
  end loop;

  update orders set total = v_total where id = v_order_id;
  return v_order_id;
end;
$$ language plpgsql security definer;

-- 6.2) Função: operador atualiza status do pedido
create or replace function update_order_status(
  p_order_id uuid,
  p_status order_status,
  p_operator_id uuid,
  p_tracking_code text default null
)
returns void as $$
begin
  update orders
  set status = p_status,
      operator_id = p_operator_id,
      tracking_code = coalesce(p_tracking_code, tracking_code),
      updated_at = now()
  where id = p_order_id;
end;
$$ language plpgsql security definer;

-- 7) Função: adicionar entrada de estoque
create or replace function add_stock(
  p_product_id uuid,
  p_quantity integer,
  p_user_id uuid,
  p_notes text default null
)
returns void as $$
begin
  update products set quantity = quantity + p_quantity, updated_at = now() where id = p_product_id;
  insert into stock_movements (product_id, type, quantity, user_id, notes)
  values (p_product_id, 'in', p_quantity, p_user_id, coalesce(p_notes, 'Entrada manual'));
end;
$$ language plpgsql security definer;

-- ============================================================================
-- RLS (Row Level Security) - segurança no banco
-- ============================================================================

alter table profiles enable row level security;
alter table products enable row level security;
alter table stock_movements enable row level security;
alter table sales enable row level security;
alter table sale_items enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- Helper: checa se user é admin
create or replace function is_admin()
returns boolean as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$ language sql stable security definer;

-- Profiles: todos veem, só admin edita
create policy "profiles_select_all" on profiles for select using (auth.uid() is not null);
create policy "profiles_insert_admin" on profiles for insert with check (is_admin());
create policy "profiles_update_admin" on profiles for update using (is_admin());

-- Products: autenticados leem; admin e operator escrevem
create policy "products_select_all" on products for select using (auth.uid() is not null);
create policy "products_insert_auth" on products for insert with check (auth.uid() is not null);
create policy "products_update_auth" on products for update using (auth.uid() is not null);

-- Stock movements: autenticados leem/escrevem
create policy "movements_select_all" on stock_movements for select using (auth.uid() is not null);
create policy "movements_insert_auth" on stock_movements for insert with check (auth.uid() is not null);

-- Sales
create policy "sales_select_all" on sales for select using (auth.uid() is not null);
create policy "sales_insert_auth" on sales for insert with check (auth.uid() is not null);
create policy "sale_items_select_all" on sale_items for select using (auth.uid() is not null);
create policy "sale_items_insert_auth" on sale_items for insert with check (auth.uid() is not null);

-- Orders: cliente vê os próprios; admin/operador veem todos
create policy "orders_select_own_or_staff" on orders for select using (
  auth.uid() = customer_id
  or exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'operator'))
);
create policy "orders_insert_self" on orders for insert with check (auth.uid() = customer_id);
create policy "orders_update_staff" on orders for update using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'operator'))
);

create policy "order_items_select_via_order" on order_items for select using (
  exists (
    select 1 from orders o
    where o.id = order_items.order_id
    and (o.customer_id = auth.uid() or exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'operator')))
  )
);
create policy "order_items_insert_auth" on order_items for insert with check (auth.uid() is not null);

-- ============================================================================
-- Seed de exemplo (opcional)
-- ============================================================================
insert into products (name, cost_price, sale_price, quantity, min_stock) values
  ('Arroz Tio Urbano 5kg', 18.50, 28.00, 100, 10),
  ('Óleo de Soja 900ml', 5.20, 8.50, 95, 15),
  ('Feijão Carioca 1Kg', 4.50, 7.00, 58, 20),
  ('Leite Integral 1L', 3.20, 5.50, 42, 25);
