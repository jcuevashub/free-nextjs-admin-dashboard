-- Migración: Agregar case_id a company_documents
-- Esta columna permite buscar documentos por caso de onboarding

-- 1. Agregar la columna case_id si no existe
ALTER TABLE company_documents
ADD COLUMN IF NOT EXISTS case_id UUID;

-- 2. Crear índice para mejorar el performance de búsquedas
CREATE INDEX IF NOT EXISTS idx_company_documents_case_id
ON company_documents(case_id);

-- 3. Agregar foreign key constraint (opcional, para integridad referencial)
-- Descomentar si quieres que se valide que el case_id existe en onboarding_cases
-- ALTER TABLE company_documents
-- ADD CONSTRAINT fk_company_documents_case_id
-- FOREIGN KEY (case_id) REFERENCES onboarding_cases(id)
-- ON DELETE CASCADE;

-- 4. Actualizar registros existentes (si hay documentos sin case_id)
-- Esta query intenta asociar documentos existentes con su caso correspondiente
-- basándose en el company_id
UPDATE company_documents cd
SET case_id = oc.id
FROM onboarding_cases oc
WHERE cd.company_id = oc.company_id
  AND cd.case_id IS NULL;

-- Verificar los resultados
SELECT
  COUNT(*) as total_documents,
  COUNT(case_id) as documents_with_case_id,
  COUNT(*) - COUNT(case_id) as documents_without_case_id
FROM company_documents;
