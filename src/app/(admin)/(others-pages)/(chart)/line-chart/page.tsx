import LineChartOne from "@/components/charts/line/LineChartOne";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Gráfico de líneas | Fintech RD - Panel Next.js",
  description:
    "Página de gráfico de líneas para el panel Fintech RD con Tailwind CSS y Next.js",
};
export default function LineChart() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Gráfico de líneas" />
      <div className="space-y-6">
        <ComponentCard title="Gráfico de líneas 1">
          <LineChartOne />
        </ComponentCard>
      </div>
    </div>
  );
}
