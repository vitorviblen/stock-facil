import { createClient } from "@/lib/supabase/server";
import { RelatoriosView } from "@/components/reports/relatorios-view";

export const dynamic = "force-dynamic";

export default async function RelatoriosPage() {
  const supabase = createClient();
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const { data } = await supabase
    .from("sales")
    .select("total, created_at")
    .gte("created_at", ninetyDaysAgo.toISOString())
    .order("created_at", { ascending: true });

  const sales = (data ?? []) as Array<{ total: number; created_at: string }>;

  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Relatórios</h1>
        <p className="text-sm text-muted-foreground">
          Análise de vendas com filtro por período.
        </p>
      </header>

      <RelatoriosView sales={sales} />
    </div>
  );
}
