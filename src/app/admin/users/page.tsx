'use client';

import React, { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import StatCard from '@/components/admin/StatCard';
import { Users, UserCheck, Shield, Search, Filter, Building2, Clock, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function UserManagementPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [currentPage, setCurrentPage] = useState(0);
    const pageSize = 20;

    // Fetch all organisers from Convex
    const organisersData = useQuery(api.organisers.getAllOrganisers, {});

    // Filter organisers based on search and status
    const filteredOrganisers = organisersData?.filter((org) => {
        const matchesSearch = !searchTerm ||
            org.institutionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            org.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            org.username?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = selectedStatus === 'all' || org.accountStatus === selectedStatus;

        return matchesSearch && matchesStatus;
    }) || [];

    // Pagination
    const paginatedOrganisers = filteredOrganisers.slice(
        currentPage * pageSize,
        (currentPage + 1) * pageSize
    );

    // Calculate statistics
    const stats = {
        total: organisersData?.length || 0,
        pending_verification: organisersData?.filter(o => o.accountStatus === 'pending_verification').length || 0,
        pending_setup: organisersData?.filter(o => o.accountStatus === 'pending_setup').length || 0,
        pending_approval: organisersData?.filter(o => o.accountStatus === 'pending_approval').length || 0,
        active: organisersData?.filter(o => o.accountStatus === 'active').length || 0,
    };

    const statuses = [
        { value: 'all', label: 'All Status' },
        { value: 'pending_verification', label: 'Email Not Verified' },
        { value: 'pending_setup', label: 'Onboarding Pending' },
        { value: 'pending_approval', label: 'Awaiting Approval' },
        { value: 'active', label: 'Active' },
        { value: 'suspended', label: 'Suspended' },
        { value: 'rejected', label: 'Rejected' },
    ];

    const getStatusBadge = (status: string) => {
        const badges: Record<string, { color: string; label: string; icon: any }> = {
            pending_verification: {
                color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                label: 'Email Not Verified',
                icon: Clock
            },
            pending_setup: {
                color: 'bg-blue-100 text-blue-800 border-blue-200',
                label: 'Onboarding Pending',
                icon: Clock
            },
            pending_approval: {
                color: 'bg-orange-100 text-orange-800 border-orange-200',
                label: 'Awaiting Approval',
                icon: Clock
            },
            active: {
                color: 'bg-green-100 text-green-800 border-green-200',
                label: 'Active',
                icon: CheckCircle
            },
            suspended: {
                color: 'bg-red-100 text-red-800 border-red-200',
                label: 'Suspended',
                icon: XCircle
            },
            rejected: {
                color: 'bg-gray-100 text-gray-800 border-gray-200',
                label: 'Rejected',
                icon: XCircle
            },
        };
        return badges[status] || badges.pending_verification;
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                <p className="text-gray-600 mt-2">
                    View all registered organisers and their account status
                </p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <StatCard
                    title="Total Organisers"
                    value={stats.total.toLocaleString()}
                    icon={Building2}
                    color="blue"
                    subtitle="All registered"
                />
                <StatCard
                    title="Email Pending"
                    value={stats.pending_verification.toLocaleString()}
                    icon={Clock}
                    color="orange"
                    subtitle="Not verified"
                />
                <StatCard
                    title="Onboarding"
                    value={stats.pending_setup.toLocaleString()}
                    icon={Clock}
                    color="blue"
                    subtitle="Incomplete"
                />
                <StatCard
                    title="Awaiting Approval"
                    value={stats.pending_approval.toLocaleString()}
                    icon={Clock}
                    color="orange"
                    subtitle="Ready for review"
                />
                <StatCard
                    title="Active"
                    value={stats.active.toLocaleString()}
                    icon={CheckCircle}
                    color="green"
                    subtitle="Fully functional"
                />
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by institution name, email, or username..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(0);
                                }}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div className="md:w-64">
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <select
                                value={selectedStatus}
                                onChange={(e) => {
                                    setSelectedStatus(e.target.value);
                                    setCurrentPage(0);
                                }}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none bg-white"
                            >
                                {statuses.map((status) => (
                                    <option key={status.value} value={status.value}>
                                        {status.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Organisers Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Institution
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Contact
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Username
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Account Status
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Registered
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {!organisersData ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="flex justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                                        </div>
                                        <p className="text-gray-500 mt-4">Loading organisers...</p>
                                    </td>
                                </tr>
                            ) : paginatedOrganisers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        No organisers found matching your criteria
                                    </td>
                                </tr>
                            ) : (
                                paginatedOrganisers.map((org) => {
                                    const statusBadge = getStatusBadge(org.accountStatus || 'pending_verification');
                                    const StatusIcon = statusBadge.icon;

                                    return (
                                        <tr key={org._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                                                        {org.institutionName?.[0]?.toUpperCase() || 'O'}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="font-medium text-gray-900">
                                                            {org.institutionName}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {org.address?.city}, {org.address?.state}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">{org.email || 'No email'}</div>
                                                <div className="text-sm text-gray-500">{org.phone || 'No phone'}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900 font-mono">
                                                    {org.username || 'Not set'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${statusBadge.color}`}
                                                >
                                                    <StatusIcon className="w-3.5 h-3.5" />
                                                    {statusBadge.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {format(new Date(org.createdAt), 'MMM dd, yyyy')}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {filteredOrganisers.length > pageSize && (
                    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            Showing {currentPage * pageSize + 1} to{' '}
                            {Math.min((currentPage + 1) * pageSize, filteredOrganisers.length)} of{' '}
                            {filteredOrganisers.length} organisers
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
                                disabled={(currentPage + 1) * pageSize >= filteredOrganisers.length}
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
