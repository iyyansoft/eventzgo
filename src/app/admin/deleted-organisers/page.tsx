'use client';

import React, { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Building2, Mail, Phone, MapPin, Eye, Calendar, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

// Disable static generation for this page
export const dynamic = 'force-dynamic';

export default function DeletedOrganisersPage() {
    const [selectedOrganiser, setSelectedOrganiser] = useState<any>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    // Fetch deleted organisers
    const organisers = useQuery(api.managementApprovals.getDeletedOrganisers);

    const viewDetails = (organiser: any) => {
        setSelectedOrganiser(organiser);
        setShowDetailsModal(true);
    };

    const renderDocument = (doc: string | undefined, label: string) => {
        if (!doc) return <p className="text-sm text-gray-500">Not provided</p>;

        if (doc.startsWith('http')) {
            const isImage = doc.match(/\.(jpg|jpeg|png|gif|webp)$/i);
            const isPDF = doc.match(/\.pdf$/i);

            if (isImage) {
                return (
                    <div>
                        <img src={doc} alt={label} className="max-w-full h-auto rounded border" />
                        <a href={doc} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm mt-2 block">
                            Open in new tab
                        </a>
                    </div>
                );
            } else if (isPDF) {
                return (
                    <div>
                        <embed src={doc} type="application/pdf" className="w-full h-96 rounded border" />
                        <a href={doc} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm mt-2 block">
                            Open in new tab
                        </a>
                    </div>
                );
            }
        }

        return <p className="text-sm text-gray-500">Document available</p>;
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Deleted Organisers</h1>
                <p className="text-gray-600">View all deleted organiser records</p>
            </div>

            {/* Stats */}
            <div className="bg-gradient-to-r from-red-600 to-pink-600 rounded-xl p-6 mb-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-red-100 text-sm">Total Deleted Organisers</p>
                        <p className="text-4xl font-bold">{organisers?.length || 0}</p>
                    </div>
                    <Trash2 className="w-16 h-16 opacity-50" />
                </div>
            </div>

            {/* Organisers List */}
            {!organisers ? (
                <div className="text-center py-12">
                    <p className="text-gray-500">Loading deleted organisers...</p>
                </div>
            ) : organisers.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <Trash2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No deleted organisers found</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {organisers.map((organiser) => (
                        <div key={organiser._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-pink-600 rounded-full flex items-center justify-center">
                                            <Building2 className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">{organiser.institutionName}</h3>
                                            <p className="text-sm text-gray-500">{organiser.contactPerson}</p>
                                        </div>
                                        <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                                            DELETED
                                        </span>
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

                                    {organiser.deletedAt && (
                                        <div className="mt-3 flex items-center space-x-2 text-xs text-red-600">
                                            <Calendar className="w-3 h-3" />
                                            <span>Deleted on {format(new Date(organiser.deletedAt), 'MMM dd, yyyy')}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="ml-4">
                                    <button
                                        onClick={() => viewDetails(organiser)}
                                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2 text-sm"
                                    >
                                        <Eye className="w-4 h-4" />
                                        <span>View Details</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Details Modal - Same as active organisers page */}
            {showDetailsModal && selectedOrganiser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Deleted Organiser Details</h2>
                                <span className="inline-block mt-2 px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                                    DELETED
                                </span>
                            </div>
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="text-gray-500 hover:text-gray-700 text-2xl"
                            >
                                Ã—
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Same content as active organisers modal */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Basic Information</h3>
                                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Institution Name</p>
                                            <p className="font-medium">{selectedOrganiser.institutionName}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Contact Person</p>
                                            <p className="font-medium">{selectedOrganiser.contactPerson || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Email</p>
                                            <p className="font-medium">{selectedOrganiser.email || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Phone</p>
                                            <p className="font-medium">{selectedOrganiser.phone || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {selectedOrganiser.deletedAt && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <p className="text-sm text-red-700">
                                        <strong>Deleted:</strong> {format(new Date(selectedOrganiser.deletedAt), 'MMMM dd, yyyy at hh:mm a')}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6">
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
