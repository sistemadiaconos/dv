-- Execute esse script no SQL Editor do Supabase para corrigir o erro 404

-- 1. Torna o bucket 'logos' público (acessível por qualquer pessoa/navegador)
UPDATE storage.buckets
SET public = true
WHERE id = 'logos';

-- 2. Garante que existe uma política de acesso público para leitura
-- (O DROP POLICY previne erros se ela já existir)
DROP POLICY IF EXISTS "Public Access to Logos" ON storage.objects;

CREATE POLICY "Public Access to Logos"
ON storage.objects FOR SELECT
USING ( bucket_id = 'logos' );
