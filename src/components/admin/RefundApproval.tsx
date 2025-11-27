import React from "react";
import { Refund } from "@/types";

interface Props {
  refund: Refund;
}

const RefundApproval: React.FC<Props> = ({ refund }) => {
  return (
    <div className="p-6 flex items-center justify-between">
      <div>
        <div className="text-sm text-gray-600">Booking ID: {refund.bookingId as any}</div>
        <div className="font-semibold text-gray-900">Amount: ₹{refund.amount}</div>
        <div className="text-sm text-gray-500">Status: {refund.status}</div>
      </div>
      <div>
        <button className="px-4 py-2 rounded-lg bg-red-600 text-white">Review</button>
      </div>
    </div>
  );
};

export default RefundApproval;
