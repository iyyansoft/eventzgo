import QRCode from "qrcode";

/**
 * Generate QR code as data URL
 */
export async function generateQRCode(data: string): Promise<string> {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(data, {
      errorCorrectionLevel: "H",
      margin: 1,
      width: 300,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });
    
    return qrCodeDataUrl;
  } catch (error) {
    console.error("QR code generation failed:", error);
    throw new Error("Failed to generate QR code");
  }
}

/**
 * Generate QR code as buffer
 */
export async function generateQRCodeBuffer(data: string): Promise<Buffer> {
  try {
    const buffer = await QRCode.toBuffer(data, {
      errorCorrectionLevel: "H",
      margin: 1,
      width: 300,
    });
    
    return buffer;
  } catch (error) {
    console.error("QR code generation failed:", error);
    throw new Error("Failed to generate QR code");
  }
}

/**
 * Generate booking QR code data
 */
export function generateBookingQRData(
  bookingNumber: string,
  eventId: string,
  userId?: string
): string {
  return JSON.stringify({
    type: "booking",
    bookingNumber,
    eventId,
    userId,
    timestamp: Date.now(),
  });
}

/**
 * Parse booking QR code data
 */
export function parseBookingQRData(qrData: string): {
  type: string;
  bookingNumber: string;
  eventId: string;
  userId?: string;
  timestamp: number;
} | null {
  try {
    const data = JSON.parse(qrData);
    
    if (data.type !== "booking") {
      return null;
    }
    
    return data;
  } catch {
    return null;
  }
}