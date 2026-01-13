"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
    Camera,
    CheckCircle,
    XCircle,
    User,
    Ticket,
    LogOut,
    Zap,
    BarChart3,
    AlertCircle,
    ChevronDown,
    Calendar,
    MapPin
} from "lucide-react";

export default function ScannerPage() {
    const router = useRouter();
    const [staffSession, setStaffSession] = useState<any>(null);
    const [scanResult, setScanResult] = useState<any>(null);
    const [todayStats, setTodayStats] = useState({ total: 0, valid: 0, invalid: 0 });
    const [scanning, setScanning] = useState(false);
    const [selectedEventId, setSelectedEventId] = useState<Id<"events"> | "">("");

    const verifyTicket = useMutation(api.verification.verifyTicket);
    const overrideScan = useMutation(api.verification.overrideScan);

    // Fetch allowed events
    const allowedEvents = useQuery(
        api.verificationStaff.getStaffAllowedEvents,
        staffSession ? { staffId: staffSession.staffId } : "skip"
    );

    useEffect(() => {
        // Check session
        const session = localStorage.getItem('staffSession') || sessionStorage.getItem('staffSession');
        if (!session) {
            router.push('/verify/login');
            return;
        }

        const sessionData = JSON.parse(session);
        setStaffSession(sessionData);

        // Load today's stats
        const stats = localStorage.getItem(`stats_${sessionData.staffId}_${new Date().toDateString()}`);
        if (stats) {
            setTodayStats(JSON.parse(stats));
        }
    }, [router]);

    // Auto-select event if only one is available or default to first (latest)
    useEffect(() => {
        if (allowedEvents && allowedEvents.length > 0 && !selectedEventId) {
            setSelectedEventId(allowedEvents[0]._id);
        }
    }, [allowedEvents, selectedEventId]);

    const handleScan = async (qrData: string) => {
        if (!staffSession || scanning) return;

        if (!selectedEventId) {
            alert("Please select an event first.");
            return;
        }

        setScanning(true);
        setScanResult(null);

        try {
            const result = await verifyTicket({
                qrData,
                scannerId: staffSession.staffId as Id<"verificationStaff">,
                deviceInfo: {
                    userAgent: navigator.userAgent,
                    deviceId: localStorage.getItem('deviceId') || 'unknown',
                },
            });

            // Frontend Verification: Ensure scanned ticket matches selected event
            if (result.success && result.event?.id !== selectedEventId) {
                const newStats = {
                    total: todayStats.total + 1,
                    valid: todayStats.valid,
                    invalid: todayStats.invalid + 1,
                };
                setTodayStats(newStats);
                localStorage.setItem(`stats_${staffSession.staffId}_${new Date().toDateString()}`, JSON.stringify(newStats));

                setScanResult({
                    success: false,
                    result: 'wrong_event',
                    message: `Warning: This ticket is for "${result.event?.title || 'another event'}", not the selected event.`,
                });
                return;
            }

            // Frontend Verification: Check if scanned ticket matches selected event
            // Note: The backend allows global staff to scan ANY event, 
            // but the UX requires us to enforce the SELECTED event context.
            if (result.success && result.booking) {
                // We need to check the event ID. 
                // Currently verifyTicket result returns `event: { title: ... }` but not ID explicitly in the simplified return.
                // However, `booking` object usually contains `eventId`. 
                // Let's rely on the result.result logic from backend which handles wrong_event for assigned staff.
                // For global staff, we need to manually check.

                // Since `verifyTicket` doesn't strictly return booking.eventId in the `booking` object in my previous code 
                // (it returns `bookingNumber`, `tickets`, etc.), 
                // I rely on the fact that `verifyTicket` logic itself checks for event mismatch if staff is assigned.

                // If staff is GLOBAL, they can scan anything. 
                // But we want to warn them if they scanned Event B while observing Event A.
                // The backend `verifyTicket` returns `event` object with title.
                // I'll add a check if possible, but without booking.eventId in response, I can't be 100% sure unless I update backend.
                // However, I can infer from `correctEvent` field if it was wrong.

                // Actually, let's just show the success. 
                // User requirement: "can verify based on the events".
                // If I am at Event A and scan Event B, and I am global, it IS a valid ticket.
                // Maybe just showing "Event: [Title]" in the result is enough context for the staff to say "Wait, this is for the wrong show".
            }

            setScanResult(result);

            // Update stats
            const isSuccess = result.success;
            const newStats = {
                total: todayStats.total + 1,
                valid: todayStats.valid + (isSuccess ? 1 : 0),
                invalid: todayStats.invalid + (isSuccess ? 0 : 1),
            };
            setTodayStats(newStats);
            localStorage.setItem(`stats_${staffSession.staffId}_${new Date().toDateString()}`, JSON.stringify(newStats));

            // Auto-clear after 3 seconds ONLY if successful
            if (isSuccess) {
                setTimeout(() => setScanResult(null), 3000);
            }
        } catch (error: any) {
            setScanResult({
                success: false,
                result: 'error',
                message: error.message || 'Scan failed. Please try again.',
            });
        } finally {
            setScanning(false);
        }
    };

    const handleManualEntry = () => {
        const qrData = prompt('Enter QR code data or booking number:');
        if (qrData) {
            handleScan(qrData);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('staffSession');
        sessionStorage.removeItem('staffSession');
        router.push('/verify/login');
    };

    if (!staffSession) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const selectedEvent = allowedEvents?.find(e => e._id === selectedEventId);

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col">
            {/* Custom Header */}
            <header className="bg-white shadow-sm z-10 sticky top-0">
                <div className="max-w-md mx-auto px-4 py-3">
                    <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                            <div className="bg-blue-600 p-1.5 rounded-lg">
                                <Zap className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="font-bold text-gray-900 leading-none">EventzGo</h1>
                                <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Scanner</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-semibold text-gray-900">{staffSession.staffName}</p>
                                <p className="text-xs text-gray-500 capitalize">{staffSession.role}</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                title="Sign Out"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Event Selector */}
                    <div className="relative">
                        {allowedEvents ? (
                            allowedEvents.length === 1 ? (
                                <div className="w-full p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-3">
                                    <Calendar className="w-5 h-5 text-blue-600" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-blue-900 truncate">{allowedEvents[0].title}</p>
                                        <p className="text-xs text-blue-700 flex items-center gap-1">
                                            <MapPin className="w-3 h-3" />
                                            {typeof allowedEvents[0].venue === 'string'
                                                ? allowedEvents[0].venue
                                                : allowedEvents[0].venue.name
                                            }
                                        </p>
                                    </div>
                                    <div className="px-2 py-1 bg-blue-200 text-blue-800 text-xs font-bold rounded">
                                        ACTIVE
                                    </div>
                                </div>
                            ) : (
                                <div className="relative">
                                    <select
                                        value={selectedEventId}
                                        onChange={(e) => setSelectedEventId(e.target.value as Id<"events">)}
                                        className="w-full appearance-none bg-white border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-3 pr-10 shadow-sm"
                                    >
                                        <option value="" disabled>Select Event to Verify...</option>
                                        {allowedEvents.map(event => (
                                            <option key={event._id} value={event._id}>
                                                {event.title}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                                        <ChevronDown className="w-5 h-5" />
                                    </div>
                                </div>
                            )
                        ) : (
                            <div className="w-full h-12 bg-gray-200 animate-pulse rounded-xl"></div>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-md mx-auto w-full p-4 pb-24">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 text-center">
                        <p className="text-2xl font-bold text-gray-900">{todayStats.total}</p>
                        <p className="text-xs text-gray-500 font-medium uppercase">Scans</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 text-center">
                        <p className="text-2xl font-bold text-green-600">{todayStats.valid}</p>
                        <p className="text-xs text-gray-500 font-medium uppercase">Valid</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 text-center">
                        <p className="text-2xl font-bold text-red-600">{todayStats.invalid}</p>
                        <p className="text-xs text-gray-500 font-medium uppercase">Invalid</p>
                    </div>
                </div>

                {/* Scanner View */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6 relative">
                    {!scanResult && !scanning ? (
                        <div className="p-8 text-center space-y-4">
                            <div className="w-64 h-64 mx-auto bg-gray-900 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer"
                                onClick={() => !(!selectedEventId) && setScanning(true)}>

                                {selectedEventId ? (
                                    <>
                                        <Camera className="w-12 h-12 text-white mb-2" />
                                        <p className="text-white font-medium">Tap to Scan</p>
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all" />
                                    </>
                                ) : (
                                    <p className="text-gray-400 px-4">Select an event above to start</p>
                                )}
                            </div>
                            <button
                                onClick={handleManualEntry}
                                disabled={!selectedEventId}
                                className="text-blue-600 font-medium text-sm hover:underline disabled:text-gray-400"
                            >
                                Enter Code Manually
                            </button>
                        </div>
                    ) : scanning && !scanResult ? (
                        <div className="p-8 text-center space-y-4">
                            <div className="w-full aspect-square bg-black rounded-2xl relative overflow-hidden">
                                {/* Simulating Camera Feed */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <p className="text-white/50 text-sm">Camera Active</p>
                                </div>
                                <div className="absolute inset-0 border-[3px] border-blue-500/50 rounded-2xl" />
                                <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.8)] animate-[scan_2s_ease-in-out_infinite]" />

                                {/* Mock Controls for Demo */}
                                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                                    <button
                                        onClick={() => handleScan(JSON.stringify({
                                            bookingId: "test",
                                            eventId: selectedEventId,
                                            timestamp: Date.now()
                                        }))}
                                        className="px-3 py-1 bg-white/20 text-white text-xs rounded backdrop-blur-sm"
                                    >
                                        Simulate Scan
                                    </button>
                                    <button
                                        onClick={() => setScanning(false)}
                                        className="px-3 py-1 bg-red-500/80 text-white text-xs rounded backdrop-blur-sm"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                            <p className="text-gray-500 text-sm animate-pulse">Searching for QR code...</p>
                        </div>
                    ) : (
                        // Result View
                        <div className={`p-6 ${scanResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
                            <div className="text-center mb-6">
                                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${scanResult.success ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                    }`}>
                                    {scanResult.success ? <CheckCircle className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
                                </div>
                                <h2 className={`text-2xl font-bold ${scanResult.success ? 'text-green-700' : 'text-red-700'
                                    }`}>
                                    {scanResult.success ? 'Access Granted' : 'Access Denied'}
                                </h2>
                                <p className={`text-sm font-medium mt-1 ${scanResult.success ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                    {scanResult.message}
                                </p>
                            </div>

                            {/* Details Card */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3">
                                {scanResult.attendee ? (
                                    <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                                        <div className="bg-gray-100 p-2 rounded-full">
                                            <User className="w-5 h-5 text-gray-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{scanResult.attendee.name}</p>
                                            <p className="text-xs text-gray-500">{scanResult.attendee.email || 'No email'}</p>
                                        </div>
                                    </div>
                                ) : null}

                                {scanResult.booking ? (
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Ticket Type</span>
                                            <span className="font-medium text-gray-900">
                                                {scanResult.booking.tickets[0]?.ticketTypeName}
                                                {scanResult.booking.tickets.length > 1 && ` +${scanResult.booking.tickets.length - 1}`}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Quantity</span>
                                            <span className="font-medium text-gray-900">
                                                {scanResult.booking.tickets.reduce((acc: any, t: any) => acc + t.quantity, 0)} Psl
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Booking ID</span>
                                            <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                                                #{scanResult.booking.bookingNumber}
                                            </span>
                                        </div>
                                    </div>
                                ) : null}
                            </div>

                            {/* Actions */}
                            <div className="mt-6 flex flex-col gap-3">
                                <button
                                    onClick={() => setScanResult(null)}
                                    className="w-full py-3 bg-white border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50"
                                >
                                    Scan Next
                                </button>

                                {staffSession.permissions?.canOverrideScans && !scanResult.success && scanResult.scanId && (
                                    <button
                                        onClick={async () => {
                                            const reason = prompt('Enter override reason:');
                                            if (reason) {
                                                try {
                                                    const result = await overrideScan({
                                                        scanId: scanResult.scanId,
                                                        overrideReason: reason,
                                                        overriddenBy: staffSession.staffId as Id<"verificationStaff">,
                                                    });

                                                    setScanResult({
                                                        success: true,
                                                        result: 'valid',
                                                        message: `Override: ${result.message}`,
                                                        scanId: result.newScanId,
                                                        attendee: scanResult.attendee,
                                                        booking: scanResult.booking
                                                    });

                                                    // Fix stats
                                                    setTodayStats(prev => ({
                                                        ...prev,
                                                        valid: prev.valid + 1,
                                                        invalid: prev.invalid - 1
                                                    }));
                                                } catch (err: any) {
                                                    alert(err.message);
                                                }
                                            }
                                        }}
                                        className="w-full py-3 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-xl font-medium hover:bg-yellow-100"
                                    >
                                        ⚠️ Override Verification
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Info */}
                <div className="text-center text-xs text-gray-400 space-y-1">
                    <p>Logged in as {staffSession.organiserName}</p>
                    <p>EventzGo Scanner v1.2 • Secure Connection</p>
                </div>
            </main>

            {/* Sticky Bottom Nav (Optional, mostly for very tall screens, but distinct footer requested) */}
            <footer className="bg-white border-t border-gray-200 p-4 pb-6 absolute bottom-0 w-full hidden">
                {/* Hidden per request for "remove end user footer" - using in-flow footer above instead */}
            </footer>
        </div>
    );
}
