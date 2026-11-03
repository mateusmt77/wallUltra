# WallUltra

Protótipo de um estúdio de wallpapers personalizados para computador, em português. HTML, CSS e JavaScript com Canvas 2D, sem dependências externas ou etapa de build.

## Executar

Requer Node.js 20 ou superior.

```sh
npm start
```

Acesse `http://localhost:3000`. Para outra porta, use `PORT=4000 npm start`.

## Criar um wallpaper

1. Escolha entre Órbita, Horizonte, Aurora e Equilíbrio. Cada estilo oferece uma composição inicial editável.
2. Ajuste a paleta, a cor de destaque, a frase, a fonte, o alinhamento, a textura e a intensidade dos elementos.
3. Selecione Full HD, Quad HD, 4K ou ultrawide e baixe um PNG renderizado na resolução escolhida. A prévia usa uma resolução menor para manter a edição leve.

O histórico permite desfazer e refazer alterações. `Ctrl/Cmd+Z` desfaz fora dos campos de texto; `Ctrl/Cmd+Shift+Z` refaz. “Salvar projeto” mantém um único projeto no armazenamento local desse navegador, recuperado na próxima visita. “Surpreenda-me” cria uma nova combinação.

## Validação

```sh
npm test
```

Os testes nativos do Node verificam a recuperação segura dos projetos salvos. A interface e a exportação também podem ser verificadas diretamente em um navegador moderno.

## Escopo do protótipo

Funciona inteiramente no navegador. Não há contas, backend de projetos, sincronização entre dispositivos, upload de imagens ou geração por IA. As composições são desenhadas proceduralmente, sem imagens, fontes remotas ou serviços pagos. O texto está limitado a 90 caracteres e é dimensionado para caber na composição. As próximas etapas podem incluir movimentação livre de elementos, biblioteca de imagens e projetos em nuvem.
