# Supabase Setup - Banca Empresarial Digital RD

Este directorio contiene todas las migraciones SQL necesarias para configurar la base de datos de la plataforma de banca empresarial digital.

## Prerequisitos

1. **Cuenta de Supabase**
   - Crear proyecto en [supabase.com](https://supabase.com)
   - Anotar el Project URL y las API Keys

2. **Supabase CLI** (opcional pero recomendado)
   ```bash
   npm install -g supabase
   ```

## Paso 1: Configurar Variables de Entorno

Actualizar el archivo `.env` con las credenciales de tu proyecto Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
```

## Paso 2: Ejecutar Migraciones

### Opción A: Desde Supabase Dashboard (Recomendado para primera vez)

1. Ir a tu proyecto en Supabase Dashboard
2. Navegar a **SQL Editor** (icono de código en el sidebar)
3. Crear un nuevo query
4. Copiar y pegar el contenido completo de `migrations/001_initial_schema.sql`
5. Hacer clic en **Run** (o `Ctrl+Enter`)
6. Esperar a que termine (puede tardar 1-2 minutos)
7. Repetir el proceso con `migrations/002_rls_policies.sql`

### Opción B: Usando Supabase CLI

```bash
# Login a Supabase
supabase login

# Link al proyecto
supabase link --project-ref tu-project-id

# Ejecutar migraciones
supabase db push
```

## Paso 3: Verificar la Instalación

Ejecutar esta query en el SQL Editor para verificar que todas las tablas fueron creadas:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Deberías ver ~20 tablas incluyendo:
- companies
- users
- accounts
- transactions
- transfers
- recipients
- cards
- invoices
- customers
- products
- notifications
- audit_logs
- etc.

## Paso 4: Generar Tipos TypeScript

Después de ejecutar las migraciones, generar los tipos TypeScript:

```bash
# Desde la raíz del proyecto
npx supabase gen types typescript --project-id tu-project-id > src/types/database.types.ts
```

O agregar al `package.json`:

```json
{
  "scripts": {
    "supabase:types": "supabase gen types typescript --project-id tu-project-id > src/types/database.types.ts"
  }
}
```

Luego ejecutar:

```bash
npm run supabase:types
```

## Paso 5: Verificar Row Level Security (RLS)

Verificar que RLS está habilitado en todas las tablas:

```sql
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

La columna `rowsecurity` debe ser `true` para todas las tablas.

## Paso 6: Crear Usuario de Prueba

Para testing, crear un usuario de prueba y una empresa:

```sql
-- Primero, registrar un usuario desde la UI de tu app (/signup)
-- Luego, ejecutar este SQL para configurar la empresa y el rol

-- 1. Crear empresa de prueba
INSERT INTO companies (rnc, company_name, legal_name, company_email, status, kyc_status)
VALUES ('13257407912', 'Empresa Demo RD', 'Empresa Demo RD SRL', 'demo@empresademo.do', 'active', 'approved');

-- 2. Obtener el ID de la empresa recién creada
-- SELECT id FROM companies WHERE rnc = '13257407912';

-- 3. Asociar el usuario a la empresa (reemplazar USER_ID y COMPANY_ID)
INSERT INTO users (id, company_id, full_name, email, role)
VALUES ('USER_ID_FROM_AUTH', 'COMPANY_ID_FROM_STEP_2', 'Usuario Demo', 'demo@empresademo.do', 'owner');

-- 4. Crear una cuenta checking de prueba
INSERT INTO accounts (
  company_id,
  account_number,
  account_type,
  currency,
  account_name,
  balance,
  available_balance,
  status
)
VALUES (
  'COMPANY_ID_FROM_STEP_2',
  generate_account_number(),
  'checking',
  'DOP',
  'Cuenta Principal',
  100000.00,
  100000.00,
  'active'
);
```

## Estructura de la Base de Datos

### Tablas Principales

#### Empresas y Usuarios
- `companies` - Empresas registradas
- `users` - Usuarios (extends auth.users con roles)

#### Bancarias
- `accounts` - Cuentas bancarias (checking/savings)
- `transactions` - Todas las transacciones
- `transfers` - Transferencias entre cuentas
- `recipients` - Beneficiarios guardados

#### Tarjetas
- `cards` - Tarjetas virtuales/físicas
- `card_transactions` - Transacciones con tarjeta

#### Facturación
- `invoices` - Facturas emitidas
- `invoice_items` - Líneas de factura
- `customers` - Clientes de la empresa
- `products` - Catálogo de productos

#### Impuestos (República Dominicana)
- `ncf_records` - Comprobantes fiscales (NCF)
- `itbis_declarations` - Declaraciones de ITBIS

#### Compliance
- `kyc_verifications` - Verificaciones KYC
- `company_documents` - Documentos corporativos

#### Sistema
- `notifications` - Notificaciones in-app
- `audit_logs` - Logs de auditoría
- `login_logs` - Logs de acceso

### Tipos ENUM

El schema incluye varios tipos ENUM para garantizar consistencia:

- `account_type`: 'checking', 'savings'
- `account_status`: 'active', 'suspended', 'closed', 'pending_verification'
- `currency_code`: 'DOP', 'USD'
- `transaction_type`: 'credit', 'debit', 'transfer', 'fee', 'adjustment'
- `transaction_status`: 'pending', 'completed', 'failed', 'reversed'
- `card_type`: 'virtual', 'physical'
- `card_status`: 'active', 'frozen', 'cancelled', 'pending'
- `invoice_status`: 'draft', 'pending', 'paid', 'overdue', 'cancelled'
- `user_role`: 'owner', 'admin', 'accountant', 'employee', 'viewer'
- `ncf_type`: 'B01', 'B02', 'B14', 'B15', 'B16'

### Funciones Útiles

El schema incluye funciones PL/pgSQL útiles:

- `generate_account_number()` - Genera números de cuenta únicos
- `calculate_itbis(amount, rate)` - Calcula ITBIS (18% por defecto)
- `update_updated_at_column()` - Trigger para actualizar updated_at automáticamente

## Troubleshooting

### Error: "relation already exists"

Si algunas tablas ya existen, puedes eliminarlas primero:

```sql
-- CUIDADO: Esto elimina todas las tablas y datos
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

Luego, volver a ejecutar las migraciones.

### Error: "permission denied"

Asegúrate de estar usando el Service Role Key en lugar del Anon Key para operaciones administrativas.

### RLS Bloqueando Queries

Si RLS está bloqueando tus queries durante desarrollo, temporalmente puedes deshabilitar RLS en una tabla:

```sql
ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
```

**IMPORTANTE**: No hacer esto en producción.

## Siguientes Pasos

1. ✅ Ejecutar migraciones SQL
2. ✅ Generar tipos TypeScript
3. ⬜ Instalar Zod: `npm install zod`
4. ⬜ Crear primer módulo (Cuentas)
5. ⬜ Implementar Server Actions
6. ⬜ Conectar UI existente con base de datos

Ver el archivo `/Users/jacksoncuevas1/.claude/plans/eventual-roaming-hammock.md` para el plan completo de implementación.

## Recursos

- [Supabase Docs](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Functions](https://www.postgresql.org/docs/current/plpgsql.html)
- [Next.js con Supabase](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
