import Link from "next/link";
import { AlertTriangle, CheckCircle2, ArrowDownToLine, Package } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function AlertasPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .order("quantity", { ascending: true });

  const products = (data ?? []) as Product[];
  const critical = products.filter((p) => p.quantity <= p.min_stock);
  const ok = products.filter((p) => p.quantity > p.min_stock).slice(0, 10);

  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Alertas de Estoque</h1>
        <p className="text-sm text-muted-foreground">
          {critical.length} produto{critical.length !== 1 ? "s" : ""} em situação crítica.
        </p>
      </header>

      {products.length === 0 ? (
        <div className="rounded-xl border border-dashed py-16 text-center">
          <Package className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">
            Sem produtos ativos. Cadastre produtos para acompanhar alertas.
          </p>
        </div>
      ) : (
        <>
          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <AlertTriangle className="h-4 w-4 text-destructive" /> Críticos
              <Badge variant="destructive">{critical.length}</Badge>
            </h2>
            {critical.length === 0 ? (
              <Card>
                <CardContent className="flex items-center gap-3 py-6 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-5 w-5 text-stock-emerald" />
                  Tudo certo! Nenhum produto abaixo do estoque mínimo.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {critical.map((p) => (
                  <ProductCard key={p.id} product={p} variant="danger" />
                ))}
              </div>
            )}
          </section>

          {ok.length > 0 ? (
            <section className="space-y-3">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <CheckCircle2 className="h-4 w-4 text-stock-emerald" /> Estoque saudável
                <Badge variant="mint">{ok.length}</Badge>
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {ok.map((p) => (
                  <ProductCard key={p.id} product={p} variant="ok" />
                ))}
              </div>
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}

function ProductCard({ product, variant }: { product: Product; variant: "danger" | "ok" }) {
  const isDanger = variant === "danger";
  return (
    <Card
      className={cn(
        "border-l-4 transition-shadow hover:shadow-md",
        isDanger ? "border-l-destructive" : "border-l-stock-emerald"
      )}
    >
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-semibold">{product.name}</p>
            <p className="text-xs text-muted-foreground">{product.code}</p>
          </div>
          {isDanger ? <Badge variant="destructive">Crítico</Badge> : <Badge variant="success">OK</Badge>}
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-bold">{product.quantity}</p>
            <p className="text-xs text-muted-foreground">mínimo {product.min_stock}</p>
          </div>
          {isDanger ? (
            <Button asChild size="sm" variant="mint">
              <Link href={`/estoque/entrada?produto=${product.id}`}>
                <ArrowDownToLine className="h-3.5 w-3.5" /> Repor
              </Link>
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
