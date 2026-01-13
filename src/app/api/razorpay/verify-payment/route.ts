import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing required fields for payment verification" },
        { status: 400 }
      );
    }

    // Create signature verification string
    const text = razorpay_order_id + "|" + razorpay_payment_id;

    // Generate expected signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(text)
      .digest("hex");

    // Compare signatures
    const isValid = expectedSignature === razorpay_signature;

    if (isValid) {
      return NextResponse.json({
        success: true,
        message: "Payment verified successfully",
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Payment verification failed",
          message: "Invalid signature"
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Payment verification failed",
        message: error.message || "Unknown error"
      },
      { status: 500 }
    );
  }
}