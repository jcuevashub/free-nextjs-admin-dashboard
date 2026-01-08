/**
 * Sanctions Screening Logic
 *
 * Performs comprehensive screening for:
 * - OFAC (Office of Foreign Assets Control)
 * - PEP (Politically Exposed Persons)
 * - UN, EU, UK sanctions lists
 * - Adverse media
 *
 * @see https://www.sanctions.io/solutions/screening-api
 */

import { sanctionsClient, SanctionsAPIError } from './client';

/**
 * Match from sanctions screening
 */
export interface SanctionsMatch {
  source: string; // 'ofac', 'pep', 'eu_sanctions', 'un_sanctions', etc.
  matchScore: number; // 0-100
  entityName: string;
  listType: string;
  details: {
    program?: string;
    listingDate?: string;
    reason?: string;
    aliases?: string[];
    countries?: string[];
  };
}

/**
 * Result from sanctions screening
 */
export interface SanctionsScreeningResult {
  screeningId: string;
  matches: SanctionsMatch[];
  isPEP: boolean;
  isOnSanctionsList: boolean;
  hasAdverseMedia: boolean;
  riskScore: number; // 0-100
  recommendation: 'approve' | 'review' | 'reject';
  rawResponse?: any;
}

/**
 * Screen an entity for sanctions, PEP, and adverse media
 *
 * @param name - Full name of person or company
 * @param type - Type of entity (individual or company)
 * @param identifier - RNC for companies, cédula for individuals
 * @param dateOfBirth - Date of birth for individuals (optional)
 * @returns Screening result with matches and risk assessment
 */
export async function screenForSanctions(
  name: string,
  type: 'individual' | 'company',
  identifier?: string,
  dateOfBirth?: string
): Promise<SanctionsScreeningResult> {
  try {
    // Perform screening
    const response = await sanctionsClient.screenEntity({
      name,
      type,
      identifier,
      country: 'DO',
      dateOfBirth,
    });

    // Parse matches
    const matches: SanctionsMatch[] = (response.matches || []).map((match: any) => ({
      source: match.source || match.list_type,
      matchScore: match.match_score || match.score || 0,
      entityName: match.name || match.entity_name,
      listType: match.list_type || match.source,
      details: {
        program: match.program || match.sanctioning_authority,
        listingDate: match.listing_date || match.date_added,
        reason: match.reason || match.remarks,
        aliases: match.aliases || match.aka || [],
        countries: match.countries || match.nationalities || [],
      },
    }));

    // Determine flags
    const isPEP = matches.some((m) => m.source.toLowerCase().includes('pep'));
    const isOnSanctionsList = matches.some((m) =>
      ['ofac', 'un', 'eu', 'uk'].some((list) => m.source.toLowerCase().includes(list))
    );
    const hasAdverseMedia = matches.some((m) =>
      m.source.toLowerCase().includes('adverse')
    );

    // Calculate risk score (0-100)
    let riskScore = 0;
    if (isOnSanctionsList) riskScore = 100; // Maximum risk
    else if (isPEP) riskScore = 60; // High risk
    else if (hasAdverseMedia) riskScore = 40; // Medium risk
    else if (matches.length > 0) riskScore = 20; // Low risk

    // Determine recommendation
    let recommendation: 'approve' | 'review' | 'reject';
    if (isOnSanctionsList) {
      recommendation = 'reject'; // Auto-reject sanctions matches
    } else if (isPEP || hasAdverseMedia) {
      recommendation = 'review'; // Manual review required
    } else {
      recommendation = 'approve'; // No matches, safe to approve
    }

    return {
      screeningId: response.screening_id || response.reference_id || `scr_${Date.now()}`,
      matches,
      isPEP,
      isOnSanctionsList,
      hasAdverseMedia,
      riskScore,
      recommendation,
      rawResponse: response,
    };
  } catch (error) {
    if (error instanceof SanctionsAPIError) {
      console.error('[Sanctions] API Error:', error.message, error.response);
      throw error;
    }

    console.error('[Sanctions] Unexpected error:', error);
    throw new Error(
      `Sanctions screening failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Check if screening result is acceptable (no blocking issues)
 */
export function isScreeningAcceptable(result: SanctionsScreeningResult): boolean {
  return !result.isOnSanctionsList && result.recommendation !== 'reject';
}

/**
 * Check if screening requires manual review
 */
export function requiresManualReview(result: SanctionsScreeningResult): boolean {
  return result.recommendation === 'review';
}

/**
 * Get human-readable screening message
 */
export function getScreeningMessage(result: SanctionsScreeningResult): string {
  if (result.isOnSanctionsList) {
    const sanctionSources = result.matches
      .filter((m) => ['ofac', 'un', 'eu', 'uk'].some((s) => m.source.toLowerCase().includes(s)))
      .map((m) => m.source.toUpperCase())
      .join(', ');

    return `Coincidencia encontrada en listas de sanciones: ${sanctionSources}. Solicitud rechazada.`;
  }

  if (result.isPEP) {
    return 'Persona Políticamente Expuesta (PEP) identificada. Requiere debida diligencia reforzada.';
  }

  if (result.hasAdverseMedia) {
    return 'Medios adversos detectados. Requiere revisión manual.';
  }

  if (result.matches.length > 0) {
    return `${result.matches.length} coincidencia(s) potencial(es) encontrada(s). En revisión.`;
  }

  return 'Sin coincidencias en listas de sanciones ni PEP. Aprobado para continuar.';
}

/**
 * Get color indicator for risk level (for UI)
 */
export function getScreeningColor(result: SanctionsScreeningResult): string {
  if (result.isOnSanctionsList) return 'error';
  if (result.isPEP) return 'warning';
  if (result.hasAdverseMedia) return 'warning';
  if (result.matches.length > 0) return 'info';
  return 'success';
}

/**
 * Format match details for display
 */
export function formatMatchDetails(match: SanctionsMatch): string {
  const parts = [
    `Fuente: ${match.source.toUpperCase()}`,
    `Coincidencia: ${match.matchScore}%`,
    `Nombre: ${match.entityName}`,
  ];

  if (match.details.program) {
    parts.push(`Programa: ${match.details.program}`);
  }

  if (match.details.reason) {
    parts.push(`Motivo: ${match.details.reason}`);
  }

  return parts.join(' | ');
}

/**
 * Screen multiple entities in batch (for efficiency)
 */
export async function batchScreenSanctions(
  entities: Array<{
    name: string;
    type: 'individual' | 'company';
    identifier?: string;
  }>
): Promise<SanctionsScreeningResult[]> {
  // Execute all screenings in parallel
  const screeningPromises = entities.map((entity) =>
    screenForSanctions(entity.name, entity.type, entity.identifier)
  );

  return Promise.all(screeningPromises);
}
