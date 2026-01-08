"use client";

import { useSidebar } from "@/context/SidebarContext";
import { SessionProvider } from "@/context/SessionContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import React from "react";

type AdminClientLayoutProps = {
  children: React.ReactNode;
  userName?: string | null;
  userEmail?: string | null;
};

export const AdminClientLayout: React.FC<AdminClientLayoutProps> = ({
  children,
  userName,
  userEmail,
}) => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  return (
    <SessionProvider userName={userName ?? null} userEmail={userEmail ?? null}>
      <div className="min-h-screen xl:flex">
        <AppSidebar />
        <Backdrop />
        <div
          className={`flex-1 transition-all  duration-300 ease-in-out ${mainContentMargin}`}
        >
          <AppHeader />
          <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
            {children}
          </div>
        </div>
      </div>
    </SessionProvider>
  );
};
