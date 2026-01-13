"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
    BarChart3,
    TrendingUp,
    Users,
    Clock,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Download,
    RefreshCw,
    Award,
    Activity
} from "lucide-react";

export default function EventAnalyticsPage() {
    const params = useParams();
    const eventId = params.id as Id<"events">;

    const [autoRefresh, setAutoRefresh] = useState(true);

    // Fetch analytics data
    const analytics = useQuery(api.scanAnalytics.getEventScanAnalytics, { eventId });
    const timeline = useQuery(api.scanAnalytics.getScanTimeline, { eventId, hours: 24 });
    const leaderboard = useQuery(api.scanAnalytics.getScannerLeaderboard, { eventId });
    const fraudAlerts = useQuery(api.scanAnalytics.getFraudAlerts, { eventId });

    // Auto-refresh every 5 seconds
    useState(() => {
        if (autoRefresh) {
            const interval = setInterval(() => {
                // Convex automatically refetches
            }, 5000);
            return () => clearInterval(interval);
        }
    });

    const exportData = async () => {
        const data = await fetch(`/api/export-scans?eventId=${eventId}`);
        const blob = await data.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `scan-data-${eventId}.csv`;
        a.click();
    };

    if (!analytics) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                <div className="text-center">
                    <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading analytics...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl">
                                <BarChart3 className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    Real-Time Analytics
                                </h1>
                                <p className="text-gray-600 mt-1">
                                    {analytics.event.title}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setAutoRefresh(!autoRefresh)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${autoRefresh
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-gray-100 text-gray-700'
                                    }`}
                            >
                                <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
                                {autoRefresh ? 'Live' : 'Paused'}
                            </button>
                            <button
                                onClick={exportData}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:shadow-lg transition-all"
                            >
                                <Download className="w-4 h-4" />
                                Export
                            </button>
                        </div>
                    </div>
                </div>

                {/* Overview Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                            <span className="text-sm text-gray-600">Total</span>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">
                            {analytics.overview.totalTickets}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">Total Tickets</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <span className="text-sm font-medium text-green-600">
                                {analytics.overview.checkInPercentage}%
                            </span>
                        </div>
                        <p className="text-3xl font-bold text-green-600">
                            {analytics.overview.checkedIn}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">Checked In</p>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                            <div
                                className="bg-green-600 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${analytics.overview.checkInPercentage}%` }}
                            />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-orange-100 rounded-lg">
                                <Clock className="w-6 h-6 text-orange-600" />
                            </div>
                            <span className="text-sm text-gray-600">Remaining</span>
                        </div>
                        <p className="text-3xl font-bold text-orange-600">
                            {analytics.overview.pending}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">Pending Entry</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <TrendingUp className="w-6 h-6 text-purple-600" />
                            </div>
                            <span className="text-sm text-gray-600">Per Hour</span>
                        </div>
                        <p className="text-3xl font-bold text-purple-600">
                            {analytics.scans.entryRatePerHour}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">Entry Rate</p>
                    </div>
                </div>

                {/* Scan Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Activity className="w-5 h-5 text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900">Total Scans</h3>
                        </div>
                        <p className="text-4xl font-bold text-blue-600">{analytics.scans.total}</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900">Valid Scans</h3>
                        </div>
                        <p className="text-4xl font-bold text-green-600">{analytics.scans.valid}</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <XCircle className="w-5 h-5 text-red-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900">Invalid Scans</h3>
                        </div>
                        <p className="text-4xl font-bold text-red-600">{analytics.scans.invalid}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Ticket Type Breakdown */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Ticket Type Breakdown
                        </h3>
                        <div className="space-y-4">
                            {analytics.ticketTypeBreakdown.map((type) => (
                                <div key={type.ticketTypeId}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium text-gray-900">{type.ticketTypeName}</span>
                                        <span className="text-sm text-gray-600">
                                            {type.checkedIn} / {type.total} ({type.percentage}%)
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                        <div
                                            className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-500"
                                            style={{ width: `${type.percentage}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Invalid Scan Reasons */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Invalid Scan Reasons
                        </h3>
                        <div className="space-y-3">
                            {Object.entries(analytics.invalidScanReasons).map(([reason, count]) => (
                                count > 0 && (
                                    <div key={reason} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                                        <span className="text-sm font-medium text-gray-900 capitalize">
                                            {reason.replace(/_/g, ' ')}
                                        </span>
                                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                                            {count}
                                        </span>
                                    </div>
                                )
                            ))}
                        </div>
                    </div>
                </div>

                {/* Scanner Leaderboard */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <Award className="w-6 h-6 text-yellow-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Scanner Leaderboard</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Rank</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Scanner</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Total Scans</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Valid</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Invalid</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Success Rate</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {leaderboard?.map((scanner, index) => (
                                    <tr key={scanner.scannerId} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {index === 0 && <Award className="w-5 h-5 text-yellow-500" />}
                                                {index === 1 && <Award className="w-5 h-5 text-gray-400" />}
                                                {index === 2 && <Award className="w-5 h-5 text-orange-600" />}
                                                <span className="font-medium text-gray-900">#{index + 1}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-gray-900">{scanner.scannerName}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-600 capitalize">{scanner.role}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-blue-600">{scanner.totalScans}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-green-600">{scanner.validScans}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-red-600">{scanner.invalidScans}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-24 bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className={`h-2 rounded-full ${scanner.successRate >= 90 ? 'bg-green-500' :
                                                                scanner.successRate >= 70 ? 'bg-yellow-500' :
                                                                    'bg-red-500'
                                                            }`}
                                                        style={{ width: `${scanner.successRate}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm font-medium text-gray-900">{scanner.successRate}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recent Entries */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Entries</h3>
                    <div className="space-y-3">
                        {analytics.recentEntries.map((entry) => (
                            <div key={entry.scanId} className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{entry.attendeeName}</p>
                                        <p className="text-sm text-gray-600">{entry.ticketType} • {entry.bookingNumber}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-600">{entry.scannerName}</p>
                                    <p className="text-xs text-gray-500">
                                        {new Date(entry.time).toLocaleTimeString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Fraud Alerts */}
                {fraudAlerts && fraudAlerts.length > 0 && (
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <AlertTriangle className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Fraud Alerts</h3>
                        </div>
                        <div className="space-y-3">
                            {fraudAlerts.map((alert, index) => (
                                <div key={index} className={`p-4 rounded-lg ${alert.severity === 'high' ? 'bg-red-50 border border-red-200' :
                                        alert.severity === 'medium' ? 'bg-yellow-50 border border-yellow-200' :
                                            'bg-blue-50 border border-blue-200'
                                    }`}>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="font-medium text-gray-900">{alert.type.replace(/_/g, ' ').toUpperCase()}</p>
                                            <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${alert.severity === 'high' ? 'bg-red-100 text-red-700' :
                                                alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-blue-100 text-blue-700'
                                            }`}>
                                            {alert.severity}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
