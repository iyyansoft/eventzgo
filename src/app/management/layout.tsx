"use client";

import React from "react";
import ManagementHeader from "@/components/management/ManagementHeader";
import { ManagementAuthProvider } from "@/contexts/ManagementAuthContext";

export default function ManagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ManagementAuthProvider>
      <div className="min-h-screen bg-gray-50">
        <ManagementHeader />
        <main>{children}</main>
      </div>
    </ManagementAuthProvider>
  );
}