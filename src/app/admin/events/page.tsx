'use client';

import React, { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Building2, Calendar, Eye, ChevronRight, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Id } from '@/convex/_generated/dataModel';

export default function AdminEventsPage() {
    const [selectedOrganiserId, setSelectedOrganiserId] = useState<Id<'organisers'> | null>(null);

    // Fetch events grouped by organiser
    const groupedEvents = useQuery(api.events.getAllEventsGroupedByOrganiser);
    const organiserEvents = useQuery(api.events.getEventsByOrganiser,
        selectedOrganiserId ? { organiserId: selectedOrganiserId } : "skip"
    );

    const selectedOrganiser = groupedEvents?.find(g => g.organiser._id === selectedOrganiserId);

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Events Management</h1>
                <p className="text-gray-600">View all events organized by organisers</p>
            </div>

            {!selectedOrganiserId ? (
                /* Organiser List View */
                <div className="space-y-4">
                    {!groupedEvents ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">Loading organisers...</p>
                        </div>
                    ) : groupedEvents.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-xl">
                            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">No events found</p>
                        </div>
                    ) : (
                        groupedEvents.map((group) => (
                            <div
                                key={group.organiser._id}
                                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => setSelectedOrganiserId(group.organiser._id)}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-3">
                                            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                                                <Building2 className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900">
                                                    {group.organiser.institutionName}
                                                </h3>
                                                <p className="text-sm text-gray-500">{group.organiser.email}</p>
                                            </div>
                                        </div>

                                        {/* Stats */}
                                        <div className="grid grid-cols-5 gap-4 mt-4">
                                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                                                <p className="text-2xl font-bold text-blue-600">{group.totalEvents}</p>
                                                <p className="text-xs text-gray-600">Total Events</p>
                                            </div>
                                            <div className="text-center p-3 bg-green-50 rounded-lg">
                                                <p className="text-2xl font-bold text-green-600">{group.activeEvents}</p>
                                                <p className="text-xs text-gray-600">Active</p>
                                            </div>
                                            <div className="text-center p-3 bg-purple-50 rounded-lg">
                                                <p className="text-2xl font-bold text-purple-600">{group.completedEvents}</p>
                                                <p className="text-xs text-gray-600">Completed</p>
                                            </div>
                                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                                                <p className="text-2xl font-bold text-gray-600">{group.draftEvents}</p>
                                                <p className="text-xs text-gray-600">Drafts</p>
                                            </div>
                                            <div className="text-center p-3 bg-yellow-50 rounded-lg">
                                                <p className="text-2xl font-bold text-yellow-600">₹{group.totalRevenue.toLocaleString('en-IN')}</p>
                                                <p className="text-xs text-gray-600">Total Revenue</p>
                                            </div>
                                        </div>
                                    </div>

                                    <ChevronRight className="w-6 h-6 text-gray-400 ml-4" />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            ) : (
                /* Events List View for Selected Organiser */
                <div>
                    {/* Back Button */}
                    <button
                        onClick={() => setSelectedOrganiserId(null)}
                        className="mb-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
                    >
                        <ChevronRight className="w-4 h-4 rotate-180" />
                        <span>Back to Organisers</span>
                    </button>

                    {/* Organiser Header */}
                    {selectedOrganiser && (
                        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 mb-6 text-white">
                            <div className="flex items-center space-x-3 mb-4">
                                <Building2 className="w-8 h-8" />
                                <div>
                                    <h2 className="text-2xl font-bold">{selectedOrganiser.organiser.institutionName}</h2>
                                    <p className="text-purple-100">{selectedOrganiser.organiser.email}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-5 gap-4">
                                <div>
                                    <p className="text-3xl font-bold">{selectedOrganiser.totalEvents}</p>
                                    <p className="text-sm text-purple-100">Total Events</p>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold">{selectedOrganiser.activeEvents}</p>
                                    <p className="text-sm text-purple-100">Active</p>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold">{selectedOrganiser.completedEvents}</p>
                                    <p className="text-sm text-purple-100">Completed</p>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold">{selectedOrganiser.draftEvents}</p>
                                    <p className="text-sm text-purple-100">Drafts</p>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold">₹{selectedOrganiser.totalRevenue.toLocaleString('en-IN')}</p>
                                    <p className="text-sm text-purple-100">Total Revenue</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Events List */}
                    <div className="space-y-4">
                        {organiserEvents && organiserEvents.length > 0 ? (
                            organiserEvents.map((event) => (
                                <div
                                    key={event._id}
                                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <h3 className="text-lg font-bold text-gray-900">{event.title}</h3>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${event.status === 'published' ? 'bg-green-100 text-green-700' :
                                                    event.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                                                        event.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-purple-100 text-purple-700'
                                                    }`}>
                                                    {event.status.toUpperCase()}
                                                </span>
                                            </div>

                                            <p className="text-sm text-gray-600 mb-3">{event.description.substring(0, 150)}...</p>

                                            <div className="grid grid-cols-4 gap-4 text-sm">
                                                <div className="flex items-center space-x-2 text-gray-600">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>{format(new Date(event.dateTime.start), 'MMM dd, yyyy')}</span>
                                                </div>
                                                <div className="flex items-center space-x-2 text-gray-600">
                                                    <TrendingUp className="w-4 h-4" />
                                                    <span>{event.soldTickets} / {event.totalCapacity} tickets sold</span>
                                                </div>
                                                <div className="flex items-center space-x-2 text-gray-600">
                                                    <CheckCircle className="w-4 h-4" />
                                                    <span>{event.category}</span>
                                                </div>
                                                <div className="flex items-center space-x-2 text-green-600 font-semibold">
                                                    <span>₹{((event as any).revenue || 0).toLocaleString('en-IN')}</span>
                                                    <span className="text-xs text-gray-500">Revenue</span>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                                        >
                                            <Eye className="w-4 h-4" />
                                            <span>View</span>
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 bg-gray-50 rounded-xl">
                                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500">No events found for this organiser</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
