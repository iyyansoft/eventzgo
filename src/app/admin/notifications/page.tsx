'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import {
    Bell,
    Send,
    MessageSquare,
    Users,
    Building2,
    Mic,
    Award,
    User,
    Search,
    Filter,
    MailOpen,
    Mail,
    Trash2,
    Reply,
    X,
    CheckCheck,
} from 'lucide-react';
import { format } from 'date-fns';
import { Id } from '@/convex/_generated/dataModel';

// Disable static generation for this page
export const dynamic = 'force-dynamic';

export default function NotificationsPage() {
    const [showComposer, setShowComposer] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState<any>(null);
    const [filterType, setFilterType] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteConfirmation, setDeleteConfirmation] = useState<Id<'notifications'> | null>(null);

    // Composer state
    const [recipientType, setRecipientType] = useState('all');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [priority, setPriority] = useState('normal');

    // Fetch notifications
    const notificationsData = useQuery(api.notifications.getAdminNotifications, {
        userType: filterType,
        limit: 50,
        offset: 0,
    });

    const unreadCount = useQuery(api.notifications.getUnreadCount);

    // Mutations
    const sendNotification = useMutation(api.notifications.sendNotification);
    const replyToNotification = useMutation(api.notifications.replyToNotification);
    const markAsRead = useMutation(api.notifications.markAsRead);
    const markAllAsRead = useMutation(api.notifications.markAllAsRead);
    const deleteNotification = useMutation(api.notifications.deleteNotification);

    const handleSendNotification = async () => {
        if (!subject || !message) {
            alert('Please fill in all fields');
            return;
        }

        try {
            await sendNotification({
                recipientType,
                subject,
                message,
                priority,
            });

            // Reset form
            setSubject('');
            setMessage('');
            setPriority('normal');
            setShowComposer(false);
            alert('Notification sent successfully!');
        } catch (error) {
            alert('Failed to send notification');
        }
    };

    const handleReply = async (parentId: Id<'notifications'>, replyMessage: string) => {
        try {
            await replyToNotification({
                parentId,
                message: replyMessage,
            });
            alert('Reply sent successfully!');
        } catch (error) {
            alert('Failed to send reply');
        }
    };

    const handleMarkAsRead = async (notificationId: Id<'notifications'>) => {
        try {
            await markAsRead({ notificationId });
        } catch (error) {
            console.error('Failed to mark as read');
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllAsRead({});
            alert('All notifications marked as read');
        } catch (error) {
            alert('Failed to mark all as read');
        }
    };

    const handleDelete = (notificationId: Id<'notifications'>) => {
        setDeleteConfirmation(notificationId);
    };

    const confirmDelete = async () => {
        if (!deleteConfirmation) return;

        try {
            const result = await deleteNotification({ notificationId: deleteConfirmation });
            if (result.success) {
                console.log(`Deleted notification and ${result.deletedCount - 1} replies`);
                setDeleteConfirmation(null);
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('Failed to delete notification. Please try again.');
        }
    };

    const cancelDelete = () => {
        setDeleteConfirmation(null);
    };

    const recipientTypes = [
        { id: 'all', label: 'All Users', icon: Users },
        { id: 'user', label: 'End Users', icon: User },
        { id: 'organiser', label: 'Organisers', icon: Building2 },
        { id: 'vendor', label: 'Vendors', icon: Building2 },
        { id: 'speaker', label: 'Speakers', icon: Mic },
        { id: 'sponsor', label: 'Sponsors', icon: Award },
    ];

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                    <p className="text-gray-600 mt-2">
                        Send and manage notifications to all user types
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    {unreadCount !== undefined && unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllAsRead}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <CheckCheck className="w-4 h-4" />
                            <span>Mark All Read ({unreadCount})</span>
                        </button>
                    )}
                    <button
                        onClick={() => setShowComposer(!showComposer)}
                        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 transition-colors"
                    >
                        <Send className="w-4 h-4" />
                        <span>New Notification</span>
                    </button>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirmation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                                <Trash2 className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Delete Notification</h3>
                                <p className="text-sm text-gray-600">This action cannot be undone</p>
                            </div>
                        </div>
                        <p className="text-gray-700 mb-6">
                            Are you sure you want to delete this notification? This will also delete all replies associated with it.
                        </p>
                        <div className="flex space-x-3">
                            <button
                                onClick={cancelDelete}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Composer Modal */}
            {showComposer && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-gray-900">Compose Notification</h2>
                                <button
                                    onClick={() => setShowComposer(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            {/* Recipient Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Send To
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {recipientTypes.map((type) => {
                                        const Icon = type.icon;
                                        return (
                                            <button
                                                key={type.id}
                                                onClick={() => setRecipientType(type.id)}
                                                className={`flex items-center space-x-2 p-3 rounded-lg border-2 transition-colors ${recipientType === type.id
                                                    ? 'border-red-500 bg-red-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <Icon className="w-5 h-5" />
                                                <span className="text-sm font-medium">{type.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Priority */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Priority
                                </label>
                                <select
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                >
                                    <option value="low">Low</option>
                                    <option value="normal">Normal</option>
                                    <option value="high">High</option>
                                </select>
                            </div>

                            {/* Subject */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Subject
                                </label>
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="Enter notification subject..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                />
                            </div>

                            {/* Message */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Message
                                </label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Enter your message..."
                                    rows={6}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                            <button
                                onClick={() => setShowComposer(false)}
                                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSendNotification}
                                className="px-6 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 transition-colors flex items-center space-x-2"
                            >
                                <Send className="w-4 h-4" />
                                <span>Send Notification</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Filter className="w-5 h-5 text-gray-400" />
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        >
                            <option value="all">All Notifications</option>
                            <option value="user">End Users</option>
                            <option value="organiser">Organisers</option>
                            <option value="vendor">Vendors</option>
                            <option value="speaker">Speakers</option>
                            <option value="sponsor">Sponsors</option>
                        </select>
                    </div>
                    <div className="flex items-center space-x-2 flex-1 md:max-w-md">
                        <Search className="w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search notifications..."
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                    </div>
                </div>
            </div>

            {/* Notifications List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {!notificationsData ? (
                    <div className="p-12 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                        <p className="text-gray-500 mt-4">Loading notifications...</p>
                    </div>
                ) : notificationsData.notifications.length === 0 ? (
                    <div className="p-12 text-center">
                        <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Notifications</h3>
                        <p className="text-gray-600">Start by sending your first notification</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {notificationsData.notifications.map((notification) => (
                            <div
                                key={notification._id}
                                className={`p-6 hover:bg-gray-50 transition-colors ${!notification.isRead ? 'bg-blue-50' : ''
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
                                            <h3 className="font-semibold text-gray-900">{notification.subject}</h3>
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
                                        <p className="text-gray-600 mb-3">{notification.message}</p>
                                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                                            <span>To: {notification.recipientName}</span>
                                            <span>•</span>
                                            <span>{format(notification.createdAt, 'MMM dd, yyyy HH:mm')}</span>
                                            {notification.replyCount > 0 && (
                                                <>
                                                    <span>•</span>
                                                    <span className="flex items-center">
                                                        <MessageSquare className="w-4 h-4 mr-1" />
                                                        {notification.replyCount} replies
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2 ml-4">
                                        {!notification.isRead && (
                                            <button
                                                onClick={() => handleMarkAsRead(notification._id)}
                                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                                title="Mark as read"
                                            >
                                                <CheckCheck className="w-5 h-5" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(notification._id)}
                                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
