/**
 * Email Service - DISABLED
 * TODO: Implement AWS SES integration
 */

import { sendEmail } from "./aws-ses";
import {
    bookingConfirmationTemplate,
    gstInvoiceTemplate,
    BookingConfirmationData,
    GSTInvoiceData,
} from "./email-templates";

export async function sendBookingConfirmation(
    email: string,
    data: BookingConfirmationData
): Promise<{ success: boolean; error?: string }> {
    console.log("📧 Would send booking confirmation to:", email);
    return { success: true };
}

export async function sendGSTInvoice(
    email: string,
    data: GSTInvoiceData
): Promise<{ success: boolean; error?: string }> {
    console.log("📧 Would send GST invoice to:", email);
    return { success: true };
}