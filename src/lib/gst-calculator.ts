import { APP_CONFIG } from "@/constants/config";

export interface PriceBreakdown {
  basePrice: number;
  gst: number;
  platformFee: number;
  totalPrice: number;
  gstPercentage: number;
  platformFeePercentage: number;
}

/**
 * Calculate price breakdown with GST and platform fee
 */
export function calculatePriceBreakdown(basePrice: number): PriceBreakdown {
  const platformFeePercentage = APP_CONFIG.platformCommission;
  const gstPercentage = APP_CONFIG.gstPercentage;
  
  // Calculate platform fee
  const platformFee = (basePrice * platformFeePercentage) / 100;
  
  // Calculate subtotal (base + platform fee)
  const subtotal = basePrice + platformFee;
  
  // Calculate GST on subtotal
  const gst = (subtotal * gstPercentage) / 100;
  
  // Calculate total
  const totalPrice = subtotal + gst;
  
  return {
    basePrice: Math.round(basePrice * 100) / 100,
    gst: Math.round(gst * 100) / 100,
    platformFee: Math.round(platformFee * 100) / 100,
    totalPrice: Math.round(totalPrice * 100) / 100,
    gstPercentage,
    platformFeePercentage,
  };
}

/**
 * Calculate booking price breakdown
 */
export function calculateBookingPrice(
  tickets: Array<{ price: number; quantity: number }>
): PriceBreakdown & { subtotal: number } {
  // Calculate base price from all tickets
  const basePrice = tickets.reduce(
    (total, ticket) => total + ticket.price * ticket.quantity,
    0
  );
  
  const breakdown = calculatePriceBreakdown(basePrice);
  
  return {
    ...breakdown,
    subtotal: basePrice + breakdown.platformFee,
  };
}

/**
 * Calculate organiser payout (after platform commission)
 */
export function calculateOrganiserPayout(grossAmount: number): {
  grossAmount: number;
  platformFee: number;
  netAmount: number;
} {
  const platformFeePercentage = APP_CONFIG.platformCommission;
  const platformFee = (grossAmount * platformFeePercentage) / 100;
  const netAmount = grossAmount - platformFee;
  
  return {
    grossAmount: Math.round(grossAmount * 100) / 100,
    platformFee: Math.round(platformFee * 100) / 100,
    netAmount: Math.round(netAmount * 100) / 100,
  };
}

/**
 * Extract GST components (CGST, SGST, IGST)
 */
export function extractGSTComponents(
  totalGST: number,
  isInterState: boolean = false
): {
  cgst: number;
  sgst: number;
  igst: number;
} {
  if (isInterState) {
    // Inter-state transaction - only IGST
    return {
      cgst: 0,
      sgst: 0,
      igst: Math.round(totalGST * 100) / 100,
    };
  } else {
    // Intra-state transaction - CGST + SGST (equal split)
    const cgst = totalGST / 2;
    const sgst = totalGST / 2;
    return {
      cgst: Math.round(cgst * 100) / 100,
      sgst: Math.round(sgst * 100) / 100,
      igst: 0,
    };
  }
}

/**
 * Generate GST invoice data
 */
export interface GSTInvoice {
  invoiceNumber: string;
  invoiceDate: string;
  bookingNumber: string;
  
  // Customer details
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  
  // Organiser details
  organiserName: string;
  organiserGST: string;
  organiserAddress: string;
  
  // Event details
  eventName: string;
  eventDate: string;
  eventVenue: string;
  
  // Pricing
  tickets: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  subtotal: number;
  platformFee: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalGST: number;
  grandTotal: number;
}

export function generateGSTInvoice(
  bookingData: {
    bookingNumber: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    tickets: Array<{ name: string; quantity: number; price: number }>;
  },
  eventData: {
    name: string;
    date: string;
    venue: string;
  },
  organiserData: {
    name: string;
    gst: string;
    address: string;
  },
  pricing: PriceBreakdown,
  isInterState: boolean = false
): GSTInvoice {
  const invoiceNumber = `INV-${Date.now()}`;
  const invoiceDate = new Date().toISOString();
  
  const gstComponents = extractGSTComponents(pricing.gst, isInterState);
  
  const tickets = bookingData.tickets.map((ticket) => ({
    name: ticket.name,
    quantity: ticket.quantity,
    price: ticket.price,
    total: ticket.price * ticket.quantity,
  }));
  
  return {
    invoiceNumber,
    invoiceDate,
    bookingNumber: bookingData.bookingNumber,
    
    customerName: bookingData.customerName,
    customerEmail: bookingData.customerEmail,
    customerPhone: bookingData.customerPhone,
    
    organiserName: organiserData.name,
    organiserGST: organiserData.gst,
    organiserAddress: organiserData.address,
    
    eventName: eventData.name,
    eventDate: eventData.date,
    eventVenue: eventData.venue,
    
    tickets,
    subtotal: pricing.basePrice + pricing.platformFee,
    platformFee: pricing.platformFee,
    cgst: gstComponents.cgst,
    sgst: gstComponents.sgst,
    igst: gstComponents.igst,
    totalGST: pricing.gst,
    grandTotal: pricing.totalPrice,
  };
}