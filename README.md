# Sistema de Diáconos e Voluntários

Sistema de gestão de presença com QR Code.

## Funcionalidades
- Cadastro de participantes
- Geração de Credencial com QR Code
- Leitura de QR Code para check-in
- Dashboard administrativo
- Relatórios de presença/ausência

## Como Rodar
1. Instale as dependências: `npm install`
2. Configure o `.env` com as chaves do Supabase
3. Rode o projeto: `npm run dev`

## Deploy na Vercel
Este projeto está configurado para deploy contínuo na Vercel.
Certifique-se de configurar as variáveis de ambiente:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
