import { DigistoreError, Digistore24Purchase, DigistoreApiResponse } from './types';
import { retry } from './utils';

export class DigistoreClient {
  private apiKey: string;
  private baseUrl: string = 'https://www.digistore24.com/api/call';
  private apiVersion: string = 'v1';

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new DigistoreError('Digistore24 API key is required');
    }
    this.apiKey = apiKey;
  }

  /**
   * Make authenticated API request
   */
  private async request<T>(
    endpoint: string,
    method: string = 'GET',
    data?: any
  ): Promise<T> {
    const url = `${this.baseUrl}/${this.apiVersion}/${endpoint}`;

    const headers: HeadersInit = {
      'X-DS-API-KEY': this.apiKey,
      'Content-Type': 'application/json',
    };

    const options: RequestInit = {
      method,
      headers,
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await retry(async () => {
        const res = await fetch(url, options);

        if (!res.ok) {
          const errorText = await res.text();
          throw new DigistoreError(
            `API request failed: ${errorText}`,
            'API_ERROR',
            res.status
          );
        }

        return res;
      });

      return await response.json();
    } catch (error) {
      if (error instanceof DigistoreError) {
        throw error;
      }
      throw new DigistoreError(
        `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'NETWORK_ERROR'
      );
    }
  }

  /**
   * List purchases/sales
   */
  async listPurchases(params?: {
    limit?: number;
    page?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<DigistoreApiResponse<Digistore24Purchase[]>> {
    const queryParams = new URLSearchParams();

    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.startDate) queryParams.append('start_date', params.startDate);
    if (params?.endDate) queryParams.append('end_date', params.endDate);

    const endpoint = `purchases?${queryParams.toString()}`;

    try {
      const response = await this.request<any>(endpoint);

      // Transform response to match our interface
      return {
        data: response.data || [],
        meta: response.meta,
      };
    } catch (error) {
      console.error('Error fetching purchases:', error);
      // Return empty array on error to prevent crashes
      return { data: [], meta: { page: 1, limit: 50, total: 0 } };
    }
  }

  /**
   * Get single purchase by order ID
   */
  async getPurchase(orderId: string): Promise<Digistore24Purchase | null> {
    try {
      const response = await this.request<any>(`purchases/${orderId}`);
      return response.data || null;
    } catch (error) {
      console.error(`Error fetching purchase ${orderId}:`, error);
      return null;
    }
  }

  /**
   * List affiliates
   */
  async listAffiliates(params?: {
    limit?: number;
    page?: number;
  }): Promise<any> {
    const queryParams = new URLSearchParams();

    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.page) queryParams.append('page', params.page.toString());

    const endpoint = `affiliates?${queryParams.toString()}`;

    try {
      return await this.request<any>(endpoint);
    } catch (error) {
      console.error('Error fetching affiliates:', error);
      return { data: [], meta: { page: 1, limit: 50, total: 0 } };
    }
  }

  /**
   * Get affiliate by ID
   */
  async getAffiliate(affiliateId: string): Promise<any> {
    try {
      const response = await this.request<any>(`affiliates/${affiliateId}`);
      return response.data || null;
    } catch (error) {
      console.error(`Error fetching affiliate ${affiliateId}:`, error);
      return null;
    }
  }

  /**
   * Get sales statistics
   */
  async getSalesStats(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    const queryParams = new URLSearchParams();

    if (params?.startDate) queryParams.append('start_date', params.startDate);
    if (params?.endDate) queryParams.append('end_date', params.endDate);

    const endpoint = `stats/sales?${queryParams.toString()}`;

    try {
      return await this.request<any>(endpoint);
    } catch (error) {
      console.error('Error fetching sales stats:', error);
      return { revenue: 0, count: 0 };
    }
  }

  /**
   * Verify webhook signature (if provided by Digistore24)
   * TODO: Implement proper HMAC signature verification based on Digistore24's documentation
   * This is a security-critical function that should be implemented before production use
   */
  verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    // WARNING: This is a placeholder implementation
    // Implement actual signature verification using HMAC-SHA256 or Digistore24's algorithm
    // Example implementation (adjust based on Digistore24's actual algorithm):
    // const crypto = require('crypto');
    // const expectedSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    // return signature === expectedSignature;
    
    console.warn('Webhook signature verification is not implemented - this is a security risk');
    try {
      // For development, accept any signature if present
      // In production, this MUST be replaced with proper verification
      return !!signature;
    } catch (error) {
      console.error('Error verifying webhook signature:', error);
      return false;
    }
  }
}

// Export a singleton instance
let digistoreClient: DigistoreClient | null = null;

export function getDigistoreClient(): DigistoreClient {
  if (!digistoreClient) {
    const apiKey = process.env.DIGISTORE24_API_KEY;
    if (!apiKey) {
      throw new DigistoreError('DIGISTORE24_API_KEY environment variable is not set');
    }
    digistoreClient = new DigistoreClient(apiKey);
  }
  return digistoreClient;
}
