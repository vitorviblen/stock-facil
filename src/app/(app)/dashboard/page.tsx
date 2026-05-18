import Link from "next/link";
import {
  DollarSign,
  ShoppingCart,
  Package as PackageIcon,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Product, Sale } from "@/types/database";

export const dynamic = "force-dynamic";

async function getDashboardData() {
  const supabase = createClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayIso = today.toISOString();

  const [salesToday, productsCount, activeProducts, recentSales, topProducts] = await Promise.all([
    supabase.from("sales").select("total, created_at").gte("created_at", todayIso),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("active", true),
    supabase.from("products").select("*").eq("active", true),
    supabase.from("sales").select("id, total, created_at").order("created_at", { ascending: false }).limit(5),
    supabase
      .from("sale_items")
      .select("product_id, quantity, products(name)")
      .limit(50),
  ]);

  const lowStockList = ((activeProducts.data ?? []) as Product[])
    .filter((p) => p.quantity <= p.min_stock)
    .sort((a, b) => a.quantity - b.quantity)
    .slice(0, 10);

  const todaySales = salesToday.data ?? [];
  const totalToday = todaySales.reduce((sum, s) => sum + Number(s.total), 0);
  const countToday = todaySales.length;
  const avgTicket = countToday > 0 ? totalToday / countToday : 0;

  const topMap = new Map<string, { name: string; quantity: number }>();
  (topProducts.data ?? []).forEach((item: any) => {
    const name = item.products?.name ?? "—";
    const current = topMap.get(item.product_id) ?? { name, quantity: 0 };
    current.quantity += item.quantity;
    topMap.set(item.product_id, current);
  });
  const topRanked = Array.from(topMap.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  return {
    totalToday,
    countToday,
    avgTicket,
    productsCount: productsCount.count ?? 0,
    lowStock: lowStockList,
    recentSales: (recentSales.data ?? []) as Sale[],
    topRanked,
  };
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Visão geral do estoque e vendas em tempo real.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Faturamento hoje"
          value={formatCurrency(data.totalToday)}
          icon={DollarSign}
          accent="mint"
        />
        <KpiCard
          label="Vendas hoje"
          value={String(data.countToday)}
          icon={ShoppingCart}
          accent="emerald"
        />
        <KpiCard
          label="Ticket médio"
          value={formatCurrency(data.avgTicket)}
          icon={TrendingUp}
          accent="mint"
        />
        <KpiCard
          label="Estoque crítico"
          value={String(data.lowStock.length)}
          icon={AlertTriangle}
          accent={data.lowStock.length > 0 ? "danger" : "emerald"}
          subline={`${data.productsCount} produtos ativos`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Top 5 mais vendidos</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/relatorios">
                Ver relatório <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {data.topRanked.length === 0 ? (
              <EmptyHint icon={PackageIcon} text="Nenhuma venda registrada ainda." />
            ) : (
              <ol className="space-y-3">
                {data.topRanked.map((p, idx) => (
                  <li key={idx} className="flex items-center justify-between border-b last:border-0 pb-2 last:pb-0">
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-stock-mint/15 text-xs font-bold text-stock-emerald">
                        {idx + 1}
                      </span>
                      <span className="text-sm font-medium">{p.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{p.quantity} un.</span>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Alertas de estoque</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/alertas">
                Ver todos <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {data.lowStock.length === 0 ? (
              <EmptyHint icon={AlertTriangle} text="Tudo ok! Sem produtos críticos." />
            ) : (
              <ul className="space-y-3">
                {data.lowStock.slice(0, 5).map((p) => (
                  <li key={p.id} className="flex items-center justify-between border-l-2 border-destructive pl-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Restam {p.quantity} · mín. {p.min_stock}
                      </p>
                    </div>
                    <Badge variant="destructive">Crítico</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Últimas vendas</CardTitle>
        </CardHeader>
        <CardContent>
          {data.recentSales.length === 0 ? (
            <EmptyHint icon={ShoppingCart} text="Nenhuma venda registrada." />
          ) : (
            <ul className="divide-y">
              {data.recentSales.map((s) => (
                <li key={s.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium">Venda #{s.id.slice(0, 8)}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(s.created_at, true)}
                    </p>
                  </div>
                  <span className="font-semibold text-stock-emerald">
                    {formatCurrency(Number(s.total))}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function KpiCard({
  label,
  value,
  icon: Icon,
  accent,
  subline,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: "mint" | "emerald" | "danger";
  subline?: string;
}) {
  const accentClasses = {
    mint: "bg-stock-mint/15 text-stock-emerald",
    emerald: "bg-stock-emerald/15 text-stock-emerald",
    danger: "bg-destructive/15 text-destructive",
  }[accent];

  return (
    <Card className="animate-fade-in">
      <CardContent className="flex items-start justify-between p-5">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="text-2xl font-bold">{value}</p>
          {subline ? <p className="text-xs text-muted-foreground">{subline}</p> : null}
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${accentClasses}`}>
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyHint({
  icon: Icon,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-8 text-center text-muted-foreground">
      <Icon className="h-8 w-8 opacity-40" />
      <p className="text-sm">{text}</p>
    </div>
  );
}
