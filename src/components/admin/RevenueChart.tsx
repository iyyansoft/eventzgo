import React from "react";

interface DataPoint {
	date: string;
	amount: number;
}

const RevenueChart: React.FC<{ data?: DataPoint[] }> = ({ data = [] }) => {
	return (
		<div className="p-6">
			<div className="text-sm text-gray-500">Revenue chart placeholder</div>
			<div className="w-full h-48 bg-gray-100 rounded-lg mt-4 flex items-center justify-center">
				<span className="text-sm text-gray-400">{data.length ? `${data.length} points` : "No data"}</span>
			</div>
		</div>
	);
};

export default RevenueChart;
