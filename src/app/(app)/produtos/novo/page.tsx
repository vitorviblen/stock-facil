"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NovoProdutoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    quantity: 0,
    min_stock: 0,
    cost_price: 0,
    sale_price: 0,
  });

  function update<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.name.trim()) return toast.error("Informe o nome do produto.");
    if (form.cost_price < 0 || form.sale_price < 0)
      return toast.error("Preços não podem ser negativos.");
    if (form.quantity < 0 || form.min_stock < 0)
      return toast.error("Quantidades não podem ser negativas.");

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.from("products").insert({
      name: form.name.trim(),
      quantity: form.quantity,
      min_stock: form.min_stock,
      cost_price: form.cost_price,
      sale_price: form.sale_price,
    });
    setLoading(false);

    if (error) {
      toast.error("Erro ao salvar: " + error.message);
      return;
    }
    toast.success("Produto cadastrado!");
    router.push("/produtos");
    router.refresh();
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon" aria-label="Voltar">
          <Link href="/produtos">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Novo Produto</h1>
          <p className="text-sm text-muted-foreground">Cadastre um item no estoque.</p>
        </div>
      </div>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Dados do produto</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do produto *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Ex: Arroz Tio Urbano 5kg"
                required
                autoFocus
              />
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantidade inicial</Label>
                <Input
                  id="quantity"
                  type="number"
                  min={0}
                  value={form.quantity}
                  onChange={(e) => update("quantity", Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="min_stock">Estoque mínimo</Label>
                <Input
                  id="min_stock"
                  type="number"
                  min={0}
                  value={form.min_stock}
                  onChange={(e) => update("min_stock", Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                  Você será alertado quando estoque chegar nesse nível.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cost_price">Preço de custo (R$)</Label>
                <Input
                  id="cost_price"
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.cost_price}
                  onChange={(e) => update("cost_price", Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sale_price">Preço de venda (R$)</Label>
                <Input
                  id="sale_price"
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.sale_price}
                  onChange={(e) => update("sale_price", Number(e.target.value))}
                />
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <Button type="submit" variant="mint" size="lg" disabled={loading} className="min-w-[200px]">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {loading ? "Salvando..." : "Salvar Produto"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
