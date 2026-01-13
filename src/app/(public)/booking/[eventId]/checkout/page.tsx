"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/useAuth";
import {
  ArrowLeft,
  Loader2,
  Calendar,
  Clock,
  MapPin,
  User,
  Mail,
  Phone,
  ShieldCheck,
  CreditCard,
} from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import StepIndicator from "@/components/booking/StepIndicator";
import CustomFormFields from "@/components/booking/CustomFormFields";
import Image from "next/image";

interface CheckoutPageProps {
  params: Promise<{
    eventId: string;
  }>;
}

const steps = [
  { number: 1, label: "Details" },
  { number: 2, label: "Payment" },
  { number: 3, label: "Confirmation" },
];

export default function CheckoutPage(props: CheckoutPageProps) {
  const router = useRouter();
  const params = use(props.params);
  const eventId = params.eventId as Id<"events">;

  const { isSignedIn, user, convexUser } = useAuth();

  // Booking flow state
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [bookingData, setBookingData] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isLoadingUser, setIsLoadingUser] = useState<boolean>(true);

  // Contact Details
  const [contactDetails, setContactDetails] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // Custom form responses
  const [customFormValues, setCustomFormValues] = useState<{
    [key: string]: string;
  }>({});
  const [customFormErrors, setCustomFormErrors] = useState<{
    [key: string]: string;
  }>({});

  const createBooking = useMutation(api.bookings.createBooking);
  const createPayment = useMutation(api.payments.createPayment);
  const syncUser = useMutation(api.users.syncUser);

  // Fetch event to get custom fields
  const event = useQuery(api.events.getEventById, { eventId });

  // Fetch organizer details
  const organizer = useQuery(
    api.organisers.getOrganiserById,
    event?.organiserId ? { organiserId: event.organiserId } : "skip"
  );

  useEffect(() => {
    // Get booking data from session storage
    const data = sessionStorage.getItem("bookingData");
    if (data) {
      const parsed = JSON.parse(data);
      console.log("Loaded booking data:", parsed);

      // Patch for legacy data: Calculate split GST if missing
      if (parsed.pricing && parsed.pricing.ticketGst === undefined) {
        // Default 18% GST if not pre-calculated
        const subtotal = parsed.pricing.subtotal || 0;
        const platformFee = parsed.pricing.platformFeeAmount || 0;
        parsed.pricing.ticketGst = (subtotal * 18) / 100;
        parsed.pricing.platformFeeGst = (platformFee * 18) / 100;
      }

      setBookingData(parsed);
    } else {
      console.error("No booking data found");
      router.push("/");
    }

    // Pre-fill user details if signed in
    if (user) {
      // Clean phone number - remove any non-numeric characters except +
      let phone = user.primaryPhoneNumber?.phoneNumber || "";
      phone = phone.replace(/[^0-9+]/g, '');

      setContactDetails({
        name: user.fullName || "",
        email: user.primaryEmailAddress?.emailAddress || "",
        phone: phone,
      });
    }
  }, [router, user]);

  // Track convexUser loading
  useEffect(() => {
    if (isSignedIn && convexUser) {
      setIsLoadingUser(false);
    } else if (isSignedIn && !convexUser) {
      // Give it some time to load
      const timer = setTimeout(() => {
        setIsLoadingUser(false);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setIsLoadingUser(false);
    }
  }, [isSignedIn, convexUser]);

  const validateStep1 = () => {
    if (!contactDetails.name.trim()) {
      alert("Please enter your name");
      return false;
    }
    if (!contactDetails.email.trim() || !contactDetails.email.includes("@")) {
      alert("Please enter a valid email");
      return false;
    }
    // Remove all non-numeric characters for validation
    const phoneDigits = contactDetails.phone.replace(/[^0-9]/g, '');
    if (!phoneDigits || phoneDigits.length < 10) {
      alert("Please enter a valid 10-digit phone number");
      return false;
    }

    // Validate custom fields
    if (event?.customFields) {
      const errors: { [key: string]: string } = {};
      let hasErrors = false;

      event.customFields.forEach((field) => {
        if (field.required && !customFormValues[field.id]?.trim()) {
          errors[field.id] = `${field.label} is required`;
          hasErrors = true;
        }
      });

      setCustomFormErrors(errors);
      if (hasErrors) {
        return false;
      }
    }

    return true;
  };

  const handleProceedToPayment = () => {
    console.log("Proceeding to payment...");
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handlePayment = async () => {
    console.log("=== RAZORPAY PAYMENT FLOW STARTED ===");
    console.log("Is Signed In:", isSignedIn);
    console.log("User:", user);
    console.log("Convex User:", convexUser);

    // Check if booking data exists
    if (!bookingData) {
      alert("Booking data not found. Please try again.");
      router.push(`/events/${eventId}`);
      return;
    }

    // For authenticated users, wait for convexUser to load
    if (isSignedIn && !convexUser) {
      console.log("Convex user not loaded, attempting to sync...");
      setIsProcessing(true);
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (!convexUser) {
        setIsProcessing(false);
        alert("User data is still loading. Please wait a moment and try again.");
        window.location.reload();
        return;
      }
    }

    setIsProcessing(true);

    try {
      // Generate booking number
      const bookingNumber = `TH${Date.now()}${Math.floor(Math.random() * 1000)}`;
      console.log("📝 Booking Number:", bookingNumber);

      // Step 1: Create Razorpay Order
      console.log("💳 Creating Razorpay order...");
      const orderResponse = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(bookingData.pricing.grandTotal),
          currency: "INR",
          receipt: bookingNumber,
          notes: {
            eventId: bookingData.eventId,
            eventTitle: event?.title || "Event",
            userId: convexUser?._id || "guest",
            guestEmail: !convexUser ? contactDetails.email : undefined,
          },
        }),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json().catch(() => ({ error: "Unknown error" }));
        console.error("❌ Razorpay order creation failed:", {
          status: orderResponse.status,
          statusText: orderResponse.statusText,
          error: errorData,
        });
        throw new Error(`Failed to create Razorpay order: ${errorData.error || errorData.message || orderResponse.statusText}`);
      }

      const orderData = await orderResponse.json();
      console.log("✅ Razorpay order created:", orderData.id);

      // Step 2: Load Razorpay script
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);

      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
      });

      // Step 3: Open Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "TicketsHub",
        description: event?.title || "Event Booking",
        order_id: orderData.id,
        prefill: {
          name: contactDetails.name,
          email: contactDetails.email,
          contact: contactDetails.phone,
        },
        theme: {
          color: "#9333EA", // Purple color
        },
        handler: async (response: any) => {
          try {
            console.log("💰 Payment successful, verifying...");

            // Step 4: Verify payment
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

            console.log("✅ Payment verified successfully");

            // Step 5: Create payment record in Convex
            const paymentId = await createPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              amount: Number(bookingData.pricing.grandTotal),
              currency: "INR",
              eventId: bookingData.eventId,
              userId: convexUser?._id,  // Optional for guests
              status: "captured",
            });

            console.log("✅ Payment record created:", paymentId);

            // Step 6: Prepare tickets
            const tickets = Object.entries(bookingData.selectedTickets).map(
              ([ticketId, quantity]: [string, any]) => {
                const ticketType = bookingData.ticketTypes?.find(
                  (t: any) => t.id === ticketId
                );
                return {
                  ticketTypeId: ticketId,
                  ticketTypeName: ticketType?.name || "Unknown",
                  quantity: Number(quantity),
                  price: Number(ticketType?.price || 0),
                };
              }
            );

            // Step 7: Prepare custom field responses
            const customFieldResponses = event?.customFields
              ? event.customFields.map((field) => ({
                fieldId: field.id,
                label: field.label,
                value: customFormValues[field.id] || "",
              }))
              : undefined;

            // Step 8: Create booking
            console.log("📋 Creating booking...");
            console.log("🔍 User info:", {
              isSignedIn,
              hasConvexUser: !!convexUser,
              convexUserId: convexUser?._id,
              email: contactDetails.email,
            });

            const bookingId = await createBooking({
              bookingNumber,
              eventId: bookingData.eventId,
              userId: convexUser?._id,  // Set if user exists in Convex
              guestDetails: {  // ALWAYS include so booking can be matched by email
                name: contactDetails.name,
                email: contactDetails.email,
                phone: contactDetails.phone,
              },
              tickets,
              totalAmount: Number(bookingData.pricing.grandTotal),
              pricing: {
                subtotal: Number(bookingData.pricing.subtotal),
                gst: Number(bookingData.pricing.gstAmount),
                platformFee: Number(bookingData.pricing.platformFeeAmount),
                total: Number(bookingData.pricing.grandTotal),
                ticketGst: Number(bookingData.pricing.ticketGst),
                platformFeeGst: Number(bookingData.pricing.platformFeeGst),
              },
              paymentId,
              customFieldResponses,
            });

            console.log("✅ Booking created successfully! ID:", bookingId);

            // Clear session storage
            sessionStorage.removeItem("bookingData");

            // Show success step
            setCurrentStep(3);

            // Redirect to confirmation
            setTimeout(() => {
              router.push(`/booking/confirmation/${bookingId}`);
            }, 1500);
          } catch (error: any) {
            console.error("❌ Post-payment error:", error);
            setIsProcessing(false);
            alert(`Error: ${error.message || "Failed to complete booking"}`);
          }
        },
        modal: {
          ondismiss: () => {
            console.log("⚠️ Payment cancelled by user");
            setIsProcessing(false);
            alert("Payment cancelled. Please try again.");
          },
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      console.error("❌ Payment error:", error);
      setIsProcessing(false);
      alert(`Payment Error: ${error.message || "Failed to initiate payment"}`);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Loading state
  if (!bookingData || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 pt-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Book Tickets</h1>
        </div>

        {/* Step Indicator */}
        <StepIndicator currentStep={currentStep} steps={steps} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Details */}
            {currentStep === 1 && (
              <>
                {/* Event Details Card */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Event Details
                  </h2>
                  <div className="flex items-start space-x-4">
                    <Image
                      src={event.bannerImage}
                      alt={event.title}
                      width={100}
                      height={100}
                      className="w-24 h-24 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900 mb-2">
                        {event.title}
                      </h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(event.dateTime.start)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>{formatTime(event.dateTime.start)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4" />
                          <span>
                            {typeof event.venue === 'string'
                              ? event.venue
                              : `${event.venue.name}, ${event.venue.city}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Organizer Information */}
                {organizer && (
                  <div className="bg-white rounded-2xl p-6 shadow-sm mt-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                      Event Organizer
                    </h2>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-xl">
                            {organizer.institutionName.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-lg text-gray-900">
                            {organizer.institutionName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {organizer.address.city}, {organizer.address.state}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">GST Number</span>
                          <span className="text-sm font-mono text-gray-900">
                            {organizer.gstNumber}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Status</span>
                          <span className="inline-flex px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                            ✓ Verified
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Contact Details */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Contact Details
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                        <User className="w-4 h-4" />
                        <span>Full Name</span>
                      </label>
                      <input
                        type="text"
                        value={contactDetails.name}
                        onChange={(e) =>
                          setContactDetails({
                            ...contactDetails,
                            name: e.target.value,
                          })
                        }
                        placeholder="John Doe"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                          <Phone className="w-4 h-4" />
                          <span>Phone Number</span>
                        </label>
                        <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-transparent">
                          <span className="px-4 py-3 bg-gray-50 text-gray-600 border-r border-gray-300">
                            +91
                          </span>
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={contactDetails.phone.replace('+91', '')}
                            onChange={(e) => {
                              // Allow only numbers and limit to 10 digits
                              const value = e.target.value.replace(/[^0-9]/g, '');
                              if (value.length <= 10) {
                                setContactDetails({
                                  ...contactDetails,
                                  phone: '+91' + value,
                                });
                              }
                            }}
                            onKeyPress={(e) => {
                              // Allow only numbers
                              if (!/[0-9]/.test(e.key)) {
                                e.preventDefault();
                              }
                            }}
                            placeholder="9876543210"
                            maxLength={10}
                            className="flex-1 px-4 py-3 border-0 rounded-r-lg focus:outline-none"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Enter 10-digit mobile number
                        </p>
                      </div>

                      <div>
                        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                          <Mail className="w-4 h-4" />
                          <span>Email Address</span>
                        </label>
                        <input
                          type="email"
                          value={contactDetails.email}
                          onChange={(e) =>
                            setContactDetails({
                              ...contactDetails,
                              email: e.target.value,
                            })
                          }
                          placeholder="demo@ticketshub.com"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <p className="text-xs text-gray-500">
                      Tickets will be sent to this email address
                    </p>

                    {/* Guest Checkout Info */}
                    {!isSignedIn && (
                      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>📧 Booking as Guest:</strong> Your tickets will be sent to your email.
                          You can create an account later to view all your bookings in one place!
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Custom Fields */}
                {event.customFields && event.customFields.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                      Additional Information
                    </h2>
                    <CustomFormFields
                      fields={event.customFields}
                      values={customFormValues}
                      onChange={(fieldId, value) =>
                        setCustomFormValues({
                          ...customFormValues,
                          [fieldId]: value,
                        })
                      }
                      errors={customFormErrors}
                    />
                  </div>
                )}
              </>
            )}

            {/* Step 2: Payment */}
            {currentStep === 2 && (
              <>
                {/* Payment Method */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Payment Method
                  </h2>
                  <div className="border-2 border-purple-200 rounded-xl p-4 bg-purple-50">
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        id="razorpay"
                        checked
                        readOnly
                        className="w-5 h-5 text-purple-600"
                      />
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded">
                          <CreditCard className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            Razorpay
                          </p>
                          <p className="text-sm text-gray-600">
                            Credit/Debit Card, UPI, Net Banking, Wallets
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Secure Payment Info */}
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <ShieldCheck className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-green-900 mb-1">
                        Secure Payment
                      </p>
                      <p className="text-sm text-green-700">
                        Your payment information is encrypted and secure.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Step 3: Processing */}
            {currentStep === 3 && (
              <div className="bg-white rounded-2xl p-12 shadow-sm text-center">
                <Loader2 className="w-16 h-16 text-purple-600 animate-spin mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Processing Your Booking...
                </h2>
                <p className="text-gray-600">
                  Please wait while we confirm your tickets
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Booking Summary
              </h3>

              <div className="space-y-3 mb-6">
                {Object.entries(bookingData.selectedTickets).map(
                  ([ticketId, quantity]: [string, any]) => {
                    const ticketType = bookingData.ticketTypes?.find(
                      (t: any) => t.id === ticketId
                    );
                    if (!ticketType) return null;

                    return (
                      <div
                        key={ticketId}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-gray-600">
                          Tickets ({quantity}x)
                        </span>
                        <span className="font-medium text-gray-900">
                          ₹
                          {(ticketType.price * quantity).toLocaleString(
                            "en-IN"
                          )}
                        </span>
                      </div>
                    );
                  }
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Ticket GST (18%)</span>
                  <span className="font-medium text-gray-900">
                    ₹{bookingData.pricing.ticketGst.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Platform Fee</span>
                  <span className="font-medium text-gray-900">
                    ₹
                    {bookingData.pricing.platformFeeAmount.toLocaleString(
                      "en-IN"
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Platform GST (18%)</span>
                  <span className="font-medium text-gray-900">
                    ₹{bookingData.pricing.platformFeeGst.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">
                    Total Amount
                  </span>
                  <span className="text-2xl font-bold text-purple-600">
                    ₹{bookingData.pricing.grandTotal.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              {currentStep === 1 && (
                <button
                  onClick={handleProceedToPayment}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg"
                >
                  Proceed to Payment
                </button>
              )}

              {currentStep === 2 && (
                <>
                  <button
                    onClick={handlePayment}
                    disabled={isProcessing || (isSignedIn && !convexUser)}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (isSignedIn && !convexUser) ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Loading user data...</span>
                      </>
                    ) : (
                      <span>
                        Pay ₹{bookingData.pricing.grandTotal.toLocaleString("en-IN")}
                      </span>
                    )}
                  </button>

                  {/* Show user sync message if needed */}
                  {!convexUser && isSignedIn && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-xs text-yellow-800 text-center">
                        Syncing user data... This usually takes a few seconds.
                      </p>
                    </div>
                  )}

                  {/* Manually sync user - Direct Convex call (no webhook needed) */}
                  {!convexUser && isSignedIn && (
                    <div className="mt-3">
                      <button
                        onClick={async () => {
                          if (!user) return;

                          setIsProcessing(true);
                          try {
                            console.log("Manually syncing user to Convex...");

                            // Directly call Convex mutation (no webhook needed)
                            await syncUser({
                              clerkId: user.id,
                              email: user.primaryEmailAddress?.emailAddress || "",
                              firstName: user.firstName || undefined,
                              lastName: user.lastName || undefined,
                              profileImage: user.imageUrl || undefined,
                              phone: user.primaryPhoneNumber?.phoneNumber || undefined,
                            });

                            console.log("✅ User synced successfully!");

                            // Wait a moment for the query to update
                            await new Promise(resolve => setTimeout(resolve, 1000));

                            // Reload to refresh convexUser
                            window.location.reload();
                          } catch (error) {
                            console.error('Sync error:', error);
                            alert('Failed to sync user. Please try again.');
                          } finally {
                            setIsProcessing(false);
                          }
                        }}
                        disabled={isProcessing}
                        className="w-full px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Syncing...</span>
                          </>
                        ) : (
                          <span>Sync User Data</span>
                        )}
                      </button>
                      <p className="text-xs text-yellow-600 mt-2 text-center">
                        Click here if the payment button is not working
                      </p>
                    </div>
                  )}
                </>
              )}

              <p className="text-xs text-gray-500 mt-4 text-center">
                By proceeding, you agree to our Terms & Conditions
              </p>
            </div>
          </div>
        </div >
      </div >
    </div >
  );
}
