import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SidebarOperador } from "@/components/layout/sidebar-operador";
import { MobileHeaderOperador } from "@/components/layout/mobile-header-operador";

export const dynamic = "force-dynamic";

export default async function OperadorLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (me?.role !== "operator" && me?.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/30 md:flex-row">
      <MobileHeaderOperador />
      <div className="hidden md:block">
        <SidebarOperador />
      </div>
      <main className="flex-1 overflow-x-hidden">
        <div className="container mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">{children}</div>
      </main>
    </div>
  );
}
