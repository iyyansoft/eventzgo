"use client";

import React from "react";

type BankDetails = {
	accountHolderName?: string;
	accountNumber?: string;
	ifscCode?: string;
	bankName?: string;
	branchName?: string;
};

type BankDetailsFormProps = {
	bankDetails?: BankDetails;
	initialData?: BankDetails;
	organiserId?: string;
	onChange?: (updated: BankDetails) => void;
};

export default function BankDetailsForm({ bankDetails, initialData, organiserId, onChange }: BankDetailsFormProps) {
	return (
		<div className="bg-white rounded-xl p-4 shadow-sm">
			<h3 className="text-lg font-medium mb-2">Bank Details</h3>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
				<input
					className="border rounded p-2"
					placeholder="Account Holder Name"
					defaultValue={initialData?.accountHolderName ?? bankDetails?.accountHolderName}
				/>
				<input
					className="border rounded p-2"
					placeholder="Account Number"
					defaultValue={initialData?.accountNumber ?? bankDetails?.accountNumber}
				/>
				<input
					className="border rounded p-2"
					placeholder="IFSC Code"
					defaultValue={initialData?.ifscCode ?? bankDetails?.ifscCode}
				/>
				<input
					className="border rounded p-2"
					placeholder="Bank Name"
					defaultValue={initialData?.bankName ?? bankDetails?.bankName}
				/>
				<input
					className="border rounded p-2"
					placeholder="Branch Name"
					defaultValue={initialData?.branchName ?? bankDetails?.branchName}
				/>
			</div>
			<div className="mt-3">
				<button type="button" className="px-4 py-2 rounded bg-purple-600 text-white">Save</button>
			</div>
		</div>
	);
}
