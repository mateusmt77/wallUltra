# WallUltra

Estúdio de wallpapers personalizados para computador, em português. HTML, CSS e JavaScript com Canvas 2D, sem dependências externas ou etapa de build.

## Executar localmente

Use Node.js 22 LTS (a versão principal está fixada em `package.json` para o Vercel). Não é necessário executar `npm install`.

```sh
git clone https://github.com/mateusmt77/wallUltra.git
cd wallUltra
npm start
```

Abra `http://localhost:3000`. Para outra porta, use `PORT=4000 npm start`.

Se você já tem o projeto, atualize com `git pull origin main` e reinicie o servidor.

## Conheça a plataforma

O menu principal tem **Criar wallpaper**, **Sobre a plataforma** e **Planos**, que abre a comparação e a ativação manual de acesso. A página Sobre (`http://localhost:3000/#sobre`) apresenta o WallUltra, explica as opções de criação e tem um passo a passo, acesso direto às sete categorias de ferramentas e perguntas frequentes sobre salvamento, fotos, borracha e exportação.

Os links `#como-funciona` e `#perguntas-frequentes` também podem ser abertos diretamente. A troca entre Criar wallpaper e Sobre a plataforma tem uma transição curta de saída e entrada, combinando deslocamento horizontal e transparência. Ela também funciona com Voltar/Avançar e com os atalhos da página Sobre. Cliques rápidos mantêm somente a última navegação solicitada. A preferência de movimento reduzido do sistema desativa o efeito. O editor continua aberto em memória ao visitar a página Sobre: textos, formas, traços e alterações ainda não salvas são preservados ao voltar. Recarregar ou fechar a página ainda exige salvar o projeto antes.

## Identidade visual

A interface combina azul elétrico, coral, amarelo e verde-lima, com marca, favicon e ilustrações vetoriais próprios. **Space Grotesk** é usada nos títulos e **Manrope** nos textos e controles. As duas fontes variáveis são servidas pelo próprio projeto, em WOFF2, sem chamadas a serviços de fontes externos. A interface acompanha o tema claro ou escuro do sistema.

As fontes são distribuídas sob **SIL Open Font License 1.1**. Licenças, versões e verificações de integridade estão em [assets/fonts](assets/fonts/SOURCES.md). As fontes da identidade da interface não mudam a tipografia escolhida dentro de cada wallpaper.

## Dois espaços para criar

- **Explorar estilos:** comece com uma das oito composições prontas e personalize cada detalhe.
- **Criar do zero:** comece com um fundo sólido, sem textos, formas, imagem ou textura predefinidos. Escolha cores, crie formas, importe sua imagem e adicione seus textos.

As abas acima do editor guardam rascunhos independentes durante a sessão. Alternar entre elas não apaga a outra criação, e cada espaço mantém seu próprio histórico. “Limpar tela” no espaço livre pode ser desfeito. Use “Salvar projeto” antes de fechar o navegador para persistir os dois rascunhos.

A página inicial usa blocos de cor vibrantes, uma colagem vetorial e atalhos para os dois modos de criação e para a apresentação da plataforma.

## Ferramentas de edição

O painel de edição é organizado em sete abas:

- **Tela:** resolução do monitor, formato do download e qualidade do arquivo.
- **Cores:** paletas, cores livres, fundos sólidos e gradientes lineares ou radiais com direção ajustável.
- **Textos:** escolha do texto, criação e exclusão de camadas, conteúdo, fonte, estilo e posição.
- **Elementos:** formas geométricas com tamanho, cor, contorno, sombra, posição, rotação e opacidade.
- **Desenho:** lápis, caneta, pincel, marcador, borracha e criação de formas por arraste.
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

Use o seletor na aba “Textos” para editar uma camada. O botão **Adicionar texto** cria uma camada; “Duplicar” copia a camada selecionada com um pequeno deslocamento. Há suporte a até **32 textos**, com até **300 caracteres** cada, incluindo quebras de linha. É possível remover uma camada, remover todas ou ocultar um texto sem apagá-lo.

Cada camada tem:

- 8 opções de fonte: Arial, Georgia, Courier New, Trebuchet MS, Times New Roman, Verdana, Impact e Cursiva.
- Cor, tamanho, negrito, itálico, sombra, contorno, espaçamento entre linhas e alinhamento próprios.
- Posição horizontal e vertical, rotação e opacidade.
- Ordem de sobreposição entre textos com “Recuar” e “Avançar”.
- Posicionamento por arraste na prévia, inclusive por toque. Em sobreposições, a camada escolhida no seletor tem prioridade no arraste.

As fontes são locais, com alternativas de sistema: a aparência pode variar conforme as fontes instaladas. A renderização reduz textos muito grandes ou longos para mantê-los dentro da tela. O tamanho indicado é a referência em uma tela com altura de 1080 pixels; acompanha proporcionalmente a resolução exportada.

## Quadro de desenho livre

A aba **Desenho** e a barra acima da prévia oferecem:

| Material | Comportamento inicial | Atalho |
| --- | --- | --- |
| Selecionar | Mover textos e formas, sem desenhar | V |
| Lápis | Fino, leve e sensível à pressão | P |
| Caneta | Traço preciso e opaco | L |
| Pincel | Traço mais largo e sensível à pressão | B |
| Marcador | Traço translúcido com ponta quadrada | M |
| Borracha | Apaga a tinta de forma transparente | E |
| Desenhar forma | Criar uma forma diretamente por arraste | F |

Use mouse, toque ou caneta digital. Espessura (0,5 a 240 px), cor e opacidade são independentes para cada material e ficam lembradas durante a sessão. Há 16 cores rápidas, seletor de cor e campo hexadecimal. Na borracha, a opacidade controla a força da remoção; ela não pinta com uma cor de fundo. A pressão de uma caneta digital varia a espessura do lápis e do pincel, quando ativada. Mouse e toque usam a espessura definida.

Cada gesto completo conta como uma edição no histórico. **Esc** cancela o gesto atual; **Ctrl/Cmd+Z** desfaz. “Remover último traço” remove a última passada de tinta ou borracha; “Limpar desenho” apaga apenas a camada de traços e pode ser desfeito. Os atalhos de ferramentas não interferem na digitação em campos de texto.

O desenho tem uma camada transparente acima das formas e abaixo dos textos. A borracha apaga **somente os traços livres**, preservando o fundo, a imagem e os objetos. Formas e textos são removidos por seus botões de exclusão. O projeto armazena a sequência dos traços e das passadas da borracha; salvar, reabrir e exportar mantêm o resultado.

Os traços guardam coordenadas relativas ao centro e à altura da arte: mudar a resolução preserva as proporções. Ao mudar a proporção da tela, a arte permanece centralizada e o que ultrapassar o novo enquadramento é recortado.

Para criar formas manualmente, escolha **Desenhar uma forma**, selecione o tipo e arraste na prévia. **Shift** mantém largura e altura iguais; um clique insere uma forma de tamanho padrão. A forma resultante continua editável na aba Elementos. Volte a **Selecionar / mover** para posicionar objetos.

**Ampliar editor** remove a página ao redor da área de trabalho e mantém as ferramentas disponíveis. “Voltar ao site” ou Esc retorna ao layout normal; durante um gesto, o primeiro Esc cancela apenas o gesto.

Para manter o navegador responsivo, cada espaço aceita até 2000 gestos e 200 mil pontos de desenho, com até 5000 pontos por gesto. Um traço que alcançar esse limite é preservado e pode ser continuado com outro gesto. O histórico compartilha dados imutáveis entre edições para evitar cópias completas do desenho a cada alteração.

## Formas e imagens

Adicione até **100 formas por projeto**, escolhendo entre **24 tipos**: círculo/elipse, retângulo, forma arredondada, triângulo, estrela, anel, losango, pentágono, hexágono, octógono, coração, setas à direita e à esquerda, chevron, linha, cruz, raio, gota, lua, nuvem, balão de fala, flor, brilho e arco. A biblioteca tem busca por nome e prévias desenhadas. Cada uma pode ser duplicada, ocultada, excluída, arrastada e reordenada entre as formas. Há controles de largura, altura, preenchimento ou apenas contorno, espessura de até 240 px, sombra, posição, rotação e opacidade. As formas novas podem ultrapassar as bordas por padrão. Ao mover uma forma pelo quadro, a posição pode ficar fora de 0–100%, e o trecho externo é recortado na prévia e no arquivo exportado. Essas posições são preservadas ao salvar e reabrir. “Centralizar no quadro” recupera facilmente uma forma que ficou fora da tela. “Conter dentro da tela” ainda permite enquadrar uma forma pelo painel; a edição com o mouse libera as bordas novamente.

**Edite diretamente na prévia:** selecione a forma e arraste as oito alças brancas. Os cantos alteram largura e altura; as alças laterais alteram uma dimensão. Segure **Shift** para manter a proporção. O círculo amarelo com a indicação “Contorno” ajusta a espessura ao arrastar horizontalmente. As alças acompanham a rotação e continuam acessíveis quando a forma está parcialmente fora do quadro. Mouse e toque são aceitos; cada gesto ocupa uma etapa de desfazer/refazer, e **Esc** cancela a edição em andamento. As dimensões agora vão de 1 a 4000 px de largura e de 1 a 2160 px de altura, na referência de altura de 1080 px.

As imagens importadas ficam sobre a arte original e atrás das formas e dos textos. Os padrões e o acabamento do fundo também aparecem sobre a imagem. As formas ficam atrás dos traços livres e dos textos; os controles de ordem operam dentro de cada grupo.

A aba Imagem aceita **PNG, JPEG e WebP de até 10 MB e 30 megapixels**. A importação é processada localmente, sem envio a um servidor. Para manter a edição e o salvamento leves, a imagem é reduzida para no máximo 2560 pixels no maior lado e convertida em WebP (ou PNG, se necessário), com limite de 4 MB codificados. Imagens com transparência continuam transparentes. A resolução final do wallpaper segue o formato de exportação escolhido; fotos de baixa resolução não ganham detalhes ao exportar em 4K.

Use “Preencher a tela” para cobrir o fundo com recorte, ou “Mostrar imagem inteira” para preservar o enquadramento. Zoom, alinhamento e opacidade permitem combinar a imagem com a arte. Remover a imagem pode ser desfeito.

## Formatos e exportação

11 resoluções de desktop, conforme o plano, com as proporções reais preservadas:

| Resolução | Proporção | Uso |
| --- | --- | --- |
| 7680 × 4320 | 16:9 | 8K (wallHigh) |
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

“Baixar projeto” exporta a criação ativa em `.wallultra.json`, incluindo textos, formas, traços, passadas da borracha, efeitos e imagem. “Abrir projeto” permite continuar a criação em outro navegador ou computador; arquivos de até 32 MB são aceitos. A importação usa o espaço correspondente (livre ou estilos), preserva o outro rascunho e pode ser desfeita.

O armazenamento do navegador tem limites. Se ele estiver cheio ou bloqueado, o app avisa para usar “Baixar projeto”; não há sincronização automática com uma conta.

## Validação

```sh
npm test
```

Os testes do Node verificam traços, pressão, limites de pontos, migração da camada de desenho, novas formas, criação livre, independência dos rascunhos, arquivos de projeto, persistência, migração, recuperação de dados inválidos, ordem e limites das camadas e ajuste de textos e formas rotacionados. A interface também foi verificada no Chromium com pixels da tinta e da borracha em PNG Full HD/4K/ultrawide, eventos reais de toque e pressão de caneta, desenho de formas com Shift, editor ampliado, edição, arraste, histórico, exclusão, salvamento, migração, imagens locais, importação/exportação de projetos, verificação dos pixels da imagem exportada e layouts em diferentes larguras.

## Escopo

O editor e os arquivos continuam processados no navegador. O servidor Node agora valida o acesso manual aos planos. Ainda não há contas de usuário, pagamentos, sincronização em nuvem ou geração por IA. Há importação local de imagens e transferência de projetos por arquivo. As composições prontas são desenhadas proceduralmente, sem imagens externas, fontes remotas ou serviços pagos. O wallBasic funciona sem credenciais; a ativação dos demais planos exige configuração do servidor descrita abaixo.


## Planos sem pagamento — versão 0.7.0

| Plano | Recursos disponíveis |
| --- | --- |
| wallBasic | Gratuito; todos os materiais de desenho; cores e fontes livres; imagens próprias; 8 formas essenciais; 4 estilos; PNG/JPEG/WebP até 1920 × 1200; biblioteca local de 3 projetos. |
| wallMedium | Basic + 24 formas, 8 estilos, sombra/contorno em textos, gradiente de 3 cores (fundo/secundária/destaque), contraste e saturação, até 20 paletas favoritas locais, exportação até 4K e ultrawide de uma tela; biblioteca local de 25 projetos. |
| wallHigh | Medium + mesclagem de imagem (multiply, screen, overlay, soft-light, difference), extração das cores mais frequentes de imagens, até 20 estilos de acabamento locais, pacote de 3 PNGs Full HD/QHD/4K, 8K e múltiplos monitores; biblioteca local de 100 projetos. |

As ferramentas mostram o plano necessário e abrem a comparação ao tentar usar um recurso bloqueado. O acesso é cumulativo. Os limites técnicos de 32 textos, 100 formas e desenho existentes valem igualmente para todos. A biblioteca local é adicional aos dois rascunhos; o limite de armazenamento é o do navegador, não uma cota em GB. Ao atingir a cota de projetos, é possível excluir itens ou baixar o arquivo editável.

Importação, histórico, salvamentos antigos e mudança de plano não descartam conteúdo. Uma criação que usa recursos superiores continua visível, editável e pode ser baixada como projeto; sua imagem final exige o plano correspondente. “Adaptar criação ao meu plano” remove os efeitos indisponíveis, converte formas avançadas em retângulos e escolhe resolução compatível. A adaptação pode ser desfeita. Projetos importantes devem ter uma cópia baixada antes de qualquer alteração.

### Ativação manual pelo responsável

Não há checkout, preços, cobranças, renovação automática nem seletor público que conceda planos. Sem configuração, todos começam no Basic. Para testar ou conceder acesso durante esta fase:

1. Copie `.env.example` para `.env` e preencha **segredos diferentes**, gerados por você: segredo de assinatura com pelo menos 32 caracteres e códigos de convite com pelo menos 16 caracteres.
2. Execute com Node 22: `node --env-file=.env server.mjs`. `npm start` também funciona quando as variáveis já são fornecidas pelo ambiente da hospedagem.
3. No menu **Planos**, insira um dos códigos. O servidor concede Medium ou High neste navegador por **7 dias**, em cookie assinado `HttpOnly` e `SameSite=Strict`. Não guarde códigos em projetos, JavaScript público ou no Git. Não envie credenciais bancárias.
4. Em produção, configure `NODE_ENV=production`, use HTTPS e informe `WALLULTRA_ORIGIN` com a origem pública exata (sem barra final), especialmente atrás de proxy reverso. Isso também habilita `Secure` no cookie.
5. “Encerrar acesso neste navegador” retorna ao Basic. Para invalidar todas as sessões, troque o segredo e reinicie o servidor. Trocar somente um código impede novas ativações com ele, mas não revoga cookies já emitidos.

Os códigos são convites compartilhados para este piloto, não assinaturas ou contas individuais. Qualquer pessoa com um código válido pode ativá-lo. A API limita tentativas por endereço da conexão em uma janela de 10 minutos; atrás de proxy, clientes podem compartilhar esse limite. Não há uma tela administrativa nem emissão de códigos pela interface.

### Limite de proteção e próximos passos

`GET /api/membership` consulta o acesso; `POST /api/membership/activate` valida o convite; `DELETE /api/membership` encerra a sessão; `POST /api/access` verifica recursos e metadados antes de exportar. O plano não é confiado a localStorage, arquivos de projeto ou um campo enviado pelo cliente. A assinatura de sessão é verificada no servidor, e a política de recursos é compartilhada em `plans.js`.

**O desenho e a exportação ainda são executados pelo JavaScript público do navegador.** Um usuário que modificar o aplicativo pode executar esses algoritmos por conta própria, inclusive ignorando a chamada de autorização. Esta entrega aplica a divisão na experiência oficial, com sessão validada, mas não constitui proteção comercial inviolável de ferramentas locais. Antes de cobrar, será necessário autenticação individual, registro persistente de direitos e proteger no backend os ativos/serviços que serão vendidos. Os metadados enviados ao endpoint não são prova do conteúdo efetivamente renderizado no cliente.

Benefícios de nuvem (100 MB/1 GB/5 GB), histórico por dias, fontes próprias, pincéis personalizados, máscaras, combinação de formas e SVG ainda não estão implementados nem são anunciados como disponíveis nas fichas dos planos. Esta versão não simula armazenamento em nuvem ou restauração de versões. A extração de paleta é local, por frequência de cores quantizadas, sem IA; imagens transparentes podem não fornecer cores. Os downloads em lote podem exigir permissão do navegador.

### Verificação dos planos

`npm test` inclui política cumulativa, formatos, importação de recursos premium, migração dos efeitos, ativação por código, rejeição de cookie adulterado, ausência de configuração, origem externa, limite de tentativas e autorização da exportação. A interface foi verificada no Chromium com ativação de Basic/Medium/High, persistência, bloqueios, PNGs reais Full HD e 4K, imagem, favoritos, mudança de plano e diálogo responsivo.


## Publicação no Vercel — correção 0.7.1

O projeto tem dois ambientes: os arquivos do editor executados no navegador e as rotas de API executadas no servidor. `app.js` **não é a entrada de um servidor Node**. O deploy anterior o identificava como entrada principal, embora o log terminasse com “Deployment completed”.

`vercel.json` define explicitamente o preset **Other** (`framework: null`), o build `npm run build` e a saída `public`. O build copia somente os 14 arquivos necessários à interface; arquivos `.env`, testes e código de servidor não são publicados como arquivos estáticos. Os três arquivos em `api/` exportam handlers Node para as rotas de consulta do plano, ativação e autorização. Eles reutilizam a política do servidor local sem abrir uma porta HTTP na função.

### Configuração do projeto no painel

1. Conecte o repositório e selecione a branch `main`. A **Root Directory** deve ser a raiz do repositório (onde estão `package.json` e `vercel.json`).
2. Deixe o preset e o build seguirem `vercel.json`. Se houver configurações antigas no painel, desative overrides conflitantes: o resultado deve ser **Other**, Build Command **npm run build**, Output Directory **public** e Node.js **22.x**. Não use `npm start` como comando de build.
3. O wallBasic funciona sem variáveis secretas. Para ativar Medium/High por código, configure `WALLULTRA_SESSION_SECRET` (mínimo 32 caracteres), `WALLULTRA_MEDIUM_CODE` e `WALLULTRA_HIGH_CODE` (mínimo 16 caracteres) nas variáveis de ambiente do Vercel. Use seus próprios valores, nunca os exemplos de testes.
4. No Vercel, `WALLULTRA_ORIGIN` é opcional: por padrão, a API aceita a origem HTTPS do domínio que recebeu a requisição. Se você já configurou essa variável, ela deve coincidir exatamente com o domínio acessado, sem barra final. Use valores separados para Production e Preview, ou remova a variável para aceitar o domínio atual. Cabeçalhos arbitrários de proxy não alteram essa decisão no servidor local.
5. Faça um novo deploy do commit corrigido. Alterações nas variáveis do painel só entram em vigor em um novo deploy.
6. Verifique `/` (editor), `/api/membership` (JSON com o plano Basic, ou o plano ativado) e uma exportação Full HD. Se configurou os códigos, teste a ativação, a permanência após recarregar e “Encerrar acesso”. A sessão usa cookies `HttpOnly`, `SameSite=Strict` e `Secure` no Vercel.

O aviso `npm warn Unknown env config "cache-dir"` mostrado no log vem da configuração do ambiente de instalação e não interrompeu aquele deploy. Fixar `engines.node` em `22.x` remove o aviso de atualização automática para futuras versões principais do Node.

### Validação local do pacote publicado

```sh
npm run build
npm test
```

Os testes de deploy verificam a lista de arquivos publicados, os três entrypoints, JSON já interpretado pelo runtime, cookies seguros, origem HTTPS atrás do proxy, limites do corpo e rejeição de pedidos inválidos. O servidor local continua com `npm start`; ele usa a mesma lista de arquivos públicos e a mesma política de planos. `public/` e `.vercel/` são gerados localmente e não são versionados.

O controle de tentativas de códigos é mantido em memória **por instância**. Em funções serverless ele não é um limite global persistente, e pode reiniciar com uma nova instância. A ativação manual continua sendo um piloto; autenticação e controle de tentativas compartilhado são necessários antes da operação comercial.
