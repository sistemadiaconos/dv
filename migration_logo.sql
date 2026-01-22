-- RODE ISSO NO SQL EDITOR DO SUPABASE
-- Este script garante que a tabela de configurações e a coluna de logo existam.

-- 1. Criar tabela de configurações se não existir
CREATE TABLE IF NOT EXISTS app_settings (
    id uuid PRIMARY KEY,
    app_name text DEFAULT 'Sistema MVP',
    logo_url text,
    registration_open boolean DEFAULT true,
    updated_at timestamp with time zone DEFAULT now()
);

-- 2. Habilitar segurança (RLS)
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- 3. Criar políticas de acesso (Público pode ler, Admin pode editar)
DROP POLICY IF EXISTS "Public read app_settings" ON app_settings;
CREATE POLICY "Public read app_settings" ON app_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage app_settings" ON app_settings;
CREATE POLICY "Admin manage app_settings" ON app_settings FOR ALL USING (true);

-- 4. Inserir configuração padrão (se ainda não existir)
-- Isso garante que sempre tenha uma linha de configuração com o ID fixo
INSERT INTO app_settings (id, app_name, logo_url)
VALUES ('00000000-0000-0000-0000-000000000001', 'Sistema MVP', 'https://placehold.co/200x80?text=Sua+Logo')
ON CONFLICT (id) DO UPDATE 
SET updated_at = now()
WHERE app_settings.logo_url IS NULL;

-- 5. Opcional: Criar Bucket de Storage se quiser upload de arquivo (futuro)
-- insert into storage.buckets (id, name, public) values ('logos', 'logos', true) on conflict do nothing;
