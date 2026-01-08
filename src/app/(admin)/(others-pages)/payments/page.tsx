import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import BasicTableOne from "@/components/tables/BasicTableOne";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pagos | TailAdmin - Panel Next.js",
  description:
    "Listado de pagos con tabla básica en el panel TailAdmin.",
};

export default function PaymentsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Pagos" />
      <ComponentCard title="Pagos">
        <BasicTableOne />
      </ComponentCard>
    </div>
  );
}
