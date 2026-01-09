import { CURRENCIES } from './constants';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Función para combinar clases de Tailwind (ya existente en el proyecto)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ============================================
// FORMATEO DE MONEDA
// ============================================

/**
 * Formatea un número como moneda
 * @param amount Monto a formatear
 * @param currency Código de moneda (DOP o USD)
 * @param showSymbol Si se muestra el símbolo de la moneda
 * @returns String formateado
 */
export function formatCurrency(
  amount: number,
  currency: 'DOP' | 'USD' = 'DOP',
  showSymbol: boolean = true
): string {
  const currencyInfo = CURRENCIES[currency];
  const formatted = new Intl.NumberFormat('es-DO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return showSymbol ? `${currencyInfo.symbol}${formatted}` : formatted;
}

/**
 * Convierte string de moneda a número
 * @param value String de moneda (ej: "RD$1,234.56" o "1234.56")
 * @returns Número parseado
 */
export function parseCurrency(value: string): number {
  const cleaned = value.replace(/[^0-9.-]/g, '');
  return parseFloat(cleaned) || 0;
}

// ============================================
// VALIDACIÓN DE RNC (Registro Nacional de Contribuyentes)
// ============================================

/**
 * Valida formato de RNC dominicano
 * @param rnc String a validar
 * @returns true si es válido
 */
export function isValidRNC(rnc: string): boolean {
  // RNC debe tener 9 u 11 dígitos
  const cleaned = rnc.replace(/[^0-9]/g, '');
  return cleaned.length === 9 || cleaned.length === 11;
}

/**
 * Formatea RNC con guiones
 * @param rnc RNC a formatear
 * @returns RNC formateado (ej: 123-45678-9)
 */
export function formatRnc(rnc: string): string {
  const cleaned = rnc.replace(/[^0-9]/g, '');

  if (cleaned.length === 9) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 8)}-${cleaned.slice(8)}`;
  }

  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 10)}-${cleaned.slice(10)}`;
  }

  return rnc;
}

// ============================================
// VALIDACIÓN DE CÉDULA DOMINICANA
// ============================================

/**
 * Valida formato de cédula dominicana
 * @param cedula String a validar
 * @returns true si es válida
 */
export function isValidCedula(cedula: string): boolean {
  const cleaned = cedula.replace(/[^0-9]/g, '');

  // Cédula dominicana tiene 11 dígitos
  if (cleaned.length !== 11) {
    return false;
  }

  // Validación del dígito verificador (simplificada)
  // Nota: La validación completa requiere algoritmo específico de la JCE
  const digits = cleaned.split('').map(Number);
  const checkDigit = digits[10];

  // Implementar algoritmo completo si es necesario
  // Por ahora, solo validamos el formato
  return true;
}

/**
 * Formatea cédula con guiones
 * @param cedula Cédula a formatear
 * @returns Cédula formateada (ej: 001-1234567-8)
 */
export function formatCedula(cedula: string): string {
  const cleaned = cedula.replace(/[^0-9]/g, '');

  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 10)}-${cleaned.slice(10)}`;
  }

  return cedula;
}

// ============================================
// FORMATEO DE FECHAS
// ============================================

/**
 * Formatea fecha en formato legible
 * @param date Fecha a formatear
 * @param options Opciones de formato
 * @returns Fecha formateada
 */
export function formatDate(
  date: Date | string,
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  };

  return new Intl.DateTimeFormat('es-DO', defaultOptions).format(dateObj);
}

/**
 * Formatea fecha y hora
 * @param date Fecha a formatear
 * @returns Fecha y hora formateada
 */
export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  return new Intl.DateTimeFormat('es-DO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
}

/**
 * Calcula fecha relativa (ej: "hace 2 días")
 * @param date Fecha a formatear
 * @returns String de fecha relativa
 */
export function formatRelativeDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInMs = now.getTime() - dateObj.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    return 'Hoy';
  } else if (diffInDays === 1) {
    return 'Ayer';
  } else if (diffInDays < 7) {
    return `Hace ${diffInDays} días`;
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return `Hace ${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`;
  } else if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    return `Hace ${months} ${months === 1 ? 'mes' : 'meses'}`;
  } else {
    const years = Math.floor(diffInDays / 365);
    return `Hace ${years} ${years === 1 ? 'año' : 'años'}`;
  }
}

// ============================================
// VALIDACIÓN DE NCF
// ============================================

/**
 * Valida formato de NCF (Número de Comprobante Fiscal)
 * @param ncf String a validar
 * @returns true si es válido
 */
export function isValidNCF(ncf: string): boolean {
  // Formato: E + 3 dígitos del tipo + 8 dígitos del establecimiento + 8 dígitos secuenciales
  // Ejemplo: E310000000001 (19 caracteres)
  const ncfPattern = /^[A-Z][0-9]{18}$/;
  return ncfPattern.test(ncf);
}

/**
 * Formatea NCF con espacios para legibilidad
 * @param ncf NCF a formatear
 * @returns NCF formateado
 */
export function formatNCF(ncf: string): string {
  if (ncf.length === 19) {
    return `${ncf.slice(0, 1)} ${ncf.slice(1, 4)} ${ncf.slice(4, 12)} ${ncf.slice(12)}`;
  }
  return ncf;
}

// ============================================
// CÁLCULOS FINANCIEROS
// ============================================

/**
 * Calcula el ITBIS (Impuesto sobre Transferencias)
 * @param amount Monto base
 * @param rate Tasa de ITBIS (por defecto 18%)
 * @returns Monto de ITBIS
 */
export function calculateITBIS(amount: number, rate: number = 18): number {
  return Math.round((amount * (rate / 100)) * 100) / 100;
}

/**
 * Calcula el total con ITBIS incluido
 * @param amount Monto base
 * @param rate Tasa de ITBIS (por defecto 18%)
 * @returns Total con ITBIS
 */
export function calculateTotalWithITBIS(amount: number, rate: number = 18): number {
  return amount + calculateITBIS(amount, rate);
}

/**
 * Extrae el monto base de un total con ITBIS
 * @param total Total con ITBIS incluido
 * @param rate Tasa de ITBIS (por defecto 18%)
 * @returns Monto base sin ITBIS
 */
export function extractBaseFromTotal(total: number, rate: number = 18): number {
  return Math.round((total / (1 + rate / 100)) * 100) / 100;
}

// ============================================
// HELPERS GENERALES
// ============================================

/**
 * Genera un número de cuenta único
 * @returns Número de cuenta (ej: ACC12345678)
 */
export function generateAccountNumber(): string {
  const randomNumber = Math.floor(Math.random() * 100000000);
  return `ACC${randomNumber.toString().padStart(8, '0')}`;
}

/**
 * Trunca texto largo
 * @param text Texto a truncar
 * @param maxLength Longitud máxima
 * @returns Texto truncado
 */
export function truncateText(text: string, maxLength: number = 50): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

/**
 * Capitaliza primera letra de cada palabra
 * @param text Texto a capitalizar
 * @returns Texto capitalizado
 */
export function capitalizeWords(text: string): string {
  return text
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Genera iniciales de un nombre
 * @param name Nombre completo
 * @returns Iniciales (ej: "Juan Pérez" -> "JP")
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Valida email
 * @param email Email a validar
 * @returns true si es válido
 */
export function isValidEmail(email: string): boolean {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

/**
 * Valida número de teléfono dominicano
 * @param phone Teléfono a validar
 * @returns true si es válido
 */
export function isValidDominicanPhone(phone: string): boolean {
  const cleaned = phone.replace(/[^0-9]/g, '');
  // Teléfonos dominicanos: 10 dígitos (809/829/849 + 7 dígitos)
  if (cleaned.length !== 10) return false;

  const areaCode = cleaned.slice(0, 3);
  return ['809', '829', '849'].includes(areaCode);
}

/**
 * Formatea número de teléfono
 * @param phone Teléfono a formatear
 * @returns Teléfono formateado (ej: (809) 123-4567)
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/[^0-9]/g, '');

  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  return phone;
}

/**
 * Genera un color basado en string (para avatars)
 * @param str String base
 * @returns Color hexadecimal
 */
export function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const colors = [
    '#3B82F6', // blue
    '#10B981', // green
    '#F59E0B', // amber
    '#EF4444', // red
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#06B6D4', // cyan
  ];

  return colors[Math.abs(hash) % colors.length];
}

/**
 * Formatea números grandes con sufijos (K, M, B)
 * @param num Número a formatear
 * @returns String formateado (ej: "1.2M")
 */
export function formatCompactNumber(num: number): string {
  if (num < 1000) return num.toString();

  const suffixes = ['', 'K', 'M', 'B', 'T'];
  const tier = (Math.log10(Math.abs(num)) / 3) | 0;

  if (tier === 0) return num.toString();

  const suffix = suffixes[tier];
  const scale = Math.pow(10, tier * 3);
  const scaled = num / scale;

  return scaled.toFixed(1) + suffix;
}

/**
 * Descarga un archivo desde el navegador
 * @param data Contenido del archivo
 * @param filename Nombre del archivo
 * @param type Tipo MIME
 */
export function downloadFile(data: string | Blob, filename: string, type: string = 'text/plain'): void {
  const blob = typeof data === 'string' ? new Blob([data], { type }) : data;
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Copia texto al portapapeles
 * @param text Texto a copiar
 * @returns Promise<boolean> - true si se copió exitosamente
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Error copying to clipboard:', err);
    return false;
  }
}

/**
 * Sleep/delay asíncrono
 * @param ms Milisegundos a esperar
 * @returns Promise que se resuelve después del tiempo especificado
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
