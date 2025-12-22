// Health check endpoint to verify API is working
import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        env: {
            hasConvexUrl: !!process.env.NEXT_PUBLIC_CONVEX_URL,
            hasCloudinaryName: !!process.env.CLOUDINARY_CLOUD_NAME,
            hasCloudinaryKey: !!process.env.CLOUDINARY_API_KEY,
            hasRazorpayKey: !!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        },
    });
}
