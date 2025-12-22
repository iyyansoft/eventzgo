"use client";

import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import StatCard from '@/components/admin/StatCard';
import { Calendar, CheckCircle, Clock, XCircle, Search, Filter, TrendingUp, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { Id } from '@/convex/_generated/dataModel';

export default function EventsManagementPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [currentPage, setCurrentPage] = useState(0);
    const pageSize = 15;

    // Mutations
    const approveEvent = useMutation(api.events.approveEvent);
    const rejectEvent = useMutation(api.events.rejectEvent);

    // Fetch event data
    const eventsData = useQuery(api.adminQueries.getAllEvents, {
        limit: pageSize,
        offset: currentPage * pageSize,
        status: selectedStatus,
        searchTerm: searchTerm || undefined,
    });

    const eventStats = useQuery(api.adminQueries.getEventStats);

    const handleApprove = async (eventId: Id<"events">) => {
        try {
            await approveEvent({
                eventId,
            });
            alert("Event approved successfully!");
        } catch (error) {
            console.error("Error approving event:", error);
            alert("Failed to approve event");
        }
    };

    const handleReject = async (eventId: Id<"events">) => {
        const reason = prompt("Please enter rejection reason:");
        if (!reason) return;

        try {
            await rejectEvent({
                eventId,
                rejectionReason: reason,
            });
            alert("Event rejected successfully!");
        } catch (error) {
            console.error("Error rejecting event:", error);
            alert("Failed to reject event");
        }
    };

    const statuses = [
        { value: 'all', label: 'All Status' },
        { value: 'draft', label: 'Draft' },
        { value: 'pending', label: 'Pending Approval' },
        { value: 'approved', label: 'Approved' },
        { value: 'published', label: 'Published' },
        { value: 'rejected', label: 'Rejected' },
        { value: 'cancelled', label: 'Cancelled' },
    ];

    const getStatusBadge = (status: string) => {
        const badges: Record<string, { color: string; label: string }> = {
            draft: { color: 'bg-gray-100 text-gray-800', label: 'Draft' },
            pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
            approved: { color: 'bg-blue-100 text-blue-800', label: 'Approved' },
            published: { color: 'bg-green-100 text-green-800', label: 'Published' },
            rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' },
            cancelled: { color: 'bg-gray-100 text-gray-800', label: 'Cancelled' },
        };
        return badges[status] || badges.draft;
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Events Management</h1>
                <p className="text-gray-600 mt-2">
                    Manage and monitor all events from Convex
                </p>
            </div>

            {/* Statistics Cards */}
            {eventStats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Total Events"
                        value={eventStats.total.toLocaleString()}
                        icon={Calendar}
                        color="blue"
                        subtitle="All events"
                    />
                    <StatCard
                        title="Published"
                        value={eventStats.byStatus.published.toLocaleString()}
                        icon={CheckCircle}
                        color="green"
                        subtitle="Live events"
                    />
                    <StatCard
                        title="Pending Approval"
                        value={eventStats.byStatus.pending.toLocaleString()}
                        icon={Clock}
                        color="orange"
                        subtitle="Awaiting review"
                    />
                    <StatCard
                        title="Tickets Sold"
                        value={eventStats.totalTicketsSold.toLocaleString()}
                        icon={TrendingUp}
                        color="purple"
                        subtitle={`${((eventStats.totalTicketsSold / eventStats.totalCapacity) * 100).toFixed(1)}% capacity`}
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
                                placeholder="Search by title, organizer, or category..."
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

            {/* Events Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Event
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Organizer
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Category
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Tickets
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {!eventsData ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <div className="flex justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                                        </div>
                                        <p className="text-gray-500 mt-4">Loading events...</p>
                                    </td>
                                </tr>
                            ) : eventsData.events.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        No events found matching your criteria
                                    </td>
                                </tr>
                            ) : (
                                eventsData.events.map((event) => {
                                    const statusBadge = getStatusBadge(event.status);
                                    return (
                                        <tr key={event._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="font-medium text-gray-900 line-clamp-1">
                                                        {event.title}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {event.venue.city}, {event.venue.state}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">{event.organiserName}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {event.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {format(new Date(event.dateTime.start), 'MMM dd, yyyy')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm">
                                                    <span className="font-medium text-gray-900">
                                                        {event.soldTickets}
                                                    </span>
                                                    <span className="text-gray-500"> / {event.totalCapacity}</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                                    <div
                                                        className="bg-red-600 h-1.5 rounded-full"
                                                        style={{
                                                            width: `${(event.soldTickets / event.totalCapacity) * 100}%`,
                                                        }}
                                                    ></div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}>
                                                    {statusBadge.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {event.status === 'pending' ? (
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleApprove(event._id)}
                                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors flex items-center gap-1"
                                                            title="Approve Event"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                            <span className="text-xs font-medium">Approve</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(event._id)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1"
                                                            title="Reject Event"
                                                        >
                                                            <X className="w-4 h-4" />
                                                            <span className="text-xs font-medium">Reject</span>
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-500">
                                                        {event.status === 'approved' || event.status === 'published' ? 'Approved' :
                                                            event.status === 'rejected' ? 'Rejected' :
                                                                event.status === 'draft' ? 'Draft' : '-'}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {eventsData && eventsData.total > pageSize && (
                    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            Showing {currentPage * pageSize + 1} to{' '}
                            {Math.min((currentPage + 1) * pageSize, eventsData.total)} of{' '}
                            {eventsData.total} events
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
                                disabled={!eventsData.hasMore}
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
