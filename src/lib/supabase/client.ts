import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { createDemoClient } from "@/lib/demo/client";

function browserCookies() {
  return {
    get(name: string) {
      if (typeof document === "undefined") return undefined;
      const match = document.cookie.split("; ").find((c) => c.startsWith(name + "="));
      return match ? decodeURIComponent(match.split("=")[1]) : undefined;
    },
    set(name: string, value: string, options?: Record<string, unknown>) {
      if (typeof document === "undefined") return;
      const maxAge = (options?.maxAge as number) ?? 60 * 60 * 24;
      document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}`;
    },
    delete(name: string) {
      if (typeof document === "undefined") return;
      document.cookie = `${name}=; path=/; max-age=0`;
    },
  };
}

export function createClient() {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "1") {
    return createDemoClient(browserCookies()) as unknown as ReturnType<typeof createBrowserClient<Database>>;
  }
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
