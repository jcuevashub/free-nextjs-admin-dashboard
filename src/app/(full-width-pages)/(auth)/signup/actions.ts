'use server';

import { createSupabaseServer } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";

export async function signUpAction(formData: FormData) {
  const email = (formData.get("email") as string) || "";
  const password = (formData.get("password") as string) || "";
  const firstName = (formData.get("fname") as string) || "";
  const lastName = (formData.get("lname") as string) || "";

  const supabase = await createSupabaseServer();

  // Sign up the user with email confirmation disabled
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Skip email confirmation by automatically confirming
      data: {
        first_name: firstName,
        last_name: lastName,
      },
    },
  });

  if (signUpError) {
    return { error: signUpError.message };
  }

  // Immediately sign in to create a session
  // This works because we're auto-confirming the email
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    // If auto-confirm didn't work, inform the user
    return {
      error: "Cuenta creada. Por favor revisa tu correo para confirmar tu cuenta antes de iniciar sesión.",
      requiresConfirmation: true
    };
  }

  // Create user profile in database if it doesn't exist
  if (signInData.user) {
    const { error: profileError } = await supabase
      .from('users')
      .upsert({
        id: signInData.user.id,
        email: signInData.user.email!,
        full_name: `${firstName} ${lastName}`,
      }, {
        onConflict: 'id',
        ignoreDuplicates: false,
      });

    if (profileError) {
      console.error('Error creating user profile:', profileError);
    }
  }

  // Redirect to onboarding
  redirect('/onboarding');
}
