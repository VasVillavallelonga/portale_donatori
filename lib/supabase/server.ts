import { createServerClient } from "@supabase/ssr";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { redirect, unstable_rethrow } from "next/navigation";
import { safeNextPath } from "@/lib/auth";

export const createClient = cache(async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // I Server Components possono solo leggere i cookie. Il proxy
            // persiste eventuali token aggiornati nella risposta.
          }
        },
      },
    },
  );
});

async function redirectToLogin() {
  const pathname = safeNextPath((await headers()).get("x-portal-path"));
  redirect(`/login?next=${encodeURIComponent(pathname)}`);
}

function isSessionError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const value = error as { message?: string; code?: string; status?: number };
  const text = `${value.code ?? ""} ${value.message ?? ""}`.toLowerCase();
  return (
    value.status === 401 ||
    text.includes("jwt") ||
    text.includes("not authenticated") ||
    text.includes("auth session missing") ||
    text.includes("refresh token")
  );
}

export async function readClaims() {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase.auth.getClaims();
    if (error || !data?.claims) return null;
    return data.claims;
  } catch (error) {
    unstable_rethrow(error);
    console.error(error);
    return null;
  }
}

export async function readQuery<T>(
  request: () => PromiseLike<{ data: T | null; error: { message: string } | null }>,
  message: string,
) {
  let lastError: unknown;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const { data, error } = await request();
      if (!error) return data;
      if (isSessionError(error)) await redirectToLogin();
      lastError = error;
    } catch (error) {
      unstable_rethrow(error);
      if (isSessionError(error)) await redirectToLogin();
      lastError = error;
    }
  }

  console.error(lastError);
  throw new Error(message);
}
