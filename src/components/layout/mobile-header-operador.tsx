"use client";
import { useState } from "react";
import { Menu, Package } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { SidebarOperador } from "@/components/layout/sidebar-operador";

export function MobileHeaderOperador() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-stock-ink px-4 text-white md:hidden">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-stock-mint text-stock-ink">
          <Package className="h-4 w-4" />
        </div>
        <span className="text-sm font-bold">Operador</span>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button aria-label="Abrir menu" className="rounded-md p-2 hover:bg-white/10">
            <Menu className="h-5 w-5" />
          </button>
        </DialogTrigger>
        <DialogContent className="left-0 top-0 h-screen max-w-[280px] translate-x-0 translate-y-0 gap-0 border-r border-white/10 bg-stock-ink p-0 sm:rounded-none">
          <DialogTitle className="sr-only">Menu</DialogTitle>
          <SidebarOperador onNavigate={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </header>
  );
}
