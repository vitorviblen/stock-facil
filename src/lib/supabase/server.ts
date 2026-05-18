import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";
import { createDemoClient } from "@/lib/demo/client";

export function createClient() {
  const cookieStore = cookies();

  if (process.env.NEXT_PUBLIC_DEMO_MODE === "1") {
    return createDemoClient({
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options?: Record<string, unknown>) {
        try {
          cookieStore.set(name, value, options);
        } catch {
          // Server Component context — ignorar (não dá pra setar cookie aqui)
        }
      },
      delete(name: string) {
        try {
          cookieStore.delete(name);
        } catch {
          // idem
        }
      },
    }) as unknown as ReturnType<typeof createServerClient<Database>>;
  }

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );
}
