-- Run this in your Supabase SQL Editor
ALTER TABLE confirmacoes 
ADD COLUMN IF NOT EXISTS checkin_em TIMESTAMPTZ;

-- Optional: Index for performance
CREATE INDEX IF NOT EXISTS idx_confirmacoes_checkin_em ON confirmacoes(checkin_em);
