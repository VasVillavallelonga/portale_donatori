export type SignInCredentials = {
  email: string;
  password: string;
};

export type SignInResult =
  | { success: true }
  | { success: false; message: string };

/**
 * Punto di integrazione per Supabase.
 * Sostituire il corpo con supabase.auth.signInWithPassword(credentials).
 */
export async function signInWithPassword(
  credentials: SignInCredentials,
): Promise<SignInResult> {
  if (!credentials.email || !credentials.password) {
    return { success: false, message: "Inserisci email e password." };
  }

  return { success: true };
}
