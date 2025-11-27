import { NextRequest, NextResponse } from "next/server";

/**
 * Email API - DISABLED FOR DEMO
 * TODO: Implement AWS SES integration
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, type } = body;

    console.log("📧 Email API called (disabled):", { bookingId, type });

    return NextResponse.json(
      {
        success: true,
        message: "Email functionality will be implemented with AWS SES",
        bookingId,
        type
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: true, message: "Email disabled" },
      { status: 200 }
    );
  }
}