import { ShoppingBag } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/types/database";
import { ProductsGrid } from "@/components/loja/products-grid";

export const dynamic = "force-dynamic";

export default async function LojaPage() {
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
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Catálogo StockFácil</h1>
        <p className="text-sm text-muted-foreground">
          {products.length} produto{products.length !== 1 ? "s" : ""} disponíve{products.length !== 1 ? "is" : "l"}.
        </p>
      </header>

      {products.length === 0 ? (
        <div className="rounded-xl border border-dashed py-16 text-center">
          <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">
            Nenhum produto cadastrado ainda. Volte em breve!
          </p>
        </div>
      ) : (
        <ProductsGrid products={products} />
      )}
    </div>
  );
}
