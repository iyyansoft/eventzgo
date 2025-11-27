import React from "react";
import { Payout } from "@/types";
import { formatCurrency } from "@/lib/currency-utils";

interface Props {
  payout?: Payout;
  title?: string;
  amount?: number;
  subtitle?: string;
  status?: string;
}

const PayoutCard: React.FC<Props> = ({ payout, title, amount, subtitle, status }) => {
  const displayAmount = payout ? payout.amount : amount;
  const displayStatus = payout ? payout.status : status;

  return (
    <div className="p-4 border-b flex items-center justify-between">
      <div>
        <div className="text-sm text-gray-600">{title || "Payout"}</div>
        <div className="font-semibold">{formatCurrency(displayAmount || 0)}</div>
        {subtitle && <div className="text-sm text-gray-500">{subtitle}</div>}
      </div>
      <div className="text-sm text-gray-500">Status: {displayStatus}</div>
    </div>
  );
};

export default PayoutCard;
