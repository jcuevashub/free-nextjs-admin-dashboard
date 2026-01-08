import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import BasicTableOne, { Order } from "@/components/tables/BasicTableOne";
import { createSupabaseServer } from "@/lib/supabaseServer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pagos | Fintech RD - Panel Next.js",
  description:
    "Listado de pagos con tabla básica en el panel Fintech RD.",
};

async function getPayments(): Promise<Order[]> {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("payments")
    .select(
      "id, customer_name, customer_role, project_name, budget, status, team_avatars, user_image"
    )
    .limit(20);

  if (error || !data) {
    return [];
  }

  return data.map((row) => ({
    id: row.id ?? Math.random(),
    user: {
      image: row.user_image || "/images/user/user-17.jpg",
      name: row.customer_name || "Cliente",
      role: row.customer_role || "Rol",
    },
    projectName: row.project_name || "Proyecto",
    team: {
      images: Array.isArray(row.team_avatars)
        ? row.team_avatars
        : ["/images/user/user-22.jpg"],
    },
    budget: row.budget ? `${row.budget}` : "—",
    status: row.status || "Pending",
  }));
}

export default async function PaymentsPage() {
  const payments = await getPayments();

  return (
    <div>
      <PageBreadcrumb pageTitle="Pagos" />
      <ComponentCard title="Pagos">
        <BasicTableOne rows={payments} />
      </ComponentCard>
    </div>
  );
}
