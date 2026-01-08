/**
 * Socure DocV (Document Verification)
 *
 * Verifies identity documents using OCR and authenticity checks:
 * - Extract data from documents (RNC, cédula, passport)
 * - Detect tampering and fraud
 * - Validate document authenticity
 *
 * @see https://developer.socure.com/document-verification
 */

import { socureClient, SocureAPIError } from './client';

/**
 * Document types supported by Socure DocV
 */
export type DocumentType = 'national_id' | 'passport' | 'business_registration';

/**
 * Request interface for Socure DocV
 */
export interface SocureDocVRequest {
  documentType: DocumentType;
  country: string;                    // ISO 3166-1 alpha-2 country code (e.g., 'DO')
  documentFront: string;              // Base64 encoded image
  documentBack?: string;              // Base64 encoded image (for 2-sided documents)
  extractData: boolean;               // Enable OCR
}

/**
 * Response interface from Socure DocV
 */
export interface SocureDocVResponse {
  documentUuid: string;               // Unique identifier for this document
  status: 'verified' | 'rejected' | 'review_required';
  documentType: string;
  confidence: number;                 // 0-1
  ocrData: {
    firstName?: string;
    lastName?: string;
    documentNumber?: string;
    dateOfBirth?: string;
    expirationDate?: string;
    issuingAuthority?: string;
    address?: string;
    // Business document fields
    businessName?: string;
    registrationNumber?: string;
    taxId?: string;
  };
  qualityChecks: {
    imageQuality: 'good' | 'poor' | 'acceptable';
    tampering: boolean;
    glareDetected: boolean;
    blurDetected?: boolean;
  };
  rawResponse?: any;                  // Full Socure response for debugging
}

/**
 * Convert File to base64 string
 */
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      // Remove data:image/...;base64, prefix
      const base64Data = base64.split(',')[1] || base64;
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Convert Buffer/ArrayBuffer to base64 string
 */
function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Verify a document using Socure DocV
 *
 * @param document - Front side of document (File or base64 string)
 * @param docType - Type of document being verified
 * @param documentBack - Back side of document (optional, for 2-sided IDs)
 * @returns Verification result with OCR data and quality checks
 */
export async function verifySocureDocument(
  document: File | string,
  docType: 'cedula' | 'ubo' | 'rnc' | 'constitutivo' | 'address' | 'passport',
  documentBack?: File | string
): Promise<SocureDocVResponse> {
  try {
    // Convert files to base64 if needed
    let frontBase64: string;
    if (typeof document === 'string') {
      frontBase64 = document;
    } else {
      const arrayBuffer = await document.arrayBuffer();
      frontBase64 = bufferToBase64(arrayBuffer);
    }

    let backBase64: string | undefined;
    if (documentBack) {
      if (typeof documentBack === 'string') {
        backBase64 = documentBack;
      } else {
        const arrayBuffer = await documentBack.arrayBuffer();
        backBase64 = bufferToBase64(arrayBuffer);
      }
    }

    // Map our document types to Socure document types
    const typeMap: Record<typeof docType, DocumentType> = {
      cedula: 'national_id',
      ubo: 'national_id',
      passport: 'passport',
      rnc: 'business_registration',
      constitutivo: 'business_registration',
      address: 'business_registration', // Address proof treated as business doc
    };

    const socureDocType = typeMap[docType] || 'business_registration';

    // Prepare request
    const requestData: SocureDocVRequest = {
      documentType: socureDocType,
      country: 'DO', // Dominican Republic
      documentFront: frontBase64,
      documentBack: backBase64,
      extractData: true, // Always extract OCR data
    };

    // Call Socure DocV API
    const response = await socureClient.request<any>(
      '/api/3.0/DocumentVerification',
      'POST',
      requestData
    );

    // Parse response into our standard format
    const result: SocureDocVResponse = {
      documentUuid: response.documentUuid || response.referenceId || `doc_${Date.now()}`,
      status: mapSocureStatus(response.status || response.decision),
      documentType: socureDocType,
      confidence: response.confidence || response.documentScore || 0,
      ocrData: extractOCRData(response),
      qualityChecks: {
        imageQuality: response.imageQuality || 'acceptable',
        tampering: response.tamperingDetected || false,
        glareDetected: response.glareDetected || false,
        blurDetected: response.blurDetected || false,
      },
      rawResponse: response, // Store full response for debugging
    };

    return result;
  } catch (error) {
    if (error instanceof SocureAPIError) {
      console.error('[SocureDocV] API Error:', error.message, error.response);
      throw error;
    }

    console.error('[SocureDocV] Unexpected error:', error);
    throw new Error(`Document verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Map Socure status to our standard status
 */
function mapSocureStatus(status: string): 'verified' | 'rejected' | 'review_required' {
  const normalizedStatus = status?.toLowerCase();

  if (['accept', 'verified', 'pass', 'success'].includes(normalizedStatus)) {
    return 'verified';
  }

  if (['reject', 'rejected', 'fail', 'failed'].includes(normalizedStatus)) {
    return 'rejected';
  }

  return 'review_required';
}

/**
 * Extract OCR data from Socure response
 */
function extractOCRData(response: any): SocureDocVResponse['ocrData'] {
  const extracted = response.extracted || response.ocrData || response.documentData || {};

  return {
    firstName: extracted.firstName || extracted.givenName,
    lastName: extracted.lastName || extracted.surname || extracted.familyName,
    documentNumber: extracted.documentNumber || extracted.idNumber,
    dateOfBirth: extracted.dateOfBirth || extracted.dob,
    expirationDate: extracted.expirationDate || extracted.expiry,
    issuingAuthority: extracted.issuingAuthority || extracted.issuer,
    address: extracted.address,
    // Business fields
    businessName: extracted.businessName || extracted.companyName,
    registrationNumber: extracted.registrationNumber || extracted.businessNumber,
    taxId: extracted.taxId || extracted.rnc,
  };
}

/**
 * Check if a document has passed verification
 */
export function isDocumentVerified(result: SocureDocVResponse): boolean {
  return result.status === 'verified' && result.confidence >= 0.7;
}

/**
 * Get human-readable verification status message
 */
export function getVerificationStatusMessage(result: SocureDocVResponse): string {
  if (result.status === 'verified') {
    return 'Documento verificado exitosamente';
  }

  if (result.status === 'rejected') {
    if (result.qualityChecks.tampering) {
      return 'Documento rechazado: posible alteración detectada';
    }
    if (result.qualityChecks.imageQuality === 'poor') {
      return 'Documento rechazado: calidad de imagen insuficiente';
    }
    return 'Documento rechazado: no pudo ser verificado';
  }

  return 'Documento en revisión: se requiere verificación manual';
}
