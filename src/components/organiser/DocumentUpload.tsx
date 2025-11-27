"use client";

import React from "react";

type DocumentUploadProps = {
	onUpload?: (url: string) => void;
	label?: string;
	documents?: any;
	organiserId?: string;
};

export default function DocumentUpload({ onUpload, label, documents, organiserId }: DocumentUploadProps) {
	return (
		<div className="bg-white rounded-xl p-4 shadow-sm">
			<h3 className="text-lg font-medium mb-2">{label ?? "Upload Document"}</h3>
			<input type="file" className="block" />
			<p className="text-sm text-gray-500 mt-2">Supported formats: PDF, JPG, PNG</p>
			{documents && (
				<div className="mt-3 space-y-2">
					{Object.entries(documents).map(([key, url]: any) => (
						<div key={key} className="text-sm">
							<strong>{key}:</strong> <a href={url as string} className="text-purple-600">View</a>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
