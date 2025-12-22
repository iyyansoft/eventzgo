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
} from 'lucide-react';
import { format } from 'date-fns';
import { Id } from '@/convex/_generated/dataModel';
import { useRouter } from 'next/navigation';

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

    const handleReply = async () => {
        if (!selectedNotification || !replyMessage.trim()) {
            alert('Please enter a message');
            return;
        }

        try {
            await replyToNotification({
                parentId: selectedNotification._id,
                message: replyMessage,
            });
            setReplyMessage('');
            setShowReplyModal(false);
            alert('Reply sent successfully!');
        } catch (error) {
            alert('Failed to send reply');
        }
    };

    const handleNotificationClick = async (notification: any) => {
        setSelectedNotification(notification);
        if (!notification.isRead) {
            await handleMarkAsRead(notification._id);
        }
    };

    // Filter notifications
    const filteredNotifications = notificationsData?.notifications.filter((notification: any) => {
        // Filter by read status
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
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
                    <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign In Required</h2>
                    <p className="text-gray-600 mb-6">Please sign in to view your notifications</p>
                    <button
                        onClick={() => router.push('/')}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors"
                    >
                        Go to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-20 pb-12">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Back</span>
                    </button>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                            <p className="text-gray-600 mt-2">
                                {unreadCount !== undefined && unreadCount > 0
                                    ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                                    : 'All caught up!'}
                            </p>
                        </div>
                        {unreadCount !== undefined && unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                            >
                                <CheckCheck className="w-4 h-4" />
                                <span>Mark All Read</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Filter className="w-5 h-5 text-gray-400" />
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                                <option value="all">All Notifications</option>
                                <option value="unread">Unread</option>
                                <option value="read">Read</option>
                            </select>
                        </div>
                        <div className="flex items-center space-x-2 flex-1 md:max-w-md">
                            <Search className="w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search notifications..."
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                {/* Notifications List */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Notification List */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            {!notificationsData ? (
                                <div className="p-12 text-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                                    <p className="text-gray-500 mt-4">Loading notifications...</p>
                                </div>
                            ) : filteredNotifications?.length === 0 ? (
                                <div className="p-12 text-center">
                                    <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        No Notifications
                                    </h3>
                                    <p className="text-gray-600">
                                        {searchTerm || filterStatus !== 'all'
                                            ? 'No notifications match your filters'
                                            : "You don't have any notifications yet"}
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-200">
                                    {filteredNotifications?.map((notification: any) => (
                                        <div
                                            key={notification._id}
                                            onClick={() => handleNotificationClick(notification)}
                                            className={`p-6 hover:bg-gray-50 transition-colors cursor-pointer ${!notification.isRead ? 'bg-blue-50' : ''
                                                } ${selectedNotification?._id === notification._id
                                                    ? 'border-l-4 border-purple-600'
                                                    : ''
                                                }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3 mb-2">
                                                        {!notification.isRead ? (
                                                            <Mail className="w-5 h-5 text-blue-600" />
                                                        ) : (
                                                            <MailOpen className="w-5 h-5 text-gray-400" />
                                                        )}
                                                        <h3 className="font-semibold text-gray-900">
                                                            {notification.subject}
                                                        </h3>
                                                        <span
                                                            className={`px-2 py-1 rounded-full text-xs font-medium ${notification.priority === 'high'
                                                                    ? 'bg-red-100 text-red-800'
                                                                    : notification.priority === 'low'
                                                                        ? 'bg-gray-100 text-gray-800'
                                                                        : 'bg-blue-100 text-blue-800'
                                                                }`}
                                                        >
                                                            {notification.priority}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                                        {notification.message}
                                                    </p>
                                                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                        <span>From: {notification.senderName}</span>
                                                        <span>•</span>
                                                        <span>
                                                            {format(notification.createdAt, 'MMM dd, yyyy HH:mm')}
                                                        </span>
                                                    </div>
                                                </div>
                                                {!notification.isRead && (
                                                    <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></span>
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
                                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-sm text-gray-500">
                                        Select a notification to view details
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-semibold text-gray-900">Details</h3>
                                        <button
                                            onClick={() => setSelectedNotification(null)}
                                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                                        >
                                            <X className="w-4 h-4 text-gray-500" />
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 uppercase">
                                                Subject
                                            </label>
                                            <p className="text-sm text-gray-900 mt-1">
                                                {selectedNotification.subject}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 uppercase">
                                                From
                                            </label>
                                            <p className="text-sm text-gray-900 mt-1">
                                                {selectedNotification.senderName}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 uppercase">
                                                Date
                                            </label>
                                            <p className="text-sm text-gray-900 mt-1">
                                                {format(
                                                    selectedNotification.createdAt,
                                                    'MMMM dd, yyyy HH:mm'
                                                )}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 uppercase">
                                                Priority
                                            </label>
                                            <p className="text-sm text-gray-900 mt-1 capitalize">
                                                {selectedNotification.priority}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 uppercase">
                                                Message
                                            </label>
                                            <p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">
                                                {selectedNotification.message}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setShowReplyModal(true)}
                                            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                        >
                                            <Reply className="w-4 h-4" />
                                            <span>Reply</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Reply Modal */}
            {showReplyModal && selectedNotification && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-gray-900">Reply</h2>
                                <button
                                    onClick={() => {
                                        setShowReplyModal(false);
                                        setReplyMessage('');
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Replying to: {selectedNotification.subject}
                                </label>
                                <textarea
                                    value={replyMessage}
                                    onChange={(e) => setReplyMessage(e.target.value)}
                                    placeholder="Type your reply..."
                                    rows={6}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                            <button
                                onClick={() => {
                                    setShowReplyModal(false);
                                    setReplyMessage('');
                                }}
                                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReply}
                                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                            >
                                <Send className="w-4 h-4" />
                                <span>Send Reply</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
