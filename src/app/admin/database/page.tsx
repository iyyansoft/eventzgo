'use client';

import React, { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import StatCard from '@/components/admin/StatCard';
import { Database, Table, Download, FileSpreadsheet, FileText, ChevronDown } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function DatabasePage() {
    const [selectedTable, setSelectedTable] = useState('users');
    const [currentPage, setCurrentPage] = useState(0);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const pageSize = 20;

    // Fetch database stats
    const dbStats = useQuery(api.adminQueries.getDatabaseStats);

    // Fetch table data
    const tableData = useQuery(api.adminQueries.getTableData, {
        tableName: selectedTable,
        limit: pageSize,
        offset: currentPage * pageSize,
    });

    // Fetch ALL data for export (without pagination)
    const allTableData = useQuery(api.adminQueries.getTableData, {
        tableName: selectedTable,
        limit: 10000, // Get all records
        offset: 0,
    });

    const handleTableChange = (tableName: string) => {
        setSelectedTable(tableName);
        setCurrentPage(0);
    };

    const renderTableCell = (value: any): string => {
        if (value === null || value === undefined) return '-';
        if (typeof value === 'object') return JSON.stringify(value).slice(0, 50) + '...';
        if (typeof value === 'boolean') return value ? 'Yes' : 'No';
        if (typeof value === 'number' && value > 1000000000000) {
            // Likely a timestamp
            return new Date(value).toLocaleDateString();
        }
        return String(value);
    };

    const formatValueForExport = (value: any): any => {
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return JSON.stringify(value);
        if (typeof value === 'boolean') return value ? 'Yes' : 'No';
        if (typeof value === 'number' && value > 1000000000000) {
            return new Date(value).toLocaleDateString();
        }
        return value;
    };

    const exportToExcel = () => {
        if (!allTableData || allTableData.data.length === 0) {
            alert('No data to export');
            return;
        }

        // Prepare data
        const formattedData = allTableData.data.map(row => {
            const formattedRow: any = {};
            Object.entries(row).forEach(([key, value]) => {
                formattedRow[key] = formatValueForExport(value);
            });
            return formattedRow;
        });

        // Create worksheet
        const ws = XLSX.utils.json_to_sheet(formattedData);

        // Create workbook
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, selectedTable);

        // Save file
        XLSX.writeFile(wb, `${selectedTable}_${new Date().toISOString().split('T')[0]}.xlsx`);
        setShowExportMenu(false);
    };

    const exportToCSV = () => {
        if (!allTableData || allTableData.data.length === 0) {
            alert('No data to export');
            return;
        }

        // Prepare data
        const formattedData = allTableData.data.map(row => {
            const formattedRow: any = {};
            Object.entries(row).forEach(([key, value]) => {
                formattedRow[key] = formatValueForExport(value);
            });
            return formattedRow;
        });

        // Create worksheet
        const ws = XLSX.utils.json_to_sheet(formattedData);

        // Create workbook
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, selectedTable);

        // Save as CSV
        XLSX.writeFile(wb, `${selectedTable}_${new Date().toISOString().split('T')[0]}.csv`);
        setShowExportMenu(false);
    };

    const exportToPDF = () => {
        if (!allTableData || allTableData.data.length === 0) {
            alert('No data to export');
            return;
        }

        const doc = new jsPDF();

        // Add title
        doc.setFontSize(16);
        doc.text(`${selectedTable.toUpperCase()} Table Data`, 14, 15);

        // Add date
        doc.setFontSize(10);
        doc.text(`Exported on: ${new Date().toLocaleDateString()}`, 14, 22);

        // Prepare table data
        const headers = Object.keys(allTableData.data[0]);
        const rows = allTableData.data.map(row =>
            headers.map(header => formatValueForExport(row[header]))
        );

        // Add table
        autoTable(doc, {
            head: [headers],
            body: rows,
            startY: 28,
            styles: { fontSize: 8, cellPadding: 2 },
            headStyles: { fillColor: [239, 68, 68], textColor: 255 },
            alternateRowStyles: { fillColor: [249, 250, 251] },
            margin: { top: 28 },
        });

        // Save PDF
        doc.save(`${selectedTable}_${new Date().toISOString().split('T')[0]}.pdf`);
        setShowExportMenu(false);
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Database Viewer</h1>
                <p className="text-gray-600 mt-2">
                    Browse Clerk + Convex data across all tables
                </p>
            </div>

            {/* Database Statistics */}
            {dbStats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatCard
                        title="Total Tables"
                        value={dbStats.tables.length}
                        icon={Table}
                        color="blue"
                        subtitle="Database tables"
                    />
                    <StatCard
                        title="Total Records"
                        value={dbStats.totalRecords.toLocaleString()}
                        icon={Database}
                        color="purple"
                        subtitle="Across all tables"
                    />
                    <StatCard
                        title="Data Health"
                        value={`${100 - (dbStats.dataHealth.orphanedBookings / dbStats.totalRecords) * 100}%`}
                        icon={Database}
                        color="green"
                        subtitle="Data integrity"
                    />
                </div>
            )}

            {/* Table Selector */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Table
                        </label>
                        <select
                            value={selectedTable}
                            onChange={(e) => handleTableChange(e.target.value)}
                            className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        >
                            {dbStats?.tables.map((table) => (
                                <option key={table.name} value={table.name}>
                                    {table.name} ({table.count} records) - {table.source}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Export Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowExportMenu(!showExportMenu)}
                            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700"
                        >
                            <Download className="w-4 h-4" />
                            <span>Export</span>
                            <ChevronDown className="w-4 h-4" />
                        </button>

                        {showExportMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                                <button
                                    onClick={exportToExcel}
                                    className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                                >
                                    <FileSpreadsheet className="w-5 h-5 text-green-600" />
                                    <div>
                                        <div className="font-medium text-gray-900">Excel</div>
                                        <div className="text-xs text-gray-500">.xlsx format</div>
                                    </div>
                                </button>
                                <button
                                    onClick={exportToCSV}
                                    className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-t border-gray-100"
                                >
                                    <FileText className="w-5 h-5 text-blue-600" />
                                    <div>
                                        <div className="font-medium text-gray-900">CSV</div>
                                        <div className="text-xs text-gray-500">.csv format</div>
                                    </div>
                                </button>
                                <button
                                    onClick={exportToPDF}
                                    className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-t border-gray-100 rounded-b-lg"
                                >
                                    <FileText className="w-5 h-5 text-red-600" />
                                    <div>
                                        <div className="font-medium text-gray-900">PDF</div>
                                        <div className="text-xs text-gray-500">.pdf format</div>
                                    </div>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Table Data */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-900 capitalize">
                        {selectedTable} Table
                    </h3>
                    {tableData && (
                        <p className="text-sm text-gray-500 mt-1">
                            {tableData.total} total records
                        </p>
                    )}
                </div>

                <div className="overflow-x-auto">
                    {!tableData ? (
                        <div className="px-6 py-12 text-center">
                            <div className="flex justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                            </div>
                            <p className="text-gray-500 mt-4">Loading table data...</p>
                        </div>
                    ) : tableData.data.length === 0 ? (
                        <div className="px-6 py-12 text-center text-gray-500">
                            No data in this table
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    {Object.keys(tableData.data[0]).slice(0, 6).map((key) => (
                                        <th
                                            key={key}
                                            className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                                        >
                                            {key}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {tableData.data.map((row, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        {Object.values(row).slice(0, 6).map((value, cellIndex) => (
                                            <td
                                                key={cellIndex}
                                                className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate"
                                            >
                                                {renderTableCell(value)}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination */}
                {tableData && tableData.total > pageSize && (
                    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            Showing {currentPage * pageSize + 1} to{' '}
                            {Math.min((currentPage + 1) * pageSize, tableData.total)} of{' '}
                            {tableData.total} records
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                                disabled={currentPage === 0}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setCurrentPage((p) => p + 1)}
                                disabled={!tableData.hasMore}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Data Health Indicators */}
            {dbStats && (
                <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Health Indicators</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                            <div className="text-sm font-medium text-yellow-800">Pending Organisers</div>
                            <div className="text-2xl font-bold text-yellow-900 mt-1">
                                {dbStats.dataHealth.pendingOrganisers}
                            </div>
                        </div>
                        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                            <div className="text-sm font-medium text-red-800">Failed Payments</div>
                            <div className="text-2xl font-bold text-red-900 mt-1">
                                {dbStats.dataHealth.failedPayments}
                            </div>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="text-sm font-medium text-blue-800">Orphaned Bookings</div>
                            <div className="text-2xl font-bold text-blue-900 mt-1">
                                {dbStats.dataHealth.orphanedBookings}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
