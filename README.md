# Clima de Toussaint

**[Abrir o aplicativo](https://weathertoussaint.netlify.app/clima-de-toussaint.html)** · **[Código no GitHub](https://github.com/matheussimoes22/clima-de-toussaint)**

Aplicação climática fictícia e determinística para o ducado de Toussaint, inspirado em _The Witcher 3: Blood and Wine_. O objetivo não é reproduzir uma cidade real nem consumir uma API meteorológica: o aplicativo cria uma série canônica própria, usando relações e unidades plausíveis para sustentar o roleplay.

> Projeto pessoal de fã, não oficial e sem afiliação com CD Projekt Red ou Andrzej Sapkowski.

## O que o aplicativo oferece

- clima atual e previsão horária;
- panorama climático de 30 dias com níveis progressivos de confiança;
- calendário humano e calendário élfico;
- fases, iluminação, nascer e ocaso da Lua;
- nove localidades com microclimas e sincronização regional;
- ondas de calor e eventos meteorológicos persistentes;
- boletins ducais clicáveis e ordenados cronologicamente;
- português e inglês;
- preferências, diário e recordes registrados no navegador;
- instalação como PWA e funcionamento básico offline.

## Estrutura

```text
.
├── index.html                  # Entrada com splash e redirecionamento
├── clima-de-toussaint.html     # Documento principal
├── favicon.ico
├── manifest.webmanifest        # Instalação como PWA
├── sw.js                       # Cache offline
├── assets/
│   ├── icons/                  # Logo vetorial
│   ├── css/
│   │   ├── tailwind-input.css  # Entrada do compilador
│   │   ├── tailwind.css        # CSS compilado e versionado
│   │   └── styles.css          # Estilos e animações
│   └── js/
│       ├── main.js             # Inicialização e splash
│       ├── app/                # Controlador da aplicação
│       ├── data/               # Localidades, estações, feriados e lore
│       ├── engine/
│       │   ├── weather-engine.js   # Clima diário e condições atuais
│       │   ├── weather-dynamics.js # Evolução horária
│       │   └── weather-events.js   # Critérios e regiões afetadas
│       ├── i18n/               # Português e inglês
│       ├── navigation/
│       │   ├── history-router.js  # Histórico de navegação
│       │   └── calendar-swipe.js  # Gesto e transição mensal
│       ├── state/              # Preferências e recordes
│       └── views/              # Telas, textos de boletins e ícones
├── scripts/
│   ├── dev-server.mjs          # Servidor local
│   └── build.mjs               # Geração de dist
├── tests/                      # Testes automatizados
├── .gitignore
├── .prettierignore
├── package.json
├── package-lock.json           # Versões fixadas das dependências
└── tailwind.config.js
```

Os JavaScripts usam módulos ES nativos. O projeto continua estático e sem bundler ou framework, mas cada responsabilidade declara suas dependências diretamente.

## Premissas do mundo

- A meteorologia busca coerência com fenômenos reais, mas serve primeiro ao mundo fictício.
- O ciclo solar segue a observação de Toussaint no jogo: os horários variam suavemente ao longo do ano, com pôr do sol após as 20h perto do início do verão.
- A mesma data e localidade sempre produzem o mesmo clima.
- Beauclair e localidades próximas compartilham sistemas meteorológicos, com variações de relevo, umidade, vento e altitude.
- Probabilidade de precipitação, ocorrência canônica e volume estimado são valores separados.
- Os horários lunares são aproximações contínuas; avançam cerca de 49 minutos por dia e não constituem cálculo astronômico real.

## Executar localmente

O service worker e os módulos ES exigem HTTP. Não abra o HTML diretamente pelo protocolo `file://`.

Use **Node.js 22 ou superior**. Na pasta do projeto:

```bash
npm ci
npm run dev
```

Abra [a prévia local](http://127.0.0.1:4173).

Também é possível usar qualquer servidor estático, como a extensão Live Server.

## Desenvolvimento

Instale as ferramentas:

```bash
npm ci
```

Depois use:

```bash
npm run build:css  # recompila o Tailwind local
npm run format     # formata HTML, CSS, JS e metadados
npm run format:check # verifica a formatação sem alterar arquivos
npm run check      # valida a sintaxe dos JavaScripts
npm test           # executa os testes automatizados
npm run build      # gera a pasta dist para publicação
```

O `tailwind.css` compilado é versionado. Assim, Netlify e GitHub Pages podem publicar a pasta diretamente sem executar `npm install` ou uma etapa de build.

## Persistência

O navegador usa as seguintes chaves de `localStorage`:

- `toussaintApp_lang`;
- `toussaintApp_currentView`;
- `toussaintApp_calendarMonth` e `toussaintApp_calendarYear`;
- `toussaintApp_isElven`;
- `toussaintApp_location`;
- `toussaintApp_records`;
- `toussaintApp_diary`.

Essas chaves são mantidas por compatibilidade com versões anteriores.

## Publicação

Execute `npm run build` e publique o conteúdo da pasta `dist`. No Netlify, abra o projeto existente **weathertoussaint** e envie a pasta ou seu ZIP na área de **Deploys**. Criar outro projeto gera um segundo endereço; o nome do ZIP não muda o domínio. Sempre que CSS, JavaScript ou HTML mudar, atualize a constante `CACHE` em `sw.js`.

Para publicação automática pelo GitHub no Netlify, configure o comando `npm run build` e a pasta de saída `dist`, com Node.js 22 ou superior. Os ZIPs, `dist` e `node_modules` ficam fora do repositório; os fontes, testes, lockfile e CSS compilado permanecem versionados.

As fontes Cinzel e Inter ainda são carregadas do Google Fonts. Sem rede, o restante do aplicativo funciona e utiliza as fontes alternativas do sistema.

## Dinâmica meteorológica e boletins

- `engine/weather-engine.js` mantém o calendário, o ciclo solar canônico e as características regionais. A chuva incorpora uma reconstituição de 90 dias de umidade e estiagem; a reserva de umidade só favorece episódios quando há condições de instabilidade. Esse histórico é calculado, não depende de abrir o app todos os dias.
- `engine/weather-dynamics.js` distribui cada episódio entre formação de nuvens, pico e dissipação. A época, a temperatura, a umidade e as defasagens regionais determinam se há pancadas convectivas de tarde ou chuva frontal em outro horário. O volume horário soma o total diário e as temperaturas preservam as extremas previstas.
- `engine/weather-events.js` verifica as condições de cada hora. Calor, frio, frente fria, chuva intensa, tempestade, vento, nevoeiro, neve e Lua de Sangue têm regras próprias. As áreas afetadas são obtidas dessas mesmas horas; um evento que terminou não continua ativo.
- `views/bulletin-copy.js` contém variações em português e inglês, métricas e impactos condicionais. As cores externas identificam o fenômeno; as severidades anteriores permanecem no detalhe. Os SVGs locais estão em `views/interface-icons.js`.
- `navigation/calendar-swipe.js` acrescenta gesto mobile com limiar horizontal, cancelamento por rolagem vertical/multitoque e prevenção do clique após deslizar. As proporções adicionais do calendário são restritas a telas a partir de 1024 px.

A simulação continua determinística e tem resolução horária: recarregar a mesma data não muda o clima. Os limiares são regras ficcionais do aplicativo, não um modelo operacional de meteorologia. Execute `npm test` para verificar os fluxos existentes e a integração das novas regras.

## Polimento de 6 de setembro de 2026

- O calendário mobile acompanha o arraste horizontal, anima a saída/entrada dos meses e retorna à posição inicial quando o gesto é cancelado. Respeita movimento reduzido, rolagem vertical e multitoque; os botões continuam disponíveis.
- SVGs de navegação, métricas e previsão horária usam cores coerentes. As fases lunares foram preservadas. Referências visuais consultadas: https://fontawesome.com/ e https://www.flaticon.com/br/; os vetores locais continuam sem dependência de bibliotecas externas.
- Os pequenos ajustes de largura e centralização do desktop ficam limitados à media query de 1024 px.
- A chuva reconstrói umidade e estiagem usando o ano correto e o perfil regional. Recuperação após dias secos exige umidade disponível e instabilidade; não existe aumento global da probabilidade sazonal. No verão, episódios com energia e umidade suficientes favorecem pancadas à tarde, após formação de nuvens.
- Frente fria exige queda de pelo menos 5 °C na máxima, vento/nuvens compatíveis nas horas afetadas e manutenção de pelo menos 3 °C de resfriamento na máxima seguinte. Calor exige anomalia local e continuidade em dia vizinho. Tempestade exige precipitação, nuvens, umidade e vento compatíveis.
- A lista publica um evento principal e, excepcionalmente, um segundo fenômeno relacionado próximo, dentro do horizonte de sete dias. A previsão de 30 dias continua disponível integralmente.
- Avisos rápidos e boletins consultam as mesmas ocorrências horárias e são atualizados na virada da hora. As áreas afetadas continuam sendo verificadas na simulação de cada região. Cores externas indicam o fenômeno; as severidades internas foram preservadas.
- Os textos PT/EN combinam títulos, introduções, métricas, estação, duração e horários verificáveis. A splash aparece nas duas entradas HTML, com CSS crítico embutido; a aplicação só é revelada após os estilos e a inicialização, sem espera mínima artificial. Falhas de carregamento oferecem recarregar.

Validação: `npm run check`, `npm test` e `npm run build`; simulação de 2025, 2026, 2027 e 2032 nas nove localidades, conservação de volumes, critérios dos eventos e quantidade de boletins. Navegador em desktop, 390 px e 360 px, calendário élfico, PT/EN, abas e abertura de detalhes. O gesto e a sequência de animações foram exercitados por testes automatizados; não foi realizado teste em aparelho físico. A meteorologia conserva resolução horária, e períodos secos ainda podem ocorrer quando faltam condições para precipitação.
