"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

const Breadcrumbs = () => {
  const router = useRouter();
  const pathname = usePathname();

  const pathSegments = (pathname ?? "").split("/").filter(Boolean);

  type BreadcrumbItem = {
    label: string;
    path: string;
    icon?: React.ElementType;
  };

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Home", path: "/management/dashboard", icon: Home },
  ];

  let currentPath = "";
  pathSegments.forEach((segment) => {
    if (segment === "management") return;

    currentPath += `/${segment}`;
    const fullPath = `/management${currentPath}`;

    const label = segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    breadcrumbItems.push({
      label,
      path: fullPath,
    });
  });

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={item.path}>
          {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
          {index === breadcrumbItems.length - 1 ? (
            <span className="flex items-center space-x-1 text-purple-600 font-medium">
              {item.icon && <item.icon className="w-4 h-4" />}
              <span>{item.label}</span>
            </span>
          ) : (
            <button
              onClick={() => router.push(item.path)}
              className="flex items-center space-x-1 hover:text-purple-600 transition-colors duration-200 text-gray-600"
            >
              {item.icon && <item.icon className="w-4 h-4" />}
              <span>{item.label}</span>
            </button>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumbs;