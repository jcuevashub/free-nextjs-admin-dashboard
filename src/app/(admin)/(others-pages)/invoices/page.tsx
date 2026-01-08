import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import BasicTableOne from "@/components/tables/BasicTableOne";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Facturas | TailAdmin - Panel Next.js",
  description:
    "Listado de Facturas con tabla básica en el panel TailAdmin.",
};

export default function TransactionsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Facturas" />
      <ComponentCard title="Facturas">
        <BasicTableOne />
      </ComponentCard>
    </div>
  );
}
