// Mock minimalista do Supabase Client pra apresentação sem backend real.
// Implementa só o subset usado pelas páginas: from().select/eq/gte/.../order/limit, rpc, auth.

import { demoData, demoProfiles, type DemoTable } from "./data";

export const DEMO_COOKIE = "demo_role";

type Filter =
  | { type: "eq"; col: string; val: unknown }
  | { type: "neq"; col: string; val: unknown }
  | { type: "gt"; col: string; val: unknown }
  | { type: "gte"; col: string; val: unknown }
  | { type: "lt"; col: string; val: unknown }
  | { type: "lte"; col: string; val: unknown }
  | { type: "in"; col: string; vals: unknown[] };

interface Order {
  col: string;
  ascending: boolean;
}

function applyFilters<T extends Record<string, unknown>>(rows: T[], filters: Filter[]): T[] {
  return rows.filter((row) =>
    filters.every((f) => {
      const v = row[f.col as keyof T];
      switch (f.type) {
        case "eq":
          return v === f.val;
        case "neq":
          return v !== f.val;
        case "gt":
          return (v as number | string) > (f.val as number | string);
        case "gte":
          return (v as number | string) >= (f.val as number | string);
        case "lt":
          return (v as number | string) < (f.val as number | string);
        case "lte":
          return (v as number | string) <= (f.val as number | string);
        case "in":
          return f.vals.includes(v);
      }
    })
  );
}

class MockQueryBuilder<T extends Record<string, unknown>> implements PromiseLike<{ data: T[] | null; error: null; count?: number }> {
  private table: DemoTable;
  private filters: Filter[] = [];
  private orderBy: Order | null = null;
  private limitN: number | null = null;
  private wantCount = false;
  private headOnly = false;
  private isSingle = false;

  constructor(table: DemoTable) {
    this.table = table;
  }

  select(_cols?: string, opts?: { count?: string; head?: boolean }) {
    if (opts?.count) this.wantCount = true;
    if (opts?.head) this.headOnly = true;
    return this;
  }
  insert(_payload: unknown) {
    return this;
  }
  update(_payload: unknown) {
    return this;
  }
  delete() {
    return this;
  }
  eq(col: string, val: unknown) {
    this.filters.push({ type: "eq", col, val });
    return this;
  }
  neq(col: string, val: unknown) {
    this.filters.push({ type: "neq", col, val });
    return this;
  }
  gt(col: string, val: unknown) {
    this.filters.push({ type: "gt", col, val });
    return this;
  }
  gte(col: string, val: unknown) {
    this.filters.push({ type: "gte", col, val });
    return this;
  }
  lt(col: string, val: unknown) {
    this.filters.push({ type: "lt", col, val });
    return this;
  }
  lte(col: string, val: unknown) {
    this.filters.push({ type: "lte", col, val });
    return this;
  }
  in(col: string, vals: unknown[]) {
    this.filters.push({ type: "in", col, vals });
    return this;
  }
  filter(col: string, op: string, val: unknown) {
    if (op === "lte") this.lte(col, val);
    else if (op === "gte") this.gte(col, val);
    else if (op === "eq") this.eq(col, val);
    return this;
  }
  order(col: string, opts?: { ascending?: boolean }) {
    this.orderBy = { col, ascending: opts?.ascending ?? true };
    return this;
  }
  limit(n: number) {
    this.limitN = n;
    return this;
  }
  single() {
    this.isSingle = true;
    return this;
  }

  private run(): { data: T[] | T | null; error: null; count?: number } {
    const all = demoData[this.table] as unknown as T[];
    let rows = applyFilters(all, this.filters);

    if (this.orderBy) {
      const { col, ascending } = this.orderBy;
      rows = [...rows].sort((a, b) => {
        const x = a[col as keyof T], y = b[col as keyof T];
        if (x === y) return 0;
        const r = (x as number | string) > (y as number | string) ? 1 : -1;
        return ascending ? r : -r;
      });
    }
    const count = rows.length;
    if (this.limitN) rows = rows.slice(0, this.limitN);

    if (this.isSingle) {
      return { data: (rows[0] as T) ?? null, error: null };
    }
    if (this.headOnly) {
      return { data: null, error: null, count };
    }
    if (this.wantCount) {
      return { data: rows, error: null, count };
    }
    return { data: rows, error: null };
  }

  // PromiseLike — permite `await query`
  then<R1 = { data: T[] | null; error: null; count?: number }, R2 = never>(
    onFulfilled?: ((v: { data: T[] | null; error: null; count?: number }) => R1 | PromiseLike<R1>) | null,
    onRejected?: ((reason: unknown) => R2 | PromiseLike<R2>) | null
  ): PromiseLike<R1 | R2> {
    const result = this.run() as unknown as { data: T[] | null; error: null; count?: number };
    return Promise.resolve(result).then(onFulfilled as never, onRejected as never);
  }
}

type CookieAccess = {
  get: (name: string) => string | undefined;
  set?: (name: string, value: string, options?: Record<string, unknown>) => void;
  delete?: (name: string) => void;
};

export function createDemoClient(cookies: CookieAccess) {
  function getCurrentUser() {
    const role = cookies.get(DEMO_COOKIE) as "admin" | "operator" | "cliente" | undefined;
    if (!role) return null;
    const profile = demoProfiles.find((p) => p.role === role);
    if (!profile) return null;
    return {
      id: profile.id,
      email: profile.email,
      user_metadata: { full_name: profile.full_name, role: profile.role },
    };
  }

  return {
    from: (table: string) => new MockQueryBuilder(table as DemoTable),
    rpc: (_name: string, _args: unknown) =>
      Promise.resolve({ data: "demo-id-" + Math.random().toString(36).slice(2, 10), error: null }),
    auth: {
      getUser: async () => ({ data: { user: getCurrentUser() }, error: null }),
      getSession: async () => {
        const user = getCurrentUser();
        return { data: { session: user ? { user } : null }, error: null };
      },
      signInWithPassword: async ({ email }: { email: string; password: string }) => {
        const profile = demoProfiles.find((p) => p.email === email);
        if (!profile) return { data: null, error: { message: "Demo: usuário não encontrado" } };
        cookies.set?.(DEMO_COOKIE, profile.role, { path: "/", maxAge: 60 * 60 * 24 });
        return { data: { user: { id: profile.id, email: profile.email } }, error: null };
      },
      signUp: async ({ email, options }: { email: string; password: string; options?: { data?: { full_name?: string; role?: string } } }) => {
        const role = (options?.data?.role as "cliente" | undefined) ?? "cliente";
        cookies.set?.(DEMO_COOKIE, role, { path: "/", maxAge: 60 * 60 * 24 });
        return { data: { user: { id: "demo-new-" + Date.now(), email } }, error: null };
      },
      signOut: async () => {
        cookies.delete?.(DEMO_COOKIE);
        return { error: null };
      },
    },
  };
}

export type DemoClient = ReturnType<typeof createDemoClient>;
