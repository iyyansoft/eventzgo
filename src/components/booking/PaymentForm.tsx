"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/currency-utils";
import { CreditCard, Lock, CheckCircle } from "lucide-react";

interface PaymentFormProps {
  amount: number;
  onSubmit: (paymentDetails: PaymentDetails) => void;
  isProcessing: boolean;
}

export interface PaymentDetails {
  cardNumber: string;
  cardHolderName: string;
  expiryDate: string;
  cvv: string;
}

export default function PaymentForm({
  amount,
  onSubmit,
  isProcessing,
}: PaymentFormProps) {
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    cardNumber: "",
    cardHolderName: "",
    expiryDate: "",
    cvv: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(paymentDetails);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(" ");
    } else {
      return value;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.slice(0, 2) + "/" + v.slice(2, 4);
    }
    return v;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <CreditCard className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Payment Details</h2>
        <p className="text-gray-600">Complete your booking securely</p>
      </div>

      {/* Amount Display */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 text-center">
        <p className="text-gray-600 mb-2">Total Amount</p>
        <p className="text-4xl font-bold text-purple-600">{formatCurrency(amount)}</p>
      </div>

      {/* Card Number */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Number
        </label>
        <div className="relative">
          <CreditCard className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={paymentDetails.cardNumber}
            onChange={(e) =>
              setPaymentDetails({
                ...paymentDetails,
                cardNumber: formatCardNumber(e.target.value),
              })
            }
            placeholder="1234 5678 9012 3456"
            maxLength={19}
            required
            className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Card Holder Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Holder Name
        </label>
        <input
          type="text"
          value={paymentDetails.cardHolderName}
          onChange={(e) =>
            setPaymentDetails({
              ...paymentDetails,
              cardHolderName: e.target.value.toUpperCase(),
            })
          }
          placeholder="JOHN DOE"
          required
          className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
        />
      </div>

      {/* Expiry and CVV */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expiry Date
          </label>
          <input
            type="text"
            value={paymentDetails.expiryDate}
            onChange={(e) =>
              setPaymentDetails({
                ...paymentDetails,
                expiryDate: formatExpiryDate(e.target.value),
              })
            }
            placeholder="MM/YY"
            maxLength={5}
            required
            className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CVV
          </label>
          <input
            type="password"
            value={paymentDetails.cvv}
            onChange={(e) =>
              setPaymentDetails({
                ...paymentDetails,
                cvv: e.target.value.replace(/\D/g, "").slice(0, 3),
              })
            }
            placeholder="123"
            maxLength={3}
            required
            className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Security Notice */}
      <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-xl">
        <Lock className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-green-800">
          <p className="font-semibold mb-1">Secure Payment</p>
          <p>Your payment information is encrypted and secure. We never store your card details.</p>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isProcessing}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
      >
        {isProcessing ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Processing Payment...</span>
          </>
        ) : (
          <>
            <CheckCircle className="w-5 h-5" />
            <span>Pay {formatCurrency(amount)}</span>
          </>
        )}
      </button>

      {/* Terms */}
      <p className="text-xs text-center text-gray-500">
        By completing this purchase, you agree to our{" "}
        <a href="/terms" className="text-purple-600 hover:underline">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="/privacy" className="text-purple-600 hover:underline">
          Privacy Policy
        </a>
      </p>
    </form>
  );
}