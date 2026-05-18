import Link from "next/link";
import { ClipboardList, Truck, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Order } from "@/types/database";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";

export const dynamic = "force-dynamic";

export default async function PainelOperadorPage() {
  const supabase = createClient();
  const { data: ordersData } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  const orders = (ordersData ?? []) as Order[];

  const pending = orders.filter((o) => o.status === "pending");
  const approved = orders.filter((o) => o.status === "approved");
  const shipped = orders.filter((o) => o.status === "shipped");
  const delivered = orders.filter((o) => o.status === "delivered");

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const lateOrders = orders.filter(
    (o) => o.status === "shipped" && new Date(o.updated_at) < sevenDaysAgo
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Painel do Operador</h1>
        <p className="text-sm text-muted-foreground">
          {orders.length} pedido{orders.length !== 1 ? "s" : ""} no sistema · {pending.length} pendente
          {pending.length !== 1 ? "s" : ""} de aprovação
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Pendentes" value={pending.length} icon={ClipboardList} accent="pending" />
        <KpiCard label="Aprovados" value={approved.length} icon={CheckCircle2} accent="approved" />
        <KpiCard label="Enviados" value={shipped.length} icon={Truck} accent="shipped" />
        <KpiCard
          label="Atrasados (>7d)"
          value={lateOrders.length}
          icon={AlertTriangle}
          accent={lateOrders.length > 0 ? "danger" : "ok"}
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Pedidos recentes</CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link href="/operador/pedidos">
              Ver todos <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Nenhum pedido registrado ainda.
            </p>
          ) : (
            <ul className="divide-y">
              {orders.slice(0, 8).map((o) => (
                <li key={o.id} className="flex items-center justify-between py-3">
                  <div className="min-w-0">
                    <Link
                      href={`/operador/pedidos/${o.id}`}
                      className="font-semibold hover:underline"
                    >
                      Pedido {o.code}
                    </Link>
                    <p className="text-xs text-muted-foreground">{formatDate(o.created_at, true)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{formatCurrency(Number(o.total))}</span>
                    <OrderStatusBadge status={o.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function KpiCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  accent: "pending" | "approved" | "shipped" | "ok" | "danger";
}) {
  const cls = {
    pending: "bg-amber-100 text-amber-700",
    approved: "bg-blue-100 text-blue-700",
    shipped: "bg-stock-mint/15 text-stock-emerald",
    ok: "bg-stock-emerald/15 text-stock-emerald",
    danger: "bg-destructive/15 text-destructive",
  }[accent];

  return (
    <Card className="animate-fade-in">
      <CardContent className="flex items-start justify-between p-5">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${cls}`}>
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}
