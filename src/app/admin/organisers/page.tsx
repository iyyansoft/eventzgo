'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Building2, Mail, Phone, MapPin, Eye, Trash2, Calendar, Users, Search } from 'lucide-react';
import { format } from 'date-fns';
import { Id } from '@/convex/_generated/dataModel';
import { useRouter } from 'next/navigation';

import { useAdminAuth } from "@/components/admin/AdminAuthProvider";

// Disable static generation for this page
export const dynamic = 'force-dynamic';

export default function OrganisersPage() {
    const router = useRouter();
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const { sessionToken } = useAdminAuth();

    // Fetch organisers with filters
    const organisers = useQuery(api.adminOrganisers.getAllOrganisers, sessionToken ? {
        status: statusFilter,
        search: searchQuery,
        sessionToken,
    } : "skip");

    const deleteOrganiser = useMutation(api.managementApprovals.deleteOrganiser);

    const handleDelete = async (organiser: any) => {
        const confirmDelete = confirm(`Are you sure you want to permanently delete ${organiser.institutionName}? This action cannot be undone.`);
        if (!confirmDelete) return;

        try {
            await deleteOrganiser({ organiserId: organiser._id as Id<'organisers'> });
            alert('Organiser deleted successfully.');
        } catch (error) {
            alert('Failed to delete organiser. Please try again.');
        }
    };

    const tabs = [
        { id: 'all', label: 'All Organisers', icon: Users },
        { id: 'active', label: 'Active', icon: Building2 },
        { id: 'pending_approval', label: 'Pending Approval', icon: Calendar },
        { id: 'suspended', label: 'Suspended', icon: Trash2 },
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Organisers Management</h1>
                    <p className="text-gray-600">Overview and management of all event organisers</p>
                </div>

                {/* Search */}
                <div className="relative w-full md:w-64">
                    <input
                        type="text"
                        placeholder="Search organisers..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                </div>
            </div>

            {/* Tabs */}
            <div className="flex overflow-x-auto pb-2 space-x-2 border-b border-gray-200">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setStatusFilter(tab.id)}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${statusFilter === tab.id
                                ? 'bg-purple-100 text-purple-700 font-medium'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Stats Summary */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total Organisers</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{organisers?.length || 0}</p>
                    </div>
                </div>
            </div>

            {/* Organisers List */}
            {!organisers ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="text-gray-500 mt-4">Loading organisers...</p>
                </div>
            ) : organisers.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No organisers found matching your criteria</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {organisers.map((organiser) => (
                        <div key={organiser._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-3">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${organiser.accountStatus === 'active' ? 'bg-green-100 text-green-600' :
                                            organiser.accountStatus === 'pending_approval' ? 'bg-orange-100 text-orange-600' :
                                                'bg-gray-100 text-gray-600'
                                            }`}>
                                            <Building2 className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <h3 className="text-lg font-bold text-gray-900">{organiser.institutionName}</h3>
                                                <span className={`px-2 py-0.5 text-xs rounded-full capitalize ${organiser.accountStatus === 'active' ? 'bg-green-100 text-green-700' :
                                                    organiser.accountStatus === 'pending_approval' ? 'bg-orange-100 text-orange-700' :
                                                        'bg-gray-300 text-gray-700'
                                                    }`}>
                                                    {organiser.accountStatus?.replace('_', ' ') || 'Unknown'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500">{organiser.contactPerson}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                        <div className="flex items-center space-x-2 text-gray-600">
                                            <Mail className="w-4 h-4" />
                                            <span>{organiser.email || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-gray-600">
                                            <Phone className="w-4 h-4" />
                                            <span>{organiser.phone || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-gray-600">
                                            <MapPin className="w-4 h-4" />
                                            <span>{organiser.address?.city || 'N/A'}, {organiser.address?.state || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col space-y-2 ml-4">
                                    <button
                                        onClick={() => router.push(`/admin/organisers/${organiser._id}`)}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-sm w-full justify-center"
                                    >
                                        <Eye className="w-4 h-4" />
                                        <span>View Details</span>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(organiser)}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2 text-sm w-full justify-center"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        <span>Delete</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
