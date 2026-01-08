// Constantes de la aplicación

// Monedas soportadas
export const CURRENCIES = {
  DOP: {
    code: 'DOP',
    symbol: 'RD$',
    name: 'Peso Dominicano',
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'Dólar Estadounidense',
  },
} as const;

// Tipos de cuenta
export const ACCOUNT_TYPES = {
  CHECKING: 'checking',
  SAVINGS: 'savings',
} as const;

// Estados de cuenta
export const ACCOUNT_STATUSES = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  CLOSED: 'closed',
  PENDING_VERIFICATION: 'pending_verification',
} as const;

// Tipos de transacción
export const TRANSACTION_TYPES = {
  CREDIT: 'credit',
  DEBIT: 'debit',
  TRANSFER: 'transfer',
  FEE: 'fee',
  ADJUSTMENT: 'adjustment',
} as const;

// Estados de transacción
export const TRANSACTION_STATUSES = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REVERSED: 'reversed',
} as const;

// Tipos de transferencia
export const TRANSFER_TYPES = {
  INTERNAL: 'internal',
  TEF: 'tef',
  ACH: 'ach',
  INTERNATIONAL: 'international',
} as const;

// Tipos de tarjeta
export const CARD_TYPES = {
  VIRTUAL: 'virtual',
  PHYSICAL: 'physical',
} as const;

// Estados de tarjeta
export const CARD_STATUSES = {
  ACTIVE: 'active',
  FROZEN: 'frozen',
  CANCELLED: 'cancelled',
  PENDING: 'pending',
} as const;

// Estados de factura
export const INVOICE_STATUSES = {
  DRAFT: 'draft',
  PENDING: 'pending',
  PAID: 'paid',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled',
} as const;

// Roles de usuario
export const USER_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  ACCOUNTANT: 'accountant',
  EMPLOYEE: 'employee',
  VIEWER: 'viewer',
} as const;

// Tipos de NCF (Comprobantes Fiscales - República Dominicana)
export const NCF_TYPES = {
  B01: 'B01', // Facturas de Crédito Fiscal
  B02: 'B02', // Facturas de Consumo
  B14: 'B14', // Facturas para Regímenes Especiales
  B15: 'B15', // Facturas Gubernamentales
  B16: 'B16', // Facturas para Exportaciones
} as const;

// Tasa de ITBIS (Impuesto a la Transferencia de Bienes Industrializados y Servicios)
export const ITBIS_RATE = 18; // 18%

// Límites por defecto
export const DEFAULT_LIMITS = {
  DAILY_TRANSFER: 500000, // RD$ 500,000
  MONTHLY_TRANSFER: 5000000, // RD$ 5,000,000
  CARD_DAILY: 100000, // RD$ 100,000
  CARD_MONTHLY: 1000000, // RD$ 1,000,000
  CARD_PER_TRANSACTION: 50000, // RD$ 50,000
} as const;

// Bancos locales de República Dominicana
export const DOMINICAN_BANKS = [
  'Banco Popular Dominicano',
  'BHD León',
  'Banco de Reservas',
  'Banco Santa Cruz',
  'Banesco',
  'Scotiabank',
  'Citibank',
  'Banco Promerica',
  'Banco López de Haro',
  'Banco Caribe',
  'Banco Múltiple Ademi',
  'Banco BDI',
  'Asociación Popular de Ahorros y Préstamos (APAP)',
  'Banco Vimenca',
] as const;

// Canales de notificación
export const NOTIFICATION_CHANNELS = {
  EMAIL: 'email',
  SMS: 'sms',
  PUSH: 'push',
  IN_APP: 'in_app',
} as const;

// Tipos de eventos de notificación
export const NOTIFICATION_EVENTS = {
  TRANSACTION_RECEIVED: 'transaction_received',
  TRANSACTION_SENT: 'transaction_sent',
  TRANSFER_COMPLETED: 'transfer_completed',
  TRANSFER_FAILED: 'transfer_failed',
  CARD_CREATED: 'card_created',
  CARD_USED: 'card_used',
  INVOICE_CREATED: 'invoice_created',
  INVOICE_PAID: 'invoice_paid',
  INVOICE_OVERDUE: 'invoice_overdue',
  BALANCE_LOW: 'balance_low',
  LOGIN_NEW_DEVICE: 'login_new_device',
  PASSWORD_CHANGED: 'password_changed',
} as const;

// Estados de KYC
export const KYC_STATUSES = {
  PENDING: 'pending',
  IN_REVIEW: 'in_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  REQUIRES_UPDATE: 'requires_update',
} as const;

// Formato de números de cuenta
export const ACCOUNT_NUMBER_PREFIX = 'ACC';
export const ACCOUNT_NUMBER_LENGTH = 11; // ACC + 8 dígitos

// Configuración de paginación
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

// Períodos de tiempo para reportes
export const TIME_PERIODS = {
  TODAY: 'today',
  YESTERDAY: 'yesterday',
  LAST_7_DAYS: 'last_7_days',
  LAST_30_DAYS: 'last_30_days',
  THIS_MONTH: 'this_month',
  LAST_MONTH: 'last_month',
  THIS_YEAR: 'this_year',
  LAST_YEAR: 'last_year',
  CUSTOM: 'custom',
} as const;

// Categorías de gastos predeterminadas
export const EXPENSE_CATEGORIES = [
  'Nómina',
  'Alquiler',
  'Servicios Públicos',
  'Marketing',
  'Tecnología',
  'Suministros de Oficina',
  'Viajes',
  'Comidas y Entretenimiento',
  'Seguros',
  'Impuestos',
  'Honorarios Profesionales',
  'Mantenimiento',
  'Otros',
] as const;

// URLs y endpoints
export const API_ENDPOINTS = {
  DGII_RNC_VALIDATION: 'https://dgii.gov.do/app/WebApps/ConsultasWeb/consultas/rnc.aspx',
  JCE_CEDULA_VALIDATION: 'https://api.jce.gob.do/v1/cedula',
} as const;
