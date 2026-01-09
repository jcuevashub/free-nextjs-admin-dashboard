import { Metadata } from "next";
import Link from "next/link";
import { ChevronLeftIcon } from "@/icons";

export const metadata: Metadata = {
  title: "Términos y Condiciones | Fintech RD",
  description: "Términos y condiciones de uso de la plataforma",
};

export default function TermsAndConditions() {
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
            Términos y Condiciones
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
          {/* Section 1 */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-800 dark:text-white/90">
              1. Aceptación de los Términos
            </h2>
            <p className="mb-3 leading-relaxed">
              Al acceder y usar esta plataforma de servicios financieros digitales, usted acepta estar sujeto a estos Términos y Condiciones, todas las leyes y regulaciones aplicables de la República Dominicana, y acepta que es responsable del cumplimiento de todas las leyes locales aplicables.
            </p>
            <p className="leading-relaxed">
              Si no está de acuerdo con alguno de estos términos, está prohibido usar o acceder a este sitio. Los materiales contenidos en este sitio web están protegidos por las leyes de derechos de autor y marcas comerciales aplicables.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-800 dark:text-white/90">
              2. Servicios Ofrecidos
            </h2>
            <p className="mb-3 leading-relaxed">
              Nuestra plataforma ofrece servicios de gestión financiera digital para empresas en la República Dominicana, incluyendo pero no limitado a:
            </p>
            <ul className="pl-6 space-y-2 list-disc">
              <li>Apertura y gestión de cuentas bancarias empresariales</li>
              <li>Procesamiento de transferencias nacionales e internacionales</li>
              <li>Emisión y gestión de tarjetas virtuales y físicas</li>
              <li>Facturación electrónica y gestión de comprobantes fiscales</li>
              <li>Herramientas de contabilidad y gestión financiera</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-800 dark:text-white/90">
              3. Registro y Verificación de Identidad (KYC/KYB)
            </h2>
            <p className="mb-3 leading-relaxed">
              Para usar nuestros servicios, debe completar un proceso de verificación de identidad (Know Your Customer - KYC) y verificación empresarial (Know Your Business - KYB) que incluye:
            </p>
            <ul className="pl-6 space-y-2 list-disc">
              <li>Proporcionar información personal y empresarial precisa</li>
              <li>Subir documentos válidos (RNC, cédula, acta constitutiva, etc.)</li>
              <li>Verificación biométrica mediante selfie y liveness detection</li>
              <li>Screening contra listas de sanciones OFAC/PEP</li>
              <li>Evaluación de fraude mediante sistemas automatizados</li>
            </ul>
            <p className="mt-3 leading-relaxed">
              Nos reservamos el derecho de rechazar o suspender cuentas que no cumplan con nuestros estándares de verificación o que presenten riesgos de lavado de activos o financiamiento del terrorismo.
            </p>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-800 dark:text-white/90">
              4. Uso de la Licencia
            </h2>
            <p className="mb-3 leading-relaxed">
              Se le concede permiso para usar temporalmente los servicios de esta plataforma únicamente para fines comerciales legítimos y transaccionales. Esta es la concesión de una licencia, no una transferencia de título, y bajo esta licencia usted no puede:
            </p>
            <ul className="pl-6 space-y-2 list-disc">
              <li>Modificar o copiar los materiales del servicio</li>
              <li>Usar los materiales para cualquier propósito comercial no autorizado</li>
              <li>Intentar descompilar o realizar ingeniería inversa de cualquier software del servicio</li>
              <li>Eliminar cualquier derecho de autor u otras notaciones de propiedad de los materiales</li>
              <li>Transferir los materiales a otra persona o &quot;reflejar&quot; los materiales en cualquier otro servidor</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-800 dark:text-white/90">
              5. Privacidad y Protección de Datos
            </h2>
            <p className="leading-relaxed">
              Su privacidad es importante para nosotros. Consulte nuestra{" "}
              <Link
                href="/privacy"
                className="text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300"
              >
                Política de Privacidad
              </Link>
              {" "}para entender cómo recopilamos, usamos y protegemos su información personal de acuerdo con la Ley 172-13 de Protección de Datos Personales de la República Dominicana.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-800 dark:text-white/90">
              6. Tarifas y Cargos
            </h2>
            <p className="mb-3 leading-relaxed">
              El uso de ciertos servicios puede estar sujeto a tarifas y cargos que se le comunicarán antes de realizar transacciones. Al usar estos servicios, usted acepta pagar todas las tarifas aplicables.
            </p>
            <p className="leading-relaxed">
              Nos reservamos el derecho de modificar nuestras tarifas con previo aviso de 30 días naturales.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-800 dark:text-white/90">
              7. Limitaciones de Responsabilidad
            </h2>
            <p className="leading-relaxed">
              En ningún caso la empresa o sus proveedores serán responsables de daños (incluyendo, sin limitación, daños por pérdida de datos o ganancias, o debido a interrupción del negocio) que surjan del uso o la imposibilidad de usar los servicios, incluso si hemos sido notificados de la posibilidad de tales daños.
            </p>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-800 dark:text-white/90">
              8. Precisión de los Materiales
            </h2>
            <p className="leading-relaxed">
              Los materiales que aparecen en nuestra plataforma podrían incluir errores técnicos, tipográficos o fotográficos. No garantizamos que ninguno de los materiales en este servicio sea preciso, completo o actual. Podemos hacer cambios a los materiales contenidos en nuestro servicio en cualquier momento sin previo aviso.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-800 dark:text-white/90">
              9. Cumplimiento Regulatorio
            </h2>
            <p className="mb-3 leading-relaxed">
              Nuestra plataforma cumple con todas las regulaciones aplicables de la República Dominicana, incluyendo:
            </p>
            <ul className="pl-6 space-y-2 list-disc">
              <li>Ley 155-17 contra el Lavado de Activos y el Financiamiento del Terrorismo</li>
              <li>Ley 172-13 sobre Protección de Datos Personales</li>
              <li>Normativas de la Superintendencia de Bancos</li>
              <li>Normativas de la Dirección General de Impuestos Internos (DGII)</li>
              <li>Regulaciones FATCA y CRS para cumplimiento internacional</li>
            </ul>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-800 dark:text-white/90">
              10. Suspensión y Terminación
            </h2>
            <p className="leading-relaxed">
              Nos reservamos el derecho de suspender o terminar su acceso a la plataforma en cualquier momento, sin previo aviso, por conducta que creamos viola estos Términos y Condiciones, es dañina para otros usuarios, para nosotros o para terceros, o por cualquier otra razón que consideremos necesaria.
            </p>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-800 dark:text-white/90">
              11. Modificaciones de los Términos
            </h2>
            <p className="leading-relaxed">
              Podemos revisar estos términos de servicio en cualquier momento sin previo aviso. Al usar este sitio web, usted acepta estar sujeto a la versión actual de estos Términos y Condiciones. Le recomendamos revisar periódicamente esta página para estar al tanto de cualquier cambio.
            </p>
          </section>

          {/* Section 12 */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-800 dark:text-white/90">
              12. Ley Aplicable
            </h2>
            <p className="leading-relaxed">
              Estos términos y condiciones se rigen e interpretan de acuerdo con las leyes de la República Dominicana, y usted se somete irrevocablemente a la jurisdicción exclusiva de los tribunales de ese país.
            </p>
          </section>

          {/* Section 13 */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-800 dark:text-white/90">
              13. Contacto
            </h2>
            <p className="leading-relaxed">
              Si tiene alguna pregunta sobre estos Términos y Condiciones, puede contactarnos en:
            </p>
            <div className="p-4 mt-3 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
              <p className="mb-2">
                <strong className="text-gray-800 dark:text-white/90">Email:</strong>{" "}
                <a
                  href="mailto:legal@fintechrd.com"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  legal@fintechrd.com
                </a>
              </p>
              <p className="mb-2">
                <strong className="text-gray-800 dark:text-white/90">Teléfono:</strong>{" "}
                +1 (809) 555-3000
              </p>
              <p>
                <strong className="text-gray-800 dark:text-white/90">Dirección:</strong>{" "}
                Av. Winston Churchill, Torre Empresarial, Piso 10, Santo Domingo, República Dominicana
              </p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="pt-8 mt-12 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-center text-gray-500 dark:text-gray-400">
            Al usar nuestros servicios, usted acepta estos términos y condiciones en su totalidad.
          </p>
        </div>
      </div>
    </div>
  );
}
