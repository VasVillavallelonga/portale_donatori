import { PrivateShell } from "@/components/private-shell";
import { safeNextPath } from "@/lib/auth";
import { readClaims } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function PrivateLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const claims = await readClaims();

  if (!claims) {
    const pathname = safeNextPath((await headers()).get("x-portal-path"));
    redirect(`/login?next=${encodeURIComponent(pathname)}`);
  }

  return <PrivateShell>{children}</PrivateShell>;
}
