"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Power, Pencil, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { formatCurrency, cn } from "@/lib/utils";
import type { Product } from "@/types/database";
import { EditProductDialog } from "./edit-product-dialog";

export function ProductsTable({ products }: { products: Product[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Product | null>(null);
  const [, startTransition] = useTransition();

  async function toggleActive(p: Product) {
    setPendingId(p.id);
    const supabase = createClient();
    const { error } = await supabase
      .from("products")
      .update({ active: !p.active })
      .eq("id", p.id);
    setPendingId(null);
    if (error) {
      toast.error("Erro ao atualizar: " + error.message);
      return;
    }
    toast.success(p.active ? "Produto desativado." : "Produto ativado.");
    startTransition(() => router.refresh());
  }

  return (
    <>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Código</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead className="text-right">Estoque</TableHead>
              <TableHead className="text-right">Preço</TableHead>
              <TableHead className="w-24 text-center">Status</TableHead>
              <TableHead className="w-32 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => {
              const isLow = p.quantity <= p.min_stock;
              return (
                <TableRow
                  key={p.id}
                  className={cn(
                    "border-l-4",
                    isLow ? "border-l-destructive" : "border-l-transparent",
                    !p.active && "opacity-50"
                  )}
                >
                  <TableCell className="font-mono text-xs">{p.code}</TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="text-right">
                    <span className={isLow ? "font-semibold text-destructive" : ""}>
                      {p.quantity}
                    </span>
                    <span className="text-xs text-muted-foreground"> / mín. {p.min_stock}</span>
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {formatCurrency(Number(p.sale_price))}
                  </TableCell>
                  <TableCell className="text-center">
                    {p.active ? (
                      <Badge variant="mint">Ativo</Badge>
                    ) : (
                      <Badge variant="outline">Inativo</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Editar produto"
                        onClick={() => setEditing(p)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={p.active ? "Desativar produto" : "Ativar produto"}
                        onClick={() => toggleActive(p)}
                        disabled={pendingId === p.id}
                      >
                        {pendingId === p.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Power
                            className={cn("h-4 w-4", p.active ? "text-stock-emerald" : "text-muted-foreground")}
                          />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      {editing ? (
        <EditProductDialog
          product={editing}
          open={!!editing}
          onOpenChange={(open) => !open && setEditing(null)}
          onSaved={() => {
            setEditing(null);
            startTransition(() => router.refresh());
          }}
        />
      ) : null}
    </>
  );
}
