export type SignInCredentials = {
  email: string;
  password: string;
};

export type SignInResult =
  | { success: true }
  | { success: false; message: string };

export async function signInWithPassword(
  credentials: SignInCredentials,
): Promise<SignInResult> {
  if (!credentials.email || !credentials.password) {
    return { success: false, message: "Inserisci email e password." };
  }

  const { createClient } = await import("@/lib/supabase/client");
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword(credentials);

  if (error) {
    return { success: false, message: "Email o password errati." };
  }

  return { success: true };
}

export async function signOut(): Promise<void> {
  const { createClient } = await import("@/lib/supabase/client");
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();

  if (error) throw error;
}
