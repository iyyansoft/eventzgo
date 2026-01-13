"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
    Ticket,
    Plus,
    TrendingUp,
    Calendar,
    Users,
    DollarSign,
    Eye,
    EyeOff,
    Edit,
    Trash2,
    Copy,
    Check,
    BarChart3,
    Percent,
    Tag
} from "lucide-react";

export default function EventCouponsPage() {
    const params = useParams();
    const eventId = params.id as Id<"events">;

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedCoupon, setSelectedCoupon] = useState<any>(null);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    // Get organiser ID from session (implement based on your auth)
    const organiserId = "YOUR_ORGANISER_ID" as Id<"organisers">; // TODO: Get from session

    // Fetch coupons
    const coupons = useQuery(api.coupons.getCoupons, {
        organiserId,
        eventId,
        includeInactive: true,
    });

    // Mutations
    const createCoupon = useMutation(api.coupons.createCoupon);
    const updateCoupon = useMutation(api.coupons.updateCoupon);
    const deactivateCoupon = useMutation(api.coupons.deactivateCoupon);

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    // Calculate totals
    const totalCoupons = coupons?.length || 0;
    const activeCoupons = coupons?.filter(c => c.isActive).length || 0;
    const totalDiscount = coupons?.reduce((sum, c) => sum + (c.stats?.totalDiscount || 0), 0) || 0;
    const totalRevenue = coupons?.reduce((sum, c) => sum + (c.stats?.totalRevenue || 0), 0) || 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                                <Ticket className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    Coupon Management
                                </h1>
                                <p className="text-gray-600 mt-1">
                                    Create and manage discount codes for your event
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                        >
                            <Plus className="w-5 h-5" />
                            Create Coupon
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Total Coupons</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">
                                    {totalCoupons}
                                </p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <Tag className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Active Coupons</p>
                                <p className="text-3xl font-bold text-green-600 mt-1">
                                    {activeCoupons}
                                </p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-lg">
                                <TrendingUp className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Total Discount</p>
                                <p className="text-3xl font-bold text-orange-600 mt-1">
                                    ₹{totalDiscount.toLocaleString()}
                                </p>
                            </div>
                            <div className="p-3 bg-orange-100 rounded-lg">
                                <Percent className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Total Revenue</p>
                                <p className="text-3xl font-bold text-blue-600 mt-1">
                                    ₹{totalRevenue.toLocaleString()}
                                </p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <DollarSign className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Coupons List */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900">Your Coupons</h2>
                    </div>

                    {!coupons || coupons.length === 0 ? (
                        <div className="p-12 text-center">
                            <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                No coupons yet
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Create your first coupon to start offering discounts
                            </p>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all"
                            >
                                Create Your First Coupon
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Coupon
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Discount
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Validity
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Usage
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
                                    {coupons.map((coupon) => (
                                        <tr key={coupon._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <code className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg font-mono font-bold text-sm">
                                                            {coupon.code}
                                                        </code>
                                                        <button
                                                            onClick={() => copyCode(coupon.code)}
                                                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                                                        >
                                                            {copiedCode === coupon.code ? (
                                                                <Check className="w-4 h-4 text-green-600" />
                                                            ) : (
                                                                <Copy className="w-4 h-4 text-gray-600" />
                                                            )}
                                                        </button>
                                                    </div>
                                                    <p className="font-medium text-gray-900">{coupon.name}</p>
                                                    <p className="text-sm text-gray-600">{coupon.description}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    {coupon.discountType === 'percentage' && (
                                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                                            <Percent className="w-3 h-3" />
                                                            {coupon.discountValue}% off
                                                        </span>
                                                    )}
                                                    {coupon.discountType === 'fixed' && (
                                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                                            <DollarSign className="w-3 h-3" />
                                                            ₹{coupon.discountValue} off
                                                        </span>
                                                    )}
                                                    {coupon.discountType === 'bogo' && (
                                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                                                            <Tag className="w-3 h-3" />
                                                            BOGO
                                                        </span>
                                                    )}
                                                    {coupon.maxDiscount && (
                                                        <p className="text-xs text-gray-600 mt-1">
                                                            Max: ₹{coupon.maxDiscount}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm">
                                                    <p className="text-gray-900">
                                                        {new Date(coupon.validFrom).toLocaleDateString()}
                                                    </p>
                                                    <p className="text-gray-600">to</p>
                                                    <p className="text-gray-900">
                                                        {new Date(coupon.validUntil).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm">
                                                    <p className="text-gray-900 font-medium">
                                                        {coupon.currentUses} / {coupon.maxUses || '∞'}
                                                    </p>
                                                    {coupon.maxUses && (
                                                        <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                                                            <div
                                                                className="bg-purple-600 h-2 rounded-full"
                                                                style={{
                                                                    width: `${Math.min((coupon.currentUses / coupon.maxUses) * 100, 100)}%`
                                                                }}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm">
                                                    <p className="text-gray-900">
                                                        <span className="font-medium">{coupon.stats?.totalUsages || 0}</span> uses
                                                    </p>
                                                    <p className="text-orange-600">
                                                        ₹{(coupon.stats?.totalDiscount || 0).toLocaleString()} discount
                                                    </p>
                                                    <p className="text-green-600">
                                                        ₹{(coupon.stats?.totalRevenue || 0).toLocaleString()} revenue
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${coupon.isActive
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {coupon.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => setSelectedCoupon(coupon)}
                                                        className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                                                        title="View Details"
                                                    >
                                                        <BarChart3 className="w-4 h-4 text-blue-600" />
                                                    </button>
                                                    <button
                                                        onClick={async () => {
                                                            await updateCoupon({
                                                                couponId: coupon._id,
                                                                updates: { isActive: !coupon.isActive },
                                                            });
                                                        }}
                                                        className="p-2 hover:bg-yellow-100 rounded-lg transition-colors"
                                                        title={coupon.isActive ? 'Deactivate' : 'Activate'}
                                                    >
                                                        {coupon.isActive ? (
                                                            <EyeOff className="w-4 h-4 text-yellow-600" />
                                                        ) : (
                                                            <Eye className="w-4 h-4 text-green-600" />
                                                        )}
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

                {/* Create Coupon Modal */}
                {showCreateModal && (
                    <CreateCouponModal
                        eventId={eventId}
                        organiserId={organiserId}
                        onClose={() => setShowCreateModal(false)}
                        onCreate={createCoupon}
                    />
                )}

                {/* Coupon Details Modal */}
                {selectedCoupon && (
                    <CouponDetailsModal
                        coupon={selectedCoupon}
                        onClose={() => setSelectedCoupon(null)}
                    />
                )}
            </div>
        </div>
    );
}

// Create Coupon Modal
function CreateCouponModal({ eventId, organiserId, onClose, onCreate }: any) {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        description: '',
        discountType: 'percentage' as 'percentage' | 'fixed' | 'bogo',
        discountValue: 10,
        maxDiscount: undefined as number | undefined,
        validFrom: Date.now(),
        validUntil: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days
        maxUses: undefined as number | undefined,
        maxUsesPerUser: 1,
        minPurchaseAmount: undefined as number | undefined,
        firstTimeUserOnly: false,
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await onCreate({
                organiserId,
                eventId,
                ...formData,
            });
            onClose();
        } catch (error) {
            alert('Error creating coupon: ' + error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Create New Coupon</h3>

                {/* Step Indicator */}
                <div className="flex items-center justify-between mb-8">
                    {[1, 2, 3, 4].map((s) => (
                        <div key={s} className="flex items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${step >= s ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
                                }`}>
                                {s}
                            </div>
                            {s < 4 && (
                                <div className={`w-16 h-1 mx-2 ${step > s ? 'bg-purple-600' : 'bg-gray-200'
                                    }`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Step 1: Basic Details */}
                {step === 1 && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Coupon Code (leave empty to auto-generate)
                            </label>
                            <input
                                type="text"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent uppercase"
                                placeholder="SUMMER2026"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Coupon Name *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Summer Sale 2026"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description *
                            </label>
                            <textarea
                                required
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                rows={3}
                                placeholder="Get 25% off on all tickets"
                            />
                        </div>
                    </div>
                )}

                {/* Step 2: Discount Details */}
                {step === 2 && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Discount Type *
                            </label>
                            <select
                                value={formData.discountType}
                                onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                                <option value="percentage">Percentage (10%, 20%, etc.)</option>
                                <option value="fixed">Fixed Amount (₹100, ₹500, etc.)</option>
                                <option value="bogo">Buy One Get One (50% off)</option>
                            </select>
                        </div>

                        {formData.discountType !== 'bogo' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Discount Value *
                                </label>
                                <input
                                    type="number"
                                    required
                                    value={formData.discountValue}
                                    onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder={formData.discountType === 'percentage' ? '25' : '500'}
                                />
                                <p className="text-sm text-gray-600 mt-1">
                                    {formData.discountType === 'percentage' ? 'Enter percentage (1-100)' : 'Enter amount in ₹'}
                                </p>
                            </div>
                        )}

                        {formData.discountType === 'percentage' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Maximum Discount (optional)
                                </label>
                                <input
                                    type="number"
                                    value={formData.maxDiscount || ''}
                                    onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value ? Number(e.target.value) : undefined })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="1000"
                                />
                                <p className="text-sm text-gray-600 mt-1">
                                    Cap the maximum discount amount in ₹
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Step 3: Validity & Limits */}
                {step === 3 && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Valid From *
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={new Date(formData.validFrom).toISOString().split('T')[0]}
                                    onChange={(e) => setFormData({ ...formData, validFrom: new Date(e.target.value).getTime() })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Valid Until *
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={new Date(formData.validUntil).toISOString().split('T')[0]}
                                    onChange={(e) => setFormData({ ...formData, validUntil: new Date(e.target.value).getTime() })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Maximum Total Uses (leave empty for unlimited)
                            </label>
                            <input
                                type="number"
                                value={formData.maxUses || ''}
                                onChange={(e) => setFormData({ ...formData, maxUses: e.target.value ? Number(e.target.value) : undefined })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="100"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Maximum Uses Per User
                            </label>
                            <input
                                type="number"
                                value={formData.maxUsesPerUser}
                                onChange={(e) => setFormData({ ...formData, maxUsesPerUser: Number(e.target.value) })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="1"
                            />
                        </div>
                    </div>
                )}

                {/* Step 4: Conditions */}
                {step === 4 && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Minimum Purchase Amount (optional)
                            </label>
                            <input
                                type="number"
                                value={formData.minPurchaseAmount || ''}
                                onChange={(e) => setFormData({ ...formData, minPurchaseAmount: e.target.value ? Number(e.target.value) : undefined })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="1000"
                            />
                            <p className="text-sm text-gray-600 mt-1">
                                Minimum cart value required to use this coupon
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="firstTimeOnly"
                                checked={formData.firstTimeUserOnly}
                                onChange={(e) => setFormData({ ...formData, firstTimeUserOnly: e.target.checked })}
                                className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                            />
                            <label htmlFor="firstTimeOnly" className="text-sm font-medium text-gray-700">
                                First-time users only
                            </label>
                        </div>

                        {/* Preview */}
                        <div className="mt-6 p-4 bg-purple-50 rounded-xl">
                            <h4 className="font-medium text-gray-900 mb-2">Coupon Preview:</h4>
                            <div className="space-y-1 text-sm">
                                <p><strong>Code:</strong> {formData.code || 'AUTO-GENERATED'}</p>
                                <p><strong>Name:</strong> {formData.name}</p>
                                <p><strong>Discount:</strong> {
                                    formData.discountType === 'percentage' ? `${formData.discountValue}%` :
                                        formData.discountType === 'fixed' ? `₹${formData.discountValue}` :
                                            'Buy One Get One (50% off)'
                                }</p>
                                <p><strong>Valid:</strong> {new Date(formData.validFrom).toLocaleDateString()} - {new Date(formData.validUntil).toLocaleDateString()}</p>
                                <p><strong>Max Uses:</strong> {formData.maxUses || 'Unlimited'}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <div className="flex gap-3 mt-8">
                    {step > 1 && (
                        <button
                            onClick={() => setStep(step - 1)}
                            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            Back
                        </button>
                    )}
                    {step < 4 ? (
                        <button
                            onClick={() => setStep(step + 1)}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all"
                        >
                            Next
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create Coupon'}
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

// Coupon Details Modal
function CouponDetailsModal({ coupon, onClose }: any) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Coupon Details</h3>

                <div className="space-y-4">
                    <div className="p-4 bg-purple-50 rounded-xl">
                        <code className="text-2xl font-mono font-bold text-purple-700">
                            {coupon.code}
                        </code>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-600">Total Uses</p>
                            <p className="text-2xl font-bold text-gray-900">{coupon.stats?.totalUsages || 0}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Total Discount Given</p>
                            <p className="text-2xl font-bold text-orange-600">₹{(coupon.stats?.totalDiscount || 0).toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Total Revenue</p>
                            <p className="text-2xl font-bold text-green-600">₹{(coupon.stats?.totalRevenue || 0).toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Remaining Uses</p>
                            <p className="text-2xl font-bold text-blue-600">
                                {coupon.stats?.remainingUses !== null ? coupon.stats?.remainingUses : '∞'}
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="w-full mt-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all"
                >
                    Close
                </button>
            </div>
        </div>
    );
}
