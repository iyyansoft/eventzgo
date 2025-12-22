'use client';

import React, { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import StatCard from '@/components/admin/StatCard';
import { Users, UserCheck, Shield, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';

export default function UserManagementPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState('all');
    const [currentPage, setCurrentPage] = useState(0);
    const pageSize = 20;

    // Fetch user data from Convex
    const usersData = useQuery(api.admin.getAllUsers, {
        limit: pageSize,
        offset: currentPage * pageSize,
        role: selectedRole,
        searchTerm: searchTerm || undefined,
    });

    // Fetch dashboard stats for user statistics
    const dashboardStats = useQuery(api.admin.getDashboardStats);

    const userStats = dashboardStats?.users ? {
        total: dashboardStats.users.total,
        active: dashboardStats.users.active,
        byRole: {
            organiser: dashboardStats.users.organisers || 0,
            vendor: 0,
            speaker: 0,
            sponsor: 0,
            user: dashboardStats.users.total - (dashboardStats.users.organisers || 0),
        }
    } : null;

    const roles = [
        { value: 'all', label: 'All Roles' },
        { value: 'user', label: 'Users' },
        { value: 'organiser', label: 'Organisers' },
        { value: 'vendor', label: 'Vendors' },
        { value: 'speaker', label: 'Speakers' },
        { value: 'sponsor', label: 'Sponsors' },
        { value: 'admin', label: 'Admins' },
    ];

    const getRoleBadgeColor = (role: string) => {
        const colors: Record<string, string> = {
            admin: 'bg-red-100 text-red-800',
            organiser: 'bg-purple-100 text-purple-800',
            vendor: 'bg-blue-100 text-blue-800',
            speaker: 'bg-green-100 text-green-800',
            sponsor: 'bg-orange-100 text-orange-800',
            user: 'bg-gray-100 text-gray-800',
        };
        return colors[role] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                <p className="text-gray-600 mt-2">
                    Manage and monitor all users synced from Clerk
                </p>
            </div>

            {/* Statistics Cards */}
            {userStats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Total Users"
                        value={userStats.total.toLocaleString()}
                        icon={Users}
                        color="blue"
                        subtitle="All registered users"
                    />
                    <StatCard
                        title="Active Users"
                        value={userStats.active.toLocaleString()}
                        icon={UserCheck}
                        color="green"
                        subtitle={`${((userStats.active / userStats.total) * 100).toFixed(1)}% active`}
                    />
                    <StatCard
                        title="Organisers"
                        value={(userStats?.byRole?.organiser || 0).toLocaleString()}
                        icon={Shield}
                        color="purple"
                        subtitle="Event organisers"
                    />
                    <StatCard
                        title="Vendors"
                        value={(userStats?.byRole?.vendor || 0).toLocaleString()}
                        icon={Users}
                        color="orange"
                        subtitle="Service providers"
                    />
                </div>
            )}

            {/* Filters and Search */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(0);
                                }}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Role Filter */}
                    <div className="md:w-64">
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <select
                                value={selectedRole}
                                onChange={(e) => {
                                    setSelectedRole(e.target.value);
                                    setCurrentPage(0);
                                }}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none bg-white"
                            >
                                {roles.map((role) => (
                                    <option key={role.value} value={role.value}>
                                        {role.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Role
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Joined
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {!usersData ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="flex justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                                        </div>
                                        <p className="text-gray-500 mt-4">Loading users...</p>
                                    </td>
                                </tr>
                            ) : usersData.users.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        No users found matching your criteria
                                    </td>
                                </tr>
                            ) : (
                                usersData.users.map((user) => (
                                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                                                    {user.firstName?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="font-medium text-gray-900">
                                                        {user.firstName && user.lastName
                                                            ? `${user.firstName} ${user.lastName}`
                                                            : user.firstName || user.email || 'No name'}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        ID: {user.clerkId?.slice(0, 12) || 'N/A'}...
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{user.email || 'No email'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
                                                    user.role
                                                )}`}
                                            >
                                                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-medium ${user.isActive
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                    }`}
                                            >
                                                {user.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {usersData && usersData.total > pageSize && (
                    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            Showing {currentPage * pageSize + 1} to{' '}
                            {Math.min((currentPage + 1) * pageSize, usersData.total)} of{' '}
                            {usersData.total} users
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                                disabled={currentPage === 0}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setCurrentPage((p) => p + 1)}
                                disabled={!usersData.hasMore}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
