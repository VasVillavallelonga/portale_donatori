import { PrivateShell } from "@/components/private-shell";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function PrivateLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();

  if (!claims) {
    redirect("/login");
  }

  return <PrivateShell>{children}</PrivateShell>;
}
