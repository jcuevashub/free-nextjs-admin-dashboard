import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import BasicTableOne from "@/components/tables/BasicTableOne";
import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Beneficiarios | TailAdmin - Panel Next.js",
  description:
    "Listado de beneficiarios con tabla básica en el panel TailAdmin.",
};

export default function RecipientsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Beneficiarios" />
      <ComponentCard title="Beneficiarios">
        <BasicTableOne />
      </ComponentCard>
    </div>
  );
}
