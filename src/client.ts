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
  PostGuestReviewData,
  LoginData,
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
  webAppBaseUrl?: string;
  operatorId?: string;
  timeout?: number;
}

export class HostexClient {
  private accessToken: string;
  private baseUrl: string;
  private webAppBaseUrl: string;
  private operatorId: string;
  private timeout: number;
  private sessionCookies: string = '';

  constructor(config: HostexClientConfig) {
    if (!config.accessToken) {
      throw new InvalidConfigError('Hostex access token is required');
    }
    this.accessToken = config.accessToken;
    this.baseUrl = config.baseUrl || 'https://api.hostex.io/v3';
    this.webAppBaseUrl = config.webAppBaseUrl || 'https://hostex.io/api';
    this.operatorId = config.operatorId || '';
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

  private async webAppRequest<T>(
    method: string,
    endpoint: string,
    params?: Record<string, any>,
    body?: any,
    extractCookies: boolean = false
  ): Promise<HostexAPIResponse<T>> {
    const url = new URL(`${this.webAppBaseUrl}${endpoint}`);

    // Add query parameters including operator ID and client
    const allParams = {
      ...params,
      opid: this.operatorId,
      opclient: 'Web-Mac-Chrome',
    };

    Object.entries(allParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, String(value));
      }
    });

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'hostex-ts/0.1.0',
    };

    // Include session cookies if available
    if (this.sessionCookies) {
      headers['Cookie'] = this.sessionCookies;
    }

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

      // Extract and store cookies from response if requested
      if (extractCookies) {
        const setCookieHeaders = response.headers.getSetCookie?.() || [];
        if (setCookieHeaders.length > 0) {
          // Extract cookie names and values, ignoring attributes
          this.sessionCookies = setCookieHeaders
            .map(header => header.split(';')[0])
            .join('; ');
        }
      }

      // Parse response
      let data: any;
      try {
        data = await response.json();
      } catch (parseError) {
        data = {
          error_msg: response.statusText || 'Unknown error',
          error_code: response.status
        };
      }

      // Web app API uses error_code 0 for success
      if (response.ok && data.error_code === 0) {
        return {
          ...data,
          error_code: 200, // Normalize to standard API format
        };
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

  async login(data: LoginData): Promise<HostexAPIResponse> {
    const loginData = {
      account: data.account,
      password: data.password,
      image_code: data.image_code || '',
      dynamic_code: data.dynamic_code || '',
      login_type: data.login_type || 'password',
      locale: data.locale || 'en',
    };

    const result = await this.webAppRequest<any>('POST', '/v2/user/login', undefined, loginData, true);

    // After successful login, extract operator ID from response if available
    if (result.data && (result.data as any).operator_id) {
      this.operatorId = String((result.data as any).operator_id);
    }

    return result;
  }

  async postGuestReview(data: PostGuestReviewData): Promise<HostexAPIResponse> {
    return this.webAppRequest('POST', '/reservation_comment/send_comment', undefined, data);
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