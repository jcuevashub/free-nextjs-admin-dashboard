'use server';

import { createSupabaseServer } from "@/lib/supabaseServer";

export async function signUpAction(formData: FormData) {
  const email = (formData.get("email") as string) || "";
  const password = (formData.get("password") as string) || "";

  const supabase = await createSupabaseServer();

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${siteUrl}/signin`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
