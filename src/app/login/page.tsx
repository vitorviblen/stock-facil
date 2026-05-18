"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Package, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

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
      </div>
    </div>
  );
}
