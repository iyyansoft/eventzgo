'use client';

import React, { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Database, Table, Search, Download, Eye, RefreshCw } from 'lucide-react';

export default function DatabaseViewerPage() {
    const [selectedTable, setSelectedTable] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRecord, setSelectedRecord] = useState<any>(null);
    const [showRecordModal, setShowRecordModal] = useState(false);

    // Fetch database stats
    const stats = useQuery(api.database.getDatabaseStats);
    const allRecords = useQuery(api.database.getTableRecords);

    const getTableData = (tableName: string) => {
        if (!allRecords) return [];
        return (allRecords as any)[tableName] || [];
    };

    const filteredRecords = selectedTable
        ? getTableData(selectedTable).filter((record: any) =>
            JSON.stringify(record).toLowerCase().includes(searchTerm.toLowerCase())
        )
        : [];

    const exportToJSON = (data: any, filename: string) => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.json`;
        a.click();
    };

    const exportToCSV = (data: any[], filename: string) => {
        if (data.length === 0) return;

        const headers = Object.keys(data[0]);
        const csv = [
            headers.join(','),
            ...data.map(row =>
                headers.map(header => {
                    const value = row[header];
                    if (typeof value === 'object') return JSON.stringify(value);
                    return value;
                }).join(',')
            )
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.csv`;
        a.click();
    };

    const viewRecord = (record: any) => {
        setSelectedRecord(record);
        setShowRecordModal(true);
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Database Viewer</h1>
                <p className="text-gray-600">View and explore all database tables</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {stats?.map((table) => (
                    <button
                        key={table.name}
                        onClick={() => setSelectedTable(table.name)}
                        className={`p-4 rounded-xl border-2 transition-all ${selectedTable === table.name
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 bg-white hover:border-blue-300'
                            }`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <Table className={`w-5 h-5 ${selectedTable === table.name ? 'text-blue-600' : 'text-gray-400'}`} />
                            <span className="text-2xl font-bold text-gray-900">{table.count}</span>
                        </div>
                        <p className="text-sm font-medium text-gray-700 capitalize">{table.name}</p>
                    </button>
                ))}
            </div>

            {/* Table Viewer */}
            {selectedTable && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    {/* Table Header */}
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900 capitalize flex items-center">
                                <Database className="w-5 h-5 mr-2 text-blue-600" />
                                {selectedTable} Table
                            </h2>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => exportToJSON(filteredRecords, selectedTable)}
                                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 text-sm"
                                >
                                    <Download className="w-4 h-4" />
                                    <span>JSON</span>
                                </button>
                                <button
                                    onClick={() => exportToCSV(filteredRecords, selectedTable)}
                                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-sm"
                                >
                                    <Download className="w-4 h-4" />
                                    <span>CSV</span>
                                </button>
                            </div>
                        </div>

                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search records..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Records List */}
                    <div className="p-4">
                        {filteredRecords.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <Database className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                <p>No records found</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {filteredRecords.map((record: any, index: number) => (
                                    <div
                                        key={record._id || index}
                                        className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <p className="text-sm font-mono text-gray-600 mb-2">
                                                    ID: {record._id}
                                                </p>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                                    {/* Format timestamps */}
                                                    {record.createdAt && (
                                                        <div>
                                                            <span className="text-gray-500">Created: </span>
                                                            <span className="font-medium text-gray-900">
                                                                {new Date(record.createdAt).toLocaleString('en-IN', {
                                                                    timeZone: 'Asia/Kolkata',
                                                                    dateStyle: 'medium',
                                                                    timeStyle: 'short',
                                                                    hour12: true
                                                                })}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {/* Format address */}
                                                    {record.address && (
                                                        <div>
                                                            <span className="text-gray-500">Address: </span>
                                                            <span className="font-medium text-gray-900">
                                                                {record.address.street ?
                                                                    `${record.address.street}, ${record.address.city}, ${record.address.state} - ${record.address.pincode}`
                                                                    : 'No address available'}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {/* Format bank details */}
                                                    {record.bankDetails && (
                                                        <div>
                                                            <span className="text-gray-500">Bank: </span>
                                                            <span className="font-medium text-gray-900">
                                                                {record.bankDetails.bankName ?
                                                                    `${record.bankDetails.bankName} (${record.bankDetails.ifscCode})`
                                                                    : 'No bank details available'}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {/* Show other fields */}
                                                    {Object.entries(record)
                                                        .filter(([key]) =>
                                                            !key.startsWith('_') &&
                                                            key !== 'createdAt' &&
                                                            key !== 'address' &&
                                                            key !== 'bankDetails' &&
                                                            key !== 'documents' &&
                                                            key !== 'onboardingData' &&
                                                            key !== 'passwordHash' &&
                                                            key !== 'tempPasswordHash'
                                                        )
                                                        .slice(0, 3)
                                                        .map(([key, value]) => (
                                                            <div key={key}>
                                                                <span className="text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}: </span>
                                                                <span className="font-medium text-gray-900">
                                                                    {value === null || value === undefined || value === ''
                                                                        ? 'Not available'
                                                                        : typeof value === 'object'
                                                                            ? '[Object]'
                                                                            : String(value).substring(0, 40)}
                                                                </span>
                                                            </div>
                                                        ))}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => viewRecord(record)}
                                                className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                                            >
                                                <Eye className="w-4 h-4" />
                                                <span>View</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Record Count */}
                    <div className="p-4 border-t border-gray-200 bg-gray-50">
                        <p className="text-sm text-gray-600">
                            Showing <span className="font-bold">{filteredRecords.length}</span> of{' '}
                            <span className="font-bold">{getTableData(selectedTable).length}</span> records
                        </p>
                    </div>
                </div>
            )}

            {/* No Table Selected */}
            {!selectedTable && (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Select a table above to view its records</p>
                </div>
            )}

            {/* Record Details Modal */}
            {showRecordModal && selectedRecord && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900">Record Details</h2>
                            <button
                                onClick={() => setShowRecordModal(false)}
                                className="text-gray-500 hover:text-gray-700 text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        <div className="p-6">
                            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                                {JSON.stringify(selectedRecord, null, 2)}
                            </pre>
                        </div>

                        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex space-x-2">
                            <button
                                onClick={() => exportToJSON(selectedRecord, `record-${selectedRecord._id}`)}
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                Export JSON
                            </button>
                            <button
                                onClick={() => setShowRecordModal(false)}
                                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
