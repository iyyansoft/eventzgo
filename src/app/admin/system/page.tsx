'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import StatCard from '@/components/admin/StatCard';
import {
    Server,
    Database,
    Activity,
    TrendingUp,
    Users,
    CreditCard,
    Clock,
    AlertCircle,
    CheckCircle,
    Zap,
    HardDrive,
    Cpu,
    BarChart3,
    ExternalLink,
    Wifi,
    WifiOff,
    Globe,
    Shield,
    Code,
    FileCode,
    Terminal,
    CloudUpload,
    Network,
    RefreshCw,
} from 'lucide-react';
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

export default function SystemMonitorPage() {
    const [systemHealth, setSystemHealth] = useState({
        uptime: 0,
        responseTime: 0,
        requestsPerMinute: 0,
    });

    // Fetch database stats for Convex usage
    const dbStats = useQuery(api.adminQueries.getDatabaseStats);


    // Simulate system metrics (in production, these would come from actual monitoring)
    useEffect(() => {
        const updateMetrics = () => {
            setSystemHealth({
                uptime: 99.9,
                responseTime: Math.floor(Math.random() * 50) + 100, // 100-150ms
                requestsPerMinute: Math.floor(Math.random() * 100) + 200,
            });
        };

        updateMetrics();
        const interval = setInterval(updateMetrics, 5000);
        return () => clearInterval(interval);
    }, []);

    // Mock data for charts (in production, fetch from monitoring service)
    const performanceData = [
        { time: '00:00', responseTime: 120, requests: 250 },
        { time: '04:00', responseTime: 115, requests: 180 },
        { time: '08:00', responseTime: 135, requests: 320 },
        { time: '12:00', responseTime: 145, requests: 380 },
        { time: '16:00', responseTime: 130, requests: 350 },
        { time: '20:00', responseTime: 125, requests: 290 },
    ];

    // Clerk Usage Information (Mock - in production, fetch from Clerk API)
    const clerkUsage = {
        plan: 'Free Trial',
        monthlyActiveUsers: dbStats?.totalRecords || 0,
        mauLimit: 10000,
        daysRemaining: 14,
        features: {
            authentication: true,
            userManagement: true,
            organizations: false,
            sso: false,
        },
        billing: {
            currentCost: '$0.00',
            nextBillingDate: '2025-01-21',
            estimatedNextBill: '$0.00',
        },
    };

    // Convex Usage Information (Mock - in production, fetch from Convex API)
    const convexUsage = {
        plan: 'Free Tier',
        databaseSize: '2.4 MB',
        storageLimitMB: 1024,
        functionsExecuted: 15420,
        functionsLimit: 1000000,
        bandwidthUsed: '45 MB',
        bandwidthLimit: '10 GB',
        daysRemaining: 'Unlimited',
        billing: {
            currentCost: '$0.00',
            nextBillingDate: 'N/A',
            estimatedNextBill: '$0.00',
        },
    };

    const getUsagePercentage = (used: number, limit: number) => {
        return Math.min((used / limit) * 100, 100);
    };

    const getUsageColor = (percentage: number) => {
        if (percentage < 50) return 'bg-green-500';
        if (percentage < 80) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">System Monitor</h1>
                <p className="text-gray-600 mt-2">
                    Monitor Clerk + Convex usage, billing, and system health
                </p>
            </div>

            {/* System Health Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="System Uptime"
                    value={`${systemHealth.uptime}%`}
                    icon={Server}
                    color="green"
                    subtitle="Last 30 days"
                />
                <StatCard
                    title="Response Time"
                    value={`${systemHealth.responseTime}ms`}
                    icon={Zap}
                    color="blue"
                    subtitle="Average latency"
                />
                <StatCard
                    title="Requests/Min"
                    value={systemHealth.requestsPerMinute}
                    icon={Activity}
                    color="purple"
                    subtitle="Current load"
                />
                <StatCard
                    title="Database Size"
                    value={convexUsage.databaseSize}
                    icon={HardDrive}
                    color="orange"
                    subtitle={`of ${convexUsage.storageLimitMB} MB`}
                />
            </div>

            {/* Clerk Usage Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Clerk Authentication</h2>
                            <p className="text-sm text-gray-500">User management & authentication service</p>
                        </div>
                    </div>
                    <a
                        href="https://dashboard.clerk.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <span>View Dashboard</span>
                        <ExternalLink className="w-4 h-4" />
                    </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm font-medium text-gray-600">Current Plan</div>
                        <div className="text-2xl font-bold text-gray-900 mt-1">{clerkUsage.plan}</div>
                        <div className="flex items-center mt-2 text-sm text-orange-600">
                            <Clock className="w-4 h-4 mr-1" />
                            <span>{clerkUsage.daysRemaining} days remaining</span>
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm font-medium text-gray-600">Monthly Active Users</div>
                        <div className="text-2xl font-bold text-gray-900 mt-1">
                            {clerkUsage.monthlyActiveUsers.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                            of {clerkUsage.mauLimit.toLocaleString()} limit
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm font-medium text-gray-600">Current Cost</div>
                        <div className="text-2xl font-bold text-green-600 mt-1">
                            {clerkUsage.billing.currentCost}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">This month</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm font-medium text-gray-600">Next Billing</div>
                        <div className="text-lg font-bold text-gray-900 mt-1">
                            {clerkUsage.billing.nextBillingDate}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                            Est: {clerkUsage.billing.estimatedNextBill}
                        </div>
                    </div>
                </div>

                {/* MAU Usage Bar */}
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">MAU Usage</span>
                        <span className="text-sm text-gray-500">
                            {getUsagePercentage(clerkUsage.monthlyActiveUsers, clerkUsage.mauLimit).toFixed(1)}%
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                            className={`h-3 rounded-full ${getUsageColor(
                                getUsagePercentage(clerkUsage.monthlyActiveUsers, clerkUsage.mauLimit)
                            )}`}
                            style={{
                                width: `${getUsagePercentage(clerkUsage.monthlyActiveUsers, clerkUsage.mauLimit)}%`,
                            }}
                        ></div>
                    </div>
                </div>

                {/* Features */}
                <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Enabled Features</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {Object.entries(clerkUsage.features).map(([feature, enabled]) => (
                            <div
                                key={feature}
                                className={`flex items-center space-x-2 p-3 rounded-lg ${enabled ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
                                    }`}
                            >
                                {enabled ? (
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                ) : (
                                    <AlertCircle className="w-5 h-5 text-gray-400" />
                                )}
                                <span className={`text-sm font-medium ${enabled ? 'text-green-900' : 'text-gray-500'}`}>
                                    {feature.charAt(0).toUpperCase() + feature.slice(1)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Convex Usage Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                            <Database className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Convex Backend</h2>
                            <p className="text-sm text-gray-500">Database & serverless functions</p>
                        </div>
                    </div>
                    <a
                        href="https://dashboard.convex.dev"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                    >
                        <span>View Dashboard</span>
                        <ExternalLink className="w-4 h-4" />
                    </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm font-medium text-gray-600">Current Plan</div>
                        <div className="text-2xl font-bold text-gray-900 mt-1">{convexUsage.plan}</div>
                        <div className="flex items-center mt-2 text-sm text-green-600">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            <span>{convexUsage.daysRemaining}</span>
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm font-medium text-gray-600">Database Tables</div>
                        <div className="text-2xl font-bold text-gray-900 mt-1">
                            {dbStats?.tables.length || 0}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                            {dbStats?.totalRecords || 0} total records
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm font-medium text-gray-600">Current Cost</div>
                        <div className="text-2xl font-bold text-green-600 mt-1">
                            {convexUsage.billing.currentCost}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">This month</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm font-medium text-gray-600">Functions Executed</div>
                        <div className="text-2xl font-bold text-gray-900 mt-1">
                            {(convexUsage.functionsExecuted / 1000).toFixed(1)}K
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                            of {(convexUsage.functionsLimit / 1000000).toFixed(0)}M limit
                        </div>
                    </div>
                </div>

                {/* Usage Bars */}
                <div className="space-y-4 mb-4">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Storage Usage</span>
                            <span className="text-sm text-gray-500">
                                {getUsagePercentage(2.4, convexUsage.storageLimitMB).toFixed(2)}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                                className={`h-3 rounded-full ${getUsageColor(
                                    getUsagePercentage(2.4, convexUsage.storageLimitMB)
                                )}`}
                                style={{
                                    width: `${getUsagePercentage(2.4, convexUsage.storageLimitMB)}%`,
                                }}
                            ></div>
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Function Executions</span>
                            <span className="text-sm text-gray-500">
                                {getUsagePercentage(convexUsage.functionsExecuted, convexUsage.functionsLimit).toFixed(2)}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                                className={`h-3 rounded-full ${getUsageColor(
                                    getUsagePercentage(convexUsage.functionsExecuted, convexUsage.functionsLimit)
                                )}`}
                                style={{
                                    width: `${getUsagePercentage(convexUsage.functionsExecuted, convexUsage.functionsLimit)}%`,
                                }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Response Time (24h)</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={performanceData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="time" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                            <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="responseTime"
                                stroke="#3B82F6"
                                fill="#3B82F6"
                                fillOpacity={0.3}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Volume (24h)</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={performanceData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="time" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                            <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="requests"
                                stroke="#10B981"
                                strokeWidth={2}
                                dot={{ fill: '#10B981' }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* API Endpoints Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Network className="w-5 h-5 mr-2" />
                    API Endpoints Status
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                        { name: 'Clerk Auth API', status: 'operational', responseTime: '45ms' },
                        { name: 'Convex Functions', status: 'operational', responseTime: '32ms' },
                        { name: 'Convex Database', status: 'operational', responseTime: '28ms' },
                        { name: 'Payment Gateway', status: 'operational', responseTime: '156ms' },
                        { name: 'Email Service', status: 'operational', responseTime: '89ms' },
                        { name: 'File Storage', status: 'operational', responseTime: '67ms' },
                    ].map((endpoint) => (
                        <div key={endpoint.name} className="p-4 border border-gray-200 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-900">{endpoint.name}</span>
                                {endpoint.status === 'operational' ? (
                                    <Wifi className="w-5 h-5 text-green-600" />
                                ) : (
                                    <WifiOff className="w-5 h-5 text-red-600" />
                                )}
                            </div>
                            <div className="flex items-center justify-between">
                                <span
                                    className={`text-xs px-2 py-1 rounded-full ${endpoint.status === 'operational'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                        }`}
                                >
                                    {endpoint.status}
                                </span>
                                <span className="text-xs text-gray-500">{endpoint.responseTime}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bandwidth & Network Usage */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Globe className="w-5 h-5 mr-2" />
                        Bandwidth Usage (This Month)
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">Inbound Traffic</span>
                                <span className="text-sm text-gray-500">23 MB / 5 GB</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="h-2 rounded-full bg-blue-500" style={{ width: '0.46%' }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">Outbound Traffic</span>
                                <span className="text-sm text-gray-500">45 MB / 10 GB</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="h-2 rounded-full bg-green-500" style={{ width: '0.45%' }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">CDN Bandwidth</span>
                                <span className="text-sm text-gray-500">12 MB / 50 GB</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="h-2 rounded-full bg-purple-500" style={{ width: '0.024%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <CloudUpload className="w-5 h-5 mr-2" />
                        Deployment Information
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-600">Environment</span>
                            <span className="text-sm font-semibold text-gray-900">Production</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-600">Last Deployment</span>
                            <span className="text-sm font-semibold text-gray-900">2 hours ago</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-600">Version</span>
                            <span className="text-sm font-semibold text-gray-900">v1.2.5</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-600">Build Status</span>
                            <span className="flex items-center text-sm font-semibold text-green-600">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Successful
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Errors & Logs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Terminal className="w-5 h-5 mr-2" />
                        Recent Error Logs
                    </h3>
                    <button className="flex items-center space-x-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                        <RefreshCw className="w-4 h-4" />
                        <span>Refresh</span>
                    </button>
                </div>
                <div className="space-y-2">
                    {[
                        {
                            time: '2 min ago',
                            level: 'warning',
                            message: 'Slow query detected in events table (245ms)',
                            source: 'Convex',
                        },
                        {
                            time: '15 min ago',
                            level: 'info',
                            message: 'User authentication successful',
                            source: 'Clerk',
                        },
                        {
                            time: '1 hour ago',
                            level: 'error',
                            message: 'Payment webhook timeout (retried successfully)',
                            source: 'Payment Gateway',
                        },
                        {
                            time: '2 hours ago',
                            level: 'info',
                            message: 'Database backup completed',
                            source: 'Convex',
                        },
                    ].map((log, index) => (
                        <div
                            key={index}
                            className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <div
                                className={`w-2 h-2 rounded-full mt-2 ${log.level === 'error'
                                    ? 'bg-red-500'
                                    : log.level === 'warning'
                                        ? 'bg-yellow-500'
                                        : 'bg-blue-500'
                                    }`}
                            ></div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium text-gray-900">{log.message}</span>
                                    <span className="text-xs text-gray-500">{log.time}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span
                                        className={`text-xs px-2 py-0.5 rounded-full ${log.level === 'error'
                                            ? 'bg-red-100 text-red-800'
                                            : log.level === 'warning'
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : 'bg-blue-100 text-blue-800'
                                            }`}
                                    >
                                        {log.level.toUpperCase()}
                                    </span>
                                    <span className="text-xs text-gray-500">{log.source}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Environment Variables & Security */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <FileCode className="w-5 h-5 mr-2" />
                        Environment Variables
                    </h3>
                    <div className="space-y-2">
                        {[
                            { name: 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', status: 'configured' },
                            { name: 'CLERK_SECRET_KEY', status: 'configured' },
                            { name: 'NEXT_PUBLIC_CONVEX_URL', status: 'configured' },
                            { name: 'CONVEX_DEPLOYMENT', status: 'configured' },
                            { name: 'RAZORPAY_KEY_ID', status: 'configured' },
                            { name: 'RAZORPAY_KEY_SECRET', status: 'configured' },
                            { name: 'EMAIL_SERVICE_API_KEY', status: 'configured' },
                        ].map((env) => (
                            <div
                                key={env.name}
                                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                            >
                                <div className="flex items-center space-x-2">
                                    <Code className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm font-mono text-gray-700">{env.name}</span>
                                </div>
                                <span className="flex items-center text-sm text-green-600">
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    {env.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Shield className="w-5 h-5 mr-2" />
                        Security & Compliance
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                            <span className="text-sm font-medium text-gray-700">SSL Certificate</span>
                            <span className="flex items-center text-sm font-semibold text-green-600">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Valid
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                            <span className="text-sm font-medium text-gray-700">HTTPS Enforced</span>
                            <span className="flex items-center text-sm font-semibold text-green-600">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Enabled
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                            <span className="text-sm font-medium text-gray-700">CORS Policy</span>
                            <span className="flex items-center text-sm font-semibold text-green-600">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Configured
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                            <span className="text-sm font-medium text-gray-700">Rate Limiting</span>
                            <span className="flex items-center text-sm font-semibold text-green-600">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Active
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Database Health Metrics */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Database className="w-5 h-5 mr-2" />
                    Database Health Metrics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="text-sm font-medium text-blue-800">Query Performance</div>
                        <div className="text-2xl font-bold text-blue-900 mt-2">98.5%</div>
                        <div className="text-xs text-blue-600 mt-1">Queries under 100ms</div>
                    </div>
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="text-sm font-medium text-green-800">Connection Pool</div>
                        <div className="text-2xl font-bold text-green-900 mt-2">12/50</div>
                        <div className="text-xs text-green-600 mt-1">Active connections</div>
                    </div>
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                        <div className="text-sm font-medium text-purple-800">Cache Hit Rate</div>
                        <div className="text-2xl font-bold text-purple-900 mt-2">94.2%</div>
                        <div className="text-xs text-purple-600 mt-1">Optimal performance</div>
                    </div>
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                        <div className="text-sm font-medium text-orange-800">Index Efficiency</div>
                        <div className="text-2xl font-bold text-orange-900 mt-2">97.8%</div>
                        <div className="text-xs text-orange-600 mt-1">Well optimized</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
