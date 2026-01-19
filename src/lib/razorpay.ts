import Razorpay from "razorpay";
import crypto from "crypto";

// Server-side Razorpay instance
let razorpayInstance: Razorpay | undefined;

const getRazorpayInstance = () => {
  if (!razorpayInstance) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.warn("Razorpay keys are missing");
      // Don't throw here to allow other functions to work if they don't need instance
    }

    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || "dummy_key",
      key_secret: process.env.RAZORPAY_KEY_SECRET || "dummy_secret",
    });
  }
  return razorpayInstance!;
};

export { getRazorpayInstance };

/**
 * Create Razorpay order
 */
export async function createRazorpayOrder(
  amount: number,
  currency: string = "INR",
  receipt: string,
  notes?: Record<string, string>
) {
  try {
    const order = await getRazorpayInstance().orders.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency,
      receipt,
      notes,
    });

    return order;
  } catch (error) {
    console.error("Razorpay order creation failed:", error);
    throw new Error("Failed to create payment order");
  }
}

/**
 * Verify Razorpay payment signature
 */
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  try {
    const text = `${orderId}|${paymentId}`;
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(text)
      .digest("hex");

    return generated_signature === signature;
  } catch (error) {
    console.error("Signature verification failed:", error);
    return false;
  }
}

/**
 * Verify Razorpay webhook signature
 */
export function verifyWebhookSignature(
  body: string,
  signature: string
): boolean {
  try {
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest("hex");

    return expectedSignature === signature;
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return false;
  }
}

/**
 * Fetch payment details
 */
export async function fetchPayment(paymentId: string) {
  try {
    const payment = await getRazorpayInstance().payments.fetch(paymentId);
    return payment;
  } catch (error) {
    console.error("Failed to fetch payment:", error);
    throw new Error("Failed to fetch payment details");
  }
}

/**
 * Create refund
 */
export async function createRefund(
  paymentId: string,
  amount?: number,
  notes?: Record<string, string>
) {
  try {
    const refund = await getRazorpayInstance().payments.refund(paymentId, {
      amount: amount ? Math.round(amount * 100) : undefined,
      notes,
    });

    return refund;
  } catch (error) {
    console.error("Refund creation failed:", error);
    throw new Error("Failed to create refund");
  }
}

/**
 * Fetch refund details
 */
export async function fetchRefund(refundId: string) {
  try {
    const refund = await getRazorpayInstance().refunds.fetch(refundId);
    return refund;
  } catch (error) {
    console.error("Failed to fetch refund:", error);
    throw new Error("Failed to fetch refund details");
  }
}

/**
 * Client-side: Load Razorpay script
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    // Check if already loaded
    if (typeof window !== "undefined" && (window as any).Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Client-side: Open Razorpay checkout
 */
export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

export async function openRazorpayCheckout(options: RazorpayOptions) {
  const loaded = await loadRazorpayScript();

  if (!loaded) {
    throw new Error("Failed to load Razorpay SDK");
  }

  const razorpay = new (window as any).Razorpay(options);
  razorpay.open();
}