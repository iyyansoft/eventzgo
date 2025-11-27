"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import DataTable from "@/components/management/DataTable";
import UserManagement from "@/components/admin/UserManagement";

export default function AdminUsersPage() {
  const [filter, setFilter] = useState<"all" | "user" | "organiser" | "admin">("all");
  
  const users = useQuery(api.users.getAllUsers, {
    role: filter === "all" ? undefined : (filter as any),
  });

  if (!users) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-purple-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-purple-600 rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading users...</p>
        </div>
      </div>
    );
  }

  const columns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "role", label: "Role" },
    { key: "status", label: "Status" },
    { key: "createdAt", label: "Joined" },
    { key: "actions", label: "Actions" },
  ];

  const tableData = users.map((user) => ({
    ...user,
    name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "N/A",
    status: user.isActive ? "Active" : "Inactive",
    createdAt: new Date(user.createdAt).toLocaleDateString(),
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          User Management
        </h1>
        <p className="text-gray-600">
          Manage platform users and roles
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === "all"
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            All Users
          </button>
          <button
            onClick={() => setFilter("user")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === "user"
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Regular Users
          </button>
          <button
            onClick={() => setFilter("organiser")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === "organiser"
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Organisers
          </button>
          <button
            onClick={() => setFilter("admin")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === "admin"
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Admins
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
          <p className="text-sm text-gray-600 mb-1">Total Users</p>
          <p className="text-3xl font-bold text-gray-900">{users.length}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
          <p className="text-sm text-gray-600 mb-1">Regular Users</p>
          <p className="text-3xl font-bold text-gray-900">
            {users.filter((u) => u.role === "user").length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
          <p className="text-sm text-gray-600 mb-1">Organisers</p>
          <p className="text-3xl font-bold text-gray-900">
            {users.filter((u) => u.role === "organiser").length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
          <p className="text-sm text-gray-600 mb-1">Admins</p>
          <p className="text-3xl font-bold text-gray-900">
            {users.filter((u) => u.role === "admin").length}
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <DataTable
          columns={columns}
          data={tableData}
          emptyMessage="No users found"
        />
      </div>
    </div>
  );
}