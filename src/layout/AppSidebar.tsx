"use client";
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import {
  BoxCubeIcon,
  ChevronDownIcon,
  EnvelopeIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  PieChartIcon,
  PlugInIcon,
} from "../icons/index";
import SidebarWidget from "./SidebarWidget";
import CompanyDropdown from "@/components/header/CompanyDropdown";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { icon?: React.ReactNode; name: string; path: string; pro?: boolean; new?: boolean }[];
};

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Panel",
    path: "/",
  },
  {
    icon: <ListIcon />,
    name: "Transacciones",
    path: "/transactions",
  },
  {
    name: "Pagos",
    icon: <ListIcon />,
    path: "/payments",
    subItems: [
      { icon: <ListIcon />, name: "Beneficiarios", path: "/recipients", pro: false },
      { name: "Impuestos", path: "/payments", pro: false },
      { name: "Autorizaciones ACH", path: "/ach_authorizations", pro: false },
    ],
  },
  {
    name: "Tarjetas",
    icon: <EnvelopeIcon />,
    path: "/cards",
  },
   {
    name: "Cuentas",
    icon: <ListIcon />,
    path: "/accounts"
  },
];

const othersItems: NavItem[] = [
  {
    icon: <PieChartIcon />,
    name: "Pagos de servicios",
    path: "/bill-pay"
  },
  {
    icon: <PieChartIcon />,
    name: "Facturas",
    path: "/invoices",
    subItems: [
      { name: "Catalogo", path: "/catalog", pro: true },
      { name: "Clientes", path: "/customers", pro: true }
    ],
  },
  {
    icon: <ListIcon />,
    name: "Reembolsos",
    path: "/reimbursements"
  },
  {
    icon: <ListIcon />,
    name: "Contabilidad",
    path: "/accounting"
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  const matchedSubmenu = useMemo(() => {
    for (const menuType of ["main", "others"] as const) {
      const items = menuType === "main" ? navItems : othersItems;
      const matchedIndex = items.findIndex(
        (nav) =>
          (nav.path && isActive(nav.path)) ||
          nav.subItems?.some((subItem) => isActive(subItem.path))
      );

      if (matchedIndex !== -1) {
        return { type: menuType, index: matchedIndex } as const;
      }
    }
    return null;
  }, [isActive]);

  const currentOpenSubmenu = matchedSubmenu ?? openSubmenu;

  useEffect(() => {
    if (currentOpenSubmenu !== null) {
      const key = `${currentOpenSubmenu.type}-${currentOpenSubmenu.index}`;
      const target = subMenuRefs.current[key];

      if (target) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: target.scrollHeight || 0,
        }));
      }
    }
  }, [currentOpenSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (
    navItems: NavItem[],
    menuType: "main" | "others"
  ) => (
    <ul className="flex flex-col gap-4">
      {navItems.map((nav, index) => {
        const isSubmenuOpen =
          currentOpenSubmenu?.type === menuType &&
          currentOpenSubmenu?.index === index;
        const isNavActive = nav.path ? isActive(nav.path) : false;

        return (
          <li key={nav.name}>
            {nav.subItems ? (
              <div className="flex items-center gap-2">
                {nav.path ? (
                  <Link
                    href={nav.path}
                    className={`menu-item group flex-1 ${
                      isNavActive || isSubmenuOpen
                        ? "menu-item-active"
                        : "menu-item-inactive"
                    } ${
                      !isExpanded && !isHovered
                        ? "lg:justify-center"
                        : "lg:justify-start"
                    }`}
                  >
                    <span
                      className={` ${
                        isNavActive || isSubmenuOpen
                          ? "menu-item-icon-active"
                          : "menu-item-icon-inactive"
                      }`}
                    >
                      {nav.icon}
                    </span>
                    {(isExpanded || isHovered || isMobileOpen) && (
                      <span className={`menu-item-text`}>{nav.name}</span>
                    )}
                  </Link>
                ) : (
                  <button
                    onClick={() => handleSubmenuToggle(index, menuType)}
                    className={`menu-item group flex-1 ${
                      isSubmenuOpen ? "menu-item-active" : "menu-item-inactive"
                    } cursor-pointer ${
                      !isExpanded && !isHovered
                        ? "lg:justify-center"
                        : "lg:justify-start"
                    }`}
                  >
                    <span
                      className={` ${
                        isSubmenuOpen
                          ? "menu-item-icon-active"
                          : "menu-item-icon-inactive"
                      }`}
                    >
                      {nav.icon}
                    </span>
                    {(isExpanded || isHovered || isMobileOpen) && (
                      <span className={`menu-item-text`}>{nav.name}</span>
                    )}
                  </button>
                )}
                {(isExpanded || isHovered || isMobileOpen) && (
                  <button
                    onClick={() => handleSubmenuToggle(index, menuType)}
                    aria-label={`Toggle ${nav.name} submenu`}
                    className="flex items-center justify-center w-10 h-10 text-gray-500 transition-colors rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                  >
                    <ChevronDownIcon
                      className={`w-5 h-5 transition-transform duration-200  ${
                        isSubmenuOpen ? "rotate-180 text-brand-500" : ""
                      }`}
                    />
                  </button>
                )}
              </div>
            ) : (
              nav.path && (
                <Link
                  href={nav.path}
                  className={`menu-item group ${
                    isActive(nav.path)
                      ? "menu-item-active"
                      : "menu-item-inactive"
                  }`}
                >
                  <span
                    className={`${
                      isActive(nav.path)
                        ? "menu-item-icon-active"
                        : "menu-item-icon-inactive"
                    }`}
                  >
                    {nav.icon}
                  </span>
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className={`menu-item-text`}>{nav.name}</span>
                  )}
                </Link>
              )
            )}
            {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
              <div
                ref={(el) => {
                  subMenuRefs.current[`${menuType}-${index}`] = el;
                }}
                className="overflow-hidden transition-all duration-300"
                style={{
                  height: isSubmenuOpen
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
                }}
              >
                <ul className="mt-2 space-y-1 ml-9">
                  {nav.subItems.map((subItem) => (
                    <li key={subItem.name}>
                      <Link
                        href={subItem.path}
                        className={`menu-dropdown-item ${
                          isActive(subItem.path)
                            ? "menu-dropdown-item-active"
                            : "menu-dropdown-item-inactive"
                        }`}
                      >
                        {subItem.name}
                        <span className="flex items-center gap-1 ml-auto">
                          {subItem.new && (
                            <span
                              className={`ml-auto ${
                                isActive(subItem.path)
                                  ? "menu-dropdown-badge-active"
                                  : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge `}
                            >
                              new
                            </span>
                          )}
                          {subItem.pro && (
                            <span
                              className={`ml-auto ${
                                isActive(subItem.path)
                                  ? "menu-dropdown-badge-active"
                                  : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge `}
                            >
                              pro
                            </span>
                          )}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-72.5"
            : isHovered
            ? "w-72.5"
            : "w-22.5"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex  ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
  
          {isExpanded || isHovered || isMobileOpen ? (
           <CompanyDropdown /> 
          ) : (
            <Image
              src="/images/logo/company-logo.png"
              alt="Logo"
              width={32}
              height={32}
            />
          )}

      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-5 text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>

            <div className="">
              <h2
                className={`mb-4 text-xs uppercase flex leading-5 text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Workflows"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(othersItems, "others")}
            </div>
          </div>
        </nav>
        {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null}
      </div>
    </aside>
  );
};

export default AppSidebar;
