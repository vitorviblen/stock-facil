"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowDownToLine } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import type { Product } from "@/types/database";

export function EntradaForm({
  products,
  preselected,
}: {
  products: Product[];
  preselected?: string;
}) {
  const router = useRouter();
  const [productId, setProductId] = useState(preselected ?? "");
  const [quantity, setQuantity] = useState(0);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const selected = products.find((p) => p.id === productId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!productId) return toast.error("Selecione um produto.");
    if (quantity <= 0) return toast.error("Quantidade deve ser maior que zero.");

    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return toast.error("Sessão expirada. Faça login novamente.");
    }

    const { error } = await supabase.rpc("add_stock", {
      p_product_id: productId,
      p_quantity: quantity,
      p_user_id: user.id,
      p_notes: notes.trim() || undefined,
    });
    setLoading(false);

    if (error) {
      toast.error("Erro ao registrar entrada: " + error.message);
      return;
    }
    toast.success(`+${quantity} un. adicionadas ao estoque.`);
    setProductId("");
    setQuantity(0);
    setNotes("");
    router.refresh();
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Nova entrada</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="produto">Produto *</Label>
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger id="produto">
                <SelectValue placeholder="Selecione um produto" />
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.code} — {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selected ? (
              <p className="text-xs text-muted-foreground">
                Estoque atual: <strong>{selected.quantity}</strong> un. · Mínimo {selected.min_stock}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="qtd">Quantidade a adicionar *</Label>
            <Input
              id="qtd"
              type="number"
              min={1}
              value={quantity || ""}
              onChange={(e) => setQuantity(Number(e.target.value))}
              placeholder="Ex: 50"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: NF 1234 - Fornecedor X"
              rows={3}
            />
          </div>

          <Button type="submit" variant="mint" size="lg" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowDownToLine className="h-4 w-4" />}
            {loading ? "Registrando..." : "Confirmar Entrada"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
