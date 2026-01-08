import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import BasicTableOne from "@/components/tables/BasicTableOne";
import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Transacciones | TailAdmin - Panel Next.js",
  description:
    "Listado de transacciones con tabla básica en el panel TailAdmin.",
};

export default function TransactionsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Transacciones" />
      <ComponentCard title="Transacciones">
        <BasicTableOne />
      </ComponentCard>
    </div>
  );
}
