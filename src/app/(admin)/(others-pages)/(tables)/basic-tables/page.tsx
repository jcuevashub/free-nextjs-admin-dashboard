import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import BasicTableOne from "@/components/tables/BasicTableOne";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tabla básica | TailAdmin - Panel Next.js",
  description:
    "Página de tabla básica para el panel TailAdmin con Tailwind CSS y Next.js",
  // other metadata
};

export default function BasicTables() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Tabla básica" />
      <div className="space-y-6">
        <ComponentCard title="Tabla básica 1">
          <BasicTableOne />
        </ComponentCard>
      </div>
    </div>
  );
}
