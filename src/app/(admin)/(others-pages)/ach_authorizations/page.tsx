import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import BasicTableOne from "@/components/tables/BasicTableOne";
import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Autorizaciones ACH | TailAdmin - Panel Next.js",
  description:
    "Listado de autorizaciones ACH con tabla básica en el panel TailAdmin.",
};

export default function TransactionsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Autorizaciones ACH" />
      <ComponentCard title="Autorizaciones ACH">
        <BasicTableOne />
      </ComponentCard>
    </div>
  );
}
