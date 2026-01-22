-- SCRIPT DE ATUALIZAÇÃO: Configurações e Departamentos
-- Rode este script no SQL Editor do Supabase

-- 1. Criar tabela de Departamentos (se não existir)
CREATE TABLE IF NOT EXISTS departamentos (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome text NOT NULL UNIQUE,
    ordem serial,
    ativo boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);

-- 2. Habilitar RLS (Segurança) mas deixar aberto para o MVP
ALTER TABLE departamentos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read departments" ON departamentos;
CREATE POLICY "Public read departments" ON departamentos FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage departments" ON departamentos;
CREATE POLICY "Admin manage departments" ON departamentos FOR ALL USING (true);

-- 3. Inserir departamentos iniciais (ignora se já existir)
INSERT INTO departamentos (nome) VALUES 
('MVPMusic'),
('Diácono(niza)'),
('Voluntário(a)'),
('House Mix'),
('AMI'),
('Conselho Ministerial'),
('Conselho Fiscal'),
('Mídia'),
('Pastor(a)')
ON CONFLICT (nome) DO NOTHING;

-- 4. Garantir que tabela app_settings exista
CREATE TABLE IF NOT EXISTS app_settings (
    id uuid PRIMARY KEY,
    app_name text,
    logo_url text,
    registration_open boolean DEFAULT true,
    updated_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS para app_settings
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read app_settings" ON app_settings;
CREATE POLICY "Public read app_settings" ON app_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin manage app_settings" ON app_settings;
CREATE POLICY "Admin manage app_settings" ON app_settings FOR ALL USING (true);


-- 5. Atualizar ou Inserir configurações iniciais
INSERT INTO app_settings (id, app_name, logo_url)
VALUES ('00000000-0000-0000-0000-000000000001', 'Sistema MVP', 'https://placehold.co/200x80?text=Sua+Logo')
ON CONFLICT (id) DO UPDATE SET logo_url = EXCLUDED.logo_url WHERE app_settings.logo_url IS NULL;
