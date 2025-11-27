import React from "react";

const EventsTable: React.FC<{ events?: any[] }> = ({ events = [] }) => {
	return (
		<div className="p-6">
			<div className="text-sm text-gray-500">Events table placeholder</div>
			<div className="mt-4 space-y-2">
				{events.length === 0 ? (
					<div className="text-gray-400">No events</div>
				) : (
					events.map((e, i) => (
						<div key={i} className="p-3 bg-white rounded shadow">{e.title ?? `Event ${i+1}`}</div>
					))
				)}
			</div>
		</div>
	);
};

export default EventsTable;
