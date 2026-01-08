import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import BasicTableOne from "@/components/tables/BasicTableOne";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Clientes | Fintech RD - Panel Next.js",
  description:
    "Listado de Clientes con tabla básica en el panel Fintech RD.",
};

export default function TransactionsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Clientes" />
      <ComponentCard title="Clientes">
        <BasicTableOne />
      </ComponentCard>
    </div>
  );
}
