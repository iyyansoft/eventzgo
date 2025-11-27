"use client";

import React from "react";

export default function Breadcrumbs() {
  return (
    <nav className="text-sm text-gray-500" aria-label="Breadcrumb">
      <ol className="list-none p-0 inline-flex">
        <li className="flex items-center">Home</li>
        <li className="flex items-center">/</li>
        <li className="flex items-center font-medium text-gray-900">Organiser</li>
      </ol>
    </nav>
  );
}
