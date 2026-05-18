import Link from "next/link";
import { Plus, Package } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { ProductsTable } from "@/components/products/products-table";
import type { Product } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function ProdutosPage() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  const products = (data ?? []) as Product[];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Produtos</h1>
          <p className="text-sm text-muted-foreground">
            {products.length} produto{products.length !== 1 ? "s" : ""} cadastrado{products.length !== 1 ? "s" : ""}.
          </p>
        </div>
        <Button asChild variant="mint">
          <Link href="/produtos/novo">
            <Plus className="h-4 w-4" />
            Novo Produto
          </Link>
        </Button>
      </div>

      {error ? (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          Erro ao carregar produtos: {error.message}
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-background py-16 text-center">
          <Package className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <h3 className="mt-3 text-lg font-semibold">Nenhum produto ainda</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Cadastre seu primeiro produto pra começar.
          </p>
          <Button asChild variant="mint" className="mt-4">
            <Link href="/produtos/novo">
              <Plus className="h-4 w-4" /> Cadastrar produto
            </Link>
          </Button>
        </div>
      ) : (
        <ProductsTable products={products} />
      )}
    </div>
  );
}
