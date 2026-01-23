# Gerenciamento de Usuários

## Resumo
Adicionada uma aba "Usuários" na tela de Configurações para permitir criar novos administradores.

## Alterações Realizadas

### [MODIFY] `src/pages/admin/SettingsPage.tsx`
- **Tabs de Navegação:** Agora a página tem duas abas: "Geral" (Logo/Departamentos) e "Usuários".
- **Formulário de Cadastro:** Permite inserir E-mail e Senha para criar um novo usuário no Supabase Auth.
- **Técnica de Sessão:** Usa um cliente Supabase temporário para criar o usuário *sem* desconectar o administrador atual.

## Como Validar
1. Vá em **Configurações**.
2. Clique na aba **Usuários**.
3. Preencha e-mail e senha de um novo admin.
4. Clique em "Criar Usuário".
5. Teste o login com esse novo usuário em uma aba anônima.
