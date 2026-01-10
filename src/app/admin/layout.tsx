/**
 * Admin Layout
 *
 * Wraps all admin pages and ensures only users with role='owner' can access.
 */

import { createSupabaseServer } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protección: redirigir si no hay usuario
  if (!user) {
    redirect('/signin');
  }

  // Verificar que el usuario tenga rol de admin
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'owner') {
    redirect('/');
  }

  return <>{children}</>;
}
