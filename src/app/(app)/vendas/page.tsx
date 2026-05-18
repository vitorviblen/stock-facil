import { createClient } from "@/lib/supabase/server";
import { VendasForm } from "@/components/sales/vendas-form";
import type { Product } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function VendasPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .gt("quantity", 0)
    .order("name", { ascending: true });

  const products = (data ?? []) as Product[];

  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Registrar Venda</h1>
        <p className="text-sm text-muted-foreground">
          Monte o carrinho e finalize a venda — o estoque é baixado automaticamente.
        </p>
      </header>

      <VendasForm products={products} />
    </div>
  );
}
