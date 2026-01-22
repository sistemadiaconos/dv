-- RODE ISSO NO SQL EDITOR DO SUPABASE
-- Este script configura o Storage para guardar as Logos (Versão Segura/Idempotente)

-- 1. Criar o bucket 'logos' (se não existir)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('logos', 'logos', true) 
ON CONFLICT (id) DO NOTHING;

-- 2. Políticas de Segurança (Removemos as antigas para evitar erro de duplicidade)

-- DOWNLOAD (Público)
DROP POLICY IF EXISTS "Public Access Logos" ON storage.objects;
CREATE POLICY "Public Access Logos" ON storage.objects
FOR SELECT
USING ( bucket_id = 'logos' );

-- UPLOAD (Insert)
DROP POLICY IF EXISTS "Admin Upload Logos" ON storage.objects;
CREATE POLICY "Admin Upload Logos" ON storage.objects
FOR INSERT
WITH CHECK ( bucket_id = 'logos' );

-- UPDATE
DROP POLICY IF EXISTS "Admin Update Logos" ON storage.objects;
CREATE POLICY "Admin Update Logos" ON storage.objects
FOR UPDATE
USING ( bucket_id = 'logos' );

-- DELETE
DROP POLICY IF EXISTS "Admin Delete Logos" ON storage.objects;
CREATE POLICY "Admin Delete Logos" ON storage.objects
FOR DELETE
USING ( bucket_id = 'logos' );
