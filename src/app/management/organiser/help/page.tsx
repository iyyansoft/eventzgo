"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
    HelpCircle, Mail, Phone, MessageCircle, FileText, ExternalLink,
    Plus, Send, X, AlertCircle, Clock, CheckCircle, Lock,
    Calendar, Users, DollarSign, BarChart3, ChevronRight
} from "lucide-react";

// Disable static generation for this page
export const dynamic = 'force-dynamic';

export default function OrganiserHelpPage() {
    const [organiserId, setOrganiserId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'tickets' | 'faq'>('tickets');
    const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Create Ticket Form State
    const [newTicket, setNewTicket] = useState({
        subject: "",
        description: "",
        category: "technical",
        priority: "medium",
        tags: ""
    });

    // Chat State
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Mutations
    const createTicket = useMutation(api.support.createTicket);
    const sendMessage = useMutation(api.support.sendMessage);
    const updateStatus = useMutation(api.support.updateStatus);

    useEffect(() => {
        const stored = localStorage.getItem("organiser_session");
        if (stored) {
            try {
                const user = JSON.parse(stored);
                if (user && user.id) setOrganiserId(user.id);
            } catch (e) { }
        }
    }, []);

    // Queries
    const tickets = useQuery(
        api.support.getTicketsByOrganiser,
        organiserId ? { organiserId: organiserId as any } : "skip"
    );

    const ticketDetails = useQuery(
        api.support.getTicketDetails,
        selectedTicketId ? { ticketId: selectedTicketId as any } : "skip"
    );

    // Scroll to bottom of chat
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [ticketDetails?.messages]);

    const handleCreateTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!organiserId) return;

        try {
            const ticketId = await createTicket({
                organiserId: organiserId as any,
                subject: newTicket.subject,
                description: newTicket.description,
                category: newTicket.category,
                priority: newTicket.priority as any,
                tags: newTicket.tags.split(',').map(t => t.trim()).filter(t => t.length > 0)
            });

            setIsCreateModalOpen(false);
            setNewTicket({ subject: "", description: "", category: "technical", priority: "medium", tags: "" });
            setSelectedTicketId(ticketId);
        } catch (error) {
            console.error("Failed to create ticket:", error);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!organiserId || !selectedTicketId || !newMessage.trim()) return;

        try {
            await sendMessage({
                ticketId: selectedTicketId as any,
                senderId: organiserId,
                senderRole: "organiser",
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

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'critical': return 'text-red-600 bg-red-50 ring-red-500/10';
            case 'high': return 'text-orange-600 bg-orange-50 ring-orange-500/10';
            case 'medium': return 'text-blue-600 bg-blue-50 ring-blue-500/10';
            case 'low': return 'text-gray-600 bg-gray-50 ring-gray-500/10';
            default: return 'text-gray-600 bg-gray-50 ring-gray-500/10';
        }
    };

    return (
        <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center flex-shrink-0">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Help & Support</h1>
                    <p className="text-gray-600 mt-1">Get help with your events and account</p>
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setActiveTab('tickets')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'tickets' ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                    >
                        My Tickets
                    </button>
                    <button
                        onClick={() => setActiveTab('faq')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'faq' ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                    >
                        FAQs & Guides
                    </button>
                </div>
            </div>

            {activeTab === 'tickets' && (
                <div className="flex-1 flex gap-6 min-h-0">
                    {/* Ticket List (Left Pane) */}
                    <div className="w-1/3 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col min-h-0">
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
                            <h2 className="font-semibold text-gray-900">Support Tickets</h2>
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="p-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-2">
                            {tickets?.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p>No tickets yet</p>
                                </div>
                            ) : (
                                tickets?.map((ticket) => (
                                    <div
                                        key={ticket._id}
                                        onClick={() => setSelectedTicketId(ticket._id)}
                                        className={`p-3 rounded-lg cursor-pointer transition-colors border ${selectedTicketId === ticket._id ? 'bg-purple-50 border-purple-200' : 'bg-white border-transparent hover:bg-gray-50'}`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-semibold text-gray-900 line-clamp-1">{ticket.subject}</span>
                                            <span className="text-xs text-gray-500 whitespace-nowrap">
                                                {new Date(ticket.lastMessageAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(ticket.status)}`}>
                                                {ticket.status.replace('_', ' ')}
                                            </span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ring-1 ${getPriorityColor(ticket.priority)}`}>
                                                {ticket.priority}
                                            </span>
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
                    <div className="w-2/3 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col min-h-0">
                        {selectedTicketId && ticketDetails ? (
                            <>
                                {/* Chat Header */}
                                <div className="p-4 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h2 className="font-semibold text-gray-900">{ticketDetails.ticket.subject}</h2>
                                            <span className="text-xs text-gray-400">#{ticketDetails.ticket.ticketId}</span>
                                        </div>
                                        <div className="flex gap-2 mt-1">
                                            {ticketDetails.ticket.tags?.map((tag: string, i: number) => (
                                                <span key={i} className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    {ticketDetails.ticket.status !== 'closed' && (
                                        <button
                                            onClick={() => updateStatus({ ticketId: selectedTicketId as any, status: 'resolved' })}
                                            className="text-sm px-3 py-1.5 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors"
                                        >
                                            Mark as Resolved
                                        </button>
                                    )}
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                                    {ticketDetails.messages?.map((msg) => {
                                        const isMe = msg.senderRole === 'organiser';
                                        return (
                                            <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[70%] rounded-xl p-3 ${isMe
                                                    ? 'bg-purple-600 text-white rounded-br-none'
                                                    : 'bg-white border border-gray-200 text-gray-900 rounded-bl-none'
                                                    }`}>
                                                    <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                                                    <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-purple-200' : 'text-gray-400'}`}>
                                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input Area */}
                                {ticketDetails.ticket.status !== 'closed' ? (
                                    <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 flex gap-2 flex-shrink-0">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="Type your message..."
                                            className="flex-1 border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!newMessage.trim()}
                                            className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <Send className="w-5 h-5" />
                                        </button>
                                    </form>
                                ) : (
                                    <div className="p-4 bg-gray-100 text-center text-gray-500 text-sm border-t border-gray-200">
                                        This ticket is closed. You cannot reply.
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                <MessageCircle className="w-16 h-16 mb-4 opacity-20" />
                                <p>Select a ticket to view conversation</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Create Ticket Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">Create Support Ticket</h2>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateTicket} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                <input
                                    required
                                    type="text"
                                    value={newTicket.subject}
                                    onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                                    className="w-full border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                                    placeholder="Brief summary of the issue"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select
                                        value={newTicket.category}
                                        onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                                        className="w-full border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                                    >
                                        <option value="technical">Technical Issue</option>
                                        <option value="billing">Billing & Payouts</option>
                                        <option value="account">Account & Verification</option>
                                        <option value="event">Event Management</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                    <select
                                        value={newTicket.priority}
                                        onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                                        className="w-full border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="critical">Critical</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                                <input
                                    type="text"
                                    value={newTicket.tags}
                                    onChange={(e) => setNewTicket({ ...newTicket, tags: e.target.value })}
                                    className="w-full border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                                    placeholder="e.g. login, payment, error"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={newTicket.description}
                                    onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                                    className="w-full border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                                    placeholder="Describe your issue in detail..."
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                                >
                                    Create Ticket
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {activeTab === "faq" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto">
                    {/* Static FAQ Content (Re-used for simplicity) */}
                    {[
                        { icon: Mail, title: "Email Support", desc: "support@eventzgo.com" },
                        { icon: Phone, title: "Phone Support", desc: "+91 1234567890" },
                        { icon: FileText, title: "Documentation", desc: "Read our guides" },
                    ].map((item, i) => (
                        <div key={i} className="bg-white p-6 rounded-xl border border-gray-200">
                            <item.icon className="w-8 h-8 text-purple-600 mb-4" />
                            <h3 className="font-semibold text-gray-900">{item.title}</h3>
                            <p className="text-gray-600 text-sm mt-1">{item.desc}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
