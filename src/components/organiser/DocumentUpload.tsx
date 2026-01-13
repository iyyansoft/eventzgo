"use client";

import React, { useState } from "react";
import { Upload, Eye, RefreshCw, CheckCircle, FileText, AlertCircle, Loader2 } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

type DocumentUploadProps = {
	documents: {
		gstCertificate?: string;
		panCardFront?: string;
		panCardBack?: string;
		cancelledCheque?: string;
		bankStatement?: string;
		bankProofType?: "cheque" | "statement";
	};
	organiserId: string;
	onUpload?: (url: string) => void; // Optional fallback
	label?: string; // Optional fallback
};

export default function DocumentUpload({ documents, organiserId }: DocumentUploadProps) {
	const updateDocument = useMutation(api.organisers.updateDocument);
	const [uploading, setUploading] = useState<string | null>(null);

	const docDefinitions = [
		{ key: "gstCertificate", label: "GST Certificate", accept: ".pdf,.jpg,.png" },
		{ key: "panCardFront", label: "PAN Card (Front)", accept: ".jpg,.png" },
		{ key: "panCardBack", label: "PAN Card (Back)", accept: ".jpg,.png" },
		{
			key: documents.bankProofType === "statement" ? "bankStatement" : "cancelledCheque",
			label: documents.bankProofType === "statement" ? "Bank Statement" : "Cancelled Cheque",
			accept: documents.bankProofType === "statement" ? ".pdf" : ".jpg,.png"
		},
	];

	const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (file.size > 5 * 1024 * 1024) {
			alert("File size must be less than 5MB");
			e.target.value = "";
			return;
		}

		setUploading(fieldName);

		try {
			// 1. Upload to Cloudinary
			const fd = new FormData();
			fd.append("file", file);
			fd.append("folder", "eventzgo/documents");
			const response = await fetch("/api/upload-document", { method: "POST", body: fd });
			const result = await response.json();

			if (!result.success) {
				throw new Error(result.error || "Upload failed");
			}

			// 2. Update Convex
			await updateDocument({
				organiserId: organiserId as any,
				field: fieldName as any,
				url: result.url,
			});

			alert(`✅ ${fieldName} updated successfully! Your account is now pending approval.`);
		} catch (error: any) {
			console.error("Upload error:", error);
			alert(`Failed to upload: ${error.message}`);
		} finally {
			setUploading(null);
			e.target.value = "";
		}
	};

	return (
		<div className="space-y-6">
			<div className="bg-yellow-50 border-1-4 border-yellow-400 p-4 rounded-xl border border-yellow-200">
				<div className="flex items-start">
					<AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
					<div>
						<h4 className="text-sm font-medium text-yellow-800">Important Note</h4>
						<p className="text-sm text-yellow-700 mt-1">
							Updating any document will trigger a re-verification process.
							Your account status will change to <strong>Pending Approval</strong> until the admin reviews the new documents.
						</p>
					</div>
				</div>
			</div>

			<div className="grid md:grid-cols-2 gap-6">
				{docDefinitions.map((doc) => {
					// @ts-ignore
					const currentUrl = documents[doc.key];
					const isUploading = uploading === doc.key;

					return (
						<div key={doc.key} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
							<div className="flex justify-between items-start mb-4">
								<div className="flex items-center gap-3">
									<div className={`w-10 h-10 rounded-lg flex items-center justify-center ${currentUrl ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"}`}>
										<FileText className="w-5 h-5" />
									</div>
									<div>
										<h3 className="font-medium text-gray-900">{doc.label}</h3>
										<span className={`text-xs px-2 py-0.5 rounded-full ${currentUrl ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
											{currentUrl ? "Uploaded" : "Missing"}
										</span>
									</div>
								</div>
							</div>

							<div className="space-y-3">
								{currentUrl && (
									<a
										href={currentUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="flex items-center justify-center w-full px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 border border-gray-200 text-sm font-medium transition-colors"
									>
										<Eye className="w-4 h-4 mr-2" />
										View Document
									</a>
								)}

								<div className="relative">
									<input
										type="file"
										id={`upload-${doc.key}`}
										className="hidden"
										accept={doc.accept}
										onChange={(e) => handleFileUpload(e, doc.key)}
										disabled={!!uploading}
									/>
									<label
										htmlFor={`upload-${doc.key}`}
										className={`flex items-center justify-center w-full px-4 py-2 rounded-lg cursor-pointer text-sm font-medium transition-colors ${currentUrl
												? "bg-white text-purple-600 border border-purple-200 hover:bg-purple-50"
												: "bg-purple-600 text-white hover:bg-purple-700"
											} ${!!uploading ? "opacity-50 cursor-not-allowed" : ""}`}
									>
										{isUploading ? (
											<>
												<Loader2 className="w-4 h-4 mr-2 animate-spin" />
												Uploading...
											</>
										) : (
											<>
												{currentUrl ? <RefreshCw className="w-4 h-4 mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
												{currentUrl ? "Replace Document" : "Upload Document"}
											</>
										)}
									</label>
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
