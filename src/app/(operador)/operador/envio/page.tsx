import Link from "next/link";
import { Truck, Package, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Order } from "@/types/database";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";

export const dynamic = "force-dynamic";

export default async function EnvioEntregaPage() {
  const supabase = createClient();

  const [approvedRes, shippedRes] = await Promise.all([
    supabase
      .from("orders")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: true }),
    supabase
      .from("orders")
      .select("*")
      .eq("status", "shipped")
      .order("updated_at", { ascending: false }),
  ]);

  const aprovados = (approvedRes.data ?? []) as Order[];
  const emRota = (shippedRes.data ?? []) as Order[];

  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Envio e Entrega</h1>
        <p className="text-sm text-muted-foreground">
          {aprovados.length} aguardando envio · {emRota.length} em rota
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Package className="h-4 w-4" /> Pedidos Aprovados para Envio
          <Badge variant="outline" className="border-blue-500 text-blue-700">
            {aprovados.length}
          </Badge>
        </h2>
        {aprovados.length === 0 ? (
          <Card>
            <CardContent className="py-6 text-center text-sm text-muted-foreground">
              Nenhum pedido aprovado aguardando envio.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {aprovados.map((o) => (
              <OrderCard key={o.id} order={o} cta="Despachar" />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Truck className="h-4 w-4" /> Pedidos em Rota
          <Badge variant="mint">{emRota.length}</Badge>
        </h2>
        {emRota.length === 0 ? (
          <Card>
            <CardContent className="py-6 text-center text-sm text-muted-foreground">
              Nenhum pedido em rota.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {emRota.map((o) => (
              <OrderCard key={o.id} order={o} cta="Confirmar Entrega" />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function OrderCard({ order, cta }: { order: Order; cta: string }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="font-mono text-sm">{order.code}</CardTitle>
          <OrderStatusBadge status={order.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1 text-sm">
          <p className="text-muted-foreground">Total</p>
          <p className="text-xl font-bold">{formatCurrency(Number(order.total))}</p>
        </div>
        {order.shipping_address ? (
          <div className="space-y-1 text-xs">
            <p className="text-muted-foreground">Endereço</p>
            <p className="line-clamp-2">{order.shipping_address}</p>
          </div>
        ) : null}
        <p className="text-xs text-muted-foreground">
          {order.shipping_method ?? "PAC"} · {formatDate(order.created_at)}
        </p>
        <Button asChild variant="mint" size="sm" className="w-full">
          <Link href={`/operador/pedidos/${order.id}`}>
            {cta} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
