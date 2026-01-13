'use client';

import React, { useState } from 'react';
import { useQuery } from 'convex/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { api } from '@/convex/_generated/api';
import {
    Calendar, Plus, Users, TrendingUp, Clock, MapPin,
    Star, Eye, Edit, Trash2, CheckCircle, Target,
    FileText, CreditCard, AlertCircle, MessageSquare, Zap, Building
} from 'lucide-react';
import DashboardOnboarding from "@/components/organiser/DashboardOnboarding";
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell as RechartsCell
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const OrganizerDashboard = () => {
    const router = useRouter();
    const { data: nextAuthSession, status } = useSession();
    const [activeTab, setActiveTab] = useState('overview');
    const [localSession, setLocalSession] = useState<any>(null);
    const [isLoadingLocal, setIsLoadingLocal] = useState(true);
    const [isEditingApplication, setIsEditingApplication] = useState(false);

    // Check for local session on mount
    React.useEffect(() => {
        const stored = localStorage.getItem("organiser_session");
        if (stored) {
            try {
                setLocalSession(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse local session");
            }
        }
        setIsLoadingLocal(false);
    }, []);

    // Combine sessions (prefer NextAuth, fallback to local)
    const session = nextAuthSession || (localSession ? { user: { ...localSession, userId: localSession.id } } : null);
    const userId = session?.user?.userId || session?.user?.id;

    // Redirect if no session found after checking both
    React.useEffect(() => {
        if (status === "unauthenticated" && !localSession && !isLoadingLocal) {
            // Optional: Redirect to login if absolutely no session
            // router.push("/management/sign-in");
        }
    }, [status, localSession, isLoadingLocal, router]);

    // Fetch organiser data
    const organiserData = useQuery(
        api.organisers.getOrganiserById,
        userId ? { organiserId: userId as any } : "skip"
    );

    // Fetch events created by this organiser
    const myEvents = useQuery(
        api.events.getOrganiserEvents,
        userId ? { organiserId: userId as any } : "skip"
    );

    // Fetch bookings for analytics
    const bookings = useQuery(
        api.bookings.getOrganiserBookings,
        userId ? { organiserId: userId as any } : "skip"
    );

    // Compute Chart Data
    const { performanceData, categoryData, revenueData, totalRevenue } = React.useMemo(() => {
        if (!myEvents || !bookings) return { performanceData: [], categoryData: [], revenueData: [], totalRevenue: 0 };

        // 1. Performance Trends (Bookings over time - grouped by month)
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const performanceMap = new Map<string, { bookings: number, revenue: number }>();

        // Initialize last 6 months
        const today = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const key = months[d.getMonth()];
            performanceMap.set(key, { bookings: 0, revenue: 0 });
        }

        bookings.forEach((b: any) => {
            const date = new Date(b.createdAt);
            const key = months[date.getMonth()];
            if (performanceMap.has(key)) {
                const curr = performanceMap.get(key)!;
                performanceMap.set(key, {
                    bookings: curr.bookings + 1,
                    revenue: curr.revenue + (b.totalAmount || 0)
                });
            }
        });

        const performanceData = Array.from(performanceMap.entries()).map(([name, data]) => ({
            name,
            bookings: data.bookings,
            revenue: data.revenue
        }));

        // 2. Category Distribution
        const categoryMap = new Map<string, number>();
        myEvents.forEach((e: any) => {
            const cat = e.category || 'Uncategorized';
            categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
        });
        const categoryData = Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }));

        // 3. Revenue Growth (Cumulative revenue) - Simplified as monthly revenue for now
        const revenueData = performanceData.map(d => ({
            name: d.name,
            value: d.revenue
        }));

        // Total Revenue Calculation
        const totalRev = bookings.filter((b: any) => b.status === "confirmed").reduce((sum: number, b: any) => sum + (b.totalAmount || 0), 0);

        return { performanceData, categoryData, revenueData, totalRevenue: totalRev };
    }, [myEvents, bookings]);

    const stats = [
        {
            title: 'My Events Created',
            value: myEvents?.length || 0,
            change: '',
            icon: Calendar,
            color: 'bg-blue-500'
        },
        {
            title: 'Active Events',
            value: myEvents?.filter((e: any) => e.status === 'published').length || 0,
            change: '',
            icon: TrendingUp,
            color: 'bg-green-500'
        },
        {
            title: 'Pending Approval',
            value: myEvents?.filter((e: any) => e.status === 'pending').length || 0,
            change: '',
            icon: Clock,
            color: 'bg-yellow-500'
        },
        {
            title: 'Total Revenue',
            value: `₹${totalRevenue.toLocaleString()}`,
            change: '',
            icon: CreditCard,
            color: 'bg-purple-500'
        }
    ];

    const recentOrganizerActivities: any[] = [];

    const handleCreateEvent = () => {
        router.push('/management/organiser/events/create');
    };

    if (!session) {
        if (status === "loading" || isLoadingLocal) {
            return (
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-gray-500 mt-4">Loading...</p>
                    </div>
                </div>
            );
        }
        return null; // Will redirect via useEffect
    }

    // New Onboarding / Approval Checks
    if (isEditingApplication) {
        return (
            <div className="py-8">
                <DashboardOnboarding
                    organiserId={userId as any}
                    onComplete={() => {
                        setIsEditingApplication(false);
                        window.location.reload();
                    }}
                    onCancel={() => setIsEditingApplication(false)}
                />
            </div>
        );
    }

    if (organiserData?.accountStatus === "pending_setup") {
        return <DashboardOnboarding organiserId={userId as any} onComplete={() => window.location.reload()} />;
    }


    // If pending_approval - show blurred dashboard with "Under Review" message
    const isPending = organiserData?.accountStatus === "pending_approval";

    return (
        <div className="relative">
            {isPending && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-md overflow-hidden">
                    <div className="text-center max-w-lg mx-auto p-8 bg-white rounded-2xl shadow-2xl border border-orange-200">
                        <div className="text-orange-600 mb-6 mx-auto w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center">
                            <Clock className="w-10 h-10" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Application Under Review</h2>
                        <p className="text-gray-600 text-lg mb-2">
                            Your onboarding details have been submitted successfully!
                        </p>
                        <p className="text-gray-500">
                            Our admin team is currently reviewing your application. You will be notified once your account is approved.
                        </p>
                        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-sm text-blue-800">
                                <strong>What's next?</strong> Once approved, you'll have full access to create events, manage bookings, and more!
                            </p>
                        </div>
                    </div>
                </div>
            )}
            <div className={`space-y-6 ${isPending ? 'opacity-40 pointer-events-none select-none' : ''}`}>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Event Organizer Hub</h1>
                        <p className="text-gray-600 mt-1">
                            Welcome back, {organiserData?.institutionName || session.user?.companyName || 'Organiser'}! 👋
                        </p>
                    </div>
                    <button
                        onClick={handleCreateEvent}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Create New Event</span>
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`${stat.color} w-12 h-12 rounded-xl flex items-center justify-center`}>
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                                <p className="text-gray-600 text-sm">{stat.title}</p>
                                <p className="text-green-600 text-xs mt-1">{stat.change}</p>
                            </div>
                        );
                    })}
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                            <TrendingUp className="w-5 h-5 text-blue-600" />
                            <span>Event Performance Trends</span>
                        </h3>
                        <div className="h-64 w-full">
                            {performanceData.length > 0 && performanceData.some(d => d.bookings > 0) ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={performanceData}>
                                        <defs>
                                            <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Area type="monotone" dataKey="bookings" stroke="#2563eb" fillOpacity={1} fill="url(#colorBookings)" strokeWidth={3} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                                    No booking data available
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                            <Target className="w-5 h-5 text-purple-600" />
                            <span>Event Category Distribution</span>
                        </h3>
                        <div className="h-64 w-full">
                            {categoryData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={categoryData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {categoryData.map((entry, index) => (
                                                <RechartsCell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                                    No event categories found
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                        <CreditCard className="w-5 h-5 text-green-600" />
                        <span>Revenue Growth</span>
                    </h3>
                    <div className="h-64 w-full">
                        {revenueData.length > 0 && revenueData.some(d => d.value > 0) ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={revenueData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} tickFormatter={(value) => `₹${value / 1000}k`} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
                                    />
                                    <Bar dataKey="value" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                                No revenue data available
                            </div>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8 px-6">
                            {[
                                { id: 'overview', label: 'Recent Activity', icon: FileText },
                                { id: 'events', label: 'My Events', icon: Calendar },
                                { id: 'connections', label: 'Partner Network', icon: Users },
                                { id: 'suggestions', label: 'Recommended Partners', icon: Star },
                                { id: 'onboarding', label: 'Onboarding Details', icon: Building }
                            ].map((tab) => {
                                const TabIcon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 flex items-center space-x-2 ${activeTab === tab.id
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        <TabIcon className="w-4 h-4" />
                                        <span>{tab.label}</span>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="p-6">
                        {activeTab === 'overview' && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                                {recentOrganizerActivities.length > 0 ? recentOrganizerActivities.map((activity) => {
                                    const Icon = activity.icon;
                                    return (
                                        <div key={activity.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activity.type === 'success' ? 'bg-green-100' : 'bg-blue-100'
                                                }`}>
                                                <Icon className={`w-5 h-5 ${activity.type === 'success' ? 'text-green-600' : 'text-blue-600'
                                                    }`} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-gray-900 font-medium">{activity.message}</p>
                                                <p className="text-gray-500 text-sm">{activity.time}</p>
                                            </div>
                                        </div>
                                    );
                                }) : (
                                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                                        <p className="text-gray-500">No recent activity</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'events' && (
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900">My Event Portfolio</h3>
                                    <button
                                        onClick={handleCreateEvent}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span>New Event</span>
                                    </button>
                                </div>

                                {myEvents && myEvents.length > 0 ? (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {myEvents.map((event: any) => (
                                            <div key={event._id} className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors duration-200 border border-gray-200">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div>
                                                        <h4 className="font-bold text-lg text-gray-900 mb-2">{event.eventName || event.title}</h4>
                                                        <div className="space-y-1 text-sm text-gray-600">
                                                            <div className="flex items-center space-x-2">
                                                                <Calendar className="w-4 h-4" />
                                                                <span>{event.basicInfo?.date || 'Date TBD'}</span>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <MapPin className="w-4 h-4" />
                                                                <span>{event.basicInfo?.venue || 'Venue TBD'}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${event.status === 'published' ? 'bg-green-100 text-green-800' :
                                                        event.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {event.status || 'draft'}
                                                    </span>
                                                </div>
                                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.basicInfo?.description || 'No description'}</p>
                                                <div className="flex items-center justify-between">
                                                    <div className="text-sm text-gray-600">
                                                        <span className="font-medium">{event.basicInfo?.expectedAttendees || '0'}</span> expected attendees
                                                    </div>
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => router.push(`/management/organiser/events/${event._id}`)}
                                                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => router.push(`/management/organiser/events/${event._id}/edit`)}
                                                            className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No events yet</h3>
                                        <p className="text-gray-600 mb-4">Create your first event to get started!</p>
                                        <button
                                            onClick={handleCreateEvent}
                                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
                                        >
                                            <Plus className="w-5 h-5" />
                                            <span>Create Event</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'connections' && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-6">Partner Network Status</h3>
                                <div className="text-center py-12">
                                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Coming Soon</h3>
                                    <p className="text-gray-600">Partner network features are under development</p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'suggestions' && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-6">AI-Recommended Partners</h3>
                                <div className="text-center py-12">
                                    <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Recommendations coming soon</h3>
                                    <p className="text-gray-600">We're learning your preferences to suggest the best partners.</p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'onboarding' && (
                            <div className="mt-6">
                                <DashboardOnboarding
                                    organiserId={userId as any}
                                    onComplete={() => window.location.reload()}
                                    onCancel={() => setActiveTab('overview')}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrganizerDashboard;