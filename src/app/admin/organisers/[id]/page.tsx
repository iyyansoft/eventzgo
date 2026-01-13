'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import {
    Building2, Mail, Phone, MapPin, Calendar,
    FileText, CreditCard, DollarSign, Download,
    ExternalLink, ArrowLeft, Edit2, Check, X,
    LayoutGrid, List, Receipt, ShieldCheck
} from 'lucide-react';
import { format } from 'date-fns';
import { useAdminAuth } from '@/components/admin/AdminAuthProvider';

export default function OrganiserDetailPage() {
    const params = useParams();
    const router = useRouter();
    const organiserId = params.id as Id<"organisers">;

    const [activeTab, setActiveTab] = useState('events');
    const [showFeeModal, setShowFeeModal] = useState(false);
    const [newFee, setNewFee] = useState<number>(10);
    const { sessionToken } = useAdminAuth();

    const organiser = useQuery(api.adminOrganisers.getOrganiserDetails, sessionToken ? { organiserId, sessionToken } : "skip");
    const events = useQuery(api.adminOrganisers.getOrganiserEvents, sessionToken ? { organiserId, sessionToken } : "skip");
    const financials = useQuery(api.adminOrganisers.getOrganiserFinancialSummary, sessionToken ? { organiserId, sessionToken } : "skip");
    const payoutRequests = useQuery(api.adminOrganisers.getPayoutRequests, sessionToken ? { organiserId, sessionToken } : "skip");

    const updateFee = useMutation(api.adminOrganisers.updatePlatformFee);
    const approvePayout = useMutation(api.adminOrganisers.approvePayout);
    const rejectPayout = useMutation(api.adminOrganisers.rejectPayout);

    const handleApprovePayout = async (payoutId: Id<"payoutRequests">) => {
        const proof = prompt("Enter payment proof URL (optional):");
        if (proof === null) return;
        if (!sessionToken) return;
        try {
            await approvePayout({ payoutId, paymentProof: proof || undefined, sessionToken });
            alert("Payout approved successfully");
        } catch (error) {
            console.error(error);
            alert("Failed to approve payout: " + (error instanceof Error ? error.message : String(error)));
        }
    };

    const handleRejectPayout = async (payoutId: Id<"payoutRequests">) => {
        const reason = prompt("Enter rejection reason:");
        if (!reason) return;
        if (!sessionToken) return;
        try {
            await rejectPayout({ payoutId, reason, sessionToken });
            alert("Payout rejected");
        } catch (error) {
            console.error(error);
            alert("Failed to reject payout: " + (error instanceof Error ? error.message : String(error)));
        }
    };

    const handleUpdateFee = async () => {
        try {
            if (!sessionToken) return;
            await updateFee({
                organiserId,
                percentage: Number(newFee),
                sessionToken
            });
            setShowFeeModal(false);
            alert("Platform fee updated successfully");
        } catch (error) {
            console.error(error);
            alert("Failed to update fee: " + (error instanceof Error ? error.message : String(error)));
        }
    };

    const approveOrg = useMutation(api.adminOrganisers.approveOrganiser);
    const rejectOrg = useMutation(api.adminOrganisers.rejectOrganiser);

    const handleApproveOrganiser = async () => {
        if (!confirm("Are you sure you want to approve this organiser?")) return;
        try {
            await approveOrg({ organiserId, sessionToken: sessionToken! });
            alert("Organiser approved!");
        } catch (e: any) {
            alert("Error approving: " + e.message);
        }
    };

    const handleRejectOrganiser = async () => {
        const reason = prompt("Enter rejection reason:");
        if (!reason) return;
        try {
            await rejectOrg({ organiserId, sessionToken: sessionToken!, reason });
            alert("Organiser rejected.");
        } catch (e: any) {
            alert("Error rejecting: " + e.message);
        }
    };

    if (!organiser) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    const tabs = [
        { id: 'events', label: 'Events', icon: Calendar },
        { id: 'financial', label: 'Financial Summary', icon: DollarSign },
        { id: 'documents', label: 'Documents', icon: FileText },
        { id: 'payouts', label: 'Payout Requests', icon: Receipt },
    ];

    const renderDocument = (doc: string | undefined, label: string) => {
        if (!doc) return <p className="text-sm text-gray-500 italic">Not provided</p>;

        const isImage = doc.match(/\.(jpg|jpeg|png|gif|webp)$/i) || doc.startsWith('data:image');
        const isPDF = doc.match(/\.pdf$/i) || doc.startsWith('data:application/pdf');

        return (
            <div className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-gray-700">{label}</span>
                    <a
                        href={doc}
                        download
                        target="_blank"
                        className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-full"
                        title="Download"
                    >
                        <Download className="w-4 h-4" />
                    </a>
                </div>

                {isImage ? (
                    <div className="relative group cursor-pointer" onClick={() => window.open(doc, '_blank')}>
                        <img
                            src={doc}
                            alt={label}
                            className="w-full h-48 object-cover rounded border bg-white"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center rounded">
                            <ExternalLink className="text-white opacity-0 group-hover:opacity-100 w-6 h-6" />
                        </div>
                    </div>
                ) : isPDF ? (
                    <div className="flex flex-col items-center justify-center h-48 bg-white border rounded border-dashed border-gray-300">
                        <FileText className="w-12 h-12 text-red-500 mb-2" />
                        <span className="text-sm text-gray-500">PDF Document</span>
                        <a
                            href={doc}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 text-blue-600 text-sm hover:underline"
                        >
                            View PDF
                        </a>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-48 bg-gray-100 border rounded">
                        <FileText className="w-12 h-12 text-gray-400 mb-2" />
                        <a
                            href={doc}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 text-sm hover:underline truncate max-w-full px-4"
                        >
                            View File
                        </a>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header / Back */}
            <button
                onClick={() => router.back()}
                className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Organisers
            </button>

            {/* Profile Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-purple-600 to-blue-600"></div>
                <div className="px-8 pb-8">
                    <div className="relative flex justify-between items-end -mt-12 mb-6">
                        <div className="flex items-end">
                            <div className="w-24 h-24 bg-white rounded-xl shadow-md p-1">
                                <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center text-3xl font-bold text-gray-400">
                                    {organiser.institutionName.charAt(0)}
                                </div>
                            </div>
                            <div className="ml-6 mb-1">
                                <h1 className="text-3xl font-bold text-gray-900">{organiser.institutionName}</h1>
                                <div className="flex items-center space-x-4 text-gray-600 mt-1">
                                    <span className="flex items-center"><Mail className="w-4 h-4 mr-1" /> {organiser.email}</span>
                                    <span className="flex items-center"><Phone className="w-4 h-4 mr-1" /> {organiser.phone}</span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium uppercase ${organiser.accountStatus === 'active' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                        }`}>
                                        {organiser.accountStatus?.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex flex-col items-end">
                            <span className="text-sm text-gray-500 mb-1">Platform Fee</span>
                            <div className="flex items-center">
                                <span className="text-2xl font-bold text-gray-900">{organiser.platformFeePercentage || 10}%</span>
                                <button
                                    onClick={() => {
                                        setNewFee(organiser.platformFeePercentage || 10);
                                        setShowFeeModal(true);
                                    }}
                                    className="ml-2 p-1 text-gray-400 hover:text-purple-600 rounded-full hover:bg-purple-50 transition-colors"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                            </div>
                            {organiser.customPlatformFee && <span className="text-xs text-purple-600 font-medium">Custom Rate</span>}
                        </div>
                    </div>

                    {organiser.accountStatus === 'pending_approval' && (
                        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg flex justify-between items-center">
                            <div className="flex items-center">
                                <ShieldCheck className="w-6 h-6 text-orange-600 mr-3" />
                                <div>
                                    <h3 className="font-bold text-orange-800">Review Required</h3>
                                    <p className="text-sm text-orange-700">This organiser has updated their details or documents and requires approval.</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleRejectOrganiser}
                                    className="px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50 font-medium transition-colors"
                                >
                                    Reject
                                </button>
                                <button
                                    onClick={handleApproveOrganiser}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors shadow-sm"
                                >
                                    Approve & Activate
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-6 border-t border-gray-100">
                        <div>
                            <p className="text-sm text-gray-500">Contact Person</p>
                            <p className="font-medium">{organiser.contactPerson}</p>
                        </div>
                        <div className="md:col-span-2">
                            <p className="text-sm text-gray-500">Address</p>
                            <p className="font-medium">
                                {organiser.address?.street}, {organiser.address?.city}, {organiser.address?.state} - {organiser.address?.pincode}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Member Since</p>
                            <p className="font-medium">{format(new Date(organiser.createdAt), 'MMM dd, yyyy')}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex overflow-x-auto bg-white rounded-lg border border-gray-200 p-1">
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md transition-all ${activeTab === tab.id
                                ? 'bg-purple-100 text-purple-700 font-medium shadow-sm'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            <span>{tab.label}</span>
                        </button>
                    )
                })}
            </div>

            {/* Tab Content */}
            <div className="space-y-6">

                {/* Events Tab */}
                {activeTab === 'events' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Events ({events?.length || 0})</h2>
                        </div>

                        {!events || events.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-lg">
                                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">No events found for this organiser.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-gray-200 text-gray-500 text-sm">
                                            <th className="pb-3 pl-4 font-medium">Event Name</th>
                                            <th className="pb-3 font-medium">Date</th>
                                            <th className="pb-3 font-medium">Status</th>
                                            <th className="pb-3 font-medium">Tickets Sold</th>
                                            <th className="pb-3 font-medium">Revenue</th>
                                            <th className="pb-3 text-right pr-4 font-medium">Fee (10%)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {events.map((event: any) => (
                                            <tr key={event._id} className="hover:bg-gray-50 group">
                                                <td className="py-4 pl-4">
                                                    <p className="font-medium text-gray-900">{event.title}</p>
                                                    <p className="text-xs text-gray-500">{event.category}</p>
                                                </td>
                                                <td className="py-4 text-sm text-gray-600">
                                                    {format(new Date(event.dateTime.start), 'MMM dd, yyyy')}
                                                </td>
                                                <td className="py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs capitalize ${event.status === 'published' ? 'bg-green-100 text-green-700' :
                                                        event.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                                                            'bg-orange-100 text-orange-700'
                                                        }`}>
                                                        {event.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 text-sm text-gray-600">
                                                    {event.soldTickets || 0} / {event.totalCapacity}
                                                </td>
                                                <td className="py-4 font-medium text-gray-900">
                                                    ₹{((event.soldTickets || 0) * (event.ticketTypes?.[0]?.price || 0)).toLocaleString()}
                                                </td>
                                                <td className="py-4 text-right pr-4 text-gray-600">
                                                    ₹{(((event.soldTickets || 0) * (event.ticketTypes?.[0]?.price || 0)) * 0.1).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Documents Tab */}
                {activeTab === 'documents' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Uploaded Documents</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {organiser.documents ? (
                                <>
                                    {renderDocument(organiser.documents.gstCertificate, 'GST Certificate')}
                                    {renderDocument(organiser.documents.panCardFront || organiser.documents.panCard, 'PAN Card Front')}
                                    {renderDocument(organiser.documents.panCardBack, 'PAN Card Back')}
                                    {renderDocument(organiser.documents.cancelledCheque, 'Cancelled Cheque')}
                                    {renderDocument(organiser.documents.bankStatement, 'Bank Statement')}
                                    {/* Add other docs as needed */}
                                </>
                            ) : (
                                <p className="text-gray-500">No documents found.</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Financial Tab */}
                {activeTab === 'financial' && (
                    <div className="space-y-6">
                        {!financials ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                                <p className="text-gray-500 mt-2">Calculating financial data...</p>
                            </div>
                        ) : (
                            <>
                                {/* Lifetime Stats Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                        <p className="text-gray-500 text-sm font-medium">Net Earnings</p>
                                        <p className="text-2xl font-bold text-green-600 mt-2">
                                            ₹{financials.lifetime.netEarnings.toLocaleString()}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">Paid to Organiser</p>
                                    </div>
                                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                        <p className="text-gray-500 text-sm font-medium">Total Revenue</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-2">
                                            ₹{financials.lifetime.totalRevenue.toLocaleString()}
                                        </p>
                                        <div className="flex items-center mt-1 text-xs text-blue-600">
                                            <Receipt className="w-3 h-3 mr-1" />
                                            {financials.lifetime.totalTicketsSold} tickets sold
                                        </div>
                                    </div>
                                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                        <p className="text-gray-500 text-sm font-medium">Platform Fees</p>
                                        <p className="text-2xl font-bold text-purple-600 mt-2">
                                            ₹{financials.lifetime.totalPlatformFee.toLocaleString()}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">Revenue for Platform</p>
                                    </div>
                                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                        <p className="text-gray-500 text-sm font-medium">Total GST</p>
                                        <p className="text-2xl font-bold text-orange-600 mt-2">
                                            ₹{financials.lifetime.totalGST.toLocaleString()}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">Tax Collected</p>
                                    </div>
                                </div>

                                {/* Event-wise Breakdown */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                                        <h3 className="text-lg font-bold text-gray-900">Event-wise Breakdown</h3>
                                        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center text-sm font-medium">
                                            <Download className="w-4 h-4 mr-2" />
                                            Download Report
                                        </button>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="bg-gray-50">
                                                <tr className="border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
                                                    <th className="px-6 py-3 font-medium">Event</th>
                                                    <th className="px-6 py-3 font-medium text-right">Tickets</th>
                                                    <th className="px-6 py-3 font-medium text-right">Revenue</th>
                                                    <th className="px-6 py-3 font-medium text-right">Platform Fee</th>
                                                    <th className="px-6 py-3 font-medium text-right">GST</th>
                                                    <th className="px-6 py-3 font-medium text-right">Net Earning</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {financials.events.map((event: any) => (
                                                    <tr key={event.eventId} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4">
                                                            <p className="font-medium text-gray-900">{event.title}</p>
                                                            <p className="text-xs text-gray-500">
                                                                {format(new Date(event.date), 'MMM dd, yyyy')}
                                                            </p>
                                                        </td>
                                                        <td className="px-6 py-4 text-right text-sm text-gray-600">
                                                            {event.ticketsSold}
                                                        </td>
                                                        <td className="px-6 py-4 text-right font-medium text-gray-900">
                                                            ₹{event.revenue.toLocaleString()}
                                                        </td>
                                                        <td className="px-6 py-4 text-right text-sm text-purple-600">
                                                            ₹{event.platformFee.toLocaleString()}
                                                        </td>
                                                        <td className="px-6 py-4 text-right text-sm text-orange-600">
                                                            ₹{event.gst.toLocaleString()}
                                                        </td>
                                                        <td className="px-6 py-4 text-right font-bold text-green-600">
                                                            ₹{event.net.toLocaleString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                                {financials.events.length === 0 && (
                                                    <tr>
                                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                                            No transaction data available.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                            {financials.events.length > 0 && (
                                                <tfoot className="bg-gray-50 font-bold">
                                                    <tr>
                                                        <td className="px-6 py-4">TOTAL</td>
                                                        <td className="px-6 py-4 text-right">{financials.lifetime.totalTicketsSold}</td>
                                                        <td className="px-6 py-4 text-right">₹{financials.lifetime.totalRevenue.toLocaleString()}</td>
                                                        <td className="px-6 py-4 text-right">₹{financials.lifetime.totalPlatformFee.toLocaleString()}</td>
                                                        <td className="px-6 py-4 text-right">₹{financials.lifetime.totalGST.toLocaleString()}</td>
                                                        <td className="px-6 py-4 text-right text-green-700">₹{financials.lifetime.netEarnings.toLocaleString()}</td>
                                                    </tr>
                                                </tfoot>
                                            )}
                                        </table>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Payouts Tab */}
                {activeTab === 'payouts' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900">Payout Requests</h3>
                        </div>

                        {!payoutRequests ? (
                            <div className="p-12 text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                            </div>
                        ) : payoutRequests.length === 0 ? (
                            <div className="p-12 text-center">
                                <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">No payout requests found.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50">
                                        <tr className="border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
                                            <th className="px-6 py-3 font-medium">Request Date</th>
                                            <th className="px-6 py-3 font-medium">Event</th>
                                            <th className="px-6 py-3 font-medium">Amount</th>
                                            <th className="px-6 py-3 font-medium">Bank Account</th>
                                            <th className="px-6 py-3 font-medium">Status</th>
                                            <th className="px-6 py-3 font-medium text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {payoutRequests.map((req: any) => (
                                            <tr key={req._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    {format(new Date(req.requestedAt), 'MMM dd, yyyy')}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {req.eventTitle}
                                                </td>
                                                <td className="px-6 py-4 font-bold text-gray-900">
                                                    ₹{req.amount.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <p className="font-medium text-gray-900">{req.bankDetails?.accountHolderName}</p>
                                                    <p className="text-gray-500 text-xs font-mono">{req.bankDetails?.accountNumber}</p>
                                                    <p className="text-gray-500 text-xs">{req.bankDetails?.bankName}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${req.status === 'paid' ? 'bg-green-100 text-green-700' :
                                                        req.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                                                            req.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                                'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {req.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {req.status === 'pending' && (
                                                        <div className="flex justify-end space-x-2">
                                                            <button
                                                                className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                                                                onClick={() => handleApprovePayout(req._id)}
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                className="px-3 py-1 bg-red-50 text-red-600 text-xs rounded border border-red-200 hover:bg-red-100 transition-colors"
                                                                onClick={() => handleRejectPayout(req._id)}
                                                            >
                                                                Reject
                                                            </button>
                                                        </div>
                                                    )}
                                                    {req.status === 'paid' && (
                                                        <button className="text-blue-600 hover:underline text-xs flex items-center justify-end w-full">
                                                            View Proof <ExternalLink className="w-3 h-3 ml-1" />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Fee Edit Modal */}
            {showFeeModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Edit Platform Fee</h3>
                            <button onClick={() => setShowFeeModal(false)}><X className="w-6 h-6 text-gray-400" /></button>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">
                            Update the platform fee percentage for <strong>{organiser.institutionName}</strong>.
                            This applies to all future events.
                        </p>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Platform Fee (%)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={newFee}
                                    onChange={(e) => setNewFee(Number(e.target.value))}
                                    className="w-full pl-4 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                    min="0"
                                    max="50"
                                    step="0.1"
                                />
                                <span className="absolute right-3 top-2 text-gray-500">%</span>
                            </div>
                        </div>

                        <div className="flex space-x-3">
                            <button
                                onClick={() => setShowFeeModal(false)}
                                className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateFee}
                                className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
