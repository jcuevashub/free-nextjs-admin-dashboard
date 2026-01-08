import { Metadata } from "next";
import Link from "next/link";
import { ChevronLeftIcon } from "@/icons";

export const metadata: Metadata = {
  title: "Política de Privacidad | Fintech RD",
  description: "Política de privacidad y protección de datos personales",
};

export default function PrivacyPolicy() {
  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto bg-white dark:bg-gray-900">
      <div className="w-full max-w-4xl px-6 py-10 mx-auto sm:px-8 lg:px-12">
        {/* Header with back button */}
        <div className="mb-8">
          <Link
            href="/signup"
            className="inline-flex items-center mb-6 text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <ChevronLeftIcon />
            Volver
          </Link>

          <h1 className="mb-4 font-bold text-gray-800 text-title-lg dark:text-white/90 sm:text-title-xl">
            Política de Privacidad
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Última actualización: {new Date().toLocaleDateString('es-DO', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8 text-gray-700 dark:text-gray-300">
          {/* Introduction */}
          <section>
            <p className="mb-4 leading-relaxed">
              En cumplimiento con la Ley 172-13 sobre Protección de Datos Personales de la República Dominicana, esta Política de Privacidad describe cómo recopilamos, usamos, protegemos y compartimos su información personal cuando utiliza nuestra plataforma de servicios financieros digitales.
            </p>
            <p className="leading-relaxed">
              Al usar nuestros servicios, usted consiente la recopilación y el uso de su información de acuerdo con esta política.
            </p>
          </section>

          {/* Section 1 */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-800 dark:text-white/90">
              1. Información que Recopilamos
            </h2>
            <p className="mb-3 leading-relaxed">
              Recopilamos diferentes tipos de información para proporcionarle y mejorar nuestros servicios:
            </p>

            <div className="space-y-4">
              <div>
                <h3 className="mb-2 text-lg font-medium text-gray-800 dark:text-white/90">
                  1.1 Información Personal
                </h3>
                <ul className="pl-6 space-y-2 list-disc">
                  <li>Nombre completo y apellidos</li>
                  <li>Número de cédula de identidad o pasaporte</li>
                  <li>Fecha de nacimiento</li>
                  <li>Dirección residencial y postal</li>
                  <li>Número de teléfono y correo electrónico</li>
                  <li>Fotografía (selfie) y datos biométricos para verificación de identidad</li>
                  <li>Firma digital</li>
                </ul>
              </div>

              <div>
                <h3 className="mb-2 text-lg font-medium text-gray-800 dark:text-white/90">
                  1.2 Información Empresarial
                </h3>
                <ul className="pl-6 space-y-2 list-disc">
                  <li>Nombre comercial y legal de la empresa</li>
                  <li>Número de Registro Nacional de Contribuyentes (RNC)</li>
                  <li>Acta constitutiva y documentos de registro mercantil</li>
                  <li>Información sobre beneficiarios finales (UBO)</li>
                  <li>Actividad económica y sector industrial</li>
                  <li>Volumen de transacciones esperado</li>
                </ul>
              </div>

              <div>
                <h3 className="mb-2 text-lg font-medium text-gray-800 dark:text-white/90">
                  1.3 Información Financiera
                </h3>
                <ul className="pl-6 space-y-2 list-disc">
                  <li>Información de cuentas bancarias</li>
                  <li>Historial de transacciones</li>
                  <li>Tarjetas de crédito/débito vinculadas</li>
                  <li>Estados financieros y documentos contables</li>
                  <li>Declaraciones fiscales (IT-1, DGII)</li>
                </ul>
              </div>

              <div>
                <h3 className="mb-2 text-lg font-medium text-gray-800 dark:text-white/90">
                  1.4 Información Técnica
                </h3>
                <ul className="pl-6 space-y-2 list-disc">
                  <li>Dirección IP y datos de geolocalización</li>
                  <li>Tipo de navegador y dispositivo</li>
                  <li>Cookies y tecnologías similares</li>
                  <li>Registros de actividad en la plataforma (logs)</li>
                  <li>Metadatos de archivos subidos</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-800 dark:text-white/90">
              2. Cómo Usamos su Información
            </h2>
            <p className="mb-3 leading-relaxed">
              Utilizamos la información recopilada para los siguientes propósitos:
            </p>
            <ul className="pl-6 space-y-2 list-disc">
              <li>Verificar su identidad mediante procesos KYC/KYB (Know Your Customer/Business)</li>
              <li>Cumplir con regulaciones anti-lavado de activos (AML) y financiamiento del terrorismo (CFT)</li>
              <li>Procesar transacciones financieras (transferencias, pagos, retiros)</li>
              <li>Emitir y gestionar tarjetas virtuales y físicas</li>
              <li>Generar comprobantes fiscales electrónicos (e-CF)</li>
              <li>Prevenir fraude y actividades sospechosas mediante análisis automatizado</li>
              <li>Proporcionar soporte al cliente y resolver disputas</li>
              <li>Enviar notificaciones sobre el estado de sus transacciones</li>
              <li>Mejorar la seguridad y funcionalidad de nuestra plataforma</li>
              <li>Cumplir con obligaciones legales y requerimientos de autoridades</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-800 dark:text-white/90">
              3. Base Legal para el Procesamiento de Datos
            </h2>
            <p className="mb-3 leading-relaxed">
              Procesamos sus datos personales basándonos en las siguientes bases legales según la Ley 172-13:
            </p>
            <ul className="pl-6 space-y-2 list-disc">
              <li><strong>Consentimiento:</strong> Usted consiente explícitamente el procesamiento al aceptar estos términos</li>
              <li><strong>Ejecución de contrato:</strong> Para proporcionarle los servicios financieros solicitados</li>
              <li><strong>Obligación legal:</strong> Para cumplir con regulaciones de la Superintendencia de Bancos, DGII, y leyes AML/CFT</li>
              <li><strong>Interés legítimo:</strong> Para prevenir fraude y proteger la seguridad de la plataforma</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-800 dark:text-white/90">
              4. Compartir Información con Terceros
            </h2>
            <p className="mb-3 leading-relaxed">
              Podemos compartir su información personal con terceros en las siguientes circunstancias:
            </p>

            <div className="space-y-4">
              <div>
                <h3 className="mb-2 text-lg font-medium text-gray-800 dark:text-white/90">
                  4.1 Proveedores de Servicios
                </h3>
                <ul className="pl-6 space-y-2 list-disc">
                  <li><strong>Socure Inc.:</strong> Verificación de identidad, liveness detection, y evaluación de fraude</li>
                  <li><strong>Sanctions.io / OFAC-API:</strong> Screening contra listas de sanciones y PEP</li>
                  <li><strong>Supabase:</strong> Almacenamiento seguro de datos en servidores cifrados</li>
                  <li><strong>Proveedores de pagos:</strong> Para procesar transferencias y transacciones</li>
                </ul>
              </div>

              <div>
                <h3 className="mb-2 text-lg font-medium text-gray-800 dark:text-white/90">
                  4.2 Autoridades Gubernamentales
                </h3>
                <ul className="pl-6 space-y-2 list-disc">
                  <li>Superintendencia de Bancos de la República Dominicana</li>
                  <li>Dirección General de Impuestos Internos (DGII)</li>
                  <li>Unidad de Análisis Financiero (UAF)</li>
                  <li>Procuraduría General de la República (cuando sea requerido por ley)</li>
                </ul>
              </div>

              <div>
                <h3 className="mb-2 text-lg font-medium text-gray-800 dark:text-white/90">
                  4.3 Transferencias Internacionales de Datos
                </h3>
                <p className="mb-2 leading-relaxed">
                  Algunos de nuestros proveedores de servicios pueden estar ubicados fuera de la República Dominicana. En estos casos, implementamos medidas de seguridad apropiadas para proteger su información, incluyendo:
                </p>
                <ul className="pl-6 space-y-2 list-disc">
                  <li>Cláusulas contractuales estándar aprobadas</li>
                  <li>Certificaciones de privacidad (Privacy Shield, ISO 27001)</li>
                  <li>Cifrado de datos en tránsito y en reposo</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-800 dark:text-white/90">
              5. Seguridad de la Información
            </h2>
            <p className="mb-3 leading-relaxed">
              Implementamos medidas técnicas y organizativas para proteger su información personal:
            </p>
            <ul className="pl-6 space-y-2 list-disc">
              <li><strong>Cifrado:</strong> TLS 1.3 para datos en tránsito, AES-256 para datos en reposo</li>
              <li><strong>Autenticación multifactor (2FA):</strong> Obligatoria para cuentas administrativas</li>
              <li><strong>Control de acceso:</strong> Políticas RLS (Row Level Security) en base de datos</li>
              <li><strong>Monitoreo continuo:</strong> Sistemas de detección de intrusiones y anomalías</li>
              <li><strong>Auditorías:</strong> Registros inmutables de todas las acciones administrativas</li>
              <li><strong>Backup:</strong> Copias de seguridad diarias cifradas con retención de 30 días</li>
              <li><strong>Capacitación:</strong> Personal entrenado en mejores prácticas de seguridad</li>
            </ul>
            <p className="mt-3 leading-relaxed">
              A pesar de nuestros esfuerzos, ningún método de transmisión por internet o almacenamiento electrónico es 100% seguro. No podemos garantizar la seguridad absoluta de su información.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-800 dark:text-white/90">
              6. Sus Derechos según la Ley 172-13
            </h2>
            <p className="mb-3 leading-relaxed">
              Usted tiene los siguientes derechos sobre sus datos personales:
            </p>
            <ul className="pl-6 space-y-2 list-disc">
              <li><strong>Derecho de acceso:</strong> Solicitar una copia de sus datos personales</li>
              <li><strong>Derecho de rectificación:</strong> Corregir datos inexactos o incompletos</li>
              <li><strong>Derecho de cancelación:</strong> Solicitar la eliminación de sus datos (sujeto a obligaciones legales)</li>
              <li><strong>Derecho de oposición:</strong> Oponerse al procesamiento de sus datos para ciertos fines</li>
              <li><strong>Derecho de portabilidad:</strong> Recibir sus datos en formato estructurado y transferible</li>
              <li><strong>Derecho de limitación:</strong> Solicitar la restricción del procesamiento en ciertas circunstancias</li>
            </ul>
            <p className="mt-3 leading-relaxed">
              Para ejercer estos derechos, puede contactarnos a través de{" "}
              <a
                href="mailto:privacidad@fintechrd.com"
                className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                privacidad@fintechrd.com
              </a>
              . Responderemos su solicitud dentro de los 15 días hábiles establecidos por la ley.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-800 dark:text-white/90">
              7. Retención de Datos
            </h2>
            <p className="mb-3 leading-relaxed">
              Conservamos su información personal durante el tiempo necesario para:
            </p>
            <ul className="pl-6 space-y-2 list-disc">
              <li>Proporcionar nuestros servicios mientras su cuenta esté activa</li>
              <li>Cumplir con obligaciones legales (mínimo 5 años para registros financieros según ley dominicana)</li>
              <li>Resolver disputas y hacer cumplir nuestros acuerdos</li>
              <li>Mantener registros de auditoría para fines de compliance AML/CFT</li>
            </ul>
            <p className="mt-3 leading-relaxed">
              Después de este período, sus datos serán eliminados de manera segura o anonimizados para análisis estadísticos.
            </p>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-800 dark:text-white/90">
              8. Cookies y Tecnologías de Rastreo
            </h2>
            <p className="mb-3 leading-relaxed">
              Utilizamos cookies y tecnologías similares para:
            </p>
            <ul className="pl-6 space-y-2 list-disc">
              <li>Mantener su sesión activa de forma segura</li>
              <li>Recordar sus preferencias y configuraciones</li>
              <li>Analizar el uso de la plataforma y mejorar la experiencia del usuario</li>
              <li>Detectar y prevenir actividades fraudulentas</li>
            </ul>
            <p className="mt-3 leading-relaxed">
              Puede configurar su navegador para rechazar cookies, aunque esto puede afectar la funcionalidad de la plataforma.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-800 dark:text-white/90">
              9. Privacidad de Menores
            </h2>
            <p className="leading-relaxed">
              Nuestros servicios están dirigidos a empresas y personas mayores de 18 años. No recopilamos intencionalmente información personal de menores de edad. Si descubrimos que hemos recopilado datos de un menor, eliminaremos esa información inmediatamente.
            </p>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-800 dark:text-white/90">
              10. Cambios a esta Política
            </h2>
            <p className="leading-relaxed">
              Podemos actualizar esta Política de Privacidad periódicamente. Le notificaremos sobre cambios significativos publicando la nueva política en esta página y actualizando la fecha de "Última actualización". Le recomendamos revisar esta política regularmente para estar informado sobre cómo protegemos su información.
            </p>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-800 dark:text-white/90">
              11. Contacto y Quejas
            </h2>
            <p className="mb-3 leading-relaxed">
              Si tiene preguntas, inquietudes o quejas sobre esta Política de Privacidad o nuestras prácticas de datos, puede contactarnos:
            </p>
            <div className="p-4 mt-3 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
              <p className="mb-2">
                <strong className="text-gray-800 dark:text-white/90">Oficial de Protección de Datos:</strong>{" "}
                <a
                  href="mailto:privacidad@fintechrd.com"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  privacidad@fintechrd.com
                </a>
              </p>
              <p className="mb-2">
                <strong className="text-gray-800 dark:text-white/90">Teléfono:</strong>{" "}
                +1 (809) 555-3000
              </p>
              <p className="mb-2">
                <strong className="text-gray-800 dark:text-white/90">Dirección:</strong>{" "}
                Av. Winston Churchill, Torre Empresarial, Piso 10, Santo Domingo, República Dominicana
              </p>
              <p className="mt-3 text-sm">
                <strong className="text-gray-800 dark:text-white/90">Autoridad de Control:</strong>
                <br />
                Si no está satisfecho con nuestra respuesta, puede presentar una queja ante:
                <br />
                <span className="text-brand-500 dark:text-brand-400">
                  Dirección de Protección de Datos Personales (ProDATAP)
                </span>
              </p>
            </div>
          </section>

          {/* Section 12 */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-800 dark:text-white/90">
              12. Cumplimiento Normativo
            </h2>
            <p className="mb-3 leading-relaxed">
              Esta política cumple con:
            </p>
            <ul className="pl-6 space-y-2 list-disc">
              <li>Ley 172-13 sobre Protección de Datos Personales (República Dominicana)</li>
              <li>Ley 155-17 contra el Lavado de Activos y el Financiamiento del Terrorismo</li>
              <li>Reglamento General de Protección de Datos (GDPR) - para usuarios en la UE</li>
              <li>FATCA (Foreign Account Tax Compliance Act) - para reportes internacionales</li>
              <li>CRS (Common Reporting Standard) - para intercambio automático de información</li>
            </ul>
          </section>
        </div>

        {/* Footer */}
        <div className="pt-8 mt-12 border-t border-gray-200 dark:border-gray-700">
          <p className="mb-3 text-sm text-center text-gray-500 dark:text-gray-400">
            Al usar nuestros servicios, usted acepta el procesamiento de sus datos según esta Política de Privacidad.
          </p>
          <p className="text-sm text-center text-gray-500 dark:text-gray-400">
            Para más información, consulte nuestros{" "}
            <Link
              href="/terms"
              className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
            >
              Términos y Condiciones
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
