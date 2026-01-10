# Instrucciones de Migración - Agregar case_id a company_documents

## Problema Resuelto
Los documentos no se mostraban en el panel de admin porque se buscaban por `company_id` en lugar de `case_id`.

## Cambios Realizados en el Código

1. **upload-document.ts**: Ahora guarda el `case_id` al subir documentos
2. **get-case-detail.ts**: Ahora busca documentos usando `case_id` en lugar de `company_id`

## Migración de Base de Datos Requerida

Para que los documentos se muestren correctamente, debes ejecutar la siguiente migración en tu base de datos Supabase:

### Opción 1: Usando el SQL Editor de Supabase

1. Ve a tu proyecto en Supabase Dashboard
2. Click en "SQL Editor" en el menú lateral
3. Copia y pega el contenido del archivo `migrations/add_case_id_to_company_documents.sql`
4. Ejecuta la query

### Opción 2: Comandos SQL Manuales

Ejecuta estos comandos en orden:

```sql
-- 1. Agregar columna case_id
ALTER TABLE company_documents
ADD COLUMN IF NOT EXISTS case_id UUID;

-- 2. Crear índice
CREATE INDEX IF NOT EXISTS idx_company_documents_case_id
ON company_documents(case_id);

-- 3. Actualizar documentos existentes
UPDATE company_documents cd
SET case_id = oc.id
FROM onboarding_cases oc
WHERE cd.company_id = oc.company_id
  AND cd.case_id IS NULL;

-- 4. Verificar
SELECT
  COUNT(*) as total_documents,
  COUNT(case_id) as documents_with_case_id,
  COUNT(*) - COUNT(case_id) as documents_without_case_id
FROM company_documents;
```

## Verificación

Después de ejecutar la migración:

1. Verifica que la columna existe:
   ```sql
   SELECT column_name, data_type
   FROM information_schema.columns
   WHERE table_name = 'company_documents'
   AND column_name = 'case_id';
   ```

2. Los nuevos documentos que se suban automáticamente incluirán el `case_id`
3. Los documentos existentes deberían haberse actualizado con el query de UPDATE

## ⚠️ Importante

- Esta migración es **segura** y no elimina datos
- Los documentos existentes se vincularán automáticamente a sus casos
- Si algunos documentos no se pueden vincular (porque no tienen un caso válido), permanecerán con `case_id = NULL`

## Rollback (si es necesario)

Si necesitas revertir los cambios:

```sql
-- Eliminar índice
DROP INDEX IF EXISTS idx_company_documents_case_id;

-- Eliminar columna (CUIDADO: esto eliminará los datos de case_id)
ALTER TABLE company_documents
DROP COLUMN IF EXISTS case_id;
```
