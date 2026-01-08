import { createSupabaseServer } from "@/lib/supabaseServer";
import { AdminClientLayout } from "@/layout/AdminClientLayout";
import React from "react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userName =
    (user?.user_metadata?.full_name as string | undefined) || user?.email || null;
  const userEmail = user?.email || null;

  return (
    <AdminClientLayout userName={userName} userEmail={userEmail}>
      {children}
    </AdminClientLayout>
  );
}
