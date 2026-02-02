// Digistore24 API Client

export class DigistoreClient {
  private apiKey: string;
  private digistoreId: string;
  private baseUrl = 'https://www.digistore24.com/api/call';

  constructor(apiKey?: string, digistoreId?: string) {
    this.apiKey = apiKey || process.env.DIGISTORE24_API_KEY || '';
    this.digistoreId = digistoreId || process.env.DIGISTORE24_ID || '';
  }

  private async makeRequest(method: string, params: any = {}) {
    const url = `${this.baseUrl}/${this.digistoreId}/${method}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-DS-API-KEY': this.apiKey,
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`Digistore24 API error: ${response.statusText}`);
    }

    return response.json();
  }

  async listPurchases(options: { limit?: number; page?: number } = {}) {
    const { limit = 50, page = 1 } = options;
    
    try {
      const data = await this.makeRequest('listPurchases', {
        limit,
        page,
      });
      return data;
    } catch (error) {
      console.error('Error fetching purchases:', error);
      throw error;
    }
  }

  async getPurchase(orderId: string) {
    try {
      const data = await this.makeRequest('getPurchase', {
        order_id: orderId,
      });
      return data;
    } catch (error) {
      console.error('Error fetching purchase:', error);
      throw error;
    }
  }

  async getStatistics(options: { from?: string; to?: string } = {}) {
    try {
      const data = await this.makeRequest('getStatistics', options);
      return data;
    } catch (error) {
      console.error('Error fetching statistics:', error);
      throw error;
    }
  }

  async listAffiliates(options: { limit?: number; page?: number } = {}) {
    const { limit = 50, page = 1 } = options;
    
    try {
      const data = await this.makeRequest('listAffiliates', {
        limit,
        page,
      });
      return data;
    } catch (error) {
      console.error('Error fetching affiliates:', error);
      throw error;
    }
  }
}

export const digistoreClient = new DigistoreClient();
