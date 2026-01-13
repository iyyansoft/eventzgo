"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import {
    MessageCircle, Send, Search, Filter, CheckCircle,
    AlertCircle, Clock, User
} from "lucide-react";

export default function AdminSupportPage() {
    const { sessionToken } = useAdminAuth(); // Typically we'd use this for auth
    const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Mutations
    const sendMessage = useMutation(api.support.sendMessage);
    const updateStatus = useMutation(api.support.updateStatus);

    // Queries
    // We pass status filter if it's not 'all'
    const tickets = useQuery(api.support.getAllTickets,
        filterStatus !== 'all' ? { status: filterStatus } : {}
    );

    const ticketDetails = useQuery(
        api.support.getTicketDetails,
        selectedTicketId ? { ticketId: selectedTicketId as any } : "skip"
    );

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [ticketDetails?.messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTicketId || !newMessage.trim()) return;

        try {
            await sendMessage({
                ticketId: selectedTicketId as any,
                senderId: "admin", // Ideally get admin ID
                senderRole: "admin",
                message: newMessage.trim()
            });
            setNewMessage("");
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return 'bg-yellow-100 text-yellow-800';
            case 'in_progress': return 'bg-blue-100 text-blue-800';
            case 'resolved': return 'bg-green-100 text-green-800';
            case 'closed': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="flex h-[calc(100vh-2rem)] gap-6">
            {/* Ticket List (Left Pane) */}
            <div className="w-1/3 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200">
                    <h2 className="font-semibold text-gray-900 mb-4">Support Desk</h2>

                    {/* Filters */}
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {['all', 'open', 'in_progress', 'resolved'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-3 py-1 text-sm rounded-full whitespace-nowrap capitalize ${filterStatus === status
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {status.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {tickets?.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <p>No tickets found</p>
                        </div>
                    ) : (
                        tickets?.map((ticket: any) => (
                            <div
                                key={ticket._id}
                                onClick={() => setSelectedTicketId(ticket._id)}
                                className={`p-4 rounded-lg cursor-pointer transition-colors border ${selectedTicketId === ticket._id ? 'bg-purple-50 border-purple-200' : 'bg-white border-transparent hover:bg-gray-50'}`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-medium text-gray-900 line-clamp-1">{ticket.subject}</span>
                                    <span className="text-xs text-gray-400">
                                        {new Date(ticket.lastMessageAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(ticket.status)} capitalize`}>
                                        {ticket.status.replace('_', ' ')}
                                    </span>
                                    {ticket.organiserName && (
                                        <span className="text-xs text-gray-500 flex items-center gap-1">
                                            <User className="w-3 h-3" />
                                            {ticket.organiserName}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 line-clamp-2">
                                    {ticket.description}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area (Right Pane) */}
            <div className="w-2/3 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
                {selectedTicketId && ticketDetails ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                            <div>
                                <h2 className="font-bold text-gray-900">{ticketDetails.ticket.subject}</h2>
                                <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                    <span className="flex items-center gap-1">
                                        <User className="w-4 h-4" />
                                        {(ticketDetails.ticket as any).organiserName || "Unknown Organiser"}
                                    </span>
                                    <span>•</span>
                                    <span className="uppercase text-xs font-semibold px-2 py-0.5 bg-gray-100 rounded">
                                        {ticketDetails.ticket.ticketId}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <select
                                    value={ticketDetails.ticket.status}
                                    onChange={(e) => updateStatus({ ticketId: selectedTicketId as any, status: e.target.value as any })}
                                    className="text-sm border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                                >
                                    <option value="open">Open</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="resolved">Resolved</option>
                                    <option value="closed">Closed</option>
                                </select>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
                            {ticketDetails.messages?.map((msg) => {
                                const isAdmin = msg.senderRole === 'admin';
                                return (
                                    <div key={msg._id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'} max-w-[80%]`}>
                                            <div className={`rounded-2xl p-4 shadow-sm ${isAdmin
                                                    ? 'bg-purple-600 text-white rounded-tr-none'
                                                    : 'bg-white border border-gray-100 text-gray-900 rounded-tl-none'
                                                }`}>
                                                <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                                            </div>
                                            <span className="text-[10px] text-gray-400 mt-1 px-1">
                                                {isAdmin ? 'You' : 'Organiser'} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type your reply..."
                                    className="flex-1 border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                                >
                                    <Send className="w-4 h-4" />
                                    <span>Send</span>
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                        <MessageCircle className="w-16 h-16 mb-4 opacity-20" />
                        <p>Select a ticket to view conversation</p>
                    </div>
                )}
            </div>
        </div>
    );
}
