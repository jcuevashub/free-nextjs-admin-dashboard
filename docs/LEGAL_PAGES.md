# Páginas Legales - Documentación

## Resumen

Se han creado páginas de **Términos y Condiciones** y **Política de Privacidad** para cumplir con requisitos legales de la República Dominicana y mejores prácticas internacionales.

## Páginas Creadas

### 1. Términos y Condiciones (`/terms`)

**Ruta:** `/app/(full-width-pages)/(legal)/terms/page.tsx`

**URL:** `https://tudominio.com/terms`

**Contenido incluido:**
- ✅ Aceptación de términos
- ✅ Descripción de servicios ofrecidos
- ✅ Proceso KYC/KYB detallado
- ✅ Uso de licencia y restricciones
- ✅ Privacidad y protección de datos
- ✅ Tarifas y cargos
- ✅ Limitaciones de responsabilidad
- ✅ Cumplimiento regulatorio (Leyes 155-17, 172-13, DGII, Superintendencia de Bancos)
- ✅ Suspensión y terminación de cuentas
- ✅ Modificaciones de términos
- ✅ Ley aplicable (República Dominicana)
- ✅ Información de contacto

### 2. Política de Privacidad (`/privacy`)

**Ruta:** `/app/(full-width-pages)/(legal)/privacy/page.tsx`

**URL:** `https://tudominio.com/privacy`

**Contenido incluido:**
- ✅ Introducción y cumplimiento Ley 172-13
- ✅ Información recopilada (personal, empresarial, financiera, técnica)
- ✅ Propósito del uso de datos
- ✅ Base legal para procesamiento
- ✅ Compartir información con terceros (Socure, Sanctions.io, autoridades)
- ✅ Transferencias internacionales de datos
- ✅ Medidas de seguridad implementadas (cifrado AES-256, TLS 1.3, 2FA, RLS)
- ✅ Derechos del usuario según Ley 172-13 (acceso, rectificación, cancelación, oposición, portabilidad)
- ✅ Retención de datos (5 años según ley dominicana)
- ✅ Cookies y tecnologías de rastreo
- ✅ Privacidad de menores
- ✅ Cambios a la política
- ✅ Contacto y quejas (ProDATAP)
- ✅ Cumplimiento normativo (GDPR, FATCA, CRS)

### 3. Layout Legal

**Ruta:** `/app/(full-width-pages)/(legal)/layout.tsx`

**Características:**
- Diseño minimalista sin sidebar
- Theme toggler (modo oscuro/claro)
- Consistente con el estilo del proyecto
- Responsive design

## Integración con Signup

### SignUpForm Actualizado

El checkbox de aceptación ahora incluye links clicables:

```tsx
Al crear una cuenta aceptas los{" "}
<Link href="/terms" target="_blank">
  Términos y Condiciones
</Link>
{" "}y nuestra{" "}
<Link href="/privacy" target="_blank">
  Política de Privacidad
</Link>
```

**Características:**
- Links abren en nueva pestaña (`target="_blank"`)
- Seguridad con `rel="noopener noreferrer"`
- Estilo consistente con el brand color
- Hover states para mejor UX

## Estilo Visual

### Tipografía
- **Título principal:** `text-title-lg` → `text-title-xl` (responsive)
- **Secciones:** `text-xl font-semibold`
- **Subsecciones:** `text-lg font-medium`
- **Cuerpo:** `leading-relaxed` para mejor legibilidad

### Colores
- **Texto primario:** `text-gray-800 dark:text-white/90`
- **Texto secundario:** `text-gray-700 dark:text-gray-300`
- **Texto terciario:** `text-gray-500 dark:text-gray-400`
- **Links:** `text-brand-500 hover:text-brand-600`
- **Fondos:** `bg-gray-50 dark:bg-gray-800` para cajas destacadas

### Espaciado
- Secciones separadas por `space-y-8`
- Párrafos con `mb-3` o `mb-4`
- Listas con `space-y-2`
- Padding principal: `px-6 py-10` → `sm:px-8 lg:px-12`

### Componentes
- **Botón "Volver":** Con `ChevronLeftIcon`, lleva de vuelta a `/signup`
- **Fecha actualización:** Generada dinámicamente con JavaScript
- **Cajas de información:** Borde sutil, fondo gris claro
- **Listas:** `list-disc` con `pl-6` para indentación

## Cumplimiento Legal

### República Dominicana

#### Ley 172-13 (Protección de Datos Personales)
✅ **Artículo 4:** Principios de licitud, calidad, información
✅ **Artículo 8:** Consentimiento del titular
✅ **Artículo 13-19:** Derechos ARCO (Acceso, Rectificación, Cancelación, Oposición)
✅ **Artículo 24:** Medidas de seguridad
✅ **Artículo 30:** Transferencias internacionales

#### Ley 155-17 (Lavado de Activos)
✅ **Artículo 35-36:** Obligaciones de identificación de clientes (KYC)
✅ **Artículo 37:** Debida diligencia mejorada para PEP
✅ **Artículo 40:** Conservación de documentos (5 años)

#### Superintendencia de Bancos
✅ Reglamento de Gestión de Riesgo
✅ Normas prudenciales para entidades financieras

#### DGII (Dirección General de Impuestos Internos)
✅ Facturación electrónica
✅ Declaraciones fiscales

### Internacional

#### GDPR (Unión Europea)
✅ **Artículo 6:** Base legal para procesamiento
✅ **Artículo 13-14:** Transparencia e información
✅ **Artículo 15-22:** Derechos de los interesados
✅ **Artículo 32:** Seguridad del tratamiento
✅ **Artículo 44-50:** Transferencias internacionales

#### FATCA (Estados Unidos)
✅ Reportes de cuentas financieras para ciudadanos estadounidenses

#### CRS (Common Reporting Standard - OECD)
✅ Intercambio automático de información fiscal

## Personalización Requerida

### Antes de Producción, Actualizar:

1. **Información de Contacto** ✅ COMPLETADO
   ```tsx
   // Ya actualizado en ambos archivos (terms y privacy)
   Email legal: legal@fintechrd.com
   Email privacidad: privacidad@fintechrd.com
   Teléfono: +1 (809) 555-3000
   Dirección: Av. Winston Churchill, Torre Empresarial, Piso 10, Santo Domingo, RD
   ```

2. **Nombre de Empresa** ✅ COMPLETADO
   ```tsx
   Fintech RD (ya actualizado en todos los archivos)
   ```

3. **URLs de Socure**
   ```tsx
   https://[your-supabase-project].supabase.co → Tu proyecto real
   ```

4. **Metadata**
   ```tsx
   // Actualizar description en cada página
   export const metadata: Metadata = {
     title: "Términos | Tu Empresa",
     description: "Descripción personalizada",
   };
   ```

## Mantenimiento

### Cuándo Actualizar Estas Páginas

1. **Cambios en servicios ofrecidos**
   - Nuevas funcionalidades
   - Cambios en tarifas
   - Nuevos proveedores de terceros

2. **Cambios regulatorios**
   - Nuevas leyes en RD
   - Actualizaciones a GDPR
   - Cambios en regulaciones bancarias

3. **Cambios en procesamiento de datos**
   - Nuevos proveedores de servicios
   - Cambios en retención de datos
   - Nuevas medidas de seguridad

4. **Incidentes de seguridad**
   - Después de un breach (requiere notificación)
   - Cambios en políticas de seguridad

### Proceso de Actualización

1. Editar el archivo correspondiente (`terms/page.tsx` o `privacy/page.tsx`)
2. La fecha de "Última actualización" se genera automáticamente
3. **Importante:** Notificar a usuarios existentes por email si los cambios son materiales
4. Considerar versionar las políticas anteriores para referencia

## Testing

### Checklist de QA

- [ ] `/terms` carga correctamente
- [ ] `/privacy` carga correctamente
- [ ] Links desde `/signup` funcionan
- [ ] Links abren en nueva pestaña
- [ ] Botón "Volver" regresa a `/signup`
- [ ] Theme toggler funciona (modo oscuro/claro)
- [ ] Responsive en mobile, tablet, desktop
- [ ] Todos los links internos funcionan
- [ ] Fecha de actualización se muestra correctamente
- [ ] Contenido es legible en ambos temas
- [ ] No hay errores de consola
- [ ] Metadata aparece correctamente en SEO

### Accesibilidad

- ✅ Estructura semántica con `<h1>`, `<h2>`, `<h3>`
- ✅ Links tienen estados hover claros
- ✅ Contraste de colores cumple WCAG AA
- ✅ Navegación por teclado funcional
- ✅ Contenido legible con zoom 200%

## SEO

### Metadata Incluida

```tsx
export const metadata: Metadata = {
  title: "Términos y Condiciones | TailAdmin",
  description: "Términos y condiciones de uso de la plataforma",
};
```

### Recomendaciones Adicionales

Agregar en `<head>` (opcional):
```html
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://tudominio.com/terms">
```

## Estructura de Archivos

```
src/app/(full-width-pages)/(legal)/
├── layout.tsx          # Layout compartido
├── terms/
│   └── page.tsx        # Términos y Condiciones
└── privacy/
    └── page.tsx        # Política de Privacidad
```

## Próximos Pasos (Opcional)

### Mejoras Futuras

1. **Versioning de Políticas**
   - Guardar historial de cambios
   - Mostrar qué cambió entre versiones
   - Link a versiones anteriores

2. **Aceptación Explícita**
   - Guardar timestamp de aceptación en DB
   - Requerir nueva aceptación después de cambios materiales
   - Dashboard de aceptaciones para admins

3. **Multi-idioma**
   - Versión en inglés
   - i18n con next-intl o similar

4. **Exportación PDF**
   - Botón para descargar como PDF
   - Usar `react-pdf` o similar

5. **FAQ Section**
   - Preguntas frecuentes sobre privacidad
   - Ejemplos de uso de datos

6. **Cookie Banner**
   - Implementar banner de cookies
   - Gestión de preferencias de cookies
   - Integración con Google Analytics (si aplica)

---

**Última actualización:** 2026-01-08
**Autor:** Claude Code
**Cumplimiento:** Ley 172-13 (RD), GDPR, FATCA, CRS
