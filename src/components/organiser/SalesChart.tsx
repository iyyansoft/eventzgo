import React from "react";

const SalesChart: React.FC<{ data?: any[] }> = ({ data = [] }) => {
	return (
		<div className="p-6">
			<div className="text-sm text-gray-500">Sales chart placeholder</div>
			<div className="w-full h-48 bg-gray-100 rounded-lg mt-4 flex items-center justify-center">
				<span className="text-sm text-gray-400">{data.length ? `${data.length} points` : "No data"}</span>
			</div>
		</div>
	);
};

export default SalesChart;
