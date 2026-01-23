# Adição de Contador de Check-ins no Dashboard

## Resumo
Foi adicionado um novo indicador no Dashboard Administrativo para contar especificamente os "Check-ins (Presencial)". Isso permite diferenciar quem confirmou presença pelo site de quem realmente compareceu e escaneou o QR Code na entrada.

## Alterações Realizadas

### 1. Serviço de Reuniões (`meetingService.ts`)
Atualizada a função `getMeetingStats` para calcular a contagem de check-ins:
```typescript
const checkins = confirmations.filter(c => (c as any).checkin_em).length;
```

### 2. Interface do Dashboard (`DashboardPage.tsx`)
Adicionado um novo cartão estatístico ao grid:
- **Título:** Check-ins (Presencial)
- **Ícone:** QR Code (Indigo)
- **Descrição:** Leram o QR Code
- **Valor:** Mostra o número real de leituras realizadas.

## Como Validar
1. Acesse o Dashboard.
2. Observe o novo card "Check-ins (Presencial)".
3. Utilize o leitor de QR Code para confirmar um participante.
4. O contador deve incrementar automaticamente (pode exigir recarregar a página para atualização instantânea se não houver atualização em tempo real).
