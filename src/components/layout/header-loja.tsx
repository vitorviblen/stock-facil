"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Package, ShoppingCart, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const navItems = [
  { href: "/loja", label: "Produtos" },
  { href: "/meus-pedidos", label: "Meus Pedidos" },
];

export function HeaderLoja({ authed = true }: { authed?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Você saiu.");
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 border-b bg-stock-ink text-white">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href={authed ? "/loja" : "/login"} className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-stock-mint text-stock-ink">
            <Package className="h-4 w-4" />
          </div>
          <span className="text-base font-bold">StockFácil</span>
        </Link>

        {authed ? (
          <>
            <nav className="hidden gap-1 md:flex">
              {navItems.map(({ href, label }) => {
                const active = pathname === href || pathname.startsWith(href + "/");
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-stock-mint/15 text-stock-mint"
                        : "text-white/70 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-1">
              <Link
                href="/carrinho"
                aria-label="Carrinho"
                className="flex h-9 w-9 items-center justify-center rounded-md text-white/70 hover:bg-white/5 hover:text-white"
              >
                <ShoppingCart className="h-4 w-4" />
              </Link>
              <button
                onClick={handleLogout}
                aria-label="Sair"
                className="flex h-9 w-9 items-center justify-center rounded-md text-white/70 hover:bg-white/5 hover:text-white"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-stock-mint hover:bg-white/5"
          >
            <User className="h-4 w-4" /> Entrar
          </Link>
        )}
      </div>
    </header>
  );
}
