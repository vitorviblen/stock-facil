import { Sidebar } from "@/components/layout/sidebar";
import { MobileHeader } from "@/components/layout/mobile-header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-muted/30">
      <MobileHeader />
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <main className="flex-1 overflow-x-hidden">
        <div className="container mx-auto px-4 py-6 md:px-8 md:py-8 max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
