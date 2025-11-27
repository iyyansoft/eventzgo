"use client";

import React from "react";

type RefundRequestProps = {
  refund?: any;
  onApprove?: () => void;
  onReject?: () => void;
};

export default function RefundRequest({ refund, onApprove, onReject }: RefundRequestProps) {
  return (
    <div className="rounded-md border p-4 bg-white">
      <h3 className="text-lg font-medium">Refund Request</h3>
      <p className="text-sm text-muted-foreground">{refund?.id ?? "No refund data provided."}</p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={onApprove}
          className="px-3 py-1 rounded bg-green-600 text-white text-sm"
        >
          Approve
        </button>
        <button
          type="button"
          onClick={onReject}
          className="px-3 py-1 rounded bg-red-600 text-white text-sm"
        >
          Reject
        </button>
      </div>
    </div>
  );
}
