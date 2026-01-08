import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import BasicTableOne from "@/components/tables/BasicTableOne";
import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Taxes | TailAdmin - Next.js Dashboard Template",
  description:
    "Taxes list page showing a basic table example in TailAdmin Next.js dashboard.",
};

export default function TaxesPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Taxes" />
      <ComponentCard title="Taxes">
        <BasicTableOne />
      </ComponentCard>
    </div>
  );
}
