'use server';

import { createSupabaseServer } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";
import { saveStepAction } from '@/app/actions/onboarding/save-step';

export async function signUpAction(formData: FormData) {
  const email = (formData.get("email") as string) || "";
  const password = (formData.get("password") as string) || "";
  const firstName = (formData.get("fname") as string) || "";
  const lastName = (formData.get("lname") as string) || "";

  const supabase = await createSupabaseServer();

  // Sign up the user with email confirmation disabled
  const {error: signUpError } = await supabase.auth.signUp({
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

  // Initialize onboarding case
  const result = await saveStepAction({
    step: 'start',
    data: {
      applicantFirstName: firstName,
      applicantLastName: lastName,
    },
  });

  if (!result.success) {

    return;
  }

  // Navigate to account selection with caseId
  const params = new URLSearchParams();
  params.set('caseId', result.caseId!);

  redirect(`/onboarding/company-info?${params.toString()}`);
}
