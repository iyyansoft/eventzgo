/**
 * Email Templates - DISABLED
 * TODO: Implement actual templates
 */

export interface BookingConfirmationData {
    bookingNumber: string;
    customerName: string;
    eventName: string;
    eventDate: string;
    eventVenue: string;
    tickets: Array<{
        name: string;
        quantity: number;
        price: number;
    }>;
    totalAmount: number;
    qrCodeUrl?: string;
}

export interface GSTInvoiceData {
    invoiceNumber: string;
    bookingNumber: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    eventName: string;
    eventDate: string;
    eventVenue: string;
    tickets: Array<{
        name: string;
        quantity: number;
        price: number;
    }>;
    pricing: {
        subtotal: number;
        platformFee: number;
        cgst?: number;
        sgst?: number;
        igst?: number;
        gstRate: number;
        total: number;
    };
    organiser: {
        name: string;
        gst: string;
        address: string;
    };
}

export function bookingConfirmationTemplate(
    data: BookingConfirmationData
): string {
    return `<html><body><h1>Booking Confirmation - ${data.bookingNumber}</h1></body></html>`;
}

export function gstInvoiceTemplate(data: GSTInvoiceData): string {
    return `<html><body><h1>GST Invoice - ${data.invoiceNumber}</h1></body></html>`;
}