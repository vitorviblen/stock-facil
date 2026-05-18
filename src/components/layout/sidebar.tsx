"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  PackagePlus,
  Package,
  ArrowDownToLine,
  ShoppingCart,
  BarChart3,
  Bell,
  Users,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/produtos/novo", label: "Cadastrar Produto", icon: PackagePlus },
  { href: "/produtos", label: "Produtos", icon: Package },
  { href: "/estoque/entrada", label: "Entrada de Estoque", icon: ArrowDownToLine },
  { href: "/vendas", label: "Vendas", icon: ShoppingCart },
  { href: "/relatorios", label: "Relatórios", icon: BarChart3 },
  { href: "/alertas", label: "Alertas", icon: Bell },
  { href: "/usuarios", label: "Usuários", icon: Users },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Erro ao sair");
      return;
    }
    toast.success("Você saiu. Até logo!");
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="flex h-full w-64 flex-col bg-stock-ink text-white">
      <div className="flex items-center gap-2 px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-stock-mint text-stock-ink">
          <Package className="h-5 w-5" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-base font-bold">Stock Fácil</span>
          <span className="text-xs text-stock-mint">Controle inteligente</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 pt-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-stock-mint/15 text-stock-mint"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        <Button
          variant="ghost"
          className="w-full justify-start text-white/70 hover:bg-white/5 hover:text-white"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>
    </aside>
  );
}
