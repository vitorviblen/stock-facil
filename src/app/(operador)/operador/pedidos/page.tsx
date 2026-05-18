import Link from "next/link";
import { Search, ClipboardList } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Order } from "@/types/database";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";

export const dynamic = "force-dynamic";

export default async function PedidosOperadorPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  const orders = (data ?? []) as Order[];

  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Atualizar Pedidos</h1>
        <p className="text-sm text-muted-foreground">
          Lista completa de pedidos — clique pra alterar status e adicionar código de rastreio.
        </p>
      </header>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-dashed py-16 text-center">
          <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">Nenhum pedido recebido ainda.</p>
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Nº Pedido</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Rastreio</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="w-24 text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono text-xs font-semibold">{o.code}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(o.created_at)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(Number(o.total))}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {o.tracking_code ?? <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell className="text-center">
                    <OrderStatusBadge status={o.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/operador/pedidos/${o.id}`}>Atualizar</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
