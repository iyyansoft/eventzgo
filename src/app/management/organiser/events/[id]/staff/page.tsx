"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
    Users,
    Plus,
    Eye,
    EyeOff,
    Copy,
    Check,
    RefreshCw,
    Trash2,
    Shield,
    Activity,
    AlertCircle
} from "lucide-react";

export default function EventStaffPage() {
    const params = useParams();
    const eventId = params.id as Id<"events">;

    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<any>(null);
    const [copiedField, setCopiedField] = useState<string | null>(null);

    // Get organiser ID from session (you'll need to implement this based on your auth)
    const organiserId = "YOUR_ORGANISER_ID" as Id<"organisers">; // TODO: Get from session

    // Fetch staff
    const staff = useQuery(api.verificationStaff.getVerificationStaff, {
        organiserId,
        eventId,
    });

    // Mutations
    const createStaff = useMutation(api.verificationStaff.createVerificationStaff);
    const updateStatus = useMutation(api.verificationStaff.updateStaffStatus);
    const resetPassword = useMutation(api.verificationStaff.resetStaffPassword);
    const deleteStaff = useMutation(api.verificationStaff.deleteStaff);

    const copyToClipboard = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                                <Users className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    Verification Staff
                                </h1>
                                <p className="text-gray-600 mt-1">
                                    Manage staff who can scan tickets at your event
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                        >
                            <Plus className="w-5 h-5" />
                            Add Staff
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Total Staff</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">
                                    {staff?.length || 0}
                                </p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Active Staff</p>
                                <p className="text-3xl font-bold text-green-600 mt-1">
                                    {staff?.filter(s => s.isActive).length || 0}
                                </p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-lg">
                                <Activity className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Total Scans</p>
                                <p className="text-3xl font-bold text-purple-600 mt-1">
                                    {staff?.reduce((sum, s) => sum + (s.stats?.totalScans || 0), 0) || 0}
                                </p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <Shield className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Staff List */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900">Staff Members</h2>
                    </div>

                    {!staff || staff.length === 0 ? (
                        <div className="p-12 text-center">
                            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                No staff members yet
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Add staff members to help scan tickets at your event
                            </p>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
                            >
                                Add Your First Staff Member
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Staff Member
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Role
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Username
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Password
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Stats
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {staff.map((member) => (
                                        <tr key={member._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-medium text-gray-900">{member.staffName}</p>
                                                    <p className="text-sm text-gray-600">{member.staffEmail}</p>
                                                    <p className="text-sm text-gray-500">{member.staffPhone}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${member.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                                    member.role === 'manager' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {member.role === 'admin' && <Shield className="w-3 h-3" />}
                                                    {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <code className="px-2 py-1 bg-gray-100 rounded text-sm">
                                                        {member.username}
                                                    </code>
                                                    <button
                                                        onClick={() => copyToClipboard(member.username, `username-${member._id}`)}
                                                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                                                    >
                                                        {copiedField === `username-${member._id}` ? (
                                                            <Check className="w-4 h-4 text-green-600" />
                                                        ) : (
                                                            <Copy className="w-4 h-4 text-gray-600" />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <PasswordDisplay password={member.tempPassword} />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm">
                                                    <p className="text-gray-900">
                                                        <span className="font-medium">{member.stats?.totalScans || 0}</span> scans
                                                    </p>
                                                    <p className="text-green-600">
                                                        {member.stats?.validScans || 0} valid
                                                    </p>
                                                    <p className="text-red-600">
                                                        {member.stats?.invalidScans || 0} invalid
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${member.isActive
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {member.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={async () => {
                                                            const result = await resetPassword({
                                                                staffId: member._id,
                                                                resetBy: organiserId,
                                                            });
                                                            if (result.success) {
                                                                setSelectedStaff({ ...member, newPassword: result.newPassword });
                                                            }
                                                        }}
                                                        className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                                                        title="Reset Password"
                                                    >
                                                        <RefreshCw className="w-4 h-4 text-blue-600" />
                                                    </button>
                                                    <button
                                                        onClick={() => updateStatus({
                                                            staffId: member._id,
                                                            isActive: !member.isActive,
                                                            updatedBy: organiserId,
                                                        })}
                                                        className="p-2 hover:bg-yellow-100 rounded-lg transition-colors"
                                                        title={member.isActive ? 'Deactivate' : 'Activate'}
                                                    >
                                                        {member.isActive ? (
                                                            <EyeOff className="w-4 h-4 text-yellow-600" />
                                                        ) : (
                                                            <Eye className="w-4 h-4 text-green-600" />
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            if (confirm('Are you sure you want to remove this staff member?')) {
                                                                deleteStaff({
                                                                    staffId: member._id,
                                                                    deletedBy: organiserId,
                                                                });
                                                            }
                                                        }}
                                                        className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                                                        title="Remove Staff"
                                                    >
                                                        <Trash2 className="w-4 h-4 text-red-600" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Add Staff Modal */}
                {showAddModal && (
                    <AddStaffModal
                        eventId={eventId}
                        organiserId={organiserId}
                        onClose={() => setShowAddModal(false)}
                        onCreate={createStaff}
                    />
                )}

                {/* Password Reset Modal */}
                {selectedStaff?.newPassword && (
                    <PasswordModal
                        staff={selectedStaff}
                        onClose={() => setSelectedStaff(null)}
                    />
                )}
            </div>
        </div>
    );
}

// Add Staff Modal Component
function AddStaffModal({ eventId, organiserId, onClose, onCreate }: any) {
    const [formData, setFormData] = useState({
        staffName: '',
        staffEmail: '',
        staffPhone: '',
        role: 'scanner' as 'scanner' | 'manager' | 'admin',
    });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await onCreate({
                organiserId,
                eventId,
                ...formData,
            });
            setResult(res);
        } catch (error) {
            alert('Error creating staff: ' + error);
        } finally {
            setLoading(false);
        }
    };

    if (result) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Check className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            Staff Created Successfully!
                        </h3>
                        <p className="text-gray-600">
                            Share these credentials securely with the staff member
                        </p>
                    </div>

                    <div className="space-y-4 mb-6">
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Username</p>
                            <div className="flex items-center justify-between">
                                <code className="text-lg font-mono font-bold text-blue-600">
                                    {result.credentials.username}
                                </code>
                                <button
                                    onClick={() => navigator.clipboard.writeText(result.credentials.username)}
                                    className="p-2 hover:bg-blue-100 rounded"
                                >
                                    <Copy className="w-4 h-4 text-blue-600" />
                                </button>
                            </div>
                        </div>

                        <div className="p-4 bg-purple-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Temporary Password</p>
                            <div className="flex items-center justify-between">
                                <code className="text-lg font-mono font-bold text-purple-600">
                                    {result.credentials.tempPassword}
                                </code>
                                <button
                                    onClick={() => navigator.clipboard.writeText(result.credentials.tempPassword)}
                                    className="p-2 hover:bg-purple-100 rounded"
                                >
                                    <Copy className="w-4 h-4 text-purple-600" />
                                </button>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Login URL</p>
                            <p className="text-sm font-mono text-gray-900 break-all">
                                {result.credentials.loginUrl}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-2 p-4 bg-yellow-50 rounded-lg mb-6">
                        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-yellow-800">
                            <strong>Important:</strong> The password is shown only once. Make sure to save it securely.
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                    >
                        Done
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Add Staff Member</h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.staffName}
                            onChange={(e) => setFormData({ ...formData, staffName: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="John Doe"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            required
                            value={formData.staffEmail}
                            onChange={(e) => setFormData({ ...formData, staffEmail: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="john@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone
                        </label>
                        <input
                            type="tel"
                            required
                            value={formData.staffPhone}
                            onChange={(e) => setFormData({ ...formData, staffPhone: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="+91 98765 43210"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Role
                        </label>
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="scanner">Scanner - Can only scan tickets</option>
                            <option value="manager">Manager - Scan + Analytics + Override</option>
                            <option value="admin">Admin - Full access</option>
                        </select>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create Staff'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Password Modal Component
function PasswordModal({ staff, onClose }: any) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Password Reset
                </h3>
                <p className="text-gray-600 mb-6">
                    New password for <strong>{staff.staffName}</strong>
                </p>

                <div className="p-4 bg-purple-50 rounded-lg mb-6">
                    <p className="text-sm text-gray-600 mb-1">New Password</p>
                    <div className="flex items-center justify-between">
                        <code className="text-lg font-mono font-bold text-purple-600">
                            {staff.newPassword}
                        </code>
                        <button
                            onClick={() => navigator.clipboard.writeText(staff.newPassword)}
                            className="p-2 hover:bg-purple-100 rounded"
                        >
                            <Copy className="w-4 h-4 text-purple-600" />
                        </button>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                >
                    Done
                </button>
            </div>
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
