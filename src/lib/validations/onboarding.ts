/**
 * Onboarding Validation Schemas
 *
 * Zod schemas for validating onboarding form data at each step.
 * These ensure data integrity before saving to the database.
 */

import { z } from 'zod';
import { isValidRNC, isValidCedula, isValidDominicanPhone } from '../utils';

/**
 * Step 2: Account Selection
 */
export const accountSelectionSchema = z.object({
  accountPreference: z.enum(['peso', 'dolar', 'both']),
});

export type AccountSelectionInput = z.infer<typeof accountSelectionSchema>;

/**
 * Step 3: Company Info
 */
export const companyInfoSchema = z.object({
  companyName: z
    .string()
    .min(2, 'Nombre de empresa debe tener al menos 2 caracteres')
    .max(255, 'Nombre de empresa muy largo'),
  rnc: z
    .string()
    .min(9, 'RNC debe tener al menos 9 dígitos')
    .max(11, 'RNC debe tener máximo 11 dígitos')
    .refine((val) => isValidRNC(val), {
      message: 'RNC inválido. Debe tener formato 123-45678-9 o 123-4567890-1',
    }),
  phone: z
    .string()
    .min(10, 'Teléfono debe tener 10 dígitos')
    .refine((val) => isValidDominicanPhone(val), {
      message: 'Teléfono dominicano inválido. Debe comenzar con 809, 829 o 849',
    }),
  industry: z
    .string()
    .min(1, 'Industria es requerida')
    .max(100, 'Industria muy larga')
    .optional(),
  description: z
    .string()
    .max(500, 'Descripción muy larga')
    .optional(),
  website: z
    .string()
    .url('URL inválida')
    .optional()
    .or(z.literal('')),
  country: z.string().default('DO'),
});

export type CompanyInfoInput = z.infer<typeof companyInfoSchema>;

/**
 * Step 4: Company Address
 */
export const companyAddressSchema = z.object({
  address: z
    .string()
    .min(5, 'Dirección debe tener al menos 5 caracteres')
    .max(255, 'Dirección muy larga'),
  city: z
    .string()
    .min(2, 'Ciudad debe tener al menos 2 caracteres')
    .max(100, 'Ciudad muy larga'),
  province: z
    .string()
    .min(2, 'Provincia es requerida')
    .max(100, 'Provincia muy larga'),
  postalCode: z
    .string()
    .max(10, 'Código postal muy largo')
    .optional(),
  country: z.string().default('DO'),
});

export type CompanyAddressInput = z.infer<typeof companyAddressSchema>;

/**
 * Step 5: Ownership
 */
export const ownershipSchema = z.object({
  ownerName: z
    .string()
    .min(3, 'Nombre completo debe tener al menos 3 caracteres')
    .max(255, 'Nombre muy largo'),
  ownerId: z
    .string()
    .min(11, 'Cédula debe tener 11 dígitos')
    .max(11, 'Cédula debe tener 11 dígitos')
    .refine((val) => isValidCedula(val), {
      message: 'Cédula inválida. Debe tener formato 001-1234567-8',
    }),
  ownershipPct: z
    .number()
    .min(0, 'Porcentaje debe ser mayor o igual a 0')
    .max(100, 'Porcentaje debe ser menor o igual a 100'),
  pep: z.boolean(),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha de nacimiento inválida. Formato: YYYY-MM-DD')
    .optional(),
  position: z
    .string()
    .max(100, 'Cargo muy largo')
    .optional(),
});

export type OwnershipInput = z.infer<typeof ownershipSchema>;

/**
 * Step 6: Identity Verification
 */
export const identityVerificationSchema = z.object({
  documentType: z.enum(['cedula', 'passport']),
  documentNumber: z
    .string()
    .min(1, 'Número de documento es requerido')
    .max(50, 'Número de documento muy largo'),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha debe tener formato YYYY-MM-DD'),
  // Note: selfie is validated as File in the component, not here
});

export type IdentityVerificationInput = z.infer<typeof identityVerificationSchema>;

/**
 * Step 7: Documents Upload
 */
export const documentUploadSchema = z.object({
  docType: z.enum(['rnc', 'constitutivo', 'cedula_front', 'cedula_back', 'ubo', 'address']),
  companyId: z.string().uuid('Company ID inválido').optional(),
  personId: z.string().uuid('Person ID inválido').optional(),
  // Note: file is validated as File in the component
});

export type DocumentUploadInput = z.infer<typeof documentUploadSchema>;

/**
 * Step 8: Expected Activity
 */
export const expectedActivitySchema = z.object({
  monthlyVolume: z.enum([
    'less_than_10k',
    '10k_to_50k',
    '50k_to_100k',
    '100k_to_500k',
    'more_than_500k',
  ]),
  countries: z
    .array(z.string())
    .min(1, 'Debes seleccionar al menos un país')
    .max(10, 'Máximo 10 países'),
  fundingSource: z
    .string()
    .min(5, 'Fuente de fondos debe tener al menos 5 caracteres')
    .max(500, 'Fuente de fondos muy larga'),
  expectedTransfers: z.enum([
    'none',
    '1_to_5',
    '6_to_20',
    '21_to_50',
    'more_than_50',
  ]).optional(),
});

export type ExpectedActivityInput = z.infer<typeof expectedActivitySchema>;

/**
 * Step 9: Follow-up Questions
 */
export const followUpSchema = z.object({
  additionalInfo: z
    .string()
    .max(1000, 'Información adicional muy larga')
    .optional(),
  hasBusinessLicense: z.boolean().optional(),
  licenseNumber: z
    .string()
    .max(100, 'Número de licencia muy largo')
    .optional(),
  agreeToTerms: z
    .boolean()
    .refine((val) => val === true, {
      message: 'Debes aceptar los términos y condiciones',
    }),
  agreeToPrivacy: z
    .boolean()
    .refine((val) => val === true, {
      message: 'Debes aceptar la política de privacidad',
    }),
});

export type FollowUpInput = z.infer<typeof followUpSchema>;

/**
 * Validation Helper
 *
 * Validates data with a Zod schema and returns formatted errors
 */
export function validateWithZod<T>(
  schema: z.ZodType<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  // Format errors for easier consumption
  const errors: Record<string, string> = {};
  result.error.issues.forEach((issue) => {
    const path = issue.path.join('.');
    errors[path] = issue.message;
  });

  return { success: false, errors };
}
