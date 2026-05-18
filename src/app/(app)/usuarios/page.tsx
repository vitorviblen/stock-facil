import { redirect } from "next/navigation";
import { ShieldOff } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { UsersView } from "@/components/users/users-view";
import type { Profile } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function UsuariosPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: me } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (me?.role !== "admin") {
    return (
      <div className="animate-fade-in space-y-6">
        <header>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Usuários</h1>
        </header>
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <ShieldOff className="h-10 w-10 text-muted-foreground/50" />
            <p className="text-base font-semibold">Acesso restrito</p>
            <p className="text-sm text-muted-foreground">
              Apenas administradores podem gerenciar usuários.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Usuários</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie quem pode acessar e operar o sistema.
        </p>
      </header>

      <UsersView profiles={(profiles ?? []) as Profile[]} />
    </div>
  );
}
