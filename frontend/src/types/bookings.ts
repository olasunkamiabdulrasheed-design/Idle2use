export interface Booking {
  id: number;
  request: number;
  resource: number;
  resource_name: string;
  requester: number;
  requester_username: string;
  provider: number;
  provider_username: string;
  date: string;
  start_time: string;
  end_time: string;
  agreed_price: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: number;
  booking: number;
  reviewer: number;
  reviewer_username: string;
  reviewee: number;
  reviewee_username: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface BookingPayload {
  request: number;
  resource: number;
  date?: string;
  start_time?: string;
  end_time?: string;
  agreed_price?: string;
}

export interface DashboardStats {
  active_requests: number;
  new_matches: number;
  incoming_matches: number;
  unread_messages: number;
  upcoming_bookings: number;
  provider_bookings: number;
  unread_notifications: number;
  my_resources: number;
  conversations: number;
}
