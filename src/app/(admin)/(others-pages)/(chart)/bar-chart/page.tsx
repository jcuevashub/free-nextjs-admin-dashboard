import BarChartOne from "@/components/charts/bar/BarChartOne";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Gráfico de barras | Fintech RD - Panel Next.js",
  description:
    "Página de gráfico de barras para el panel Fintech RD con Tailwind CSS y Next.js",
};

export default function page() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Gráfico de barras" />
      <div className="space-y-6">
        <ComponentCard title="Gráfico de barras 1">
          <BarChartOne />
        </ComponentCard>
      </div>
    </div>
  );
}
