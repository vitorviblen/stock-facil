import Link from "next/link";
import { redirect } from "next/navigation";
import { ShoppingBag, Package } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Order } from "@/types/database";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";

export const dynamic = "force-dynamic";

export default async function MeusPedidosPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("orders")
    .select("*")
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });
  const orders = (data ?? []) as Order[];

  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Meus Pedidos</h1>
        <p className="text-sm text-muted-foreground">
          Acompanhe seus pedidos e códigos de rastreio.
        </p>
      </header>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16">
            <ShoppingBag className="h-12 w-12 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Você ainda não fez pedidos.</p>
            <Button asChild variant="mint">
              <Link href="/loja">Começar a comprar</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {orders.map((o) => (
            <Card key={o.id} className="transition-shadow hover:shadow-md">
              <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-stock-mint/15 text-stock-emerald">
                    <Package className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-mono font-semibold">{o.code}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(o.created_at, true)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-1 flex-wrap items-center justify-end gap-4">
                  {o.tracking_code ? (
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Rastreio</p>
                      <p className="font-mono text-sm">{o.tracking_code}</p>
                    </div>
                  ) : null}
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="font-bold">{formatCurrency(Number(o.total))}</p>
                  </div>
                  <OrderStatusBadge status={o.status} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
