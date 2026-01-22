"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";

// Disable static generation for this page
export const dynamic = 'force-dynamic';

export default function OrganiserNotificationsPage() {
  const [organiserId, setOrganiserId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    const stored = localStorage.getItem("organiser_session");
    if (stored) {
      try {
        const session = JSON.parse(stored);
        if (session && session.id) setOrganiserId(session.id);
      } catch (e) { }
    }
  }, []);

  const organiser = useQuery(
    api.organisers.getOrganiserById,
    organiserId ? { organiserId: organiserId as any } : "skip"
  );

  const userId = organiser?.userId;

  const notificationsData = useQuery(
    api.notifications.getUserNotifications,
    userId ? { userId: userId } : "skip"
  );

  const unreadCount = useQuery(
    api.notifications.getUserUnreadCount,
    userId ? { userId: userId } : "skip"
  );

  const markAsRead = useMutation(api.notifications.markAsRead);
  const deleteNotification = useMutation(api.notifications.deleteNotification);

  if (!notificationsData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-purple-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-purple-600 rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading notifications...</p>
        </div>
      </div>
    );
  }

  const notifications = notificationsData.notifications.filter(n =>
    filter === 'unread' ? !n.isRead : true
  );

  const handleMarkAsRead = async (notificationId: any) => {
    await markAsRead({ notificationId });
  };

  const handleMarkAllAsRead = async () => {
    if (userId && notifications.length > 0) {
      const unread = notifications.filter(n => !n.isRead);
      await Promise.all(unread.map(n => markAsRead({ notificationId: n._id })));
    }
  };

  const handleDelete = async (notificationId: any) => {
    await deleteNotification({ notificationId });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Notifications
          </h1>
          <p className="text-gray-600">
            {unreadCount || 0} unread notifications
          </p>
        </div>

        {unreadCount && unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-purple-600 hover:text-pink-600 font-semibold text-sm"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg font-medium transition ${filter === "all"
              ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
              : "text-gray-600 hover:bg-gray-100"
              }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-4 py-2 rounded-lg font-medium transition ${filter === "unread"
              ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
              : "text-gray-600 hover:bg-gray-100"
              }`}
          >
            Unread {unreadCount ? `(${unreadCount})` : ""}
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No notifications</h3>
            <p className="text-gray-600">You're all caught up!</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification._id}
              className={`bg-white rounded-xl shadow-sm p-6 border-l-4 ${notification.isRead
                ? "border-gray-300"
                : "border-purple-500 bg-purple-50"
                }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {(notification as any).subject}
                    </h3>
                    {!notification.isRead && (
                      <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-3">{notification.message}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  {!notification.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(notification._id)}
                      className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition"
                      title="Mark as read"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notification._id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                    title="Delete"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
