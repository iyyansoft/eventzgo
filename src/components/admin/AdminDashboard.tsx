"use client";

import { useState } from 'react';
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Users, Calendar, TrendingUp, DollarSign, UserCheck,
  Clock, Shield, CheckCircle, XCircle
} from 'lucide-react';
import Breadcrumbs from './Breadcrumbs';
//import Breadcrumbs from './Breadcrumbs';
//import LineChart from './charts/LineChart';
//import BarChart from './charts/BarChart';
//import PieChart from './charts/PieChart';
//import AreaChart from './charts/AreaChart';
//import { formatCurrency } from '@/lib/currency-utils';
import LineChart from '@/components/charts/LineChart';
import BarChart from '@/components/charts/BarChart';
import PieChart from '@/components/charts/PieChart';
import AreaChart from '@/components/charts/AreaChart';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch data from Convex
  const userStats = useQuery(api.adminQueries.getUserStats);
  const eventStats = useQuery(api.adminQueries.getEventStats);
  const analytics = useQuery(api.adminQueries.getAnalytics, {});
  const eventsData = useQuery(api.adminQueries.getAllEvents, { limit: 10 });
  const pendingOrganisers = useQuery(api.organisers.getPendingOrganisers, {});

  // Calculate platform metrics
  const totalRevenue = analytics?.overview.totalRevenue || 0;

  const platformGrowthData = analytics?.userGrowth.map(d => ({
    month: new Date(d.date).toLocaleDateString('en-US', { month: 'short' }),
    users: d.count,
    events: 0, // Placeholder as analytics doesn't return this historical data yet
    revenue: 0 // Placeholder
  })) || [
      { month: 'Jan', users: 120, events: 45, revenue: 850000 },
      { month: 'Feb', users: 180, events: 62, revenue: 1200000 },
      { month: 'Mar', users: 240, events: 78, revenue: 1450000 },
      { month: 'Apr', users: 320, events: 95, revenue: 1800000 },
      { month: 'May', users: 450, events: 112, revenue: 2200000 },
      { month: 'Jun', users: 580, events: 135, revenue: 2650000 },
    ];

  const userTypeDistribution = [
    { name: 'Organisers', value: userStats?.byRole.organiser || 0, color: '#3b82f6' },
    { name: 'Attendees', value: userStats?.byRole.user || 0, color: '#10b981' },
  ];

  const systemMetricsData = [
    { metric: 'Server Uptime', value: 99.9 },
    { metric: 'Response Time', value: 95.2 },
    { metric: 'User Satisfaction', value: 94.8 },
    { metric: 'Platform Security', value: 98.5 },
  ];

  const stats = [
    {
      title: 'Total Platform Users',
      value: userStats?.total || 0,
      change: '+12% this month',
      icon: Users,
      color: 'bg-blue-500',
      trend: 'up'
    },
    {
      title: 'Pending Verifications',
      value: pendingOrganisers?.length || 0,
      change: pendingOrganisers?.length ? `${pendingOrganisers.length} pending` : 'All caught up',
      icon: Clock,
      color: 'bg-yellow-500',
      trend: 'up'
    },
    {
      title: 'Platform Events',
      value: eventStats?.total || 0,
      change: '+8% growth',
      icon: Calendar,
      color: 'bg-green-500',
      trend: 'up'
    },
    {
      title: 'System Health',
      value: '99.9%',
      change: 'All systems operational',
      icon: Shield,
      color: 'bg-purple-500',
      trend: 'up'
    }
  ];

  const recentAdminActivities = [
    {
      id: 1,
      type: 'user_verification',
      message: 'Verified new organiser account',
      time: '2 hours ago',
      status: 'completed',
      icon: UserCheck
    },
    {
      id: 2,
      type: 'system_update',
      message: 'Platform security update deployed successfully',
      time: '4 hours ago',
      status: 'completed',
      icon: Shield
    },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Platform Administration</h1>
          <p className="text-gray-600 mt-1">Monitor and manage the entire EVENTZGO ecosystem</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200">
            System Reports
          </button>
          <button className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-red-700 hover:to-pink-700 transition-all duration-200">
            Platform Settings
          </button>
        </div>
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
                <div className={`flex items-center space-x-1 text-sm font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Growth Analytics</h3>
          <LineChart
            data={platformGrowthData}
            dataKey="users"
            xAxisKey="month"
            color="#3b82f6"
            height={250}
          />
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Type Distribution</h3>
          <PieChart
            data={userTypeDistribution}
            dataKey="value"
            nameKey="name"
            height={250}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Revenue</h3>
          <AreaChart
            data={platformGrowthData}
            dataKey="revenue"
            xAxisKey="month"
            color="#10b981"
            height={250}
          />
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Performance</h3>
          <BarChart
            data={systemMetricsData}
            dataKey="value"
            xAxisKey="metric"
            color="#8b5cf6"
            height={250}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'System Activities' },
              { id: 'users', label: 'User Verification Queue' },
              { id: 'events', label: 'Platform Events' },
              { id: 'analytics', label: 'Advanced Analytics' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${activeTab === tab.id
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {recentAdminActivities.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div key={activity.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activity.status === 'completed' ? 'bg-green-100' : 'bg-blue-100'
                      }`}>
                      <Icon className={`w-5 h-5 ${activity.status === 'completed' ? 'text-green-600' : 'text-blue-600'
                        }`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 font-medium">{activity.message}</p>
                      <p className="text-gray-500 text-sm">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Organiser Verifications</h3>
              <div className="space-y-4">
                {pendingOrganisers?.map((organiser) => (
                  <div key={organiser._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-red-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{organiser.institutionName}</h4>
                        <p className="text-gray-600 text-sm">{(organiser as any).email ?? organiser.clerkId}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4" />
                        <span>Verify</span>
                      </button>
                      <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center space-x-2">
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                ))}
                {!pendingOrganisers?.length && (
                  <div className="text-center py-8">
                    <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">All organisers verified - no pending requests</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'events' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Event Management</h3>
              <div className="space-y-4">
                {eventsData?.events?.map((event) => (
                  <div key={event._id} className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900">{event.title}</h4>
                        <p className="text-gray-600 text-sm">{typeof event.venue === 'string' ? event.venue : event.venue.city}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${(event as any).approvalStatus === 'approved' ? 'bg-green-100 text-green-800' :
                        (event as any).approvalStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                        {(event as any).approvalStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-gray-50 rounded-xl">
                <h4 className="font-semibold text-gray-900 mb-4">Platform Health Metrics</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Server Uptime</span>
                    <span className="font-semibold text-green-600">99.9%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active Sessions</span>
                    <span className="font-semibold">2,847</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">API Response Time</span>
                    <span className="font-semibold text-green-600">120ms</span>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-gray-50 rounded-xl">
                <h4 className="font-semibold text-gray-900 mb-4">Security Metrics</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Security Score</span>
                    <span className="font-semibold text-green-600">A+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Failed Login Attempts</span>
                    <span className="font-semibold text-green-600">0.02%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Data Encryption</span>
                    <span className="font-semibold text-green-600">256-bit</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}