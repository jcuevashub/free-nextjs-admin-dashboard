import { z } from 'zod';

// ============================================
// VALIDACIONES DE EMPRESA (COMPANY)
// ============================================

export const companySchema = z.object({
  rnc: z
    .string()
    .min(9, 'RNC debe tener al menos 9 dígitos')
    .max(11, 'RNC debe tener máximo 11 dígitos')
    .regex(/^[0-9]+$/, 'RNC solo debe contener números'),
  company_name: z.string().min(1, 'Nombre de la empresa es requerido'),
  legal_name: z.string().min(1, 'Razón social es requerida'),
  company_email: z.string().email('Email inválido'),
  company_phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  industry: z.string().optional(),
  website: z.string().url('URL inválida').optional().or(z.literal('')),
});

export type CompanyFormData = z.infer<typeof companySchema>;

// ============================================
// VALIDACIONES DE USUARIO (USER)
// ============================================

export const userSchema = z.object({
  full_name: z.string().min(1, 'Nombre completo es requerido'),
  cedula: z
    .string()
    .length(11, 'Cédula debe tener 11 dígitos')
    .regex(/^[0-9]+$/, 'Cédula solo debe contener números')
    .optional()
    .or(z.literal('')),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  role: z.enum(['owner', 'admin', 'accountant', 'employee', 'viewer']),
});

export type UserFormData = z.infer<typeof userSchema>;

// ============================================
// VALIDACIONES DE CUENTA BANCARIA (ACCOUNT)
// ============================================

export const createAccountSchema = z.object({
  account_name: z.string().min(1, 'Nombre de cuenta es requerido'),
  account_type: z.enum(['checking', 'savings'], {
    errorMap: () => ({ message: 'Tipo de cuenta inválido' }),
  }),
  currency: z.enum(['DOP', 'USD'], {
    errorMap: () => ({ message: 'Moneda inválida' }),
  }),
  daily_transfer_limit: z.number().positive().optional(),
  monthly_transfer_limit: z.number().positive().optional(),
});

export type CreateAccountFormData = z.infer<typeof createAccountSchema>;

// ============================================
// VALIDACIONES DE TRANSFERENCIA (TRANSFER)
// ============================================

export const transferSchema = z.object({
  from_account_id: z.string().uuid('ID de cuenta inválido'),
  recipient_name: z.string().min(1, 'Nombre del destinatario es requerido'),
  recipient_account: z.string().min(1, 'Número de cuenta es requerido'),
  recipient_bank: z.string().min(1, 'Banco es requerido'),
  recipient_rnc_cedula: z
    .string()
    .regex(/^[0-9]{9,11}$/, 'RNC/Cédula inválido')
    .optional()
    .or(z.literal('')),
  amount: z.number().positive('El monto debe ser mayor a 0'),
  currency: z.enum(['DOP', 'USD']),
  description: z.string().optional(),
  transfer_type: z.enum(['internal', 'tef', 'ach', 'international']),
  is_scheduled: z.boolean().default(false),
  scheduled_date: z.string().optional(),
});

export type TransferFormData = z.infer<typeof transferSchema>;

// ============================================
// VALIDACIONES DE BENEFICIARIO (RECIPIENT)
// ============================================

export const recipientSchema = z.object({
  recipient_name: z.string().min(1, 'Nombre del beneficiario es requerido'),
  recipient_type: z.enum(['person', 'business']).optional(),
  rnc_cedula: z
    .string()
    .regex(/^[0-9]{9,11}$/, 'RNC/Cédula inválido')
    .optional()
    .or(z.literal('')),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  bank_name: z.string().min(1, 'Banco es requerido'),
  account_number: z.string().min(1, 'Número de cuenta es requerido'),
  account_type: z.string().optional(),
  swift_code: z.string().length(11, 'Código SWIFT debe tener 11 caracteres').optional().or(z.literal('')),
  notes: z.string().optional(),
});

export type RecipientFormData = z.infer<typeof recipientSchema>;

// ============================================
// VALIDACIONES DE TARJETA (CARD)
// ============================================

export const createCardSchema = z.object({
  account_id: z.string().uuid('ID de cuenta inválido'),
  card_holder_id: z.string().uuid('ID de titular inválido'),
  card_name: z.string().min(1, 'Nombre de tarjeta es requerido'),
  card_type: z.enum(['virtual', 'physical']),
  daily_limit: z.number().positive('Límite diario debe ser mayor a 0').optional(),
  monthly_limit: z.number().positive('Límite mensual debe ser mayor a 0').optional(),
  per_transaction_limit: z.number().positive('Límite por transacción debe ser mayor a 0').optional(),
  blocked_categories: z.array(z.string()).optional(),
  shipping_address: z.string().optional(),
});

export type CreateCardFormData = z.infer<typeof createCardSchema>;

export const updateCardLimitsSchema = z.object({
  daily_limit: z.number().positive().optional(),
  monthly_limit: z.number().positive().optional(),
  per_transaction_limit: z.number().positive().optional(),
});

export type UpdateCardLimitsFormData = z.infer<typeof updateCardLimitsSchema>;

// ============================================
// VALIDACIONES DE FACTURA (INVOICE)
// ============================================

export const invoiceItemSchema = z.object({
  product_id: z.string().uuid().optional(),
  description: z.string().min(1, 'Descripción es requerida'),
  quantity: z.number().positive('Cantidad debe ser mayor a 0'),
  unit_price: z.number().positive('Precio unitario debe ser mayor a 0'),
  itbis_rate: z.number().min(0).max(100).default(18),
});

export const createInvoiceSchema = z.object({
  customer_id: z.string().uuid('ID de cliente inválido'),
  ncf_type: z.enum(['B01', 'B02', 'B14', 'B15', 'B16']).optional(),
  currency: z.enum(['DOP', 'USD']).default('DOP'),
  issue_date: z.string(),
  due_date: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1, 'Debe agregar al menos un ítem'),
  notes: z.string().optional(),
  terms: z.string().optional(),
});

export type InvoiceItemFormData = z.infer<typeof invoiceItemSchema>;
export type CreateInvoiceFormData = z.infer<typeof createInvoiceSchema>;

// ============================================
// VALIDACIONES DE CLIENTE (CUSTOMER)
// ============================================

export const customerSchema = z.object({
  customer_name: z.string().min(1, 'Nombre del cliente es requerido'),
  rnc_cedula: z
    .string()
    .regex(/^[0-9]{9,11}$/, 'RNC/Cédula inválido')
    .optional()
    .or(z.literal('')),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  payment_terms: z.number().int().positive().default(30),
  notes: z.string().optional(),
});

export type CustomerFormData = z.infer<typeof customerSchema>;

// ============================================
// VALIDACIONES DE PRODUCTO (PRODUCT)
// ============================================

export const productSchema = z.object({
  sku: z.string().optional(),
  product_name: z.string().min(1, 'Nombre del producto es requerido'),
  description: z.string().optional(),
  unit_price: z.number().positive('Precio debe ser mayor a 0'),
  itbis_rate: z.number().min(0).max(100).default(18),
  category: z.string().optional(),
  image_url: z.string().url('URL inválida').optional().or(z.literal('')),
});

export type ProductFormData = z.infer<typeof productSchema>;

// ============================================
// VALIDACIONES DE AUTENTICACIÓN
// ============================================

export const signInSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Contraseña debe tener al menos 8 caracteres'),
});

export type SignInFormData = z.infer<typeof signInSchema>;

export const signUpSchema = z
  .object({
    email: z.string().email('Email inválido'),
    password: z.string().min(8, 'Contraseña debe tener al menos 8 caracteres'),
    confirmPassword: z.string(),
    full_name: z.string().min(1, 'Nombre completo es requerido'),
    company_name: z.string().min(1, 'Nombre de empresa es requerido'),
    rnc: z
      .string()
      .min(9, 'RNC debe tener al menos 9 dígitos')
      .max(11, 'RNC debe tener máximo 11 dígitos')
      .regex(/^[0-9]+$/, 'RNC solo debe contener números'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export type SignUpFormData = z.infer<typeof signUpSchema>;

// ============================================
// VALIDACIONES DE BÚSQUEDA Y FILTROS
// ============================================

export const searchSchema = z.object({
  query: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  sort_by: z.string().optional(),
  sort_order: z.enum(['asc', 'desc']).optional(),
});

export type SearchFormData = z.infer<typeof searchSchema>;

export const dateRangeSchema = z.object({
  from: z.string(),
  to: z.string(),
});

export type DateRangeFormData = z.infer<typeof dateRangeSchema>;

// ============================================
// VALIDACIONES DE CONFIGURACIÓN
// ============================================

export const notificationPreferencesSchema = z.object({
  channel: z.enum(['email', 'sms', 'push', 'in_app']),
  event_type: z.string(),
  enabled: z.boolean(),
});

export type NotificationPreferencesFormData = z.infer<typeof notificationPreferencesSchema>;

export const updatePasswordSchema = z
  .object({
    current_password: z.string().min(1, 'Contraseña actual es requerida'),
    new_password: z.string().min(8, 'Nueva contraseña debe tener al menos 8 caracteres'),
    confirm_new_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_new_password, {
    message: 'Las contraseñas no coinciden',
    path: ['confirm_new_password'],
  });

export type UpdatePasswordFormData = z.infer<typeof updatePasswordSchema>;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Valida datos contra un schema de Zod y retorna errores formateados
 * @param schema Schema de Zod
 * @param data Datos a validar
 * @returns Objeto con éxito y datos/errores
 */
export function validateWithZod<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string[]> } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: Record<string, string[]> = {};
  result.error.errors.forEach((err) => {
    const path = err.path.join('.');
    if (!errors[path]) {
      errors[path] = [];
    }
    errors[path].push(err.message);
  });

  return { success: false, errors };
}
