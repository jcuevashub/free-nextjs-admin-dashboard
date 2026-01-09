/**
 * Welcome Email Template
 *
 * Email enviado cuando un caso de onboarding es aprobado
 */

interface Account {
  currency: 'DOP' | 'USD';
  account_number: string;
}

export interface WelcomeEmailData {
  userName: string;
  companyName: string;
  rnc: string;
  accounts: Account[];
  loginUrl?: string;
}

/**
 * Generate welcome email HTML
 */
export function generateWelcomeEmail(data: WelcomeEmailData): string {
  const { userName, companyName, rnc, accounts, loginUrl = 'https://fintechrd.com/signin' } = data;

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>¡Bienvenido a Fintech RD!</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f6f9fc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f9fc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center;">
              <div style="width: 60px; height: 60px; margin: 0 auto 20px auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 32px;">🎉</span>
              </div>
              <h1 style="margin: 0; font-size: 32px; font-weight: bold; color: #1a202c;">
                ¡Bienvenido a Fintech RD!
              </h1>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 0 40px 20px 40px;">
              <p style="margin: 0; font-size: 16px; line-height: 24px; color: #4a5568;">
                Hola <strong>${userName}</strong>,
              </p>
            </td>
          </tr>

          <!-- Main Message -->
          <tr>
            <td style="padding: 0 40px 20px 40px;">
              <p style="margin: 0; font-size: 16px; line-height: 24px; color: #4a5568;">
                ¡Excelentes noticias! Tu solicitud de apertura de cuenta empresarial para <strong>${companyName}</strong> ha sido aprobada.
              </p>
            </td>
          </tr>

          <!-- Company Info Box -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f7fafc; border-radius: 8px; padding: 20px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 10px 0; font-size: 14px; color: #718096;">
                      <strong style="color: #2d3748;">Empresa:</strong> ${companyName}
                    </p>
                    <p style="margin: 0; font-size: 14px; color: #718096;">
                      <strong style="color: #2d3748;">RNC:</strong> ${rnc}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Accounts Section -->
          <tr>
            <td style="padding: 0 40px 20px 40px;">
              <h2 style="margin: 0 0 15px 0; font-size: 20px; font-weight: 600; color: #2d3748;">
                Tus Cuentas
              </h2>
            </td>
          </tr>

          ${accounts.map((account) => `
          <tr>
            <td style="padding: 0 40px 15px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 2px solid #e2e8f0; border-radius: 8px; padding: 15px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 5px 0; font-size: 16px; font-weight: 600; color: #2d3748;">
                      Cuenta ${account.currency === 'DOP' ? 'en Pesos (DOP)' : 'en Dólares (USD)'}
                    </p>
                    <p style="margin: 0; font-size: 14px; color: #718096; font-family: 'Courier New', monospace;">
                      ${account.account_number}
                    </p>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; padding: 4px 12px; background-color: #48bb78; color: white; border-radius: 12px; font-size: 12px; font-weight: 600;">
                      Activa
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          `).join('')}

          <!-- Next Steps -->
          <tr>
            <td style="padding: 30px 40px 20px 40px;">
              <h2 style="margin: 0 0 15px 0; font-size: 20px; font-weight: 600; color: #2d3748;">
                Próximos Pasos
              </h2>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 40px 20px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-bottom: 12px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="30" valign="top">
                          <div style="width: 24px; height: 24px; background-color: #667eea; color: white; border-radius: 50%; text-align: center; line-height: 24px; font-weight: bold; font-size: 14px;">1</div>
                        </td>
                        <td style="padding-left: 12px;">
                          <p style="margin: 0; font-size: 14px; color: #4a5568;">
                            <strong style="color: #2d3748;">Inicia sesión en tu cuenta</strong>
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 12px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="30" valign="top">
                          <div style="width: 24px; height: 24px; background-color: #667eea; color: white; border-radius: 50%; text-align: center; line-height: 24px; font-weight: bold; font-size: 14px;">2</div>
                        </td>
                        <td style="padding-left: 12px;">
                          <p style="margin: 0; font-size: 14px; color: #4a5568;">
                            <strong style="color: #2d3748;">Completa la configuración inicial</strong>
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 12px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="30" valign="top">
                          <div style="width: 24px; height: 24px; background-color: #667eea; color: white; border-radius: 50%; text-align: center; line-height: 24px; font-weight: bold; font-size: 14px;">3</div>
                        </td>
                        <td style="padding-left: 12px;">
                          <p style="margin: 0; font-size: 14px; color: #4a5568;">
                            <strong style="color: #2d3748;">Invita a tu equipo</strong>
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="30" valign="top">
                          <div style="width: 24px; height: 24px; background-color: #667eea; color: white; border-radius: 50%; text-align: center; line-height: 24px; font-weight: bold; font-size: 14px;">4</div>
                        </td>
                        <td style="padding-left: 12px;">
                          <p style="margin: 0; font-size: 14px; color: #4a5568;">
                            <strong style="color: #2d3748;">Realiza tu primera transacción</strong>
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding: 20px 40px 40px 40px;" align="center">
              <a href="${loginUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Iniciar Sesión
              </a>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px;">
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 0;">
            </td>
          </tr>

          <!-- Support Info -->
          <tr>
            <td style="padding: 30px 40px 20px 40px;">
              <p style="margin: 0 0 10px 0; font-size: 14px; color: #718096;">
                ¿Necesitas ayuda? Estamos aquí para ti:
              </p>
              <p style="margin: 0 0 5px 0; font-size: 14px; color: #718096;">
                📧 <a href="mailto:soporte@fintechrd.com" style="color: #667eea; text-decoration: none;">soporte@fintechrd.com</a>
              </p>
              <p style="margin: 0; font-size: 14px; color: #718096;">
                📞 +1 (809) 555-3000
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px 40px 40px; text-align: center;">
              <p style="margin: 0 0 10px 0; font-size: 12px; color: #a0aec0;">
                Este email fue enviado por Fintech RD
              </p>
              <p style="margin: 0; font-size: 12px; color: #a0aec0;">
                Av. Winston Churchill, Torre Empresarial, Piso 10<br>
                Santo Domingo, República Dominicana
              </p>
              <p style="margin: 15px 0 0 0; font-size: 12px; color: #a0aec0;">
                © ${new Date().getFullYear()} Fintech RD. Todos los derechos reservados.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Generate plain text version of welcome email
 * (fallback for email clients that don't support HTML)
 */
export function generateWelcomeEmailText(data: WelcomeEmailData): string {
  const { userName, companyName, rnc, accounts, loginUrl = 'https://fintechrd.com/signin' } = data;

  const accountsList = accounts
    .map((acc) => `  - Cuenta ${acc.currency}: ${acc.account_number}`)
    .join('\n');

  return `
¡Bienvenido a Fintech RD!

Hola ${userName},

¡Excelentes noticias! Tu solicitud de apertura de cuenta empresarial para ${companyName} ha sido aprobada.

Empresa: ${companyName}
RNC: ${rnc}

TUS CUENTAS:
${accountsList}

PRÓXIMOS PASOS:

1. Inicia sesión en tu cuenta
2. Completa la configuración inicial
3. Invita a tu equipo
4. Realiza tu primera transacción

Iniciar sesión: ${loginUrl}

¿Necesitas ayuda?
Email: soporte@fintechrd.com
Teléfono: +1 (809) 555-3000

---
Este email fue enviado por Fintech RD
Av. Winston Churchill, Torre Empresarial, Piso 10
Santo Domingo, República Dominicana

© ${new Date().getFullYear()} Fintech RD. Todos los derechos reservados.
  `.trim();
}
