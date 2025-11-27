import React from "react";

const PlatformStats: React.FC<{ stats?: any }> = ({ stats = {} }) => {
	return (
		<div className="p-6">
			<div className="text-sm text-gray-500">Platform stats</div>
			<div className="grid grid-cols-3 gap-4 mt-4">
				<div className="bg-white rounded-lg p-4 shadow">
					<div className="text-sm text-gray-600">Users</div>
					<div className="font-bold">{stats.users?.total ?? "-"}</div>
				</div>
				<div className="bg-white rounded-lg p-4 shadow">
					<div className="text-sm text-gray-600">Events</div>
					<div className="font-bold">{stats.events?.total ?? "-"}</div>
				</div>
				<div className="bg-white rounded-lg p-4 shadow">
					<div className="text-sm text-gray-600">Bookings</div>
					<div className="font-bold">{stats.bookings?.total ?? "-"}</div>
				</div>
			</div>
		</div>
	);
};

export default PlatformStats;
