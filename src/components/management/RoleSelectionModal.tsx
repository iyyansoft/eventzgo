"use client";

import React from 'react';
import { X, Building, Briefcase, Mic, DollarSign, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface RoleSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRoleSelected: (role: 'organizer' | 'vendor' | 'speaker' | 'sponsor') => void;
}

const RoleSelectionModal: React.FC<RoleSelectionModalProps> = ({
    isOpen,
    onClose,
    onRoleSelected
}) => {
    const router = useRouter();

    const roles = [
        {
            id: 'organizer' as const,
            title: 'Event Organizer',
            description: 'Create and manage events, connect with vendors, speakers, and sponsors',
            icon: Building,
            color: 'from-blue-500 to-blue-600',
            bgColor: 'bg-blue-50',
            features: ['Create Events', 'Manage Attendees', 'Connect with Partners', 'Analytics Dashboard']
        },
        {
            id: 'vendor' as const,
            title: 'Service Vendor',
            description: 'Offer your services like catering, photography, decoration, and more',
            icon: Briefcase,
            color: 'from-green-500 to-green-600',
            bgColor: 'bg-green-50',
            features: ['Service Listings', 'Booking Management', 'Client Communication', 'Portfolio Showcase']
        },
        {
            id: 'speaker' as const,
            title: 'Professional Speaker',
            description: 'Share your expertise at events and conferences worldwide',
            icon: Mic,
            color: 'from-purple-500 to-purple-600',
            bgColor: 'bg-purple-50',
            features: ['Speaking Opportunities', 'Profile Management', 'Event Invitations', 'Earnings Tracking']
        },
        {
            id: 'sponsor' as const,
            title: 'Brand Sponsor',
            description: 'Promote your brand through strategic event sponsorships',
            icon: DollarSign,
            color: 'from-yellow-500 to-yellow-600',
            bgColor: 'bg-yellow-50',
            features: ['Sponsorship Opportunities', 'Brand Exposure', 'ROI Analytics', 'Partnership Management']
        }
    ];

    const handleSignUp = (roleId: 'organizer' | 'vendor' | 'speaker' | 'sponsor') => {
        const roleMap = {
            organizer: "organiser",
            vendor: "vendor",
            speaker: "speaker",
            sponsor: "sponsor",
        };
        const schemaRole = roleMap[roleId];
        router.push(`/management/sign-up?role=${schemaRole}`);
        onClose();
    };

    const handleSignIn = (roleId: 'organizer' | 'vendor' | 'speaker' | 'sponsor') => {
        const roleMap = {
            organizer: "organiser",
            vendor: "vendor",
            speaker: "speaker",
            sponsor: "sponsor",
        };
        const schemaRole = roleMap[roleId];
        router.push(`/management/sign-in?role=${schemaRole}`);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto transform transition-all duration-300">
                {/* Header */}
                <div className="relative p-6 pb-0">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>

                    <div className="text-center mb-6">
                        <div className="bg-gradient-to-r from-purple-600 to-pink-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Building className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                            Choose Your Role
                        </h2>
                        <p className="text-gray-600 text-lg">
                            Select the role that best describes your involvement in the event industry
                        </p>
                    </div>
                </div>

                {/* Role Cards */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {roles.map((role) => {
                        const Icon = role.icon;
                        return (
                            <div
                                key={role.id}
                                className={`${role.bgColor} rounded-2xl p-6 border-2 border-transparent hover:border-gray-200 group transition-all duration-300`}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`bg-gradient-to-r ${role.color} w-14 h-14 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                                        <Icon className="w-7 h-7 text-white" />
                                    </div>
                                    <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-300" />
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 mb-2">{role.title}</h3>
                                <p className="text-gray-600 mb-4 leading-relaxed">{role.description}</p>

                                <div className="space-y-2 mb-6">
                                    <h4 className="font-semibold text-gray-800 text-sm">Key Features:</h4>
                                    <ul className="space-y-1">
                                        {role.features.map((feature, index) => (
                                            <li key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Action Buttons */}
                                <div className="space-y-2 pt-4 border-t border-gray-200">
                                    <button
                                        onClick={() => handleSignUp(role.id)}
                                        className={`w-full bg-gradient-to-r ${role.color} text-white px-4 py-3 rounded-lg text-center font-semibold hover:shadow-lg transition-all duration-300`}
                                    >
                                        Sign Up as {role.title}
                                    </button>
                                    <button
                                        onClick={() => handleSignIn(role.id)}
                                        className="w-full bg-white border-2 border-gray-300 text-gray-700 px-4 py-3 rounded-lg text-center font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-300"
                                    >
                                        Sign In as {role.title}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="p-6 pt-0">
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                        <p className="text-sm text-gray-600">
                            <strong>Note:</strong> You can always update your role and add additional roles later from your profile settings.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoleSelectionModal;