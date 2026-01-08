/**
 * Socure ID+ (Identity Verification)
 *
 * Comprehensive identity verification combining:
 * - Document verification
 * - Selfie liveness detection
 * - Face matching
 * - Fraud detection (Sigma)
 *
 * @see https://developer.socure.com/id-plus
 */

import { socureClient, SocureAPIError } from './client';

/**
 * Request interface for Socure ID+
 */
export interface SocureIDPlusRequest {
  documentUuid: string;               // From DocV upload
  firstName: string;
  lastName: string;
  nationalId: string;                 // Cédula or passport number
  dateOfBirth: string;                // YYYY-MM-DD
  country: string;                    // ISO 3166-1 alpha-2 (e.g., 'DO')
  selfieImageData: string;            // Base64 encoded selfie
  modules: string[];                  // ['document', 'selfie', 'liveness', 'fraud']
}

/**
 * Response interface from Socure ID+
 */
export interface SocureIDPlusResponse {
  referenceId: string;
  decision: 'accept' | 'reject' | 'review' | 'refer' | 'resubmit';
  documentVerification: {
    status: string;
    documentType: string;
    issuingCountry: string;
    extractedData: {
      firstName: string;
      lastName: string;
      dateOfBirth: string;
      documentNumber: string;
      expirationDate?: string;
    };
  };
  selfieVerification: {
    livenessScore: number;            // 0-1 (higher is better)
    faceMatch: boolean;
    faceMatchScore: number;           // 0-1 (higher is more confident match)
  };
  fraudSignals: {
    sigmaScore: number;               // 0-1000 (higher = more fraud risk)
    syntheticIdentityScore: number;
    reasons: string[];
  };
  rawResponse?: any;
}

/**
 * Verify identity using Socure ID+
 *
 * This combines document verification, selfie liveness, and fraud detection
 * into a single comprehensive identity check.
 *
 * @param data - Identity verification data including document UUID and selfie
 * @returns Complete verification result with liveness, face match, and fraud scores
 */
export async function verifySocureIdentity(data: {
  documentUuid: string;
  firstName: string;
  lastName: string;
  nationalId: string;
  dateOfBirth: string;              // YYYY-MM-DD format
  selfieImage: File | string;       // Selfie for liveness detection
}): Promise<SocureIDPlusResponse> {
  try {
    // Convert selfie to base64 if it's a File
    let selfieBase64: string;
    if (typeof data.selfieImage === 'string') {
      selfieBase64 = data.selfieImage;
    } else {
      const arrayBuffer = await data.selfieImage.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      selfieBase64 = btoa(binary);
    }

    // Prepare request
    const requestData: SocureIDPlusRequest = {
      documentUuid: data.documentUuid,
      firstName: data.firstName,
      lastName: data.lastName,
      nationalId: data.nationalId,
      dateOfBirth: data.dateOfBirth,
      country: 'DO', // Dominican Republic
      selfieImageData: selfieBase64,
      modules: ['document', 'selfie', 'liveness', 'fraud'],
    };

    // Call Socure ID+ API
    const response = await socureClient.request<any>(
      '/api/3.0/EmailAuthScore',
      'POST',
      requestData
    );

    // Parse response into our standard format
    const result: SocureIDPlusResponse = {
      referenceId: response.referenceId || `id_${Date.now()}`,
      decision: mapDecision(response.decision || response.status),
      documentVerification: {
        status: response.documentVerification?.status || 'unknown',
        documentType: response.documentVerification?.documentType || 'national_id',
        issuingCountry: response.documentVerification?.issuingCountry || 'DO',
        extractedData: {
          firstName: response.documentVerification?.extractedData?.firstName || data.firstName,
          lastName: response.documentVerification?.extractedData?.lastName || data.lastName,
          dateOfBirth: response.documentVerification?.extractedData?.dateOfBirth || data.dateOfBirth,
          documentNumber: response.documentVerification?.extractedData?.documentNumber || data.nationalId,
          expirationDate: response.documentVerification?.extractedData?.expirationDate,
        },
      },
      selfieVerification: {
        livenessScore: response.selfieVerification?.livenessScore || response.livenessScore || 0,
        faceMatch: response.selfieVerification?.faceMatch || false,
        faceMatchScore: response.selfieVerification?.faceMatchScore || 0,
      },
      fraudSignals: {
        sigmaScore: response.fraudSignals?.sigmaScore || response.sigmaScore || 0,
        syntheticIdentityScore: response.fraudSignals?.syntheticIdentityScore || 0,
        reasons: response.fraudSignals?.reasons || response.reasons || [],
      },
      rawResponse: response,
    };

    return result;
  } catch (error) {
    if (error instanceof SocureAPIError) {
      console.error('[SocureID+] API Error:', error.message, error.response);
      throw error;
    }

    console.error('[SocureID+] Unexpected error:', error);
    throw new Error(`Identity verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Map Socure decision to our standard decision types
 */
function mapDecision(decision: string): SocureIDPlusResponse['decision'] {
  const normalizedDecision = decision?.toLowerCase();

  if (['accept', 'approved', 'pass'].includes(normalizedDecision)) {
    return 'accept';
  }

  if (['reject', 'rejected', 'fail', 'failed'].includes(normalizedDecision)) {
    return 'reject';
  }

  if (['review', 'manual_review', 'pending'].includes(normalizedDecision)) {
    return 'review';
  }

  if (['refer', 'referral'].includes(normalizedDecision)) {
    return 'refer';
  }

  return 'resubmit';
}

/**
 * Check if identity verification passed
 */
export function isIdentityVerified(result: SocureIDPlusResponse): boolean {
  return (
    result.decision === 'accept' &&
    result.selfieVerification.livenessScore >= 0.7 &&
    result.selfieVerification.faceMatch === true
  );
}

/**
 * Get human-readable verification status message
 */
export function getIdentityVerificationMessage(result: SocureIDPlusResponse): string {
  if (result.decision === 'accept') {
    return 'Identidad verificada exitosamente';
  }

  if (result.decision === 'reject') {
    if (result.selfieVerification.livenessScore < 0.7) {
      return 'Verificación rechazada: liveness insuficiente. Por favor intenta de nuevo.';
    }
    if (!result.selfieVerification.faceMatch) {
      return 'Verificación rechazada: el rostro no coincide con el documento';
    }
    if (result.fraudSignals.sigmaScore > 500) {
      return 'Verificación rechazada: alto riesgo de fraude detectado';
    }
    return 'Verificación rechazada: no se pudo verificar la identidad';
  }

  if (result.decision === 'review') {
    return 'Verificación en revisión: se requiere verificación manual';
  }

  return 'Por favor intenta de nuevo o contacta soporte';
}
