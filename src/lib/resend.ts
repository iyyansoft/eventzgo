import { Resend } from "resend";
import { APP_CONFIG } from "@/constants/config";

let resend: Resend | null = null;
function getResendClient(): Resend | null {
  if (resend) return resend;
  const key = process.env.RESEND_API_KEY || process.env.NEXT_PUBLIC_RESEND_API_KEY;
  if (!key) return null;
  resend = new Resend(key);
  return resend;
}

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
  }>;
}

/**
 * Send email using Resend
 */
export async function sendEmail(options: EmailOptions) {
  try {
    const client = getResendClient();
    if (!client) {
      console.warn("Resend API key not configured; skipping email send.");
      return { success: false, error: "Resend API key missing" };
    }

    const result = await client.emails.send({
      from: options.from || APP_CONFIG.fromEmail,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
      replyTo: options.replyTo,
      attachments: options.attachments,
    });
    
    return {
      success: true,
      id: result.data?.id,
    };
  } catch (error) {
    console.error("Email sending failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send booking confirmation email
 */
export async function sendBookingConfirmation(
  to: string,
  data: {
    bookingNumber: string;
    customerName: string;
    eventName: string;
    eventDate: string;
    eventVenue: string;
    tickets: Array<{ name: string; quantity: number }>;
    totalAmount: number;
    qrCode: string;
  }
) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ef4444; color: white; padding: 20px; text-align: center; }
          .content { background: #f9fafb; padding: 20px; }
          .ticket-info { background: white; padding: 15px; margin: 15px 0; border-radius: 8px; }
          .qr-code { text-align: center; margin: 20px 0; }
          .footer { text-align: center; color: #6b7280; font-size: 12px; padding: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Booking Confirmed!</h1>
          </div>
          <div class="content">
            <p>Hi ${data.customerName},</p>
            <p>Your booking has been confirmed! Here are your ticket details:</p>
            
            <div class="ticket-info">
              <p><strong>Booking Number:</strong> ${data.bookingNumber}</p>
              <p><strong>Event:</strong> ${data.eventName}</p>
              <p><strong>Date & Time:</strong> ${data.eventDate}</p>
              <p><strong>Venue:</strong> ${data.eventVenue}</p>
              
              <p><strong>Tickets:</strong></p>
              <ul>
                ${data.tickets.map(t => `<li>${t.name} × ${t.quantity}</li>`).join('')}
              </ul>
              
              <p><strong>Total Amount:</strong> ₹${data.totalAmount}</p>
            </div>
            
            <div class="qr-code">
              <img src="${data.qrCode}" alt="QR Code" width="200" height="200" />
              <p><small>Show this QR code at the venue for entry</small></p>
            </div>
            
            <p>Your ticket PDF is attached to this email.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} TicketsHub. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
  
  return sendEmail({
    to,
    subject: `Booking Confirmed - ${data.eventName}`,
    html,
  });
}

/**
 * Send GST invoice email
 */
export async function sendGSTInvoice(
  to: string,
  invoiceData: any,
  pdfBuffer?: Buffer
) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1e293b; color: white; padding: 20px; text-align: center; }
          .content { background: #f9fafb; padding: 20px; }
          .invoice-details { background: white; padding: 15px; margin: 15px 0; }
          table { width: 100%; border-collapse: collapse; }
          th, td { padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb; }
          .total-row { font-weight: bold; background: #f3f4f6; }
          .footer { text-align: center; color: #6b7280; font-size: 12px; padding: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>GST Invoice</h1>
          </div>
          <div class="content">
            <div class="invoice-details">
              <p><strong>Invoice Number:</strong> ${invoiceData.invoiceNumber}</p>
              <p><strong>Booking Number:</strong> ${invoiceData.bookingNumber}</p>
              <p><strong>Date:</strong> ${new Date(invoiceData.invoiceDate).toLocaleDateString()}</p>
            </div>
            
            <h3>Bill To:</h3>
            <p>${invoiceData.customerName}<br>
            ${invoiceData.customerEmail}<br>
            ${invoiceData.customerPhone}</p>
            
            <h3>Bill From:</h3>
            <p>${invoiceData.organiserName}<br>
            GST: ${invoiceData.organiserGST}<br>
            ${invoiceData.organiserAddress}</p>
            
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                ${invoiceData.tickets.map((t: any) => `
                  <tr>
                    <td>${t.name}</td>
                    <td>${t.quantity}</td>
                    <td>₹${t.price}</td>
                    <td>₹${t.total}</td>
                  </tr>
                `).join('')}
                <tr>
                  <td colspan="3"><strong>Subtotal</strong></td>
                  <td>₹${invoiceData.subtotal}</td>
                </tr>
                <tr>
                  <td colspan="3">Platform Fee (${APP_CONFIG.platformCommission}%)</td>
                  <td>₹${invoiceData.platformFee}</td>
                </tr>
                ${invoiceData.cgst > 0 ? `
                  <tr>
                    <td colspan="3">CGST (${invoiceData.totalGST / invoiceData.subtotal * 50}%)</td>
                    <td>₹${invoiceData.cgst}</td>
                  </tr>
                  <tr>
                    <td colspan="3">SGST (${invoiceData.totalGST / invoiceData.subtotal * 50}%)</td>
                    <td>₹${invoiceData.sgst}</td>
                  </tr>
                ` : `
                  <tr>
                    <td colspan="3">IGST (${(invoiceData.totalGST / invoiceData.subtotal * 100).toFixed(2)}%)</td>
                    <td>₹${invoiceData.igst}</td>
                  </tr>
                `}
                <tr class="total-row">
                  <td colspan="3"><strong>Grand Total</strong></td>
                  <td><strong>₹${invoiceData.grandTotal}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="footer">
            <p>This is a computer-generated invoice.</p>
            <p>© ${new Date().getFullYear()} TicketsHub. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
  
  const attachments = pdfBuffer ? [{
    filename: `invoice-${invoiceData.invoiceNumber}.pdf`,
    content: pdfBuffer,
  }] : undefined;
  
  return sendEmail({
    to,
    subject: `GST Invoice - ${invoiceData.bookingNumber}`,
    html,
    attachments,
  });
}

/**
 * Send organiser approval email
 */
export async function sendOrganiserApproval(
  to: string,
  organiserName: string,
  approved: boolean,
  reason?: string
) {
  const html = approved
    ? `
      <h1>🎉 Organiser Account Approved!</h1>
      <p>Hi ${organiserName},</p>
      <p>Congratulations! Your organiser account has been approved.</p>
      <p>You can now start creating and managing events on TicketsHub.</p>
      <p><a href="${APP_CONFIG.url}/management/organiser/dashboard">Go to Dashboard</a></p>
    `
    : `
      <h1>Organiser Account Review</h1>
      <p>Hi ${organiserName},</p>
      <p>Unfortunately, your organiser account application was not approved.</p>
      ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
      <p>If you have any questions, please contact our support team.</p>
    `;
  
  return sendEmail({
    to,
    subject: approved ? "Organiser Account Approved" : "Organiser Account Review",
    html,
  });
}

/**
 * Send event approval email
 */
export async function sendEventApproval(
  to: string,
  eventName: string,
  approved: boolean,
  reason?: string
) {
  const html = approved
    ? `
      <h1>✅ Event Approved!</h1>
      <p>Your event "${eventName}" has been approved and is now live on TicketsHub.</p>
      <p>Users can now discover and book tickets for your event.</p>
    `
    : `
      <h1>Event Review</h1>
      <p>Your event "${eventName}" was not approved.</p>
      ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
      <p>Please make the necessary changes and resubmit.</p>
    `;
  
  return sendEmail({
    to,
    subject: approved ? `Event Approved - ${eventName}` : `Event Review - ${eventName}`,
    html,
  });
}