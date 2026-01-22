"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
    Users,
    Plus,
    Shield,
    Activity,
    UserCheck,
    Calendar,
    ArrowRight,
    QrCode,
    Search,
    MoreVertical,
    Check,
    X,
    Copy,
    Eye,
    EyeOff,
    UserX,
    RefreshCw,
    Trash2
} from "lucide-react";

// Disable static generation for this page
export const dynamic = 'force-dynamic';

export default function AllStaffPage() {
    const router = useRouter();
    const [organiserId, setOrganiserId] = useState<string | null>(null);

    // UI States
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showCredentialsModal, setShowCredentialsModal] = useState(false);
    const [newCredentials, setNewCredentials] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterEvent, setFilterEvent] = useState<string>("all");

    // Form States
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        role: "scanner" as "scanner" | "manager" | "admin",
        eventId: "all" as string // "all" means global staff (no specific event)
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showEndedEvents, setShowEndedEvents] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem("organiser_session");
        if (stored) {
            try {
                const sessionData = JSON.parse(stored);
                if (sessionData && sessionData.id) setOrganiserId(sessionData.id);
            } catch (e) { }
        }
    }, []);

    // Queries
    const events = useQuery(
        api.events.getOrganiserEvents,
        organiserId ? { organiserId: organiserId as any } : "skip"
    );

    const allStaff = useQuery(
        api.verificationStaff.getVerificationStaff,
        organiserId ? { organiserId: organiserId as any } : "skip"
    );

    // Mutations
    const createStaff = useMutation(api.verificationStaff.createVerificationStaff);
    const updateStatus = useMutation(api.verificationStaff.updateStaffStatus);
    const deleteStaff = useMutation(api.verificationStaff.deleteStaff);
    const resetPassword = useMutation(api.verificationStaff.resetStaffPassword);

    // Filtered Staff
    const filteredStaff = allStaff?.filter(staff => {
        const matchesSearch =
            staff.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            staff.username.toLowerCase().includes(searchTerm.toLowerCase());

        if (filterEvent === "all") return matchesSearch;
        if (filterEvent === "global") return matchesSearch && !staff.eventId;
        return matchesSearch && staff.eventId === filterEvent;
    });

    // Calculate Stats
    const totalStaff = allStaff?.length || 0;
    const activeStaff = allStaff?.filter(s => s.isActive).length || 0;
    const totalScans = allStaff?.reduce((sum, s) => sum + (s.stats?.totalScans || 0), 0) || 0;
    const eventsCovered = new Set(allStaff?.map(s => s.eventId).filter(Boolean)).size || 0;

    const handleCreateStaff = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!organiserId) return;

        setIsSubmitting(true);
        try {
            const result = await createStaff({
                organiserId: organiserId as any,
                eventId: formData.eventId === "all" ? undefined : formData.eventId as any,
                staffName: formData.name,
                staffEmail: formData.email,
                staffPhone: formData.phone,
                role: formData.role
            });

            setNewCredentials(result.credentials);
            setShowCreateModal(false);
            setShowCredentialsModal(true);

            // Reset form
            setFormData({
                name: "",
                email: "",
                phone: "",
                role: "scanner",
                eventId: "all"
            });
        } catch (error) {
            console.error("Failed to create staff:", error);
            alert("Failed to create staff. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleStatus = async (staffId: string, currentStatus: boolean) => {
        if (!organiserId) return;
        try {
            await updateStatus({
                staffId: staffId as any,
                isActive: !currentStatus,
                updatedBy: organiserId as any
            });
        } catch (error) {
            console.error("Failed to update status:", error);
        }
    };

    const handleDelete = async (staffId: string) => {
        if (!organiserId || !confirm("Are you sure you want to delete this staff member? This action cannot be undone.")) return;
        try {
            await deleteStaff({
                staffId: staffId as any,
                deletedBy: organiserId as any
            });
        } catch (error) {
            console.error("Failed to delete staff:", error);
        }
    };

    return (
        <div className="max-w-7xl mx-auto pb-10">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl">
                            <Users className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Staff Management
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Manage verification staff, generate credentials, and track performance
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:shadow-lg transition-all transform hover:scale-105"
                    >
                        <Plus className="w-5 h-5" />
                        Add New Staff
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-medium">Total Staff</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{totalStaff}</p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-medium">Active Staff</p>
                            <p className="text-3xl font-bold text-green-600 mt-1">{activeStaff}</p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-lg">
                            <UserCheck className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-medium">Total Scans</p>
                            <p className="text-3xl font-bold text-purple-600 mt-1">{totalScans}</p>
                        </div>
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <QrCode className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-medium">Events Covered</p>
                            <p className="text-3xl font-bold text-orange-600 mt-1">{eventsCovered}</p>
                        </div>
                        <div className="p-3 bg-orange-100 rounded-lg">
                            <Activity className="w-6 h-6 text-orange-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* Toolbar */}
                <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h2 className="text-xl font-bold text-gray-900">All Staff Members</h2>

                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search staff..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full md:w-64"
                            />
                        </div>

                        <select
                            value={filterEvent}
                            onChange={(e) => setFilterEvent(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">All Events</option>
                            <option value="global">Global Staff Only</option>
                            {events?.map(event => (
                                <option key={event._id} value={event._id}>{event.title}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Staff Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Staff Details</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Password</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role & Access</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Performance</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {!filteredStaff || filteredStaff.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        <Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                                        <p className="text-lg font-medium">No staff members found</p>
                                        <p className="text-sm">Create a new staff member to get started</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredStaff.map((staff) => (
                                    <tr key={staff._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                                                    {staff.staffName.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="font-medium text-gray-900">{staff.staffName}</div>
                                                    <div className="text-sm text-gray-500">{staff.username}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <PasswordDisplay password={staff.tempPassword} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold leading-5 rounded-full ${staff.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                                    staff.role === 'manager' ? 'bg-orange-100 text-orange-800' :
                                                        'bg-blue-100 text-blue-800'
                                                    }`}>
                                                    {staff.role.charAt(0).toUpperCase() + staff.role.slice(1)}
                                                </span>
                                                <div className="text-sm text-gray-600">
                                                    {staff.eventName ? (
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" />
                                                            {staff.eventName}
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1 text-green-600 font-medium">
                                                            <Shield className="w-3 h-3" />
                                                            All Events
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">
                                                <div className="font-medium">{staff.stats?.totalScans || 0} Scans</div>
                                                <div className="text-xs text-green-600">
                                                    {staff.stats?.validScans || 0} valid
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleToggleStatus(staff._id, staff.isActive)}
                                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${staff.isActive ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'
                                                    }`}
                                            >
                                                {staff.isActive ? 'Active' : 'Inactive'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleDelete(staff._id)}
                                                    className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-full transition-colors"
                                                    title="Delete Staff"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Staff Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-900">Add New Staff Member</h3>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateStaff} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="scanner">Scanner (App Only)</option>
                                        <option value="manager">Manager</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="john@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <input
                                    type="tel"
                                    required
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="+91 98765 43210"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Assign Event</label>
                                
                                {/* Filter active/ended events */}
                                {(() => {
                                    const now = Date.now();
                                    const activeEvents = events?.filter(event => {
                                        const eventEndTime = event.dateTime?.end || 0;
                                        return eventEndTime > now;
                                    }) || [];
                                    
                                    const endedEvents = events?.filter(event => {
                                        const eventEndTime = event.dateTime?.end || 0;
                                        return eventEndTime <= now;
                                    }) || [];

                                    return (
                                        <>
                                            <select
                                                value={formData.eventId}
                                                onChange={(e) => setFormData({ ...formData, eventId: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="all">All Events (Global Access)</option>
                                                
                                                {/* Active Events */}
                                                {activeEvents.length > 0 && (
                                                    <optgroup label="Active Events">
                                                        {activeEvents.map(event => (
                                                            <option key={event._id} value={event._id}>
                                                                {event.title}
                                                            </option>
                                                        ))}
                                                    </optgroup>
                                                )}
                                                
                                                {/* Ended Events - Only show if toggle is enabled */}
                                                {showEndedEvents && endedEvents.length > 0 && (
                                                    <optgroup label="Ended Events">
                                                        {endedEvents.map(event => (
                                                            <option key={event._id} value={event._id}>
                                                                {event.title} (Ended)
                                                            </option>
                                                        ))}
                                                    </optgroup>
                                                )}
                                            </select>
                                            
                                            <div className="mt-2 flex items-center justify-between">
                                                <p className="text-xs text-gray-500">
                                                    Select "All Events" to allow scanning for any event organized by you.
                                                </p>
                                                
                                                {/* Toggle for ended events */}
                                                {endedEvents.length > 0 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowEndedEvents(!showEndedEvents)}
                                                        className={`ml-2 px-3 py-1 text-xs font-medium rounded-full transition-all ${
                                                            showEndedEvents 
                                                                ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' 
                                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                        }`}
                                                    >
                                                        {showEndedEvents ? 'Hide' : 'Show'} Ended Events ({endedEvents.length})
                                                    </button>
                                                )}
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? 'Creating...' : 'Create Staff Account'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Credentials Modal */}
            {showCredentialsModal && newCredentials && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 text-center border-b border-gray-100">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Check className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">Staff Created!</h3>
                            <p className="text-gray-600 mt-2">
                                Share these credentials with your staff member. They will use them to login to the scanner app.
                            </p>
                        </div>

                        <div className="p-6 bg-gray-50">
                            <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Username</label>
                                    <div className="flex items-center justify-between mt-1 bg-gray-50 p-2 rounded-lg">
                                        <code className="text-lg font-mono font-bold text-blue-600">{newCredentials.username}</code>
                                        <button
                                            onClick={() => navigator.clipboard.writeText(newCredentials.username)}
                                            className="text-gray-400 hover:text-blue-600 transition-colors"
                                        >
                                            <Copy className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Password</label>
                                    <div className="flex items-center justify-between mt-1 bg-gray-50 p-2 rounded-lg">
                                        <code className="text-lg font-mono font-bold text-blue-600">{newCredentials.tempPassword}</code>
                                        <button
                                            onClick={() => navigator.clipboard.writeText(newCredentials.tempPassword)}
                                            className="text-gray-400 hover:text-blue-600 transition-colors"
                                        >
                                            <Copy className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Login URL</label>
                                    <div className="mt-1">
                                        <a href="https://eventzgo.com/verify/login" target="_blank" className="text-sm text-blue-600 hover:underline break-all">
                                            https://eventzgo.com/verify/login
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex items-start gap-3 p-3 bg-yellow-50 text-yellow-800 rounded-lg text-sm">
                                <Shield className="w-5 h-5 flex-shrink-0" />
                                <p>These credentials will only verify tickets for <strong>{
                                    allStaff?.find(s => s.username === newCredentials.username)?.eventName || "All Events"
                                }</strong>.</p>
                            </div>

                            <button
                                onClick={() => setShowCredentialsModal(false)}
                                className="w-full mt-6 px-4 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function PasswordDisplay({ password }: { password?: string }) {
    const [show, setShow] = useState(false);
    const [copied, setCopied] = useState(false);

    if (!password) return <span className="text-gray-400 text-xs italic">Hidden</span>;

    const handleCopy = () => {
        navigator.clipboard.writeText(password);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex items-center gap-2">
            <code className="px-2 py-1 bg-gray-100 rounded text-sm w-[100px] block truncate font-mono text-purple-600">
                {show ? password : '••••••••'}
            </code>
            <button
                onClick={() => setShow(!show)}
                className="p-1 hover:bg-gray-200 rounded text-gray-500"
                title={show ? "Hide" : "Show"}
            >
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <button
                onClick={handleCopy}
                className="p-1 hover:bg-gray-200 rounded text-gray-500"
                title="Copy Password"
            >
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            </button>
        </div>
    );
}
