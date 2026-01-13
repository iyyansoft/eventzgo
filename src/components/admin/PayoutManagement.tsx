import React from "react";
import { formatCurrency } from "@/lib/currency-utils";

interface Props {
  payout: any;
}

const PayoutManagement: React.FC<Props> = ({ payout }) => {
  return (
    <div className="p-6 flex items-center justify-between">
      <div>
        <div className="text-sm text-gray-600">Payout ID: {payout.payoutId}</div>
        <div className="text-sm text-gray-600">Organiser: {payout.organiserName}</div>
        <div className="text-sm text-gray-600">Event: {payout.eventTitle}</div>
        <div className="font-semibold text-gray-900">Amount: {formatCurrency(payout.eligibleAmount)}</div>
        <div className="text-sm text-gray-500">Status: {payout.status}</div>
      </div>
      <div>
        <button className="px-4 py-2 rounded-lg bg-purple-600 text-white">Process</button>
      </div>
    </div>
  );
};

export default PayoutManagement;
