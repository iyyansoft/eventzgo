"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Calendar, Users, Clock, CheckCircle, XCircle, AlertCircle, Ticket } from "lucide-react";

export default function OrganiserBookingsPage() {
    const bookings = useQuery(api.bookings.getOrganiserBookings);

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
            value: bookings.length.toString(),
            icon: Users,
            color: "blue"
        },
        {
            label: "Confirmed",
            value: bookings.filter(b => b.status === "confirmed").length.toString(),
            icon: CheckCircle,
            color: "green"
        },
        {
            label: "Pending",
            value: bookings.filter(b => b.status === "pending").length.toString(),
            icon: Clock,
            color: "yellow"
        },
        {
            label: "Cancelled",
            value: bookings.filter(b => b.status === "cancelled").length.toString(),
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Bookings
                </h1>
                <p className="text-gray-600 mt-2">Manage all your event bookings</p>
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
                        Recent Bookings
                    </h2>
                </div>

                <div className="overflow-x-auto">
                    {bookings.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            No bookings found
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
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
                                {bookings.map((booking) => (
                                    <tr
                                        key={booking._id}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
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
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
