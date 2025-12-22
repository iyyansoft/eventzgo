'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import StatCard from '@/components/admin/StatCard';
import { UserCheck, Building2, Mic, Award, CheckCircle, XCircle, Eye, Mail, Phone, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { Id } from '@/convex/_generated/dataModel';

export default function ManagementApprovalPage() {
    const [activeCategory, setActiveCategory] = useState('all');
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    // Fetch pending approvals
    const approvals = useQuery(api.managementApprovals.getPendingApprovals, {
        category: activeCategory,
    });

    const stats = useQuery(api.managementApprovals.getApprovalStats);

    // Mutations
    const approveOrganiser = useMutation(api.managementApprovals.approveOrganiser);
    const rejectOrganiser = useMutation(api.managementApprovals.rejectOrganiser);
    const approveVendor = useMutation(api.managementApprovals.approveVendor);
    const rejectVendor = useMutation(api.managementApprovals.rejectVendor);
    const approveSpeaker = useMutation(api.managementApprovals.approveSpeaker);
    const rejectSpeaker = useMutation(api.managementApprovals.rejectSpeaker);
    const approveSponsor = useMutation(api.managementApprovals.approveSponsor);
    const rejectSponsor = useMutation(api.managementApprovals.rejectSponsor);

    const categories = [
        { id: 'all', label: 'All Categories', icon: UserCheck, color: 'blue' },
        { id: 'organiser', label: 'Organisers', icon: Building2, color: 'purple' },
        { id: 'vendor', label: 'Vendors', icon: Building2, color: 'green' },
        { id: 'speaker', label: 'Speakers', icon: Mic, color: 'orange' },
        { id: 'sponsor', label: 'Sponsors', icon: Award, color: 'red' },
    ];

    const handleApprove = async (item: any, category: string) => {
        try {
            switch (category) {
                case 'organiser':
                    await approveOrganiser({ organiserId: item._id as Id<'organisers'> });
                    break;
                case 'vendor':
                    await approveVendor({ vendorId: item._id as Id<'vendors'> });
                    break;
                case 'speaker':
                    await approveSpeaker({ speakerId: item._id as Id<'speakers'> });
                    break;
                case 'sponsor':
                    await approveSponsor({ sponsorId: item._id as Id<'sponsors'> });
                    break;
            }
            alert(`${category.charAt(0).toUpperCase() + category.slice(1)} approved successfully!`);
        } catch (error) {
            alert('Failed to approve. Please try again.');
        }
    };

    const handleReject = async (item: any, category: string) => {
        const reason = prompt('Please provide a reason for rejection (optional):');
        try {
            switch (category) {
                case 'organiser':
                    await rejectOrganiser({ organiserId: item._id as Id<'organisers'>, reason: reason || undefined });
                    break;
                case 'vendor':
                    await rejectVendor({ vendorId: item._id as Id<'vendors'>, reason: reason || undefined });
                    break;
                case 'speaker':
                    await rejectSpeaker({ speakerId: item._id as Id<'speakers'>, reason: reason || undefined });
                    break;
                case 'sponsor':
                    await rejectSponsor({ sponsorId: item._id as Id<'sponsors'>, reason: reason || undefined });
                    break;
            }
            alert(`${category.charAt(0).toUpperCase() + category.slice(1)} rejected.`);
        } catch (error) {
            alert('Failed to reject. Please try again.');
        }
    };

    const viewDetails = (item: any) => {
        setSelectedItem(item);
        setShowDetailsModal(true);
    };

    const renderApprovalCard = (item: any, category: string) => {
        const getCategoryIcon = () => {
            switch (category) {
                case 'organiser': return Building2;
                case 'vendor': return Building2;
                case 'speaker': return Mic;
                case 'sponsor': return Award;
                default: return UserCheck;
            }
        };

        const Icon = getCategoryIcon();

        return (
            <div key={item._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center">
                            <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">
                                {category === 'organiser' && item.institutionName}
                                {category === 'vendor' && item.companyName}
                                {category === 'speaker' && item.fullName}
                                {category === 'sponsor' && item.companyName}
                            </h3>
                            <p className="text-sm text-gray-500">{item.userEmail}</p>
                        </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Pending
                    </span>
                </div>

                <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                        <Mail className="w-4 h-4 mr-2" />
                        {item.email || item.contactEmail}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                        <Phone className="w-4 h-4 mr-2" />
                        {item.phone || item.contactPhone}
                    </div>
                    {(item.city || item.location) && (
                        <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="w-4 h-4 mr-2" />
                            {item.city || item.location}
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <button
                        onClick={() => viewDetails(item)}
                        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <Eye className="w-4 h-4" />
                        <span className="text-sm font-medium">View Details</span>
                    </button>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => handleReject(item, category)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                        >
                            <XCircle className="w-4 h-4" />
                            <span>Reject</span>
                        </button>
                        <button
                            onClick={() => handleApprove(item, category)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                        >
                            <CheckCircle className="w-4 h-4" />
                            <span>Approve</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Management Approval</h1>
                <p className="text-gray-600 mt-2">
                    Review and approve management sign-ups from organisers, vendors, speakers, and sponsors
                </p>
            </div>

            {/* Statistics Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                    <StatCard
                        title="Total Pending"
                        value={stats.total}
                        icon={UserCheck}
                        color="blue"
                        subtitle="All categories"
                    />
                    <StatCard
                        title="Organisers"
                        value={stats.organisers}
                        icon={Building2}
                        color="purple"
                        subtitle="Pending approval"
                    />
                    <StatCard
                        title="Vendors"
                        value={stats.vendors}
                        icon={Building2}
                        color="green"
                        subtitle="Pending approval"
                    />
                    <StatCard
                        title="Speakers"
                        value={stats.speakers}
                        icon={Mic}
                        color="orange"
                        subtitle="Pending approval"
                    />
                    <StatCard
                        title="Sponsors"
                        value={stats.sponsors}
                        icon={Award}
                        color="red"
                        subtitle="Pending approval"
                    />
                </div>
            )}

            {/* Category Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6">
                        {categories.map((category) => {
                            const Icon = category.icon;
                            return (
                                <button
                                    key={category.id}
                                    onClick={() => setActiveCategory(category.id)}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 flex items-center space-x-2 ${activeCategory === category.id
                                            ? 'border-red-500 text-red-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{category.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* Approval Cards */}
            {!approvals ? (
                <div className="flex justify-center items-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                        <p className="text-gray-500 mt-4">Loading approvals...</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Organisers */}
                    {approvals.organisers.length > 0 && (
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Organisers</h2>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {approvals.organisers.map((org) => renderApprovalCard(org, 'organiser'))}
                            </div>
                        </div>
                    )}

                    {/* Vendors */}
                    {approvals.vendors.length > 0 && (
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Vendors</h2>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {approvals.vendors.map((vendor) => renderApprovalCard(vendor, 'vendor'))}
                            </div>
                        </div>
                    )}

                    {/* Speakers */}
                    {approvals.speakers.length > 0 && (
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Speakers</h2>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {approvals.speakers.map((speaker) => renderApprovalCard(speaker, 'speaker'))}
                            </div>
                        </div>
                    )}

                    {/* Sponsors */}
                    {approvals.sponsors.length > 0 && (
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Sponsors</h2>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {approvals.sponsors.map((sponsor) => renderApprovalCard(sponsor, 'sponsor'))}
                            </div>
                        </div>
                    )}

                    {/* Empty State */}
                    {approvals.organisers.length === 0 &&
                        approvals.vendors.length === 0 &&
                        approvals.speakers.length === 0 &&
                        approvals.sponsors.length === 0 && (
                            <div className="text-center py-12">
                                <UserCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Pending Approvals</h3>
                                <p className="text-gray-600">All management sign-ups have been reviewed</p>
                            </div>
                        )}
                </div>
            )}

            {/* Details Modal */}
            {showDetailsModal && selectedItem && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-gray-900">Complete Details</h2>
                                <button
                                    onClick={() => setShowDetailsModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {Object.entries(selectedItem).map(([key, value]) => {
                                    if (key === '_id' || key === '_creationTime' || key === 'userId' || key === 'category') return null;
                                    return (
                                        <div key={key} className="flex flex-col">
                                            <span className="text-sm font-medium text-gray-500 uppercase">
                                                {key.replace(/([A-Z])/g, ' $1').trim()}
                                            </span>
                                            <span className="text-gray-900 mt-1">
                                                {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                            <button
                                onClick={() => {
                                    handleReject(selectedItem, selectedItem.category);
                                    setShowDetailsModal(false);
                                }}
                                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Reject
                            </button>
                            <button
                                onClick={() => {
                                    handleApprove(selectedItem, selectedItem.category);
                                    setShowDetailsModal(false);
                                }}
                                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                Approve
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
