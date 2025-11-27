export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
  }
  
  export interface PaginatedResponse<T = any> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  }
  
  export interface RazorpayOrderResponse {
    id: string;
    entity: string;
    amount: number;
    currency: string;
    receipt: string;
    status: string;
  }
  
  export interface RazorpayPaymentVerification {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }
  
  export interface CloudinaryUploadResponse {
    url: string;
    publicId: string;
    width: number;
    height: number;
    format: string;
  }
  
  export interface EmailRequest {
    to: string;
    subject: string;
    html: string;
    from?: string;
  }
  
  export interface DashboardStats {
    users: {
      total: number;
      active: number;
      organisers: number;
      pendingOrganisers: number;
    };
    events: {
      total: number;
      approved: number;
      pending: number;
      active: number;
    };
    bookings: {
      total: number;
      confirmed: number;
      cancelled: number;
    };
    revenue: {
      total: number;
      platformFee: number;
      refunded: number;
      net: number;
    };
    payouts: {
      total: number;
      pending: number;
      completed: number;
      amount: number;
    };
    refunds: {
      total: number;
      pending: number;
      amount: number;
    };
  }