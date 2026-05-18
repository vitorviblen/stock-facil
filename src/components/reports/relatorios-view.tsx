"use client";
import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { DollarSign, TrendingUp, ShoppingCart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatCurrency, formatDateShort } from "@/lib/utils";

type Sale = { total: number; created_at: string };

export function RelatoriosView({ sales }: { sales: Sale[] }) {
  const groups = useMemo(() => ({
    "7": filterByDays(sales, 7),
    "30": filterByDays(sales, 30),
    "90": filterByDays(sales, 90),
  }), [sales]);

  return (
    <Tabs defaultValue="30" className="space-y-6">
      <TabsList>
        <TabsTrigger value="7">Últimos 7 dias</TabsTrigger>
        <TabsTrigger value="30">Últimos 30 dias</TabsTrigger>
        <TabsTrigger value="90">Últimos 90 dias</TabsTrigger>
      </TabsList>

      {(["7", "30", "90"] as const).map((period) => {
        const data = groups[period];
        const total = data.reduce((sum, d) => sum + d.total, 0);
        const count = data.reduce((sum, d) => sum + d.count, 0);
        const ticket = count > 0 ? total / count : 0;

        return (
          <TabsContent key={period} value={period} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <KpiCard
                label="Total vendido"
                value={formatCurrency(total)}
                icon={DollarSign}
              />
              <KpiCard
                label="Nº de vendas"
                value={String(count)}
                icon={ShoppingCart}
              />
              <KpiCard
                label="Ticket médio"
                value={formatCurrency(ticket)}
                icon={TrendingUp}
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Vendas por dia</CardTitle>
              </CardHeader>
              <CardContent>
                {data.length === 0 ? (
                  <p className="py-12 text-center text-sm text-muted-foreground">
                    Sem vendas no período.
                  </p>
                ) : (
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="gradient-mint" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#00FFC3" stopOpacity={0.45} />
                            <stop offset="100%" stopColor="#00FFC3" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 12 }}
                          stroke="hsl(var(--muted-foreground))"
                        />
                        <YAxis
                          tickFormatter={(v) =>
                            new Intl.NumberFormat("pt-BR", {
                              notation: "compact",
                              maximumFractionDigits: 1,
                            }).format(v)
                          }
                          tick={{ fontSize: 12 }}
                          stroke="hsl(var(--muted-foreground))"
                        />
                        <Tooltip
                          formatter={(value: number) => formatCurrency(value)}
                          contentStyle={{
                            borderRadius: 8,
                            border: "1px solid hsl(var(--border))",
                            backgroundColor: "hsl(var(--background))",
                            fontSize: 12,
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="total"
                          stroke="#00AD85"
                          strokeWidth={2}
                          fill="url(#gradient-mint)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        );
      })}
    </Tabs>
  );
}

function KpiCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between p-5">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-stock-mint/15 text-stock-emerald">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

function filterByDays(sales: Sale[], days: number) {
  const start = new Date();
  start.setDate(start.getDate() - days);
  start.setHours(0, 0, 0, 0);

  const map = new Map<string, { date: string; total: number; count: number }>();
  for (let i = 0; i <= days; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    map.set(key, { date: formatDateShort(d), total: 0, count: 0 });
  }

  sales
    .filter((s) => new Date(s.created_at) >= start)
    .forEach((s) => {
      const key = s.created_at.slice(0, 10);
      const bucket = map.get(key);
      if (bucket) {
        bucket.total += Number(s.total);
        bucket.count += 1;
      }
    });

  return Array.from(map.values());
}
