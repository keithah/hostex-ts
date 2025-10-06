/**
 * Hostex API Types
 * Based on Hostex API v3.0.0 (Beta)
 */

export interface HostexAPIResponse<T = any> {
  request_id: string;
  error_code: number;
  error_msg: string;
  data?: T;
}

export interface Property {
  id: number;
  title: string;
  address?: string;
  longitude?: string;
  latitude?: string;
  channels: Channel[];
}

export interface Channel {
  channel_type: string;
  listing_id: string;
}

export interface RoomType {
  id: number;
  title: string;
  properties: Property[];
  channels: Channel[];
}

export type ReservationStatus =
  | 'wait_accept'
  | 'wait_pay'
  | 'accepted'
  | 'cancelled'
  | 'denied'
  | 'timeout';

export interface Reservation {
  reservation_code: string;
  stay_code: string;
  property_id: number;
  channel_type: string;
  status: ReservationStatus;
  check_in_date: string;
  check_out_date: string;
  guest_name?: string;
  email?: string;
  mobile?: string;
  number_of_guests?: number;
  currency?: string;
  rate_amount?: number;
  commission_amount?: number;
  received_amount?: number;
  booked_at?: string;
}

export interface CreateReservationData {
  property_id: string;
  custom_channel_id: number;
  check_in_date: string;
  check_out_date: string;
  guest_name: string;
  currency: string;
  rate_amount: number;
  commission_amount: number;
  received_amount: number;
  income_method_id: number;
  number_of_guests?: number;
  email?: string;
  mobile?: string;
  remarks?: string;
}

export interface Availability {
  date: string;
  available: boolean;
}

export interface Listing {
  id: number;
  channel_type: string;
  listing_id: string;
  availabilities?: Availability[];
  calendar?: CalendarDay[];
}

export interface CalendarDay {
  date: string;
  price?: number;
  inventory?: number;
  available?: boolean;
  min_stay?: number;
  max_stay?: number;
  closed_to_arrival?: boolean;
  closed_to_departure?: boolean;
}

export interface Conversation {
  id: string;
  channel_type: string;
  guest: {
    name?: string;
    email?: string;
    mobile?: string;
  };
  property_id?: number;
  property_title?: string;
  check_in_date?: string;
  check_out_date?: string;
  last_message_at?: string;
  unread_count?: number;
}

export interface Message {
  id: string;
  sender_role: 'host' | 'guest';
  content: string;
  created_at: string;
  image_url?: string;
}

export interface Review {
  reservation_code: string;
  property_id: number;
  channel_type: string;
  check_out_date: string;
  review_status: string;
  host_review?: {
    score?: number;
    content?: string;
    created_at?: string;
  };
  guest_review?: {
    score?: number;
    content?: string;
    created_at?: string;
  };
  host_reply?: {
    content?: string;
    created_at?: string;
  };
}

export interface Webhook {
  id: number;
  url: string;
  manageable: boolean;
  created_at: string;
}

export interface CustomChannel {
  id: number;
  name: string;
}

export interface IncomeMethod {
  id: number;
  name: string;
}

export interface ListPropertiesParams {
  offset?: number;
  limit?: number;
  id?: number;
}

export interface ListRoomTypesParams {
  offset?: number;
  limit?: number;
}

export interface ListReservationsParams {
  reservation_code?: string;
  property_id?: number;
  status?: ReservationStatus;
  start_check_in_date?: string;
  end_check_in_date?: string;
  start_check_out_date?: string;
  end_check_out_date?: string;
  order_by?: string;
  offset?: number;
  limit?: number;
}

export interface ListAvailabilitiesParams {
  property_ids: string;
  start_date: string;
  end_date: string;
}

export interface UpdateAvailabilitiesData {
  property_ids: number[];
  start_date?: string;
  end_date?: string;
  dates?: string[];
  available: boolean;
}

export interface GetListingCalendarData {
  start_date: string;
  end_date: string;
  listings: Array<{
    channel_type: string;
    listing_id: string;
  }>;
}

export interface UpdateListingPricesData {
  channel_type: string;
  listing_id: string;
  prices: Array<{
    date: string;
    price: number;
  }>;
}

export interface UpdateListingInventoriesData {
  channel_type: string;
  listing_id: string;
  inventories: Array<{
    date: string;
    inventory: number;
  }>;
}

export interface UpdateListingRestrictionsData {
  channel_type: string;
  listing_id: string;
  restrictions: Array<{
    date: string;
    min_stay?: number;
    max_stay?: number;
    closed_to_arrival?: boolean;
    closed_to_departure?: boolean;
  }>;
}

export interface ListConversationsParams {
  offset?: number;
  limit?: number;
}

export interface SendMessageData {
  message?: string;
  jpeg_base64?: string;
}

export interface ListReviewsParams {
  reservation_code?: string;
  property_id?: number;
  review_status?: string;
  start_check_out_date?: string;
  end_check_out_date?: string;
  offset?: number;
  limit?: number;
}

export interface CreateReviewData {
  host_review_score?: number;
  host_review_content?: string;
  host_reply_content?: string;
}

export interface PostGuestReviewData {
  reservation_order_code: string;
  content: string;
  category_ratings: {
    recommend: 0 | 1;
    overall_rating: 1 | 2 | 3 | 4 | 5;
    cleanliness: 1 | 2 | 3 | 4 | 5;
    cleanliness_content?: string;
    respect_of_house_rules: 1 | 2 | 3 | 4 | 5;
    respect_house_rules_content?: string;
    communication: 1 | 2 | 3 | 4 | 5;
    communication_content?: string;
  };
}

export interface LoginData {
  account: string;
  password: string;
  image_code?: string;
  dynamic_code?: string;
  login_type?: 'password' | 'code';
  locale?: string;
}