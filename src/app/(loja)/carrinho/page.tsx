"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trash2, Loader2, ShoppingBag, MapPin } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import {
  getCart,
  removeFromCart,
  updateQuantity,
  cartTotal,
  clearCart,
  type CartItem,
} from "@/lib/cart";

export default function CarrinhoPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingMethod, setShippingMethod] = useState("PAC");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setItems(getCart());
    const sync = () => setItems(getCart());
    window.addEventListener("cart:updated", sync);
    return () => window.removeEventListener("cart:updated", sync);
  }, []);

  const total = cartTotal(items);

  function handleRemove(id: string) {
    removeFromCart(id);
    setItems(getCart());
  }

  function handleQty(id: string, qty: number) {
    updateQuantity(id, qty);
    setItems(getCart());
  }

  async function handleCheckout() {
    if (items.length === 0) return toast.error("Carrinho vazio.");
    if (!shippingAddress.trim()) return toast.error("Informe o endereço de entrega.");

    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return toast.error("Faça login pra finalizar a compra.");
    }

    const rpcItems = items.map((i) => ({
      product_id: i.product_id,
      quantity: i.quantity,
    }));

    const { error } = await supabase.rpc("create_order", {
      p_customer_id: user.id,
      p_items: rpcItems as unknown as never,
      p_shipping_address: shippingAddress.trim(),
      p_shipping_method: shippingMethod,
    });
    setLoading(false);

    if (error) return toast.error("Erro: " + error.message);

    clearCart();
    toast.success("Pedido criado! Acompanhe em 'Meus Pedidos'.");
    router.push("/meus-pedidos");
  }

  if (items.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <header>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Compra de Produtos</h1>
        </header>
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16">
            <ShoppingBag className="h-12 w-12 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Seu carrinho está vazio.</p>
            <Button asChild variant="mint">
              <Link href="/loja">Ver produtos</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Compra de Produtos</h1>
        <p className="text-sm text-muted-foreground">Confirme os itens e o endereço de entrega.</p>
      </header>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Resumo do Carrinho</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {items.map((i) => (
                <li key={i.product_id} className="flex items-center gap-3 border-b pb-3 last:border-0 last:pb-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-md bg-stock-mint/10 text-2xl">
                    📦
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium leading-tight">{i.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(i.unit_price)} cada · máx {i.max_quantity}
                    </p>
                  </div>
                  <Input
                    type="number"
                    min={1}
                    max={i.max_quantity}
                    value={i.quantity}
                    onChange={(e) => handleQty(i.product_id, Number(e.target.value))}
                    className="h-8 w-16 text-center"
                  />
                  <span className="w-20 text-right text-sm font-medium">
                    {formatCurrency(i.unit_price * i.quantity)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemove(i.product_id)}
                    aria-label="Remover"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-4 w-4" /> Endereço de Entrega
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="endereco">Endereço completo</Label>
              <Input
                id="endereco"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="Rua, número, cidade"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="metodo">Transportadora</Label>
              <Select value={shippingMethod} onValueChange={setShippingMethod}>
                <SelectTrigger id="metodo">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PAC">Correios - PAC (5-8 dias)</SelectItem>
                  <SelectItem value="SEDEX">Correios - SEDEX (1-3 dias)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1 border-t pt-4">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Total</Label>
              <p className="text-3xl font-bold text-stock-emerald">{formatCurrency(total)}</p>
            </div>

            <Button
              variant="mint"
              size="lg"
              className="w-full"
              onClick={handleCheckout}
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {loading ? "Processando..." : "Finalizar Compra"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
