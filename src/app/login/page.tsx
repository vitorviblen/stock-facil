"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Package, Loader2, ShieldCheck, Truck, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "1";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error("Credenciais inválidas. Tenta de novo.");
      return;
    }
    toast.success("Bem-vindo de volta!");
    router.push("/");
    router.refresh();
  }

  async function demoLogin(email: string, label: string, target: string) {
    setDemoLoading(label);
    const supabase = createClient();
    await supabase.auth.signInWithPassword({ email, password: "demo" });
    setDemoLoading(null);
    toast.success(`Entrando como ${label}…`);
    router.push(target);
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-stock-ink via-stock-ink to-stock-emerald/30 p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="mb-8 flex flex-col items-center gap-3 text-white">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-stock-mint text-stock-ink shadow-lg shadow-stock-mint/30">
            <Package className="h-7 w-7" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold">Stock Fácil</h1>
            <p className="text-sm text-stock-mint">Controle inteligente de estoque</p>
          </div>
        </div>

        <Card className="border-white/10 bg-white/95 backdrop-blur">
          <CardContent className="pt-6">
            <div className="mb-6 space-y-1">
              <h2 className="text-xl font-bold">Entrar na sua conta</h2>
              <p className="text-sm text-muted-foreground">Use seu e-mail e senha pra continuar.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@empresa.com"
                  required
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  minLength={6}
                />
              </div>

              <Button
                type="submit"
                variant="mint"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </form>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              Não tem conta?{" "}
              <Link href="/cadastro" className="font-semibold text-stock-emerald hover:underline">
                Cadastre-se como cliente
              </Link>
            </p>
          </CardContent>
        </Card>

        {DEMO_MODE ? (
          <Card className="mt-4 border-stock-mint/30 bg-white/95 backdrop-blur">
            <CardContent className="pt-6">
              <div className="mb-3 space-y-1">
                <h3 className="text-sm font-bold uppercase tracking-wide text-stock-emerald">
                  Modo demonstração
                </h3>
                <p className="text-xs text-muted-foreground">
                  Entre como qualquer perfil sem senha — dados de demonstração.
                </p>
              </div>
              <div className="grid gap-2">
                <Button
                  variant="outline"
                  className="justify-start"
                  disabled={!!demoLoading}
                  onClick={() => demoLogin("admin@teste.com", "Administrador", "/dashboard")}
                >
                  {demoLoading === "Administrador" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="h-4 w-4 text-stock-emerald" />
                  )}
                  Entrar como Administrador
                </Button>
                <Button
                  variant="outline"
                  className="justify-start"
                  disabled={!!demoLoading}
                  onClick={() => demoLogin("op@teste.com", "Operador", "/operador")}
                >
                  {demoLoading === "Operador" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Truck className="h-4 w-4 text-stock-emerald" />
                  )}
                  Entrar como Operador
                </Button>
                <Button
                  variant="outline"
                  className="justify-start"
                  disabled={!!demoLoading}
                  onClick={() => demoLogin("cliente@teste.com", "Cliente", "/loja")}
                >
                  {demoLoading === "Cliente" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ShoppingBag className="h-4 w-4 text-stock-emerald" />
                  )}
                  Entrar como Cliente
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
