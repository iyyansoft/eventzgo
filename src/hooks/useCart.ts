import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "./useAuth";

export function useCart() {
  const { userId, convexUser } = useAuth();

  // Get pending bookings (cart items) from Convex
  const pendingBookings = useQuery(
    api.bookings.getPendingBookings,
    convexUser?._id ? { userId: convexUser._id } : "skip"
  );

  const cartCount = pendingBookings?.length || 0;
  const hasItems = cartCount > 0;

  return {
    cartCount,
    hasItems,
    pendingBookings,
  };
}