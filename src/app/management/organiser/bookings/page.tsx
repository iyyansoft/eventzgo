"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Calendar, Users, Clock, CheckCircle, XCircle, AlertCircle, Ticket, Download, ChevronDown, ChevronUp, FileSpreadsheet, Filter } from "lucide-react";
import * as XLSX from 'xlsx';

export default function OrganiserBookingsPage() {
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem("organiser_session");
        if (stored) {
            try {
                const user = JSON.parse(stored);
                if (user && user.id) setUserId(user.id);
            } catch (e) { }
        }
    }, []);

    const bookings = useQuery(
        api.bookings.getOrganiserBookings,
        userId ? { organiserId: userId as any } : "skip"
    );
    const [expandedBooking, setExpandedBooking] = useState<string | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<string>("all");

    // Get unique events - must be before early return
    const events = useMemo(() => {
        if (!bookings) return [];
        const eventMap = new Map();
        bookings.forEach((booking: any) => {
            if (!eventMap.has(booking.eventId)) {
                eventMap.set(booking.eventId, {
                    id: booking.eventId,
                    name: booking.eventName,
                    date: booking.eventDate
                });
            }
        });
        return Array.from(eventMap.values()).sort((a, b) => b.date - a.date);
    }, [bookings]);

    // Filter bookings by selected event - must be before early return
    const filteredBookings = useMemo(() => {
        if (!bookings) return [];
        if (selectedEvent === "all") return bookings;
        return bookings.filter((b: any) => b.eventId === selectedEvent);
    }, [bookings, selectedEvent]);

    if (!bookings) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="text-gray-500 mt-4">Loading bookings...</p>
                </div>
            </div>
        );
    }

    const stats = [
        {
            label: "Total Bookings",
            value: filteredBookings.length.toString(),
            icon: Users,
            color: "blue"
        },
        {
            label: "Confirmed",
            value: filteredBookings.filter((b: any) => b.status === "confirmed").length.toString(),
            icon: CheckCircle,
            color: "green"
        },
        {
            label: "Pending",
            value: filteredBookings.filter((b: any) => b.status === "pending").length.toString(),
            icon: Clock,
            color: "yellow"
        },
        {
            label: "Cancelled",
            value: filteredBookings.filter((b: any) => b.status === "cancelled").length.toString(),
            icon: XCircle,
            color: "red"
        },
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case "confirmed":
                return "bg-green-100 text-green-800";
            case "pending":
                return "bg-yellow-100 text-yellow-800";
            case "cancelled":
            case "rejected":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const downloadExcel = (eventId?: string) => {
        const dataToExport = eventId
            ? bookings.filter((b: any) => b.eventId === eventId)
            : filteredBookings;

        if (dataToExport.length === 0) {
            alert("No bookings to download");
            return;
        }

        const data = dataToExport.map((booking: any) => {
            const baseData: any = {
                'Booking ID': booking.bookingNumber,
                'Event': booking.eventName,
                'Event Date': new Date(booking.eventDate).toLocaleDateString(),
                'Customer Name': booking.guestDetails?.name || 'Guest',
                'Email': booking.guestDetails?.email || '',
                'Phone': booking.guestDetails?.phone || '',
                'Tickets': booking.tickets.map((t: any) => `${t.quantity}x ${t.ticketTypeName}`).join(', '),
                'Total Amount': `₹${booking.totalAmount}`,
                'Status': booking.status,
                'Booking Date': new Date(booking._creationTime).toLocaleString(),
            };

            // Add custom field responses
            if (booking.customFieldResponses && booking.customFieldResponses.length > 0) {
                booking.customFieldResponses.forEach((field: any) => {
                    baseData[field.label] = field.value;
                });
            }

            return baseData;
        });

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Bookings");

        // Auto-size columns
        const maxWidth = 50;
        const colWidths = Object.keys(data[0] || {}).map(key => ({
            wch: Math.min(
                Math.max(
                    key.length,
                    ...data.map(row => String(row[key] || '').length)
                ),
                maxWidth
            )
        }));
        worksheet['!cols'] = colWidths;

        const eventName = eventId
            ? events.find(e => e.id === eventId)?.name.replace(/[^a-z0-9]/gi, '_')
            : 'all_events';
        XLSX.writeFile(workbook, `bookings_${eventName}_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Bookings
                    </h1>
                    <p className="text-gray-600 mt-2">Manage all your event bookings</p>
                </div>
                <button
                    onClick={() => downloadExcel()}
                    disabled={filteredBookings.length === 0}
                    className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <FileSpreadsheet className="w-5 h-5" />
                    Download Excel
                </button>
            </div>

            {/* Event Filter & Quick Downloads */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-4 mb-4">
                    <Filter className="w-5 h-5 text-purple-600" />
                    <h3 className="font-semibold text-gray-900">Filter by Event</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <button
                        onClick={() => setSelectedEvent("all")}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${selectedEvent === "all"
                            ? "border-purple-600 bg-purple-50"
                            : "border-gray-200 hover:border-purple-300"
                            }`}
                    >
                        <div className="font-semibold text-gray-900">All Events</div>
                        <div className="text-sm text-gray-500 mt-1">
                            {bookings.length} bookings
                        </div>
                    </button>
                    {events.map((event: any) => {
                        const eventBookings = bookings.filter((b: any) => b.eventId === event.id);
                        return (
                            <div
                                key={event.id}
                                onClick={() => setSelectedEvent(event.id)}
                                className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${selectedEvent === event.id
                                    ? "border-purple-600 bg-purple-50"
                                    : "border-gray-200 hover:border-purple-300"
                                    }`}
                            >
                                <div className="font-semibold text-gray-900 truncate" title={event.name}>
                                    {event.name}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                    {new Date(event.date).toLocaleDateString()} • {eventBookings.length} bookings
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        downloadExcel(event.id);
                                    }}
                                    className="mt-2 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-indigo-700 transition-all"
                                >
                                    <Download className="w-4 h-4" />
                                    Download
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={stat.label}
                            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">{stat.label}</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-2">
                                        {stat.value}
                                    </p>
                                </div>
                                <div
                                    className={`w-12 h-12 rounded-xl bg-${stat.color}-100 flex items-center justify-center`}
                                >
                                    <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Bookings Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                        <Ticket className="w-5 h-5 text-purple-600" />
                        {selectedEvent === "all" ? "All Bookings" : "Event Bookings"}
                    </h2>
                </div>

                <div className="overflow-x-auto">
                    {filteredBookings.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            No bookings found for this event
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">

                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                                        Booking ID
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                                        Event
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                                        Customer
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                                        Tickets
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                                        Amount
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                                        Date
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredBookings.map((booking: any) => (
                                    <React.Fragment key={booking._id}>
                                        <tr
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                {booking.customFieldResponses && booking.customFieldResponses.length > 0 && (
                                                    <button
                                                        onClick={() => setExpandedBooking(
                                                            expandedBooking === booking._id ? null : booking._id
                                                        )}
                                                        className="text-purple-600 hover:text-purple-800 transition-colors"
                                                    >
                                                        {expandedBooking === booking._id ? (
                                                            <ChevronUp className="w-5 h-5" />
                                                        ) : (
                                                            <ChevronDown className="w-5 h-5" />
                                                        )}
                                                    </button>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-mono text-sm text-gray-600">
                                                    #{booking.bookingNumber}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900 max-w-[200px] truncate" title={booking.eventName}>
                                                    {booking.eventName}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {new Date(booking.eventDate).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm">
                                                    <div className="font-medium text-gray-900">
                                                        {booking.guestDetails?.name || "Guest"}
                                                    </div>
                                                    <div className="text-gray-500 text-xs">
                                                        {booking.guestDetails?.email}
                                                    </div>
                                                    <div className="text-gray-500 text-xs">
                                                        {booking.guestDetails?.phone}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">
                                                    {booking.tickets.map((t: any) => (
                                                        <div key={t.ticketTypeId}>
                                                            {t.quantity}x {t.ticketTypeName}
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                                                ₹{booking.totalAmount.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                                        booking.status
                                                    )}`}
                                                >
                                                    {booking.status.charAt(0).toUpperCase() +
                                                        booking.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {new Date(booking._creationTime).toLocaleDateString()}
                                                <div className="text-xs">
                                                    {new Date(booking._creationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </td>
                                        </tr>
                                        {expandedBooking === booking._id && booking.customFieldResponses && (
                                            <tr className="bg-purple-50">
                                                <td colSpan={8} className="px-6 py-4">
                                                    <div className="space-y-3">
                                                        <h4 className="font-semibold text-purple-900 flex items-center gap-2">
                                                            <AlertCircle className="w-4 h-4" />
                                                            Custom Field Responses
                                                        </h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                            {booking.customFieldResponses.map((field: any, idx: number) => (
                                                                <div key={idx} className="bg-white rounded-lg p-4 border border-purple-200">
                                                                    <div className="text-xs font-medium text-purple-600 uppercase mb-1">
                                                                        {field.label}
                                                                    </div>
                                                                    <div className="text-sm text-gray-900 font-medium">
                                                                        {field.value}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
