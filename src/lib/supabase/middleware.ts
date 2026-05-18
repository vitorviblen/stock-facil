import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";
import { DEMO_COOKIE } from "@/lib/demo/client";

const PUBLIC_PATHS = ["/login", "/cadastro"];

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.includes(pathname);

  // Demo mode — auth baseada em cookie demo_role
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "1") {
    const role = request.cookies.get(DEMO_COOKIE)?.value;
    const response = NextResponse.next({ request });

    if (!role && !isPublic) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    if (role && isPublic) {
      const url = request.nextUrl.clone();
      url.pathname = role === "cliente" ? "/loja" : role === "operator" ? "/operador" : "/dashboard";
      return NextResponse.redirect(url);
    }
    return response;
  }

  // Modo real (Supabase)
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && isPublic) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    const url = request.nextUrl.clone();
    url.pathname =
      profile?.role === "cliente" ? "/loja" : profile?.role === "operator" ? "/operador" : "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
