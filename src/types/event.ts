export interface Event {
    _id: string;
    organiserId: string;
    title: string;
    description: string;
    category: string;
    tags: string[];
    bannerImage: string;
    venue: {
      name: string;
      address: string;
      city: string;
      state: string;
      pincode: string;
      coordinates?: {
        lat: number;
        lng: number;
      };
    };
    dateTime: {
      start: number;
      end: number;
    };
    ticketTypes: TicketType[];
    totalCapacity: number;
    soldTickets: number;
    pricing: {
      basePrice: number;
      gst: number;
      platformFee: number;
      totalPrice: number;
    };
    status: "draft" | "pending" | "approved" | "rejected" | "published" | "cancelled";
    approvedBy?: string;
    approvedAt?: number;
    rejectionReason?: string;
    isFeatured: boolean;
    isActive: boolean;
    createdAt: number;
    updatedAt: number;
  }
  
  export interface TicketType {
    id: string;
    name: string;
    price: number;
    quantity: number;
    sold: number;
    description?: string;
  }
  
  export interface EventFilters {
    category?: string;
    state?: string;
    city?: string;
    status?: Event["status"];
    isFeatured?: boolean;
    dateRange?: {
      start: number;
      end: number;
    };
    priceRange?: {
      min: number;
      max: number;
    };
    searchTerm?: string;
  }
  
  export interface EventFormData {
    title: string;
    description: string;
    category: string;
    tags: string[];
    bannerImage: File | string;
    venue: {
      name: string;
      address: string;
      city: string;
      state: string;
      pincode: string;
    };
    dateTime: {
      start: Date;
      end: Date;
    };
    ticketTypes: Omit<TicketType, "sold">[];
  }