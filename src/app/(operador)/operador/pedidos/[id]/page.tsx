import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Order, OrderItem, Product } from "@/types/database";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { OrderUpdateForm } from "@/components/orders/order-update-form";

export const dynamic = "force-dynamic";

export default async function AtualizarPedidoPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", params.id)
    .single();
  if (!order) notFound();

  const typedOrder = order as Order;

  const { data: itemsData } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", typedOrder.id);
  const items = (itemsData ?? []) as OrderItem[];

  const productIds = items.map((i) => i.product_id);
  const { data: productsData } = await supabase
    .from("products")
    .select("id, name")
    .in("id", productIds.length > 0 ? productIds : ["00000000-0000-0000-0000-000000000000"]);
  const productMap = new Map<string, Pick<Product, "id" | "name">>(
    (productsData ?? []).map((p) => [p.id as string, p as Pick<Product, "id" | "name">])
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon" aria-label="Voltar">
          <Link href="/operador/pedidos">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex flex-1 items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Pedido {typedOrder.code}
            </h1>
            <p className="text-sm text-muted-foreground">
              Criado em {formatDate(typedOrder.created_at, true)}
            </p>
          </div>
          <OrderStatusBadge status={typedOrder.status} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Produtos do pedido</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead className="text-right">Quantidade</TableHead>
                <TableHead className="text-right">Valor unitário</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((it) => (
                <TableRow key={it.id}>
                  <TableCell className="font-medium">
                    {productMap.get(it.product_id)?.name ?? "—"}
                  </TableCell>
                  <TableCell className="text-right">{it.quantity}</TableCell>
                  <TableCell className="text-right">{formatCurrency(Number(it.unit_price))}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(Number(it.subtotal))}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={3} className="text-right font-semibold">
                  Total
                </TableCell>
                <TableCell className="text-right font-bold text-stock-emerald">
                  {formatCurrency(Number(typedOrder.total))}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {typedOrder.shipping_address ? (
        <Card>
          <CardHeader>
            <CardTitle>Endereço de entrega</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{typedOrder.shipping_address}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Transportadora: {typedOrder.shipping_method ?? "PAC"}
            </p>
          </CardContent>
        </Card>
      ) : null}

      <OrderUpdateForm
        orderId={typedOrder.id}
        currentStatus={typedOrder.status}
        currentTrackingCode={typedOrder.tracking_code}
      />
    </div>
  );
}
