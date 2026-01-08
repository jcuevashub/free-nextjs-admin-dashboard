import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import BasicTableOne from "@/components/tables/BasicTableOne";
import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Tarjetas | Fintech RD - Panel Next.js",
  description:
    "Listado de tarjetas con tabla básica en el panel Fintech RD.",
};

export default function CardsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Tarjetas" />
      <ComponentCard title="Tarjetas">
        <BasicTableOne />
      </ComponentCard>
    </div>
  );
}
