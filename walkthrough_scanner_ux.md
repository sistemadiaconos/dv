# Melhoria no Leitor de QR Code

## Resumo
O leitor de QR Code foi atualizado para não ficar "travado" na tela de confirmação verde. Agora ele fecha automaticamente após a leitura, permitindo ler o próximo rapidamente.

## Alterações Realizadas

### [MODIFY] `src/pages/admin/AdminScannerPage.tsx`
- **Auto-fechamento:** Adicionada lógica (`useEffect`) que fecha o alerta de "Confirmado!" automaticamente após **2.5 segundos**.
- **Botão Fechar:** Adicionado um botão "Fechar Agora" na tela de confirmação, caso a pessoa queira fechar mais rápido ou se o timer falhar por algum motivo.

## Como Validar
1. Abra o Leitor de QR Code (`/admin/leitor`).
2. Leia um QR Code.
3. A tela verde aparecerá.
4. **Aguarde:** Ela deve sumir sozinha após 2.5 segundos, liberando para a próxima leitura.
5. **Alternativa:** Se não quiser esperar, clique no botão "Fechar Agora".
