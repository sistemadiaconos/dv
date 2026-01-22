-- REMOVE AS TRAVAS (CONSTRAINTS) PARA PERMITIR VALORES PERSONALIZADOS E MULTIPLOS
-- Rode este comando no SQL Editor do seu projeto Supabase

-- 1. Remover restrição de Departamento (permite "Mídia, Louvor" etc)
ALTER TABLE participantes DROP CONSTRAINT IF EXISTS participantes_departamento_check;

-- 2. Remover restrição de Encargo (permite novos cargos se necessário)
ALTER TABLE participantes DROP CONSTRAINT IF EXISTS participantes_encargo_check;
