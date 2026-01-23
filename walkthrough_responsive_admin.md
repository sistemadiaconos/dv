# Admin Responsivo (Mobile)

## Resumo
O layout administrativo foi atualizado para suportar dispositivos móveis. Anteriormente, a sidebar lateral ficava escondida (`hidden`) em telas pequenas, impossibilitando a navegação.

## Alterações Realizadas

### [MODIFY] `src/layouts/AdminLayout.tsx`
- **Cabeçalho Mobile:** Adicionado um `header` visível apenas em mobile (`md:hidden`) contendo o título e um botão "Menu" (ícone hamburger).
- **Menu Lateral Mobile:** Implementado um overlay deslizante (slide-in) que exibe as mesmas opções de navegação do desktop.
- **Componente `NavContent`:** A lógica de renderização dos links foi extraída para um componente interno reutilizável, evitando duplicação de código entre a sidebar desktop e o menu mobile.
- **Responsividade do Conteúdo:** Ajustado padding do conteúdo principal (`p-4` em mobile, `md:p-8` em desktop) para melhor aproveitamento de espaço.

## Como Validar
1. Acesse o painel administrativo pelo celular ou reduza a janela do navegador.
2. Verifique se a sidebar lateral desaparece e um novo cabeçalho com botão de menu aparece no topo.
3. Clique no botão de menu para abrir a navegação lateral.
4. Clique em um link para navegar (o menu deve fechar automaticamente) ou clique no "X" / fundo escuro para fechar.
5. Verifique se o conteúdo das páginas se ajusta a largura da tela.
