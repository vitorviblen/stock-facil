import { createClient } from "@/lib/supabase/server";
import { EntradaForm } from "@/components/stock/entrada-form";
import type { Product } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function EntradaEstoquePage({
  searchParams,
}: {
  searchParams: { produto?: string };
}) {
  const supabase = createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .order("name", { ascending: true });

  const products = (data ?? []) as Product[];

  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Entrada de Estoque</h1>
        <p className="text-sm text-muted-foreground">
          Adicione unidades ao estoque de um produto.
        </p>
      </header>

      <EntradaForm products={products} preselected={searchParams.produto} />
    </div>
  );
}
