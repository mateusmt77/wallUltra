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

## Dois espaços para criar

- **Explorar estilos:** comece com uma das oito composições prontas e personalize cada detalhe.
- **Criar do zero:** comece com um fundo sólido, sem textos, formas, imagem ou textura predefinidos. Escolha cores, crie formas, importe sua imagem e adicione seus textos.

As abas acima do editor guardam rascunhos independentes durante a sessão. Alternar entre elas não apaga a outra criação, e cada espaço mantém seu próprio histórico. “Limpar tela” no espaço livre pode ser desfeito. Use “Salvar projeto” antes de fechar o navegador para persistir os dois rascunhos.

A página inicial tem uma identidade visual com roxo, rosa e verde vibrantes e uma colagem vetorial própria, sem dependências externas.

## Ferramentas de edição

O painel de edição é organizado em seis abas:

- **Tela:** resolução do monitor, formato do download e qualidade do arquivo.
- **Cores:** paletas, cores livres, fundos sólidos e gradientes lineares ou radiais com direção ajustável.
- **Textos:** escolha do texto, criação e exclusão de camadas, conteúdo, fonte, estilo e posição.
- **Elementos:** formas geométricas com tamanho, cor, contorno, sombra, posição, rotação e opacidade.
- **Imagem:** foto ou arte local como fundo, com enquadramento, zoom e opacidade.
- **Efeitos:** textura granulada com intensidade ajustável, intensidade da arte dos estilos, padrões de grade/pontos/listras, escurecimento das bordas e moldura.

Cada grupo traz rótulos visíveis e explicações. A aba Textos abre inicialmente; o espaço livre abre em Cores. Selecionar um texto ou uma forma na prévia abre suas ferramentas automaticamente. As abas também podem ser percorridas com as setas do teclado, Home e End.

No computador, apenas o conteúdo da categoria escolhida rola dentro do painel; a navegação e o botão de download permanecem disponíveis em áreas separadas. Em telas menores, as ferramentas ficam abaixo da prévia, com rolagem natural da página. A biblioteca de estilos passa a ser uma galeria horizontal. O tema acompanha a preferência clara ou escura do sistema.

## Biblioteca de design

- **8 estilos:** Órbita, Horizonte, Aurora, Equilíbrio, Pôr do sol, Maré, Cosmos e Essência.
- **12 paletas:** Lavanda, Sálvia, Pêssego, Oceano, Areia, Neon, Rosa, Solar, Cobalto, Gelo, Terracota e Monocromática.
- **4 cores livres** para o fundo, destaque, cor secundária e luz. A cor de cada texto é independente.
- Textura granulada opcional e controle da intensidade dos elementos.

Trocar o estilo, a paleta ou usar “Surpreenda-me” preserva seus textos e a formatação deles. O seletor de cores permite ajustes além das paletas prontas.

## Textos em camadas

A composição inicial contém um título, uma etiqueta superior e uma frase no rodapé. **Todos esses textos são editáveis e removíveis.**

Use o seletor na aba “Textos” para editar uma camada. O botão **Adicionar texto** cria uma camada; “Duplicar” copia a camada selecionada com um pequeno deslocamento. Há suporte a até **8 textos**, com até **300 caracteres** cada, incluindo quebras de linha. É possível remover uma camada, remover todas ou ocultar um texto sem apagá-lo.

Cada camada tem:

- 8 opções de fonte: Arial, Georgia, Courier New, Trebuchet MS, Times New Roman, Verdana, Impact e Cursiva.
- Cor, tamanho, negrito, itálico, sombra, contorno, espaçamento entre linhas e alinhamento próprios.
- Posição horizontal e vertical, rotação e opacidade.
- Ordem de sobreposição entre textos com “Recuar” e “Avançar”.
- Posicionamento por arraste na prévia, inclusive por toque. Em sobreposições, a camada escolhida no seletor tem prioridade no arraste.

As fontes são locais, com alternativas de sistema: a aparência pode variar conforme as fontes instaladas. A renderização reduz textos muito grandes ou longos para mantê-los dentro da tela. O tamanho indicado é a referência em uma tela com altura de 1080 pixels; acompanha proporcionalmente a resolução exportada.

## Formas e imagens

Adicione até **24 formas**, entre círculo/elipse, retângulo, forma arredondada, triângulo, estrela e anel. Cada uma pode ser duplicada, ocultada, excluída, arrastada e reordenada entre as formas. Há controles de largura, altura, preenchimento, contorno e espessura, sombra, posição, rotação e opacidade.

As imagens importadas ficam sobre a arte original e atrás das formas e dos textos. Os padrões e o acabamento do fundo também aparecem sobre a imagem. As formas ficam atrás dos textos; os controles de ordem operam dentro de cada grupo.

A aba Imagem aceita **PNG, JPEG e WebP de até 10 MB e 30 megapixels**. A importação é processada localmente, sem envio a um servidor. Para manter a edição e o salvamento leves, a imagem é reduzida para no máximo 2560 pixels no maior lado e convertida em WebP (ou PNG, se necessário), com limite de 4 MB codificados. Imagens com transparência continuam transparentes. A resolução final do wallpaper segue o formato de exportação escolhido; fotos de baixa resolução não ganham detalhes ao exportar em 4K.

Use “Preencher a tela” para cobrir o fundo com recorte, ou “Mostrar imagem inteira” para preservar o enquadramento. Zoom, alinhamento e opacidade permitem combinar a imagem com a arte. Remover a imagem pode ser desfeito.

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

`Ctrl/Cmd+Z` desfaz fora dos campos de texto; `Ctrl/Cmd+Shift+Z` refaz. “Salvar projeto” guarda os dois espaços no armazenamento local desse navegador e recupera a aba ativa na próxima visita. O histórico de desfazer/refazer existe apenas durante a sessão. Projetos salvos na versão original são migrados automaticamente. Projetos salvos sem textos continuam sem textos ao reabrir.

### Arquivos de projeto

“Baixar projeto” exporta a criação ativa em `.wallultra.json`, incluindo textos, formas, efeitos e imagem. “Abrir projeto” permite continuar a criação em outro navegador ou computador; arquivos de até 8 MB são aceitos. A importação usa o espaço correspondente (livre ou estilos), preserva o outro rascunho e pode ser desfeita.

O armazenamento do navegador tem limites. Se ele estiver cheio ou bloqueado, o app avisa para usar “Baixar projeto”; não há sincronização automática com uma conta.

## Validação

```sh
npm test
```

Os testes do Node verificam criação livre, independência dos rascunhos, arquivos de projeto, persistência, migração, recuperação de dados inválidos, ordem e limites das camadas e ajuste de textos e formas rotacionados. A interface também foi verificada no Chromium com edição, arraste, histórico, exclusão, salvamento, migração, imagens locais, importação/exportação de projetos, verificação dos pixels da imagem exportada e layouts em diferentes larguras.

## Escopo

Funciona inteiramente no navegador, sem contas, sincronização em nuvem ou geração por IA. Há importação local de imagens e transferência de projetos por arquivo. As composições prontas são desenhadas proceduralmente, sem imagens externas, fontes remotas ou serviços pagos. Não há necessidade de credenciais.
