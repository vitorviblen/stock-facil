// Dados mockados para apresentação sem Supabase real.
// Quando NEXT_PUBLIC_DEMO_MODE=1, o app usa esses dados.

import type {
  Profile,
  Product,
  StockMovement,
  Sale,
  SaleItem,
  Order,
  OrderItem,
} from "@/types/database";

export const demoProfiles: Profile[] = [
  {
    id: "demo-admin",
    full_name: "Administrador Demo",
    email: "admin@teste.com",
    role: "admin",
    active: true,
    created_at: "2026-05-01T10:00:00.000Z",
  },
  {
    id: "demo-operator",
    full_name: "Operador Demo",
    email: "op@teste.com",
    role: "operator",
    active: true,
    created_at: "2026-05-02T10:00:00.000Z",
  },
  {
    id: "demo-cliente",
    full_name: "Maria Silva",
    email: "cliente@teste.com",
    role: "cliente",
    active: true,
    created_at: "2026-05-10T14:00:00.000Z",
  },
];

export const demoProducts: Product[] = [
  { id: "p1", code: "#01", name: "Arroz Tio Urbano 5kg", cost_price: 18.5, sale_price: 28.0, quantity: 100, min_stock: 10, active: true, created_at: "2026-05-01T10:00:00Z", updated_at: "2026-05-17T10:00:00Z" },
  { id: "p2", code: "#02", name: "Feijão Carioca 1kg", cost_price: 4.5, sale_price: 7.0, quantity: 58, min_stock: 20, active: true, created_at: "2026-05-01T10:00:00Z", updated_at: "2026-05-17T10:00:00Z" },
  { id: "p3", code: "#03", name: "Leite Integral 1L", cost_price: 3.2, sale_price: 5.5, quantity: 42, min_stock: 25, active: true, created_at: "2026-05-01T10:00:00Z", updated_at: "2026-05-17T10:00:00Z" },
  { id: "p4", code: "#04", name: "Óleo de Soja 900ml", cost_price: 5.2, sale_price: 8.5, quantity: 95, min_stock: 15, active: true, created_at: "2026-05-01T10:00:00Z", updated_at: "2026-05-17T10:00:00Z" },
  { id: "p5", code: "#05", name: "Açúcar Cristal 1kg", cost_price: 2.8, sale_price: 4.2, quantity: 5, min_stock: 10, active: true, created_at: "2026-05-01T10:00:00Z", updated_at: "2026-05-17T10:00:00Z" },
  { id: "p6", code: "#06", name: "Café Pilão 500g", cost_price: 12.0, sale_price: 15.9, quantity: 30, min_stock: 10, active: true, created_at: "2026-05-01T10:00:00Z", updated_at: "2026-05-17T10:00:00Z" },
];

const today = new Date("2026-05-18T10:00:00Z");
const isoDays = (n: number) => new Date(today.getTime() - n * 24 * 3600 * 1000).toISOString();

export const demoSales: Sale[] = [
  { id: "s1", user_id: "demo-admin", total: 145.5, created_at: isoDays(0) },
  { id: "s2", user_id: "demo-admin", total: 67.4, created_at: isoDays(0) },
  { id: "s3", user_id: "demo-admin", total: 98.0, created_at: isoDays(1) },
  { id: "s4", user_id: "demo-admin", total: 232.7, created_at: isoDays(1) },
  { id: "s5", user_id: "demo-admin", total: 56.0, created_at: isoDays(2) },
  { id: "s6", user_id: "demo-admin", total: 189.3, created_at: isoDays(3) },
  { id: "s7", user_id: "demo-admin", total: 78.5, created_at: isoDays(5) },
  { id: "s8", user_id: "demo-admin", total: 124.8, created_at: isoDays(7) },
  { id: "s9", user_id: "demo-admin", total: 95.2, created_at: isoDays(10) },
  { id: "s10", user_id: "demo-admin", total: 167.4, created_at: isoDays(14) },
  { id: "s11", user_id: "demo-admin", total: 88.0, created_at: isoDays(20) },
  { id: "s12", user_id: "demo-admin", total: 215.6, created_at: isoDays(28) },
];

export const demoSaleItems: SaleItem[] = [
  { id: "si1", sale_id: "s1", product_id: "p1", quantity: 3, unit_price: 28.0, subtotal: 84.0 },
  { id: "si2", sale_id: "s1", product_id: "p2", quantity: 5, unit_price: 7.0, subtotal: 35.0 },
  { id: "si3", sale_id: "s1", product_id: "p4", quantity: 3, unit_price: 8.5, subtotal: 25.5 },
  { id: "si4", sale_id: "s2", product_id: "p3", quantity: 8, unit_price: 5.5, subtotal: 44.0 },
  { id: "si5", sale_id: "s2", product_id: "p6", quantity: 1, unit_price: 15.9, subtotal: 15.9 },
  { id: "si6", sale_id: "s3", product_id: "p1", quantity: 2, unit_price: 28.0, subtotal: 56.0 },
  { id: "si7", sale_id: "s4", product_id: "p1", quantity: 5, unit_price: 28.0, subtotal: 140.0 },
  { id: "si8", sale_id: "s4", product_id: "p6", quantity: 4, unit_price: 15.9, subtotal: 63.6 },
];

export const demoOrders: Order[] = [
  {
    id: "o1",
    code: "#1042",
    customer_id: "demo-cliente",
    operator_id: null,
    status: "pending",
    total: 56.0,
    shipping_address: "Av. Brasil, 456 - Uberlândia",
    shipping_method: "PAC",
    tracking_code: null,
    notes: null,
    created_at: isoDays(0),
    updated_at: isoDays(0),
  },
  {
    id: "o2",
    code: "#1041",
    customer_id: "demo-cliente",
    operator_id: "demo-operator",
    status: "shipped",
    total: 89.5,
    shipping_address: "Rua Minas Gerais, 789 - Patrocínio",
    shipping_method: "SEDEX",
    tracking_code: "BR123456789BR",
    notes: null,
    created_at: isoDays(2),
    updated_at: isoDays(1),
  },
  {
    id: "o3",
    code: "#1040",
    customer_id: "demo-cliente",
    operator_id: "demo-operator",
    status: "delivered",
    total: 145.3,
    shipping_address: "Rua das Flores, 123 - Patos de Minas",
    shipping_method: "PAC",
    tracking_code: "BR987654321BR",
    notes: null,
    created_at: isoDays(7),
    updated_at: isoDays(3),
  },
];

export const demoOrderItems: OrderItem[] = [
  { id: "oi1", order_id: "o1", product_id: "p1", quantity: 2, unit_price: 28.0, subtotal: 56.0 },
  { id: "oi2", order_id: "o2", product_id: "p4", quantity: 3, unit_price: 8.5, subtotal: 25.5 },
  { id: "oi3", order_id: "o2", product_id: "p6", quantity: 4, unit_price: 15.9, subtotal: 63.6 },
  { id: "oi4", order_id: "o3", product_id: "p1", quantity: 4, unit_price: 28.0, subtotal: 112.0 },
  { id: "oi5", order_id: "o3", product_id: "p3", quantity: 6, unit_price: 5.5, subtotal: 33.0 },
];

export const demoMovements: StockMovement[] = [
  { id: "m1", product_id: "p1", type: "in", quantity: 50, user_id: "demo-admin", reference_id: null, notes: "NF 1234 - Fornecedor X", created_at: isoDays(5) },
  { id: "m2", product_id: "p2", type: "in", quantity: 30, user_id: "demo-admin", reference_id: null, notes: "NF 1234 - Fornecedor X", created_at: isoDays(5) },
  { id: "m3", product_id: "p1", type: "out", quantity: 3, user_id: "demo-admin", reference_id: "s1", notes: "Venda", created_at: isoDays(0) },
  { id: "m4", product_id: "p2", type: "out", quantity: 5, user_id: "demo-admin", reference_id: "s1", notes: "Venda", created_at: isoDays(0) },
  { id: "m5", product_id: "p3", type: "out", quantity: 8, user_id: "demo-admin", reference_id: "s2", notes: "Venda", created_at: isoDays(0) },
  { id: "m6", product_id: "p1", type: "out", quantity: 2, user_id: "demo-cliente", reference_id: "o1", notes: "Pedido online", created_at: isoDays(0) },
  { id: "m7", product_id: "p4", type: "in", quantity: 25, user_id: "demo-admin", reference_id: null, notes: "Reposição mensal", created_at: isoDays(10) },
  { id: "m8", product_id: "p6", type: "in", quantity: 20, user_id: "demo-admin", reference_id: null, notes: "NF 5678 - Fornecedor Y", created_at: isoDays(7) },
];

export const demoData = {
  profiles: demoProfiles,
  products: demoProducts,
  sales: demoSales,
  sale_items: demoSaleItems,
  orders: demoOrders,
  order_items: demoOrderItems,
  stock_movements: demoMovements,
};

export type DemoTable = keyof typeof demoData;

export function getDemoUserByRole(role: "admin" | "operator" | "cliente"): Profile {
  const p = demoProfiles.find((p) => p.role === role);
  if (!p) throw new Error(`No demo user for role ${role}`);
  return p;
}
