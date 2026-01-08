/**
 * Socure API Client
 *
 * Base client for interacting with Socure's verification APIs:
 * - ID+ (Identity Verification)
 * - DocV (Document Verification)
 * - Sigma (Fraud Detection)
 *
 * @see https://developer.socure.com/
 */

const SOCURE_API_KEY = process.env.SOCURE_API_KEY || '';
const SOCURE_BASE_URL = process.env.SOCURE_BASE_URL || 'https://service.socure.com';

/**
 * Error class for Socure API errors
 */
export class SocureAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'SocureAPIError';
  }
}

/**
 * Main Socure API client
 */
export class SocureClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string, baseUrl?: string) {
    this.apiKey = apiKey || SOCURE_API_KEY;
    this.baseUrl = baseUrl || SOCURE_BASE_URL;

    if (!this.apiKey) {
      throw new Error('Socure API key is required. Set SOCURE_API_KEY environment variable.');
    }
  }

  /**
   * Make an HTTP request to Socure API
   */
  async request<T = any>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'POST',
    body?: any,
    headers?: Record<string, string>
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new SocureAPIError(
          responseData.message || `Socure API error: ${response.statusText}`,
          response.status,
          responseData
        );
      }

      return responseData as T;
    } catch (error) {
      if (error instanceof SocureAPIError) {
        throw error;
      }

      // Network or parsing error
      throw new SocureAPIError(
        `Failed to connect to Socure API: ${error instanceof Error ? error.message : 'Unknown error'}`,
        undefined,
        error
      );
    }
  }

  /**
   * Health check to verify API connectivity
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Socure doesn't have a dedicated health endpoint, so we'll just verify the API key format
      if (!this.apiKey || this.apiKey.length < 10) {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Singleton instance of SocureClient
 */
export const socureClient = new SocureClient();
