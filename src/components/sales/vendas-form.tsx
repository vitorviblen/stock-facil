"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2, ShoppingCart, Search } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, cn } from "@/lib/utils";
import type { Product } from "@/types/database";

interface CartItem {
  product_id: string;
  name: string;
  code: string;
  unit_price: number;
  quantity: number;
  max_quantity: number;
}

export function VendasForm({ products }: { products: Product[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(() => {
    if (!search.trim()) return products.slice(0, 10);
    const term = search.toLowerCase();
    return products
      .filter((p) => p.name.toLowerCase().includes(term) || p.code.toLowerCase().includes(term))
      .slice(0, 10);
  }, [products, search]);

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.unit_price * item.quantity, 0),
    [cart]
  );

  function addToCart(p: Product) {
    setCart((prev) => {
      const existing = prev.find((i) => i.product_id === p.id);
      if (existing) {
        if (existing.quantity + 1 > p.quantity) {
          toast.error(`Apenas ${p.quantity} un. em estoque.`);
          return prev;
        }
        return prev.map((i) =>
          i.product_id === p.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          product_id: p.id,
          name: p.name,
          code: p.code,
          unit_price: Number(p.sale_price),
          quantity: 1,
          max_quantity: p.quantity,
        },
      ];
    });
  }

  function updateQuantity(id: string, qty: number) {
    setCart((prev) =>
      prev
        .map((i) => {
          if (i.product_id !== id) return i;
          const safe = Math.max(0, Math.min(qty, i.max_quantity));
          return { ...i, quantity: safe };
        })
        .filter((i) => i.quantity > 0)
    );
  }

  function removeItem(id: string) {
    setCart((prev) => prev.filter((i) => i.product_id !== id));
  }

  async function finalize() {
    if (cart.length === 0) return toast.error("Adicione ao menos 1 item.");

    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return toast.error("Sessão expirada. Faça login novamente.");
    }

    const items = cart.map((i) => ({
      product_id: i.product_id,
      quantity: i.quantity,
      unit_price: i.unit_price,
    }));

    const { error } = await supabase.rpc("register_sale", {
      p_user_id: user.id,
      p_items: items,
    });
    setLoading(false);

    if (error) {
      toast.error("Erro ao registrar venda: " + error.message);
      return;
    }
    toast.success(`Venda de ${formatCurrency(total)} registrada!`);
    setCart([]);
    setSearch("");
    router.refresh();
  }

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Buscar produto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome ou código..."
              className="pl-9"
              autoFocus
            />
          </div>

          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nenhum produto disponível para a busca.
            </p>
          ) : (
            <ul className="divide-y rounded-md border">
              {filtered.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.code} · {p.quantity} em estoque · {formatCurrency(Number(p.sale_price))}
                    </p>
                  </div>
                  <Button size="sm" variant="mint" onClick={() => addToCart(p)}>
                    <Plus className="h-3.5 w-3.5" />
                    Add
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" /> Carrinho
          </CardTitle>
          {cart.length > 0 ? (
            <Badge variant="mint">{cart.length} ite{cart.length > 1 ? "ns" : "m"}</Badge>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-4">
          {cart.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Adicione produtos pra começar a venda.
            </p>
          ) : (
            <ul className="space-y-3">
              {cart.map((item) => (
                <li key={item.product_id} className="flex items-center gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(item.unit_price)} · max {item.max_quantity}
                    </p>
                  </div>
                  <Input
                    type="number"
                    min={1}
                    max={item.max_quantity}
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.product_id, Number(e.target.value))}
                    className="h-8 w-16 text-center"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Remover do carrinho"
                    onClick={() => removeItem(item.product_id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </li>
              ))}
            </ul>
          )}

          <div className="space-y-1 border-t pt-4">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">
              Total
            </Label>
            <p
              className={cn(
                "text-3xl font-bold tracking-tight",
                total > 0 ? "text-stock-emerald" : "text-muted-foreground"
              )}
            >
              {formatCurrency(total)}
            </p>
          </div>

          <Button
            variant="mint"
            size="lg"
            className="w-full"
            onClick={finalize}
            disabled={loading || cart.length === 0}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />}
            {loading ? "Registrando..." : "Finalizar Venda"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
