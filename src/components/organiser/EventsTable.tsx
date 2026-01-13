"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Eye, Edit, Trash2, Calendar, MapPin, Users } from "lucide-react";

interface Event {
	_id: string;
	title: string;
	description: string;
	category: string;
	bannerImage: string;
	venue: string | {
		name: string;
		city: string;
		state: string;
	};
	dateTime: {
		start: number;
		end: number;
	};
	status: string;
	totalCapacity: number;
	soldTickets: number;
}

interface EventsTableProps {
	events: Event[];
}

const EventsTable: React.FC<EventsTableProps> = ({ events = [] }) => {
	const router = useRouter();

	const getStatusColor = (status: string) => {
		switch (status) {
			case "approved":
			case "published":
				return "bg-green-100 text-green-800";
			case "pending":
				return "bg-yellow-100 text-yellow-800";
			case "draft":
				return "bg-gray-100 text-gray-800";
			case "rejected":
				return "bg-red-100 text-red-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	const formatDate = (timestamp: number) => {
		return new Date(timestamp).toLocaleDateString("en-IN", {
			day: "numeric",
			month: "short",
			year: "numeric",
		});
	};

	return (
		<div className="overflow-x-auto">
			<table className="w-full">
				<thead className="bg-gray-50 border-b border-gray-200">
					<tr>
						<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
							Event
						</th>
						<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
							Date
						</th>
						<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
							Location
						</th>
						<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
							Tickets
						</th>
						<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
							Status
						</th>
						<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
							Actions
						</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-gray-200">
					{events.map((event) => (
						<tr
							key={event._id}
							className="hover:bg-gray-50 transition-colors"
						>
							{/* Event Info */}
							<td className="px-6 py-4">
								<div className="flex items-center space-x-3">
									<img
										src={event.bannerImage}
										alt={event.title}
										className="w-16 h-16 rounded-lg object-cover"
										onError={(e) => {
											e.currentTarget.src = "https://via.placeholder.com/64";
										}}
									/>
									<div>
										<div className="font-semibold text-gray-900">
											{event.title}
										</div>
										<div className="text-sm text-gray-500">
											{event.category}
										</div>
									</div>
								</div>
							</td>

							{/* Date */}
							<td className="px-6 py-4">
								<div className="flex items-center gap-2 text-sm text-gray-700">
									<Calendar className="w-4 h-4 text-gray-400" />
									<span>{formatDate(event.dateTime.start)}</span>
								</div>
							</td>

							{/* Location */}
							<td className="px-6 py-4">
								<div className="flex items-center gap-2 text-sm text-gray-700">
									<MapPin className="w-4 h-4 text-gray-400" />
									<span>
										{typeof event.venue === 'string' ? event.venue : `${event.venue.city}, ${event.venue.state}`}
									</span>
								</div>
							</td>

							{/* Tickets */}
							<td className="px-6 py-4">
								<div className="flex items-center gap-2 text-sm">
									<Users className="w-4 h-4 text-gray-400" />
									<span className="text-gray-700">
										{event.soldTickets}/{event.totalCapacity}
									</span>
								</div>
								<div className="text-xs text-gray-500 mt-1">
									{Math.round((event.soldTickets / event.totalCapacity) * 100)}%
									sold
								</div>
							</td>

							{/* Status */}
							{/* Status */}
							<td className="px-6 py-4">
								{(() => {
									const isCompleted = event.dateTime.end < Date.now();
									const displayStatus =
										event.status === "cancelled" ? "Cancelled" :
											event.status === "rejected" ? "Rejected" :
												event.status === "draft" ? "Draft" :
													isCompleted ? "Completed" :
														event.status.charAt(0).toUpperCase() + event.status.slice(1);

									let colorClass = "bg-gray-100 text-gray-800";
									if (displayStatus === "Published" || displayStatus === "Approved") colorClass = "bg-green-100 text-green-800";
									else if (displayStatus === "Pending") colorClass = "bg-yellow-100 text-yellow-800";
									else if (displayStatus === "Rejected" || displayStatus === "Cancelled") colorClass = "bg-red-100 text-red-800";
									else if (displayStatus === "Completed") colorClass = "bg-blue-50 text-blue-600 border border-blue-100";

									return (
										<span
											className={`px-3 py-1 rounded-full text-xs font-medium ${colorClass}`}
										>
											{displayStatus}
										</span>
									);
								})()}
							</td>

							{/* Actions */}
							<td className="px-6 py-4">
								<div className="flex items-center gap-2">
									<button
										onClick={() =>
											router.push(`/management/organiser/events/${event._id}`)
										}
										className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
										title="View Event"
									>
										<Eye className="w-4 h-4" />
									</button>
									<button
										onClick={() =>
											router.push(`/management/organiser/events/${event._id}/edit`)
										}
										className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
										title="Edit Event"
									>
										<Edit className="w-4 h-4" />
									</button>
									<button
										onClick={() => {
											if (
												confirm(
													"Are you sure you want to delete this event? This action cannot be undone."
												)
											) {
												// TODO: Implement delete functionality
												alert("Delete functionality will be implemented soon");
											}
										}}
										className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
										title="Delete Event"
									>
										<Trash2 className="w-4 h-4" />
									</button>
								</div>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

export default EventsTable;
