# WallUltra

Estúdio de wallpapers personalizados para computador, em português. HTML, CSS e JavaScript com Canvas 2D, sem dependências externas ou etapa de build.

## Executar localmente

Requer Node.js 20 ou superior. Não é necessário executar `npm install`.

```sh
git clone https://github.com/mateusmt77/wallUltra.git
cd wallUltra
npm start
```

Abra `http://localhost:3000`. Para outra porta, use `PORT=4000 npm start`.

Se você já tem o projeto, atualize com `git pull origin main` e reinicie o servidor.

## Biblioteca de design

- **8 estilos:** Órbita, Horizonte, Aurora, Equilíbrio, Pôr do sol, Maré, Cosmos e Essência.
- **12 paletas:** Lavanda, Sálvia, Pêssego, Oceano, Areia, Neon, Rosa, Solar, Cobalto, Gelo, Terracota e Monocromática.
- **4 cores livres** para o fundo, destaque, cor secundária e luz. A cor de cada texto é independente.
- Textura granulada opcional e controle da intensidade dos elementos.

Trocar o estilo, a paleta ou usar “Surpreenda-me” preserva seus textos e a formatação deles. O seletor de cores permite ajustes além das paletas prontas.

## Textos em camadas

A composição inicial contém um título, uma etiqueta superior e uma frase no rodapé. **Todos esses textos são editáveis e removíveis.**

Use o seletor em “Textos e tipografia” para editar uma camada. O botão **+** adiciona um texto; “Duplicar” copia a camada selecionada com um pequeno deslocamento. Há suporte a até **8 textos**, com até **300 caracteres** cada, incluindo quebras de linha. É possível remover uma camada, remover todas ou ocultar um texto sem apagá-lo.

Cada camada tem:

- 8 opções de fonte: Arial, Georgia, Courier New, Trebuchet MS, Times New Roman, Verdana, Impact e Cursiva.
- Cor, tamanho, negrito, itálico, sombra e alinhamento próprios.
- Posição horizontal e vertical, rotação e opacidade.
- Posicionamento por arraste na prévia, inclusive por toque. Em sobreposições, a camada escolhida no seletor tem prioridade no arraste.

As fontes são locais, com alternativas de sistema: a aparência pode variar conforme as fontes instaladas. A renderização reduz textos muito grandes ou longos para mantê-los dentro da tela. O tamanho indicado é a referência em uma tela com altura de 1080 pixels; acompanha proporcionalmente a resolução exportada.

## Formatos e exportação

10 resoluções de desktop, com as proporções reais preservadas:

| Resolução | Proporção | Uso |
| --- | --- | --- |
| 1920 × 1080 | 16:9 | Full HD |
| 2560 × 1440 | 16:9 | Quad HD |
| 3840 × 2160 | 16:9 | 4K |
| 1920 × 1200 | 16:10 | Desktop amplo |
| 2560 × 1600 | 16:10 | Wide QHD |
| 1600 × 1200 | 4:3 | Monitor clássico |
| 2560 × 1080 | 64:27 | Ultrawide HD |
| 3440 × 1440 | 43:18 | Ultrawide QHD |
| 3840 × 1080 | 32:9 | Dois monitores |
| 5120 × 1440 | 32:9 | Super ultrawide |

Exporte em **PNG**, **JPEG** ou **WebP**. JPEG e WebP têm controle de qualidade entre 10% e 100%. O arquivo é desenhado na resolução escolhida, sem guias de seleção ou marca d’água. A prévia usa uma resolução menor na mesma proporção para manter a edição leve. Em navegadores sem suporte ao formato escolhido, a exportação usa o formato retornado pelo navegador e a extensão correspondente.

## Histórico e salvamento

“Desfazer” e “Refazer” funcionam para cores, estilos, textos, exclusões, arrastes e demais edições. Uma digitação contínua ou um arraste ocupa uma única etapa no histórico, limitado às últimas 60 edições.

`Ctrl/Cmd+Z` desfaz fora dos campos de texto; `Ctrl/Cmd+Shift+Z` refaz. “Salvar projeto” mantém um único projeto no armazenamento local desse navegador, recuperado na próxima visita. Projetos salvos na versão original são migrados automaticamente. Projetos salvos sem textos continuam sem textos ao reabrir.

## Validação

```sh
npm test
```

Os testes do Node verificam persistência, migração, recuperação de dados inválidos, limites de camadas e ajuste de textos rotacionados em todos os formatos. A interface também foi verificada no Chromium com edição, arraste, histórico, exclusão, salvamento, migração, exportação e layouts em diferentes larguras.

## Escopo

Funciona inteiramente no navegador, sem contas, sincronização entre dispositivos, upload de imagens ou geração por IA. As composições são desenhadas proceduralmente, sem imagens, fontes remotas ou serviços pagos. Não há necessidade de credenciais.
