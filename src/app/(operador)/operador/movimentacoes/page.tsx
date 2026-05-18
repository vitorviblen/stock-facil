import Link from "next/link";
import { Plus, ArrowDownToLine, History } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { formatDate, cn } from "@/lib/utils";
import type { StockMovement, Product, Profile } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function MovimentacoesPage() {
  const supabase = createClient();

  const { data: movsData } = await supabase
    .from("stock_movements")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  const movs = (movsData ?? []) as StockMovement[];

  const productIds = Array.from(new Set(movs.map((m) => m.product_id)));
  const userIds = Array.from(new Set(movs.map((m) => m.user_id)));

  const [productsRes, profilesRes] = await Promise.all([
    productIds.length
      ? supabase.from("products").select("id, name").in("id", productIds)
      : Promise.resolve({ data: [] }),
    userIds.length
      ? supabase.from("profiles").select("id, full_name").in("id", userIds)
      : Promise.resolve({ data: [] }),
  ]);

  const productMap = new Map<string, string>(
    ((productsRes.data ?? []) as Array<Pick<Product, "id" | "name">>).map((p) => [p.id, p.name])
  );
  const profileMap = new Map<string, string>(
    ((profilesRes.data ?? []) as Array<Pick<Profile, "id" | "full_name">>).map((p) => [p.id, p.full_name])
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Movimentações</h1>
          <p className="text-sm text-muted-foreground">Entradas e saídas de estoque.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="mint" size="sm">
            <Link href="/estoque/entrada">
              <Plus className="h-3.5 w-3.5" /> Nova Entrada
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <div className="border-b p-4">
          <h2 className="font-semibold">Histórico de Movimentações</h2>
        </div>
        {movs.length === 0 ? (
          <div className="py-16 text-center">
            <History className="mx-auto h-12 w-12 text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">Nenhuma movimentação registrada.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-32">Data</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead className="w-32 text-center">Tipo</TableHead>
                <TableHead className="text-right">Quantidade</TableHead>
                <TableHead className="text-right">Responsável</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movs.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(m.created_at)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {productMap.get(m.product_id) ?? "—"}
                  </TableCell>
                  <TableCell className="text-center">
                    {m.type === "in" ? (
                      <Badge variant="mint">Entrada</Badge>
                    ) : m.type === "out" ? (
                      <Badge variant="destructive">Saída</Badge>
                    ) : (
                      <Badge variant="outline">Ajuste</Badge>
                    )}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-semibold",
                      m.type === "in" ? "text-stock-emerald" : "text-destructive"
                    )}
                  >
                    {m.type === "in" ? "+" : "−"}
                    {m.quantity} un.
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {profileMap.get(m.user_id) ?? "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
