import { HeaderLoja } from "@/components/layout/header-loja";

export default function LojaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/30">
      <HeaderLoja />
      <main className="container mx-auto max-w-6xl px-4 py-6 md:py-10">{children}</main>
    </div>
  );
}
