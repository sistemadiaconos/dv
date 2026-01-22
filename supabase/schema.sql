-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Tabela: PARTICIPANTES
create table if not exists participantes (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  telefone text,
  encargo text check (encargo in ('Pastor', 'Diretoria', 'Diacono', 'Voluntário', 'Outro')),
  departamento text check (departamento in ('MVPMusic', 'Diacono(niza)', 'Louvor', 'Administrativo', 'Outro')),
  data_criacao timestamp with time zone default now(),
  ativo boolean default true
);

-- 2. Tabela: REUNIOES
create table if not exists reunioes (
  id uuid primary key default uuid_generate_v4(),
  titulo text not null,
  data date not null,
  hora time not null,
  local text,
  descricao text,
  status text check (status in ('Agendada', 'Em Andamento', 'Encerrada')) default 'Agendada',
  data_criacao timestamp with time zone default now(),
  criado_por uuid references auth.users(id)
);

-- 3. Tabela: CONFIRMACOES
create table if not exists confirmacoes (
  id uuid primary key default uuid_generate_v4(),
  id_participante uuid references participantes(id) on delete cascade,
  id_reuniao uuid references reunioes(id) on delete cascade,
  presenca text check (presenca in ('Confirmado', 'Ausente', 'Pendente')),
  justificativa text,
  data_confirmacao timestamp with time zone default now(),
  ip_origem text,
  editado_em timestamp with time zone,
  unique(id_participante, id_reuniao)
);

-- Indexes for performance (IF NOT EXISTS)
create index if not exists idx_participantes_nome on participantes(nome);
create index if not exists idx_participantes_telefone on participantes(telefone);
create index if not exists idx_reunioes_status on reunioes(status);
create index if not exists idx_confirmacoes_reuniao on confirmacoes(id_reuniao);

-- RLS Policies (Row Level Security)
alter table participantes enable row level security;
alter table reunioes enable row level security;
alter table confirmacoes enable row level security;

-- Drop existing policies to allow re-run
drop policy if exists "Admin access participants" on participantes;
drop policy if exists "Public read participants" on participantes;
drop policy if exists "Admin access meetings" on reunioes;
drop policy if exists "Public read active meetings" on reunioes;
drop policy if exists "Admin access confirmations" on confirmacoes;
drop policy if exists "Public create confirmations" on confirmacoes;
drop policy if exists "Public update own confirmation" on confirmacoes;

-- Policies for PARTICIPANTES
-- Admin (authenticated) can do everything, but for MVP allow all (unprotected)
create policy "Admin access participants" on participantes
  for all using (true);

-- Public can read for autocomplete
create policy "Public read participants" on participantes
  for select using (true);

-- Policies for REUNIOES
create policy "Admin access meetings" on reunioes
  for all using (true);
  
create policy "Public read active meetings" on reunioes
  for select using (status = 'Agendada');

-- Policies for CONFIRMACOES
create policy "Admin access confirmations" on confirmacoes
  for all using (true);

create policy "Public create confirmations" on confirmacoes
  for insert with check (true);

create policy "Public update own confirmation" on confirmacoes
  for update using (true);
