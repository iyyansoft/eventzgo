import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { openRazorpayCheckout } from "@/lib/razorpay";
import { APP_CONFIG } from "@/constants/config";

interface PaymentOptions {
  amount: number;
  eventId: Id<"events">;
  userId?: Id<"users">;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  eventName: string;
  onSuccess: (paymentId: Id<"payments">) => void;
  onFailure?: (error: string) => void;
}

export function usePayment() {
  const [isProcessing, setIsProcessing] = useState(false);
  
  const createPaymentMutation = useMutation(api.payments.createPayment);
  const verifyPaymentMutation = useMutation(api.payments.verifyPayment);
  const failPaymentMutation = useMutation(api.payments.failPayment);

  const initiatePayment = async (options: PaymentOptions) => {
    setIsProcessing(true);

    try {
      // Step 1: Create Razorpay order via API
      const orderResponse = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: options.amount,
          currency: "INR",
          receipt: `receipt_${Date.now()}`,
        }),
      });

      if (!orderResponse.ok) {
        throw new Error("Failed to create payment order");
      }

      const orderData = await orderResponse.json();

      // Step 2: Create payment record in Convex
      const paymentId = await createPaymentMutation({
        razorpayOrderId: orderData.id,
        amount: options.amount,
        currency: "INR",
        eventId: options.eventId,
        userId: options.userId,
        metadata: {
          eventName: options.eventName,
          customerEmail: options.customerEmail,
        },
      });

      // Step 3: Open Razorpay checkout
      await openRazorpayCheckout({
        key: APP_CONFIG.RAZORPAY_KEY,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Ticketshub",
        description: options.eventName,
        order_id: orderData.id,
        prefill: {
          name: options.customerName,
          email: options.customerEmail,
          contact: options.customerPhone,
        },
        theme: {
          color: "#ef4444",
        },
        handler: async (response) => {
          // Step 4: Verify payment
          try {
            const verifyResponse = await fetch("/api/razorpay/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            if (!verifyResponse.ok) {
              throw new Error("Payment verification failed");
            }

            // Update payment in Convex
            await verifyPaymentMutation({
              paymentId,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            options.onSuccess(paymentId);
          } catch (error) {
            await failPaymentMutation({
              paymentId,
              failureReason: error instanceof Error ? error.message : "Verification failed",
            });
            options.onFailure?.(error instanceof Error ? error.message : "Payment verification failed");
          } finally {
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: async () => {
            await failPaymentMutation({
              paymentId,
              failureReason: "Payment cancelled by user",
            });
            options.onFailure?.("Payment cancelled");
            setIsProcessing(false);
          },
        },
      });
    } catch (error) {
      console.error("Payment initiation failed:", error);
      options.onFailure?.(error instanceof Error ? error.message : "Payment failed");
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    initiatePayment,
  };
}