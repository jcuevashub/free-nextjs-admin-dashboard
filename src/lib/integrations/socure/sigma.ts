/**
 * Socure Sigma (Fraud Detection)
 *
 * Evaluates fraud risk based on identity signals and behavior patterns.
 * Sigma scores range from 0-1000, where higher scores indicate higher fraud risk.
 *
 * Note: Sigma is automatically included in Socure ID+ responses,
 * this module provides evaluation and decision logic.
 *
 * @see https://developer.socure.com/sigma-fraud
 */

/**
 * Fraud risk levels based on Sigma score
 */
export type FraudRiskLevel = 'low' | 'medium' | 'high' | 'critical';

/**
 * Decision based on fraud evaluation
 */
export type FraudDecision = 'approve' | 'review' | 'reject';

/**
 * Sigma score thresholds (configurable per client requirements)
 */
export const SIGMA_THRESHOLDS = {
  LOW_RISK: 200,        // 0-200: Low risk, auto-approve
  MEDIUM_RISK: 500,     // 201-500: Medium risk, manual review
  HIGH_RISK: 750,       // 501-750: High risk, enhanced review
  CRITICAL_RISK: 1000,  // 751+: Critical risk, auto-reject
} as const;

/**
 * Interface for fraud evaluation result
 */
export interface FraudEvaluation {
  sigmaScore: number;
  riskLevel: FraudRiskLevel;
  decision: FraudDecision;
  reasons: string[];
  recommendation: string;
  requiresManualReview: boolean;
}

/**
 * Evaluate fraud risk based on Sigma score
 *
 * @param sigmaScore - Sigma fraud score (0-1000)
 * @param reasons - Array of fraud signals/reasons
 * @returns Fraud evaluation with risk level and recommended decision
 */
export function evaluateFraudRisk(
  sigmaScore: number,
  reasons: string[] = []
): FraudEvaluation {
  // Determine risk level
  let riskLevel: FraudRiskLevel;
  let decision: FraudDecision;
  let recommendation: string;
  let requiresManualReview: boolean;

  if (sigmaScore <= SIGMA_THRESHOLDS.LOW_RISK) {
    riskLevel = 'low';
    decision = 'approve';
    recommendation = 'Bajo riesgo de fraude. Proceder con aprobación automática.';
    requiresManualReview = false;
  } else if (sigmaScore <= SIGMA_THRESHOLDS.MEDIUM_RISK) {
    riskLevel = 'medium';
    decision = 'review';
    recommendation = 'Riesgo medio de fraude. Se recomienda revisión manual.';
    requiresManualReview = true;
  } else if (sigmaScore <= SIGMA_THRESHOLDS.HIGH_RISK) {
    riskLevel = 'high';
    decision = 'review';
    recommendation = 'Alto riesgo de fraude. Requiere revisión manual exhaustiva.';
    requiresManualReview = true;
  } else {
    riskLevel = 'critical';
    decision = 'reject';
    recommendation = 'Riesgo crítico de fraude. Rechazar automáticamente.';
    requiresManualReview = true; // For audit trail
  }

  return {
    sigmaScore,
    riskLevel,
    decision,
    reasons,
    recommendation,
    requiresManualReview,
  };
}

/**
 * Check if fraud score is acceptable for auto-approval
 */
export function isAcceptableFraudScore(sigmaScore: number): boolean {
  return sigmaScore <= SIGMA_THRESHOLDS.LOW_RISK;
}

/**
 * Check if fraud score requires manual review
 */
export function requiresManualReview(sigmaScore: number): boolean {
  return sigmaScore > SIGMA_THRESHOLDS.LOW_RISK && sigmaScore <= SIGMA_THRESHOLDS.HIGH_RISK;
}

/**
 * Check if fraud score warrants automatic rejection
 */
export function shouldAutoReject(sigmaScore: number): boolean {
  return sigmaScore > SIGMA_THRESHOLDS.HIGH_RISK;
}

/**
 * Get human-readable fraud risk message
 */
export function getFraudRiskMessage(evaluation: FraudEvaluation): string {
  const messages: Record<FraudRiskLevel, string> = {
    low: 'Bajo riesgo de fraude detectado',
    medium: 'Riesgo medio de fraude - en revisión',
    high: 'Alto riesgo de fraude - requiere verificación adicional',
    critical: 'Riesgo crítico de fraude - solicitud rechazada',
  };

  return messages[evaluation.riskLevel];
}

/**
 * Get color indicator for fraud risk level (for UI)
 */
export function getFraudRiskColor(riskLevel: FraudRiskLevel): string {
  const colors: Record<FraudRiskLevel, string> = {
    low: 'success',
    medium: 'warning',
    high: 'error',
    critical: 'error',
  };

  return colors[riskLevel];
}

/**
 * Parse fraud reasons into user-friendly messages
 */
export function parseFraudReasons(reasons: string[]): string[] {
  const reasonMap: Record<string, string> = {
    'synthetic_identity': 'Posible identidad sintética detectada',
    'device_mismatch': 'Dispositivo no coincide con perfil',
    'velocity_check_failed': 'Múltiples intentos de verificación detectados',
    'address_mismatch': 'Dirección no coincide con registros',
    'email_risk': 'Email asociado con actividad sospechosa',
    'phone_risk': 'Teléfono asociado con actividad sospechosa',
    'document_tampering': 'Posible alteración del documento detectada',
    'biometric_mismatch': 'Biométricos no coinciden',
  };

  return reasons.map(reason => {
    const normalized = reason.toLowerCase().replace(/\s+/g, '_');
    return reasonMap[normalized] || reason;
  });
}

/**
 * Calculate overall risk score combining multiple factors
 *
 * This combines Sigma score with other risk indicators like
 * liveness score, document confidence, etc.
 */
export function calculateCombinedRiskScore(params: {
  sigmaScore: number;
  livenessScore: number;
  documentConfidence: number;
  faceMatchScore: number;
}): {
  combinedScore: number;
  evaluation: FraudEvaluation;
} {
  // Weight factors
  const WEIGHTS = {
    sigma: 0.4,           // 40% weight on Sigma fraud score
    liveness: 0.25,       // 25% weight on liveness
    document: 0.2,        // 20% weight on document confidence
    faceMatch: 0.15,      // 15% weight on face matching
  };

  // Normalize scores to 0-1 range
  const normalizedSigma = params.sigmaScore / 1000; // Sigma is 0-1000
  const normalizedLiveness = 1 - params.livenessScore; // Invert (low liveness = high risk)
  const normalizedDocument = 1 - params.documentConfidence; // Invert
  const normalizedFaceMatch = 1 - params.faceMatchScore; // Invert

  // Calculate weighted average (0-1)
  const combinedScore =
    normalizedSigma * WEIGHTS.sigma +
    normalizedLiveness * WEIGHTS.liveness +
    normalizedDocument * WEIGHTS.document +
    normalizedFaceMatch * WEIGHTS.faceMatch;

  // Convert back to 0-1000 scale for consistency with Sigma
  const combinedSigmaScore = combinedScore * 1000;

  // Generate evaluation based on combined score
  const reasons = [];
  if (params.livenessScore < 0.7) reasons.push('low_liveness_score');
  if (params.documentConfidence < 0.7) reasons.push('low_document_confidence');
  if (params.faceMatchScore < 0.8) reasons.push('weak_face_match');

  const evaluation = evaluateFraudRisk(combinedSigmaScore, reasons);

  return {
    combinedScore: combinedSigmaScore,
    evaluation,
  };
}
