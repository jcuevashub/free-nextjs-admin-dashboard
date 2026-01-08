import Calendar from "@/components/calendar/Calendar";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Calendario | Fintech RD - Panel Next.js",
  description:
    "Página de calendario para el panel Fintech RD con Tailwind CSS",
  // other metadata
};
export default function page() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Calendario" />
      <Calendar />
    </div>
  );
}
