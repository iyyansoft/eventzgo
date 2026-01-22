'use client';

import React, { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Building2, Calendar, Eye, ChevronRight, TrendingUp, CheckCircle, Clock, Download, X, FileSpreadsheet } from 'lucide-react';
import { format } from 'date-fns';
import { Id } from '@/convex/_generated/dataModel';

// Disable static generation for this page
export const dynamic = 'force-dynamic';

export default function AdminEventsPage() {
    const [selectedOrganiserId, setSelectedOrganiserId] = useState<Id<'organisers'> | null>(null);
    const [selectedEventId, setSelectedEventId] = useState<Id<'events'> | null>(null);

    // Fetch events grouped by organiser
    const groupedEvents = useQuery(api.events.getAllEventsGroupedByOrganiser);
    const organiserEvents = useQuery(api.events.getEventsByOrganiser,
        selectedOrganiserId ? { organiserId: selectedOrganiserId } : "skip"
    );
    const eventBookings = useQuery(api.bookings.getBookingsByEvent,
        selectedEventId ? { eventId: selectedEventId } : "skip"
    );

    const selectedOrganiser = groupedEvents?.find(g => g.organiser._id === selectedOrganiserId);
    const selectedEvent = organiserEvents?.find(e => e._id === selectedEventId);

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
                                            onClick={() => setSelectedEventId(event._id)}
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

            {/* Event Detail Modal */}
            {selectedEventId && selectedEvent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold">{selectedEvent.title}</h2>
                                <p className="text-blue-100 mt-1">Event Attendees & Bookings</p>
                            </div>
                            <button
                                onClick={() => setSelectedEventId(null)}
                                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Export Buttons */}
                        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                            <div className="text-sm text-gray-600">
                                <span className="font-semibold">{eventBookings?.length || 0}</span> total bookings
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => {
                                        if (!eventBookings) return;
                                        const csv = convertToCSV(eventBookings);
                                        downloadFile(csv, `${selectedEvent.title}-attendees.csv`, 'text/csv');
                                    }}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                                >
                                    <FileSpreadsheet className="w-4 h-4" />
                                    <span>Export CSV</span>
                                </button>
                                <button
                                    onClick={() => {
                                        if (!eventBookings) return;
                                        const csv = convertToCSV(eventBookings);
                                        downloadFile(csv, `${selectedEvent.title}-attendees.xls`, 'application/vnd.ms-excel');
                                    }}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                                >
                                    <Download className="w-4 h-4" />
                                    <span>Export Excel</span>
                                </button>
                            </div>
                        </div>

                        {/* Attendees Table */}
                        <div className="flex-1 overflow-auto p-6">
                            {!eventBookings ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-500">Loading bookings...</p>
                                </div>
                            ) : eventBookings.length === 0 ? (
                                <div className="text-center py-12">
                                    <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">No bookings yet</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b-2 border-gray-200">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Booking #</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Phone</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tickets</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Booked On</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {eventBookings.map((booking: any) => (
                                                <tr key={booking._id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{booking.bookingNumber}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-700">
                                                        {booking.guestDetails?.name || booking.userName || 'N/A'}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-600">
                                                        {booking.guestDetails?.email || booking.userEmail || 'N/A'}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-600">
                                                        {booking.guestDetails?.phone || booking.userPhone || 'N/A'}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-700">
                                                        {booking.tickets.reduce((sum: number, t: any) => sum + t.quantity, 0)}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm font-semibold text-green-600">
                                                        ₹{booking.totalAmount.toLocaleString('en-IN')}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                            booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                            booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                            'bg-gray-100 text-gray-700'
                                                        }`}>
                                                            {booking.status.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-600">
                                                        {format(new Date(booking.createdAt), 'MMM dd, yyyy')}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Helper function to convert bookings to CSV
function convertToCSV(bookings: any[]) {
    const headers = ['Booking Number', 'Name', 'Email', 'Phone', 'Tickets', 'Amount', 'Status', 'Booked On'];
    const rows = bookings.map(booking => [
        booking.bookingNumber,
        booking.guestDetails?.name || booking.userName || 'N/A',
        booking.guestDetails?.email || booking.userEmail || 'N/A',
        booking.guestDetails?.phone || booking.userPhone || 'N/A',
        booking.tickets.reduce((sum: number, t: any) => sum + t.quantity, 0),
        booking.totalAmount,
        booking.status,
        format(new Date(booking.createdAt), 'MMM dd, yyyy HH:mm')
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csvContent;
}

// Helper function to download file
function downloadFile(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
