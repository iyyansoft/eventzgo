'use client';

import React from 'react';
import { HelpCircle, Search, Book, MessageCircle, Mail } from 'lucide-react';

export default function HelpPage() {
    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Help & Support</h1>
                <p className="text-gray-600 mt-2">Get help and support for the admin portal</p>
            </div>

            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search help articles..."
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {[
                    { icon: Book, label: 'Documentation', desc: 'Browse admin guides' },
                    { icon: MessageCircle, label: 'Live Chat', desc: 'Chat with support' },
                    { icon: Mail, label: 'Email Support', desc: 'Send us an email' },
                ].map((item, index) => {
                    const Icon = item.icon;
                    return (
                        <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow cursor-pointer">
                            <div className="bg-gradient-to-r from-red-600 to-pink-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                                <Icon className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.label}</h3>
                            <p className="text-gray-600 text-sm">{item.desc}</p>
                        </div>
                    );
                })}
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="text-center py-12">
                    <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Help Center</h3>
                    <p className="text-gray-600">Help and support resources will be implemented here</p>
                </div>
            </div>
        </div>
    );
}
