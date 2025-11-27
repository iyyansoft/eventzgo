export const formatEventDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatEventTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export const formatShortDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const formatShortTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export const getEventDuration = (start: number, end: number): string => {
  const durationMs = end - start;
  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${minutes}m`;
  }
};

export const isEventUpcoming = (startTimestamp: number): boolean => {
  return startTimestamp > Date.now();
};

export const isEventLive = (
  startTimestamp: number,
  endTimestamp: number
): boolean => {
  const now = Date.now();
  return now >= startTimestamp && now <= endTimestamp;
};

export const isEventPast = (endTimestamp: number): boolean => {
  return endTimestamp < Date.now();
};

export const getEventStatus = (
  startTimestamp: number,
  endTimestamp: number
): "upcoming" | "live" | "past" => {
  if (isEventLive(startTimestamp, endTimestamp)) return "live";
  if (isEventPast(endTimestamp)) return "past";
  return "upcoming";
};

export const getDaysUntilEvent = (startTimestamp: number): number => {
  const now = Date.now();
  const diffMs = startTimestamp - now;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

// Aliases for PDF generator compatibility
export const formatDate = formatShortDate;
export const formatTime = formatShortTime;