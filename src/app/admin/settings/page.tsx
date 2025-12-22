'use client';

import React from 'react';
import { Settings, Save, Lock, Globe, Mail, Bell } from 'lucide-react';

export default function SettingsPage() {
    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-600 mt-2">Configure platform settings and preferences</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
                        <nav className="space-y-2">
                            {[
                                { icon: Settings, label: 'General' },
                                { icon: Lock, label: 'Security' },
                                { icon: Globe, label: 'Platform' },
                                { icon: Mail, label: 'Email' },
                                { icon: Bell, label: 'Notifications' },
                            ].map((item, index) => {
                                const Icon = item.icon;
                                return (
                                    <button
                                        key={index}
                                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all ${index === 0
                                                ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white'
                                                : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        <Icon className={`w-5 h-5 ${index === 0 ? 'text-white' : 'text-gray-500'}`} />
                                        <span className="font-medium">{item.label}</span>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-gray-900">General Settings</h2>
                            <button className="flex items-center space-x-2 bg-gradient-to-r from-red-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-red-700 hover:to-pink-700">
                                <Save className="w-4 h-4" />
                                <span>Save Changes</span>
                            </button>
                        </div>

                        <div className="text-center py-12">
                            <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Settings</h3>
                            <p className="text-gray-600">Settings configuration will be implemented here</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
