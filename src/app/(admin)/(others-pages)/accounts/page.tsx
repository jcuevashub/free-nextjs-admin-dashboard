import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import BasicTableOne from "@/components/tables/BasicTableOne";
import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Accounts | Fintech RD - Next.js Dashboard Template",
  description:
    "Accounts list page showing a basic table example in Fintech RD Next.js dashboard.",
};

export default function AccountsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Cuentas" />
      <ComponentCard title="Cuentas">
        <BasicTableOne />
      </ComponentCard>
    </div>
  );
}
