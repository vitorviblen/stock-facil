"use client";
import { useState, useEffect } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/types/database";
import { getCart, addToCart, type CartItem } from "@/lib/cart";

export function ProductsGrid({ products }: { products: Product[] }) {
  const [cartIds, setCartIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setCartIds(new Set(getCart().map((i) => i.product_id)));
  }, []);

  function handleAdd(p: Product) {
    const item: CartItem = {
      product_id: p.id,
      name: p.name,
      code: p.code,
      unit_price: Number(p.sale_price),
      quantity: 1,
      max_quantity: p.quantity,
    };
    addToCart(item);
    setCartIds((prev) => new Set(prev).add(p.id));
    toast.success(`${p.name} adicionado ao carrinho.`);
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((p) => {
        const inCart = cartIds.has(p.id);
        const outOfStock = p.quantity <= 0;
        const lowStock = p.quantity > 0 && p.quantity <= 3;

        return (
          <Card key={p.id} className="overflow-hidden transition-shadow hover:shadow-lg">
            <div className="flex h-32 items-center justify-center bg-gradient-to-br from-stock-mint/10 to-stock-emerald/20 text-4xl">
              📦
            </div>
            <CardContent className="space-y-3 p-4">
              <div className="space-y-1">
                <p className="font-semibold leading-tight">{p.name}</p>
                <p className="text-xs text-muted-foreground">Código {p.code}</p>
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xl font-bold text-stock-emerald">
                    {formatCurrency(Number(p.sale_price))}
                  </p>
                  <div className="mt-1">
                    {outOfStock ? (
                      <Badge variant="destructive">Esgotado</Badge>
                    ) : lowStock ? (
                      <Badge variant="outline" className="border-amber-500 text-amber-700">
                        Últimas unidades
                      </Badge>
                    ) : (
                      <Badge variant="mint">Em estoque</Badge>
                    )}
                  </div>
                </div>
              </div>

              <Button
                variant={inCart ? "outline" : "mint"}
                className="w-full"
                disabled={outOfStock}
                onClick={() => handleAdd(p)}
              >
                {inCart ? (
                  <>
                    <Check className="h-4 w-4" /> No carrinho
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4" /> Adicionar ao Carrinho
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
