'use server';

/**
 * Admin Login Action
 *
 * Autentica al usuario admin 'godlike' y crea una sesión.
 */

import { cookies } from 'next/headers';

// Credenciales del usuario admin (en producción, estas deberían estar en variables de entorno)
const ADMIN_USERNAME = 'godlike';
const ADMIN_PASSWORD = 'godlike2025!'; // Cambiar en producción

interface AdminLoginInput {
  username: string;
  password: string;
}

interface AdminLoginResult {
  success: boolean;
  error?: string;
}

export async function adminLoginAction(
  input: AdminLoginInput
): Promise<AdminLoginResult> {
  try {
    const { username, password } = input;

    // Validar credenciales
    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return {
        success: false,
        error: 'Usuario o contraseña incorrectos',
      };
    }

    // Crear cookie de sesión (válida por 24 horas)
    const cookieStore = await cookies();
    cookieStore.set('admin_session', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 horas
      path: '/admin',
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error en admin login:', error);
    return {
      success: false,
      error: 'Error al procesar el login',
    };
  }
}

/**
 * Logout del admin
 */
export async function adminLogoutAction(): Promise<{ success: boolean }> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('admin_session');

    return { success: true };
  } catch (error) {
    console.error('Error en admin logout:', error);
    return { success: false };
  }
}

/**
 * Verifica si hay una sesión admin activa
 */
export async function checkAdminSessionAction(): Promise<{
  authenticated: boolean;
}> {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('admin_session');

    return {
      authenticated: session?.value === 'authenticated',
    };
  } catch (error) {
    console.error('Error verificando sesión admin:', error);
    return { authenticated: false };
  }
}
