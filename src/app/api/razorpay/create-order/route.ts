import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(request: NextRequest) {
  try {
    // Check if Razorpay credentials are configured
    if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error("❌ Razorpay credentials not configured");
      console.error("NEXT_PUBLIC_RAZORPAY_KEY_ID:", process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ? "SET" : "MISSING");
      console.error("RAZORPAY_KEY_SECRET:", process.env.RAZORPAY_KEY_SECRET ? "SET" : "MISSING");
      return NextResponse.json(
        {
          error: "Razorpay not configured",
          message: "Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET in environment variables"
        },
        { status: 500 }
      );
    }

    // Initialize Razorpay instance
    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const body = await request.json();
    const { amount, currency, receipt, notes } = body;

    console.log("📝 Creating Razorpay order:", { amount, currency, receipt });

    // Validate required fields
    if (!amount || !currency || !receipt) {
      return NextResponse.json(
        { error: "Missing required fields: amount, currency, receipt" },
        { status: 400 }
      );
    }

    // Create Razorpay order
    const options = {
      amount: Math.round(amount * 100), // Convert to paise (smallest currency unit)
      currency: currency || "INR",
      receipt: receipt,
      notes: notes || {},
    };

    console.log("💳 Razorpay order options:", options);

    const order = await razorpay.orders.create(options);

    console.log("✅ Razorpay order created successfully:", order.id);

    return NextResponse.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      status: order.status,
    });
  } catch (error: any) {
    console.error("❌ Razorpay order creation error:", error);
    console.error("Error details:", {
      message: error.message,
      description: error.error?.description,
      code: error.statusCode,
      stack: error.stack
    });
    return NextResponse.json(
      {
        error: "Failed to create Razorpay order",
        message: error.message || "Unknown error",
        details: error.error?.description || error.toString()
      },
      { status: 500 }
    );
  }
}
