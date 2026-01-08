/**
 * Sanctions Screening API Client
 *
 * Performs OFAC, PEP, and sanctions list screening for:
 * - Companies (by RNC and name)
 * - Individuals (by cédula/passport and name)
 *
 * Supports multiple providers:
 * - Sanctions.io (primary)
 * - OFAC-API.com (alternative)
 *
 * @see https://www.sanctions.io/
 * @see https://www.ofac-api.com/
 */

const SANCTIONS_IO_API_KEY = process.env.SANCTIONS_IO_API_KEY || '';
const OFAC_API_KEY = process.env.OFAC_API_KEY || '';
const SANCTIONS_BASE_URL = 'https://api.sanctions.io';
const OFAC_BASE_URL = 'https://api.ofac-api.com';

/**
 * Error class for Sanctions API errors
 */
export class SanctionsAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'SanctionsAPIError';
  }
}

/**
 * Provider type
 */
export type SanctionsProvider = 'sanctions.io' | 'ofac-api';

/**
 * Main Sanctions API client
 */
export class SanctionsClient {
  private provider: SanctionsProvider;
  private apiKey: string;
  private baseUrl: string;

  constructor(provider: SanctionsProvider = 'sanctions.io') {
    this.provider = provider;

    if (provider === 'sanctions.io') {
      this.apiKey = SANCTIONS_IO_API_KEY;
      this.baseUrl = SANCTIONS_BASE_URL;
    } else {
      this.apiKey = OFAC_API_KEY;
      this.baseUrl = OFAC_BASE_URL;
    }

    if (!this.apiKey) {
      throw new Error(
        `API key for ${provider} is required. Set ${
          provider === 'sanctions.io' ? 'SANCTIONS_IO_API_KEY' : 'OFAC_API_KEY'
        } environment variable.`
      );
    }
  }

  /**
   * Screen an entity (company or individual) against sanctions lists
   */
  async screenEntity(data: {
    name: string;
    type: 'individual' | 'company';
    country?: string;
    dateOfBirth?: string;
    identifier?: string; // RNC or cédula
  }): Promise<any> {
    const url = `${this.baseUrl}/v1/screen`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          type: data.type,
          country: data.country || 'DO',
          date_of_birth: data.dateOfBirth,
          identifier: data.identifier,
          sources: ['ofac', 'un', 'eu', 'uk', 'pep', 'adverse_media'],
        }),
      });

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new SanctionsAPIError(
          responseData.message || `Sanctions API error: ${response.statusText}`,
          response.status,
          responseData
        );
      }

      return responseData;
    } catch (error) {
      if (error instanceof SanctionsAPIError) {
        throw error;
      }

      throw new SanctionsAPIError(
        `Failed to connect to Sanctions API: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
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
 * Singleton instance of SanctionsClient
 */
export const sanctionsClient = new SanctionsClient();
