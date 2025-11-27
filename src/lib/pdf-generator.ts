import jsPDF from "jspdf";
import { formatDate, formatTime } from "./date-utils";
import { formatCurrency } from "./utils";
import { APP_CONFIG } from "@/constants/config";

export interface TicketData {
  bookingNumber: string;
  eventName: string;
  eventDate: number;
  eventVenue: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  tickets: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  qrCode: string;
  // Optional organizer details
  organizerName?: string;
  organizerGST?: string;
  organizerAddress?: string;
}

/**
 * Generate GST Invoice style ticket PDF
 */
export async function generateTicketPDF(data: TicketData): Promise<Blob> {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;

  // Colors
  const primaryColor = [99, 102, 241]; // Indigo
  const darkGray = [31, 41, 55];
  const lightGray = [243, 244, 246];
  const greenColor = [34, 197, 94];

  let yPos = margin;

  // ==================== HEADER ====================
  // Company Header with gradient effect
  pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.rect(0, 0, pageWidth, 45, "F");

  // Company Name (from config)
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(22);
  pdf.setFont("helvetica", "bold");
  const cfgAny = APP_CONFIG as any;
  pdf.text(cfgAny.name || "Ticketshub", margin, 20);

  // Tagline (optional)
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  if (cfgAny.tagline) {
    pdf.text(cfgAny.tagline, margin, 28);
  }

  // GST Invoice Label
  pdf.setFontSize(16);
  pdf.setFont("helvetica", "bold");
  pdf.text("TAX INVOICE", pageWidth - margin - 40, 20);

  // Invoice Number
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.text(`Invoice No: ${data.bookingNumber}`, pageWidth - margin - 40, 28);
  pdf.text(`Date: ${formatDate(Date.now())}`, pageWidth - margin - 40, 34);

  yPos = 55;

  // ==================== COMPANY DETAILS ====================
  pdf.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "normal");

  // Left side - TicketsHub Details
  pdf.setFont("helvetica", "bold");
  pdf.text("From:", margin, yPos);
  pdf.setFont("helvetica", "normal");
  yPos += 5;

  // Company details - try to use APP_CONFIG values, fallback to placeholders
  pdf.text(`${cfgAny.name || "Ticketshub"} India Pvt. Ltd.`, margin, yPos);
  yPos += 4;
  pdf.text(cfgAny.address || "123, Tech Park, Bangalore - 560001", margin, yPos);
  yPos += 4;
  pdf.text(cfgAny.addressLine2 || "Karnataka, India", margin, yPos);
  yPos += 4;
  if (cfgAny.gstin) {
    pdf.text(`GSTIN: ${cfgAny.gstin}`, margin, yPos);
    yPos += 4;
  }
  if (cfgAny.pan) {
    pdf.text(`PAN: ${cfgAny.pan}`, margin, yPos);
    yPos += 4;
  }

  // Right side - Customer Details
  let rightYPos = 55;
  pdf.setFont("helvetica", "bold");
  pdf.text("Bill To:", pageWidth - margin - 70, rightYPos);
  pdf.setFont("helvetica", "normal");
  rightYPos += 5;

  pdf.text(data.customerName, pageWidth - margin - 70, rightYPos);
  rightYPos += 4;
  pdf.text(data.customerEmail, pageWidth - margin - 70, rightYPos);
  rightYPos += 4;
  pdf.text(data.customerPhone, pageWidth - margin - 70, rightYPos);

  yPos += 10;

  // Separator Line
  pdf.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.setLineWidth(0.5);
  pdf.line(margin, yPos, pageWidth - margin, yPos);

  yPos += 8;

  // ==================== EVENT DETAILS ====================
  pdf.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  pdf.rect(margin, yPos - 3, pageWidth - 2 * margin, 8, "F");

  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.text("EVENT DETAILS", margin + 2, yPos + 3);

  yPos += 12;

  pdf.setFontSize(9);
  pdf.setTextColor(darkGray[0], darkGray[1], darkGray[2]);

  // Event Name
  pdf.setFont("helvetica", "bold");
  pdf.text("Event:", margin + 2, yPos);
  pdf.setFont("helvetica", "normal");
  const eventNameLines = pdf.splitTextToSize(data.eventName, 120);
  pdf.text(eventNameLines, margin + 30, yPos);
  yPos += eventNameLines.length * 5;

  // Event Date & Time
  pdf.setFont("helvetica", "bold");
  pdf.text("Date & Time:", margin + 2, yPos);
  pdf.setFont("helvetica", "normal");
  pdf.text(`${formatDate(data.eventDate)} at ${formatTime(data.eventDate)}`, margin + 30, yPos);
  yPos += 5;

  // Venue
  pdf.setFont("helvetica", "bold");
  pdf.text("Venue:", margin + 2, yPos);
  pdf.setFont("helvetica", "normal");
  const venueLines = pdf.splitTextToSize(data.eventVenue, 120);
  pdf.text(venueLines, margin + 30, yPos);
  yPos += venueLines.length * 5 + 5;

  // ==================== TICKET DETAILS TABLE ====================
  pdf.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  pdf.rect(margin, yPos - 3, pageWidth - 2 * margin, 8, "F");

  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.text("TICKET DETAILS", margin + 2, yPos + 3);

  yPos += 12;

  // Table Header
  pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.rect(margin, yPos - 5, pageWidth - 2 * margin, 10, "F");

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "bold");
  pdf.text("S.No", margin + 3, yPos);
  pdf.text("Ticket Type", margin + 15, yPos);
  pdf.text("Qty", margin + 90, yPos);
  pdf.text("Price (₹)", margin + 110, yPos);
  pdf.text("GST (18%)", margin + 135, yPos);
  pdf.text("Total (₹)", margin + 165, yPos);

  yPos += 8;

  // Table Rows
  pdf.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  pdf.setFont("helvetica", "normal");

  let subtotal = 0;

  data.tickets.forEach((ticket, index) => {
    // Alternate row colors
    if (index % 2 === 0) {
      pdf.setFillColor(249, 250, 251);
      pdf.rect(margin, yPos - 5, pageWidth - 2 * margin, 8, "F");
    }

    const ticketSubtotal = ticket.price;
    const gst = ticketSubtotal * 0.18;
    const total = ticketSubtotal + gst;
    subtotal += ticketSubtotal;

    pdf.text((index + 1).toString(), margin + 3, yPos);
    pdf.text(ticket.name, margin + 15, yPos);
    pdf.text(ticket.quantity.toString(), margin + 90, yPos);
    pdf.text(ticketSubtotal.toFixed(2), margin + 110, yPos);
    pdf.text(gst.toFixed(2), margin + 135, yPos);
    pdf.text(total.toFixed(2), margin + 165, yPos);

    yPos += 8;
  });

  // Separator
  pdf.setDrawColor(darkGray[0], darkGray[1], darkGray[2]);
  pdf.setLineWidth(0.3);
  pdf.line(margin, yPos, pageWidth - margin, yPos);

  yPos += 8;

  // ==================== TOTALS ====================
  const gstPercent = cfgAny.gstPercentage || 18;
  const platformPercent = cfgAny.platformCommission || 5;
  const gstAmount = subtotal * (gstPercent / 100);
  const platformFee = subtotal * (platformPercent / 100);
  const computedGrandTotal = subtotal + gstAmount + platformFee;

  pdf.setFontSize(9);

  // Subtotal
  pdf.setFont("helvetica", "normal");
  pdf.text("Subtotal:", pageWidth - margin - 60, yPos);
  pdf.text(formatCurrency(subtotal), pageWidth - margin - 20, yPos, { align: "right" });
  yPos += 6;

  // GST
  pdf.text(`GST (${gstPercent}%):`, pageWidth - margin - 60, yPos);
  pdf.text(formatCurrency(gstAmount), pageWidth - margin - 20, yPos, { align: "right" });
  yPos += 6;

  // Platform Fee
  pdf.text(`Platform Fee (${platformPercent}%):`, pageWidth - margin - 60, yPos);
  pdf.text(formatCurrency(platformFee), pageWidth - margin - 20, yPos, { align: "right" });
  yPos += 8;

  // Grand Total (highlight)
  pdf.setFillColor(greenColor[0], greenColor[1], greenColor[2]);
  const gtw = 85;
  pdf.rect(pageWidth - margin - gtw, yPos - 6, gtw, 14, "F");

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.text("GRAND TOTAL:", pageWidth - margin - gtw + 4, yPos);
  pdf.text(formatCurrency(computedGrandTotal), pageWidth - margin - 10, yPos, { align: "right" });

  yPos += 15;

  // ==================== QR CODE & INSTRUCTIONS ====================
  pdf.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.text("ENTRY QR CODE", margin, yPos);

  yPos += 5;

  pdf.setFontSize(8);
  pdf.setFont("helvetica", "normal");
  pdf.text("Please show this QR code at the venue entrance for entry verification", margin, yPos);

  yPos += 5;

  // Add QR Code
  try {
    pdf.addImage(data.qrCode, "PNG", margin, yPos, 50, 50);
  } catch (error) {
    console.error("Failed to add QR code to PDF:", error);
  }

  // Important Notes (right side of QR)
  let notesYPos = yPos;
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "bold");
  pdf.text("Important Notes:", margin + 60, notesYPos);
  notesYPos += 5;

  pdf.setFontSize(8);
  pdf.setFont("helvetica", "normal");
  const notes = [
    "• This is a computer-generated invoice",
    "• Please carry a valid ID proof to the venue",
    "• Entry is subject to security check",
    "• No refunds or cancellations allowed",
    "• Gates open 30 minutes before event time",
  ];

  notes.forEach(note => {
    pdf.text(note, margin + 60, notesYPos);
    notesYPos += 4;
  });

  yPos += 60;

  // ==================== ORGANIZER DETAILS ====================
  if (data.organizerName) {
    pdf.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
    pdf.rect(margin, yPos - 3, pageWidth - 2 * margin, 8, "F");

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.text("ORGANIZER DETAILS", margin + 2, yPos + 3);

    yPos += 10;

    pdf.setFontSize(8);
    pdf.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    pdf.setFont("helvetica", "normal");

    pdf.text(`Name: ${data.organizerName}`, margin + 2, yPos);
    yPos += 4;

    if (data.organizerGST) {
      pdf.text(`GSTIN: ${data.organizerGST}`, margin + 2, yPos);
      yPos += 4;
    }

    if (data.organizerAddress) {
      pdf.text(`Address: ${data.organizerAddress}`, margin + 2, yPos);
      yPos += 4;
    }
  }

  // ==================== FOOTER ====================
  const footerY = pageHeight - 20;

  pdf.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.setLineWidth(0.5);
  pdf.line(margin, footerY, pageWidth - margin, footerY);

  pdf.setFontSize(7);
  pdf.setTextColor(128, 128, 128);
  pdf.setFont("helvetica", "normal");

  const supportContact = cfgAny.SUPPORT_EMAIL || "support@ticketshub.com";
  const supportPhone = cfgAny.SUPPORT_PHONE || "+91 1800-123-4567";

  pdf.text(
    `For any queries, contact us at ${supportContact} | ${supportPhone}`,
    pageWidth / 2,
    footerY + 5,
    { align: "center" }
  );

  pdf.text(
    `© ${new Date().getFullYear()} ${cfgAny.name || "Ticketshub"} India Pvt. Ltd. All rights reserved.`,
    pageWidth / 2,
    footerY + 10,
    { align: "center" }
  );

  pdf.text(
    "This is a system-generated invoice and does not require a signature.",
    pageWidth / 2,
    footerY + 15,
    { align: "center" }
  );

  return pdf.output("blob");
}

/**
 * Download ticket PDF
 */
export function downloadTicketPDF(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}