'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useAuth } from '@/hooks/useAuth';
import {
    Bell,
    Mail,
    MailOpen,
    Reply,
    Search,
    Filter,
    CheckCheck,
    MessageSquare,
    X,
    Send,
    ArrowLeft,
    Clock,
    User,
} from 'lucide-react';
import { format } from 'date-fns';
import { Id } from '@/convex/_generated/dataModel';
import { useRouter } from 'next/navigation';

// Disable static generation for this page
export const dynamic = 'force-dynamic';

export default function NotificationsPage() {
    const router = useRouter();
    const { isSignedIn } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // all, read, unread
    const [selectedNotification, setSelectedNotification] = useState<any>(null);
    const [showReplyModal, setShowReplyModal] = useState(false);
    const [replyMessage, setReplyMessage] = useState('');

    // Get current user
    const currentUser = useQuery(api.users.getCurrentUser, isSignedIn ? {} : 'skip');

    // Fetch notifications
    const notificationsData = useQuery(
        api.notifications.getUserNotifications,
        currentUser ? { userId: currentUser._id, limit: 50 } : 'skip'
    );

    const unreadCount = useQuery(
        api.notifications.getUserUnreadCount,
        currentUser ? { userId: currentUser._id } : 'skip'
    );

    // Mutations
    const markAsRead = useMutation(api.notifications.markAsRead);
    const markAllAsRead = useMutation(api.notifications.markAllAsRead);
    const replyToNotification = useMutation(api.notifications.replyToNotification);

    const handleMarkAsRead = async (notificationId: Id<'notifications'>) => {
        try {
            await markAsRead({ notificationId });
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllAsRead({});
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const handleNotificationClick = async (notification: any) => {
        setSelectedNotification(notification);
        if (!notification.isRead) {
            await handleMarkAsRead(notification._id);
        }
    };

    const handleSendReply = async () => {
        if (!selectedNotification || !replyMessage.trim()) return;

        try {
            await replyToNotification({
                parentId: selectedNotification._id,
                message: replyMessage,
            });
            setReplyMessage('');
            setShowReplyModal(false);
        } catch (error) {
            console.error('Failed to send reply:', error);
        }
    };

    // Filter notifications
    const filteredNotifications = notificationsData?.notifications.filter((notification: any) => {
        // Filter by status
        if (filterStatus === 'read' && !notification.isRead) return false;
        if (filterStatus === 'unread' && notification.isRead) return false;

        // Filter by search term
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            return (
                notification.subject.toLowerCase().includes(searchLower) ||
                notification.message.toLowerCase().includes(searchLower) ||
                notification.senderName.toLowerCase().includes(searchLower)
            );
        }

        return true;
    });

    if (!isSignedIn) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Bell className="w-10 h-10 text-purple-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign In Required</h2>
                    <p className="text-gray-600 mb-6">Please sign in to view your notifications</p>
                    <button
                        onClick={() => router.push('/')}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
                    >
                        Go to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 pt-20 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 mb-6 transition-colors group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium">Back</span>
                    </button>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                Notifications
                            </h1>
                            <p className="text-gray-600 mt-2">
                                {unreadCount !== undefined && unreadCount > 0
                                    ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                                    : 'You\'re all caught up!'}
                            </p>
                        </div>
                        {unreadCount !== undefined && unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                            >
                                <CheckCheck className="w-4 h-4 text-purple-600" />
                                <span className="text-sm font-medium text-gray-700">Mark all as read</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search notifications..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>

                        {/* Filter */}
                        <div className="flex items-center space-x-2">
                            <Filter className="w-5 h-5 text-gray-400" />
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                                <option value="all">All</option>
                                <option value="unread">Unread</option>
                                <option value="read">Read</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Notifications Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Notifications List */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            {!notificationsData ? (
                                <div className="p-12 text-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                                    <p className="text-gray-500">Loading notifications...</p>
                                </div>
                            ) : filteredNotifications?.length === 0 ? (
                                <div className="p-12 text-center">
                                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Bell className="w-10 h-10 text-gray-400" />
                                    </div>
                                    <p className="text-gray-600 font-medium">
                                        {searchTerm || filterStatus !== 'all'
                                            ? 'No notifications match your filters'
                                            : "You don't have any notifications yet"}
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {filteredNotifications?.map((notification: any) => (
                                        <div
                                            key={notification._id}
                                            onClick={() => handleNotificationClick(notification)}
                                            className={`p-6 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all cursor-pointer ${
                                                !notification.isRead ? 'bg-blue-50/50' : ''
                                            } ${
                                                selectedNotification?._id === notification._id
                                                    ? 'border-l-4 border-purple-600 bg-purple-50/30'
                                                    : ''
                                            }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3 mb-3">
                                                        <div className={`p-2 rounded-lg ${
                                                            !notification.isRead 
                                                                ? 'bg-blue-100' 
                                                                : 'bg-gray-100'
                                                        }`}>
                                                            {!notification.isRead ? (
                                                                <Mail className="w-5 h-5 text-blue-600" />
                                                            ) : (
                                                                <MailOpen className="w-5 h-5 text-gray-500" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <h3 className="font-semibold text-gray-900 text-lg">
                                                                {notification.subject}
                                                            </h3>
                                                            <span
                                                                className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                                                    notification.priority === 'high'
                                                                        ? 'bg-red-100 text-red-700'
                                                                        : notification.priority === 'low'
                                                                        ? 'bg-gray-100 text-gray-700'
                                                                        : 'bg-blue-100 text-blue-700'
                                                                }`}
                                                            >
                                                                {notification.priority}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <p className="text-gray-600 text-sm mb-3 line-clamp-2 ml-14">
                                                        {notification.message}
                                                    </p>
                                                    <div className="flex items-center space-x-3 text-sm text-gray-500 ml-14">
                                                        <div className="flex items-center space-x-1">
                                                            <User className="w-4 h-4" />
                                                            <span>{notification.senderName}</span>
                                                        </div>
                                                        <span className="text-gray-300">|</span>
                                                        <div className="flex items-center space-x-1">
                                                            <Clock className="w-4 h-4" />
                                                            <span>
                                                                {format(notification.createdAt, 'MMM dd, yyyy HH:mm')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                {!notification.isRead && (
                                                    <span className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0 mt-2 shadow-lg"></span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Notification Detail Panel */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
                            {!selectedNotification ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <MessageSquare className="w-8 h-8 text-purple-600" />
                                    </div>
                                    <p className="text-sm text-gray-500 font-medium">
                                        Select a notification to view details
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                                        <h3 className="font-bold text-gray-900 text-lg">Details</h3>
                                        <button
                                            onClick={() => setSelectedNotification(null)}
                                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            <X className="w-5 h-5 text-gray-500" />
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                Subject
                                            </label>
                                            <p className="text-sm text-gray-900 mt-2 font-medium">
                                                {selectedNotification.subject}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                Message
                                            </label>
                                            <p className="text-sm text-gray-700 mt-2 leading-relaxed">
                                                {selectedNotification.message}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                From
                                            </label>
                                            <p className="text-sm text-gray-900 mt-2">
                                                {selectedNotification.senderName}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                Received
                                            </label>
                                            <p className="text-sm text-gray-900 mt-2">
                                                {format(selectedNotification.createdAt, 'MMMM dd, yyyy \'at\' HH:mm')}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                To
                                            </label>
                                            <p className="text-sm text-gray-900 mt-2 capitalize">
                                                {selectedNotification.recipientType === 'all' 
                                                    ? 'All Users' 
                                                    : `All ${selectedNotification.recipientType}s`}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
