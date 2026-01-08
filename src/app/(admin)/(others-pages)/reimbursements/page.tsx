import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import BasicTableOne from "@/components/tables/BasicTableOne";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reimbursements | Fintech RD - Panel Next.js",
  description:
    "Listado de Reimbursements con tabla básica en el panel Fintech RD.",
};

export default function TransactionsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Reimbursements" />
      <ComponentCard title="Reimbursements">
        <BasicTableOne />
      </ComponentCard>
    </div>
  );
}
