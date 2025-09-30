/**
 * Hostex API Client
 * TypeScript client library for Hostex API v3.0.0 (Beta)
 */

import {
  HostexAPIResponse,
  Property,
  RoomType,
  Reservation,
  Conversation,
  Review,
  Webhook,
  CustomChannel,
  IncomeMethod,
  ListPropertiesParams,
  ListRoomTypesParams,
  ListReservationsParams,
  CreateReservationData,
  ListAvailabilitiesParams,
  UpdateAvailabilitiesData,
  GetListingCalendarData,
  UpdateListingPricesData,
  UpdateListingInventoriesData,
  UpdateListingRestrictionsData,
  ListConversationsParams,
  SendMessageData,
  ListReviewsParams,
  CreateReviewData,
} from './types.js';
import {
  InvalidConfigError,
  TimeoutError,
  ConnectionError,
  getErrorForCode,
} from './errors.js';

export interface HostexClientConfig {
  accessToken: string;
  baseUrl?: string;
  timeout?: number;
}

export class HostexClient {
  private accessToken: string;
  private baseUrl: string;
  private timeout: number;

  constructor(config: HostexClientConfig) {
    if (!config.accessToken) {
      throw new InvalidConfigError('Hostex access token is required');
    }
    this.accessToken = config.accessToken;
    this.baseUrl = config.baseUrl || 'https://api.hostex.io/v3';
    this.timeout = config.timeout || 30000;
  }

  private async request<T>(
    method: string,
    endpoint: string,
    params?: Record<string, any>,
    body?: any
  ): Promise<HostexAPIResponse<T>> {
    const url = new URL(`${this.baseUrl}${endpoint}`);

    // Add query parameters
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const headers: Record<string, string> = {
      'Hostex-Access-Token': this.accessToken,
      'Content-Type': 'application/json',
      'User-Agent': 'hostex-ts/0.1.0',
    };

    const options: RequestInit = {
      method,
      headers,
      signal: AbortSignal.timeout(this.timeout),
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url.toString(), options);

      // Parse response
      let data: any;
      try {
        data = await response.json();
      } catch (parseError) {
        // Non-JSON response
        data = {
          error_msg: response.statusText || 'Unknown error',
          error_code: response.status
        };
      }

      // Handle successful responses
      if (response.ok && data.error_code === 200) {
        return data;
      }

      // Handle API errors
      const errorCode = data.error_code || response.status;
      const errorMsg = data.error_msg || response.statusText || 'Unknown error';
      const requestId = data.request_id;

      throw getErrorForCode(errorCode, errorMsg, {
        error_code: errorCode,
        request_id: requestId,
        response_data: data,
      });
    } catch (error) {
      // Handle timeout errors
      if (error instanceof Error && error.name === 'AbortError') {
        throw new TimeoutError(`Request timed out after ${this.timeout}ms`);
      }

      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new ConnectionError(`Connection error: ${error.message}`);
      }

      // Re-throw if already a Hostex error
      if (error instanceof Error && error.constructor.name.includes('Error')) {
        throw error;
      }

      throw new ConnectionError('Unknown error occurred');
    }
  }

  // Properties
  async listProperties(
    params?: ListPropertiesParams
  ): Promise<HostexAPIResponse<{ properties: Property[]; total: number }>> {
    return this.request('GET', '/properties', params);
  }

  // Room Types
  async listRoomTypes(
    params?: ListRoomTypesParams
  ): Promise<HostexAPIResponse<{ room_types: RoomType[]; total: number }>> {
    return this.request('GET', '/room_types', params);
  }

  // Reservations
  async listReservations(
    params?: ListReservationsParams
  ): Promise<HostexAPIResponse<{ reservations: Reservation[]; total: number }>> {
    return this.request('GET', '/reservations', params);
  }

  async createReservation(
    data: CreateReservationData
  ): Promise<HostexAPIResponse<{ reservation: Reservation }>> {
    return this.request('POST', '/reservations', undefined, data);
  }

  async cancelReservation(reservationCode: string): Promise<HostexAPIResponse> {
    return this.request('DELETE', `/reservations/${reservationCode}`);
  }

  async updateLockCode(stayCode: string, lockCode: string): Promise<HostexAPIResponse> {
    return this.request('PATCH', `/reservations/${stayCode}/check_in_details`, undefined, {
      lock_code: lockCode,
    });
  }

  async getCustomFields(
    stayCode: string
  ): Promise<HostexAPIResponse<{ custom_fields: Record<string, any> }>> {
    return this.request('GET', `/reservations/${stayCode}/custom_fields`);
  }

  async updateCustomFields(
    stayCode: string,
    customFields: Record<string, any>
  ): Promise<HostexAPIResponse> {
    return this.request('PATCH', `/reservations/${stayCode}/custom_fields`, undefined, {
      custom_fields: customFields,
    });
  }

  // Availabilities
  async listAvailabilities(
    params: ListAvailabilitiesParams
  ): Promise<HostexAPIResponse<{ listings: any[] }>> {
    return this.request('GET', '/availabilities', params);
  }

  async updateAvailabilities(data: UpdateAvailabilitiesData): Promise<HostexAPIResponse> {
    return this.request('POST', '/availabilities', undefined, data);
  }

  // Listings
  async getListingCalendar(
    data: GetListingCalendarData
  ): Promise<HostexAPIResponse<{ listings: any[] }>> {
    return this.request('POST', '/listings/calendar', undefined, data);
  }

  async updateListingPrices(data: UpdateListingPricesData): Promise<HostexAPIResponse> {
    return this.request('POST', '/listings/prices', undefined, data);
  }

  async updateListingInventories(
    data: UpdateListingInventoriesData
  ): Promise<HostexAPIResponse> {
    return this.request('POST', '/listings/inventories', undefined, data);
  }

  async updateListingRestrictions(
    data: UpdateListingRestrictionsData
  ): Promise<HostexAPIResponse> {
    return this.request('POST', '/listings/restrictions', undefined, data);
  }

  // Conversations
  async listConversations(
    params?: ListConversationsParams
  ): Promise<HostexAPIResponse<{ conversations: Conversation[]; total: number }>> {
    return this.request('GET', '/conversations', params);
  }

  async getConversation(conversationId: string): Promise<
    HostexAPIResponse<{
      guest: any;
      channel_type: string;
      messages: any[];
    }>
  > {
    return this.request('GET', `/conversations/${conversationId}`);
  }

  async sendMessage(conversationId: string, data: SendMessageData): Promise<HostexAPIResponse> {
    return this.request('POST', `/conversations/${conversationId}`, undefined, data);
  }

  // Reviews
  async listReviews(
    params?: ListReviewsParams
  ): Promise<HostexAPIResponse<{ reviews: Review[]; total: number }>> {
    return this.request('GET', '/reviews', params);
  }

  async createReview(
    reservationCode: string,
    data: CreateReviewData
  ): Promise<HostexAPIResponse> {
    return this.request('POST', `/reviews/${reservationCode}`, undefined, data);
  }

  // Webhooks
  async listWebhooks(): Promise<HostexAPIResponse<{ webhooks: Webhook[] }>> {
    return this.request('GET', '/webhooks');
  }

  async createWebhook(url: string): Promise<HostexAPIResponse<{ webhook: Webhook }>> {
    return this.request('POST', '/webhooks', undefined, { url });
  }

  async deleteWebhook(webhookId: number): Promise<HostexAPIResponse> {
    return this.request('DELETE', `/webhooks/${webhookId}`);
  }

  // Utility endpoints
  async listCustomChannels(): Promise<HostexAPIResponse<{ custom_channels: CustomChannel[] }>> {
    return this.request('GET', '/custom_channels');
  }

  async listIncomeMethods(): Promise<HostexAPIResponse<{ income_methods: IncomeMethod[] }>> {
    return this.request('GET', '/income_methods');
  }
}