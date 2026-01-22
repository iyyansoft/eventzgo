'use client';

import React from 'react';
import { FileText, Download, Filter, Calendar } from 'lucide-react';

// Disable static generation for this page
export const dynamic = 'force-dynamic';

export default function ReportsPage() {
    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
                <p className="text-gray-600 mt-2">Generate and view platform reports</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                        <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                            <Calendar className="w-4 h-4" />
                            <span>Date Range</span>
                        </button>
                        <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                            <Filter className="w-4 h-4" />
                            <span>Filter</span>
                        </button>
                    </div>
                    <button className="flex items-center space-x-2 bg-gradient-to-r from-red-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-red-700 hover:to-pink-700">
                        <Download className="w-4 h-4" />
                        <span>Export Report</span>
                    </button>
                </div>

                <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Reports</h3>
                    <p className="text-gray-600">Report generation features will be implemented here</p>
                </div>
            </div>
        </div>
    );
}
