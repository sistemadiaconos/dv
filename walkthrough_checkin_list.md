# Lista de Check-ins no Dashboard

## Resumo
Para atender ao pedido de "uma lista das pessoas que fez o check-in", o Dashboard foi reorganizado. Agora, a lista principal foca em quem realmente compareceu.

## Alterações Realizadas

### [MODIFY] `src/pages/admin/DashboardPage.tsx`
- **Nova Lista Principal:** "Últimos Check-ins".
    - Exibe apenas quem tem registro de check-in (`checkin_em`).
    - Mostra o horário da leitura do QR Code.
    - Ordenado do mais recente para o mais antigo.
- **Listas Secundárias (Coluna Direita):**
    - **Ausências Recentes:** Mantida, mas compactada.
    - **Confirmados Recentemente:** Mostra quem confirmou online mas *ainda não fez check-in*. Útil para saber quem está "atrasado" ou pendente de chegada.

## Como Validar
1. Acesse o Dashboard.
2. A lista grande à esquerda agora deve ser "Últimos Check-ins".
3. Se você fizer uma nova leitura de QR Code, o nome da pessoa deve aparecer nessa lista com o horário atual.
4. As pessoas que confirmaram no site mas não chegaram ainda aparecem na lista menor à direita ("Confirmados Recentemente").
