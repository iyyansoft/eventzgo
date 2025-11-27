// Minimal email templates stub for build

export type BookingConfirmationData = {
  bookingNumber?: string;
  eventName?: string;
  attendeeName?: string;
  totalAmount?: number;
};

export type GSTInvoiceData = {
  invoiceNumber?: string;
  billingName?: string;
  amount?: number;
};

export const bookingConfirmationTemplate = (data: BookingConfirmationData) => {
  return `Booking Confirmation for ${data.eventName || "your event"}`;
};

export const gstInvoiceTemplate = (data: GSTInvoiceData) => {
  return `GST Invoice ${data.invoiceNumber || "-"}`;
};
