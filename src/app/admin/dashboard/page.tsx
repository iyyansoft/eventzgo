'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { useUser } from '@clerk/nextjs';
import { api } from '@/convex/_generated/api';
import StatCard from '@/components/admin/StatCard';
import {
    Users, Calendar, TrendingUp, DollarSign, UserCheck,
    Clock, Shield, CheckCircle, XCircle, Settings, Building, Mail, Phone
} from 'lucide-react';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart as RePieChart,
    Pie,
    Cell,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'];

const AdminDashboard = () => {
    const { user } = useUser();
    const [activeTab, setActiveTab] = useState('overview');
    const [rejectingOrganiser, setRejectingOrganiser] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

    // Fetch real data from Convex
    const dashboardStats = useQuery(api.admin.getDashboardStats);
    const pendingOrganisers = useQuery(api.admin.getPendingUsers);
    const approveOrganiser = useMutation(api.admin.approveUser);
    const rejectOrganiser = useMutation(api.admin.rejectUser);

    // Extract stats from dashboard data
    const userStats = dashboardStats?.users || { total: 0, active: 0, organisers: 0, pendingOrganisers: 0 };
    const eventStats = dashboardStats?.events || { total: 0, approved: 0, pending: 0, active: 0 };

    const handleApprove = async (organiserId: string) => {
        try {
            await approveOrganiser({ organiserId: organiserId as any });
            alert('Organiser approved successfully!');
        } catch (error) {
            console.error('Error approving organiser:', error);
            alert('Failed to approve organiser');
        }
    };

    const handleReject = async (organiserId: string, reason: string) => {
        if (!reason.trim()) {
            alert('Please provide a rejection reason');
            return;
        }
        try {
            await rejectOrganiser({ organiserId: organiserId as any, reason });
            setRejectingOrganiser(null);
            setRejectionReason('');
            alert('Organiser rejected successfully');
        } catch (error) {
            console.error('Error rejecting organiser:', error);
            alert('Failed to reject organiser');
        }
    };

    const stats = [
        {
            title: 'Total Platform Users',
            value: userStats.total.toLocaleString(),
            change: `${userStats.active} active`,
            icon: Users,
            color: 'bg-blue-500',
        },
        {
            title: 'Pending Verifications',
            value: pendingOrganisers?.length || 0,
            change: 'Awaiting approval',
            icon: Clock,
            color: 'bg-yellow-500',
        },
        {
            title: 'Platform Events',
            value: eventStats.total.toLocaleString(),
            change: `${eventStats.approved || 0} approved`,
            icon: Calendar,
            color: 'bg-green-500',
        },
        {
            title: 'Total Revenue',
            value: `₹${((dashboardStats?.revenue?.total || 0) / 1000).toFixed(1)}K`,
            change: `${dashboardStats?.bookings?.total || 0} bookings`,
            icon: DollarSign,
            color: 'bg-purple-500',
        }
    ];

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Platform Administration</h1>
                <p className="text-gray-600 mt-2">
                    Monitor and manage the entire EventzGo ecosystem
                </p>
            </div>

            {/* Stats Grid */}
            {userStats && eventStats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`${stat.color} w-12 h-12 rounded-xl flex items-center justify-center`}>
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex items-center space-x-1 text-sm font-medium text-green-600">
                                        <TrendingUp className="w-4 h-4" />
                                        <span>Healthy</span>
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                                <p className="text-gray-600 text-sm">{stat.title}</p>
                                <p className="text-green-600 text-xs mt-1">{stat.change}</p>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6">
                        {[
                            { id: 'overview', label: 'Recent Activity' },
                            { id: 'pending', label: 'Pending Organisers', badge: pendingOrganisers?.length || 0 },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 relative ${activeTab === tab.id
                                    ? 'border-red-500 text-red-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {tab.label}
                                {tab.badge !== undefined && tab.badge > 0 && (
                                    <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                                        {tab.badge}
                                    </span>
                                )}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="p-6">
                    {activeTab === 'overview' && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Overview</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <StatCard
                                    title="Active Organisers"
                                    value={userStats.organisers.toLocaleString()}
                                    icon={UserCheck}
                                    color="green"
                                    subtitle="Verified organisers"
                                />
                                <StatCard
                                    title="Total Bookings"
                                    value={dashboardStats?.bookings?.total || 0}
                                    icon={Calendar}
                                    color="blue"
                                    subtitle={`${dashboardStats?.bookings?.confirmed || 0} confirmed`}
                                />
                                <StatCard
                                    title="Platform Revenue"
                                    value={`₹${((dashboardStats?.revenue?.total || 0) / 100).toLocaleString()}`}
                                    icon={DollarSign}
                                    color="purple"
                                    subtitle={`₹${((dashboardStats?.revenue?.net || 0) / 100).toLocaleString()} net`}
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'pending' && pendingOrganisers && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Organiser Applications</h3>
                            {pendingOrganisers.length === 0 ? (
                                <div className="text-center py-12">
                                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                    <p className="text-gray-600">No pending applications</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {pendingOrganisers.map((organiser) => (
                                        <div key={organiser.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3 mb-3">
                                                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                                            <Building className="w-6 h-6 text-purple-600" />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-lg font-bold text-gray-900">{organiser.institutionName}</h4>
                                                            <p className="text-sm text-gray-500">Applied {new Date(organiser.createdAt).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                        <div>
                                                            <p className="text-xs font-medium text-gray-500 mb-1">Contact</p>
                                                            <div className="space-y-1">
                                                                <div className="flex items-center space-x-2 text-sm">
                                                                    <Mail className="w-4 h-4 text-gray-400" />
                                                                    <span>{organiser.email}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-medium text-gray-500 mb-1">Address</p>
                                                            <p className="text-sm text-gray-700">
                                                                {organiser.address.street}, {organiser.address.city}<br />
                                                                {organiser.address.state} - {organiser.address.pincode}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-medium text-gray-500 mb-1">Tax Details</p>
                                                            <p className="text-sm text-gray-700">
                                                                GST: {organiser.gstNumber}<br />
                                                                PAN: {organiser.panNumber}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Uploaded Documents */}
                                                    {organiser.documents && (
                                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                                            <p className="text-xs font-medium text-gray-500 mb-3">📎 Uploaded Documents</p>
                                                            <div className="grid grid-cols-2 gap-2">
                                                                {organiser.documents?.gstCertificate && (
                                                                    <button
                                                                        onClick={() => setPreviewImage({ url: organiser.documents.gstCertificate!, title: 'GST Certificate' })}
                                                                        className="flex items-center space-x-2 p-2 bg-blue-50 rounded border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer text-left"
                                                                    >
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="text-xs font-medium text-blue-900">GST Certificate</p>
                                                                        </div>
                                                                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                        </svg>
                                                                    </button>
                                                                )}
                                                                {organiser.documents?.panCard && (
                                                                    <button
                                                                        onClick={() => setPreviewImage({ url: organiser.documents.panCard!, title: 'PAN Card' })}
                                                                        className="flex items-center space-x-2 p-2 bg-green-50 rounded border border-green-200 hover:bg-green-100 transition-colors cursor-pointer text-left"
                                                                    >
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="text-xs font-medium text-green-900">PAN Card</p>
                                                                        </div>
                                                                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                        </svg>
                                                                    </button>
                                                                )}
                                                                {organiser.documents?.cancelledCheque && (
                                                                    <button
                                                                        onClick={() => setPreviewImage({ url: organiser.documents.cancelledCheque!, title: 'Cancelled Cheque' })}
                                                                        className="flex items-center space-x-2 p-2 bg-purple-50 rounded border border-purple-200 hover:bg-purple-100 transition-colors cursor-pointer text-left"
                                                                    >
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="text-xs font-medium text-purple-900">Cancelled Cheque</p>
                                                                        </div>
                                                                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                        </svg>
                                                                    </button>
                                                                )}
                                                                {organiser.documents?.bankStatement && (
                                                                    <button
                                                                        onClick={() => setPreviewImage({ url: organiser.documents.bankStatement!, title: 'Bank Statement' })}
                                                                        className="flex items-center space-x-2 p-2 bg-orange-50 rounded border border-orange-200 hover:bg-orange-100 transition-colors cursor-pointer text-left"
                                                                    >
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="text-xs font-medium text-orange-900">Bank Statement</p>
                                                                        </div>
                                                                        <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                        </svg>
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {rejectingOrganiser === organiser.id ? (
                                                <div className="mt-4 p-4 bg-red-50 rounded-lg">
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Rejection Reason
                                                    </label>
                                                    <textarea
                                                        value={rejectionReason}
                                                        onChange={(e) => setRejectionReason(e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                                        rows={3}
                                                        placeholder="Please provide a reason for rejection..."
                                                    />
                                                    <div className="flex space-x-2 mt-3">
                                                        <button
                                                            onClick={() => handleReject(organiser.id, rejectionReason)}
                                                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
                                                        >
                                                            Confirm Rejection
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setRejectingOrganiser(null);
                                                                setRejectionReason('');
                                                            }}
                                                            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex space-x-2 mt-4">
                                                    <button
                                                        onClick={() => handleApprove(organiser.id)}
                                                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                        <span>Approve</span>
                                                    </button>
                                                    <button
                                                        onClick={() => setRejectingOrganiser(organiser.id)}
                                                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center space-x-2"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                        <span>Reject</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Image Preview Modal */}
            {previewImage && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
                    onClick={() => setPreviewImage(null)}
                >
                    <div className="relative max-w-4xl max-h-[90vh] w-full">
                        <button
                            onClick={() => setPreviewImage(null)}
                            className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
                        >
                            <XCircle className="w-8 h-8" />
                        </button>

                        <div className="absolute -top-12 left-0 text-white">
                            <h3 className="text-lg font-semibold">{previewImage.title}</h3>
                        </div>

                        <div className="bg-white rounded-lg p-4 max-h-[90vh] overflow-auto">
                            <img
                                src={previewImage.url}
                                alt={previewImage.title}
                                className="w-full h-auto object-contain"
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>
                </div>
            )}

            {!dashboardStats && (
                <div className="flex justify-center items-center h-96">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                        <p className="text-gray-500 mt-4">Loading dashboard data...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
