export const APP_CONFIG = {
	RAZORPAY_KEY: process.env.NEXT_PUBLIC_RAZORPAY_KEY || "",
	SUPPORT_EMAIL: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@eventzgo.com",
	platformCommission: Number(process.env.NEXT_PUBLIC_PLATFORM_COMMISSION || 5),
	gstPercentage: Number(process.env.NEXT_PUBLIC_GST_PERCENTAGE || 18),
	name: process.env.NEXT_PUBLIC_APP_NAME || "EventzGo",
	fromEmail: process.env.NEXT_PUBLIC_FROM_EMAIL || "no-reply@eventzgo.com",
	url: process.env.NEXT_PUBLIC_APP_URL || "https://eventzgo.com",
};
