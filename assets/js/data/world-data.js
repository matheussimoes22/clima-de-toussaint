/**
 * Dados estáticos do mundo: localidades, estações, feriados, boletins e ícones.
 * Este arquivo não executa a aplicação; apenas declara sua configuração.
 */

// --- LOCAIS E DADOS ---
const LOCATIONS = {
  beauclair: {
    name: "Beauclair",
    tempOffset: 0,
    humOffset: 0,
    windOffset: 0,
    rainOffset: 0,
    fogOffset: 0,
    delayHours: 0,
    aqBase: 35,
    sunriseOffset: 0,
    sunsetOffset: 0,
    windDirBias: "SO",
  },
  castel_ravello: {
    name: "Castel Ravello",
    tempOffset: 0.2,
    humOffset: 0,
    windOffset: 0,
    rainOffset: 0,
    fogOffset: 0,
    delayHours: 0,
    aqBase: 22,
    sunriseOffset: 0,
    sunsetOffset: 0,
    windDirBias: "S",
  },
  casteldaccia: {
    name: "Casteldaccia",
    tempOffset: 0.3,
    humOffset: 5,
    windOffset: 0,
    rainOffset: 0,
    fogOffset: 2,
    delayHours: 0,
    aqBase: 20,
    sunriseOffset: 0,
    sunsetOffset: 0,
    windDirBias: "SE",
  },
  coronata: {
    name: "Vinhedos de Coronata",
    tempOffset: -0.3,
    humOffset: -5,
    windOffset: -5,
    rainOffset: -5,
    fogOffset: -5,
    delayHours: 0,
    aqBase: 15,
    sunriseOffset: 0,
    sunsetOffset: 0,
    windDirBias: "L",
    syncWith: "beauclair",
    syncStrength: 0.94,
  },
  vermentino: {
    name: "Floresta de Vermentino",
    tempOffset: -0.6,
    humOffset: 12,
    windOffset: -2,
    rainOffset: 0,
    fogOffset: 15,
    delayHours: 0.5,
    aqBase: 10,
    sunriseOffset: 0,
    sunsetOffset: 0,
    windDirBias: "O",
  },
  pomerol: {
    name: "Pomerol",
    tempOffset: -0.3,
    humOffset: 0,
    windOffset: 0,
    rainOffset: 3,
    fogOffset: 5,
    delayHours: 0.3,
    aqBase: 18,
    sunriseOffset: 0,
    sunsetOffset: 0,
    windDirBias: "NO",
  },
  dun_tynne: {
    name: "Dun Tynne",
    uvBoost: 1.04,
    tempOffset: -0.5,
    humOffset: 0,
    windOffset: 2,
    rainOffset: 0,
    fogOffset: 0,
    delayHours: 0.5,
    aqBase: 16,
    sunriseOffset: 0,
    sunsetOffset: 0,
    windDirBias: "N",
  },
  monte_gorgona: {
    name: "Monte Górgona",
    uvBoost: 1.14,
    tempOffset: -6,
    humOffset: 0,
    windOffset: 8,
    rainOffset: 5,
    fogOffset: 30,
    delayHours: 1.5,
    snowRisk: true,
    aqBase: 8,
    sunriseOffset: 25,
    sunsetOffset: -20,
    windDirBias: "N",
  },
  belhaven: {
    name: "Belhaven",
    uvBoost: 0.98,
    tempOffset: -1,
    humOffset: 10,
    windOffset: 0,
    rainOffset: 5,
    fogOffset: 10,
    delayHours: 2,
    aqBase: 12,
    sunriseOffset: 5,
    sunsetOffset: -5,
    windDirBias: "NE",
  },
};

// ============================================================
// === BOLETINS DUCAIS (PRÓXIMOS EVENTOS CLICÁVEIS) ===========
// ============================================================
const NEWS_SOURCES = {
  pt: "Observatório Ducal de Beauclair · Guarda Ducal de Toussaint",
  en: "Ducal Observatory of Beauclair · Ducal Guard of Toussaint",
};

// Impacto local por evento e região (lore de Toussaint)
const NEWS_REGION = {
  beauclair: {
    storm: {
      pt: "Na capital, o risco maior está nas ruas em declive do Bairro dos Tanoeiros e na Praça de Torneios: a água desce da colina do Palácio de Beauclair e alaga as vielas do mercado em minutos. O porto suspende o embarque de barris.",
      en: "In the capital, the greatest risk lies in the sloping streets of the Coopers' Quarter and the Tourney Square: water pours down from the Beauclair Palace hill and floods the market alleys within minutes. The port suspends barrel loading.",
    },
    snow: {
      pt: "A neve raramente pega nas telhas de Beauclair, mas basta uma fina camada para que as escadarias de mármore do palácio e as pontes sobre o rio virem armadilhas de gelo.",
      en: "Snow rarely settles on Beauclair's rooftops, yet a thin layer is enough to turn the palace's marble stairways and the river bridges into ice traps.",
    },
    fog: {
      pt: "O nevoeiro sobe do rio e engole a Praça de Torneios antes do amanhecer. A Guarda dobra as rondas: batedores de carteira e criaturas menores aproveitam a visibilidade curta nos becos.",
      en: "Fog rises from the river and swallows the Tourney Square before dawn. The Guard doubles its patrols: cutpurses and lesser creatures take advantage of the short visibility in the alleys.",
    },
    heat: {
      pt: "As fontes públicas de Beauclair ficam sob racionamento e a Guarda distribui água nas filas do mercado. Recomenda-se evitar torneios e treinos nas horas centrais do dia.",
      en: "Beauclair's public fountains fall under rationing and the Guard hands out water in the market queues. Tourneys and drills should be avoided during the central hours of the day.",
    },
    blood: {
      pt: "As portas da cidade fecham cedo e a Guarda reforça os postos das muralhas. Cavaleiros andantes hospedados na capital são convocados para rondas noturnas.",
      en: "The city gates close early and the Guard reinforces the wall posts. Knights errant lodged in the capital are summoned for night patrols.",
    },
  },
  castel_ravello: {
    storm: {
      pt: "As encostas dos vinhedos de Castel Ravello escoam rápido: há risco de erosão nas fileiras baixas e de perda das uvas maduras por granizo. Os capatazes devem recolher as ferramentas dos terraços.",
      en: "The slopes of the Castel Ravello vineyards drain fast: there is risk of erosion in the lower rows and of losing ripe grapes to hail. Foremen should collect tools from the terraces.",
    },
    snow: {
      pt: "A geada preocupa mais que a neve. As videiras devem ser cobertas nas fileiras voltadas ao norte, sob pena de perder os brotos da próxima safra.",
      en: "Frost worries the growers more than snow. Vines on the north-facing rows should be covered, lest the buds of the next harvest be lost.",
    },
    fog: {
      pt: "A névoa fecha a estrada de carroças entre a propriedade e a capital. Transportes de barris devem ser adiados para depois do meio da manhã.",
      en: "Fog closes the cart road between the estate and the capital. Barrel transports should be postponed until after mid-morning.",
    },
    heat: {
      pt: "O calor adianta a maturação das uvas e concentra o açúcar em excesso. Recomenda-se antecipar a colheita das parcelas mais expostas ao sol.",
      en: "The heat hastens grape ripening and over-concentrates the sugars. Harvesting the most sun-exposed plots should be brought forward.",
    },
    blood: {
      pt: "As adegas ficam trancadas e os cães soltos. Relatos antigos falam de coisas que descem dos bosques vizinhos em noites assim.",
      en: "The cellars stay locked and the dogs run loose. Old accounts speak of things that come down from the neighbouring woods on nights like these.",
    },
  },
  casteldaccia: {
    storm: {
      pt: "As adegas subterrâneas de Casteldaccia podem infiltrar. Recomenda-se erguer os barris sobre estrados e vigiar os poços de drenagem durante a noite.",
      en: "The underground cellars of Casteldaccia may take in water. Barrels should be raised onto pallets and the drainage pits watched through the night.",
    },
    snow: {
      pt: "A umidade constante da propriedade transforma a neve em lama pesada nos caminhos de serviço; carroças carregadas devem esperar o degelo.",
      en: "The estate's constant damp turns snow into heavy mud on the service tracks; loaded carts should wait for the thaw.",
    },
    fog: {
      pt: "A névoa permanece presa entre os muros da vinícola até o fim da manhã. Trabalho com prensas e lamparinas exige atenção redobrada.",
      en: "Fog lingers trapped between the winery walls until late morning. Work with presses and lamps demands doubled attention.",
    },
    heat: {
      pt: "As adegas mantêm boa temperatura, mas o trabalho a céu aberto deve cessar entre o meio-dia e a terceira hora da tarde.",
      en: "The cellars hold a good temperature, but open-air work should cease between noon and the third hour of the afternoon.",
    },
    blood: {
      pt: "Os empregados são dispensados antes do anoitecer. Nenhuma carroça deve cruzar os vinhedos após o crepúsculo.",
      en: "Workers are dismissed before nightfall. No cart should cross the vineyards after dusk.",
    },
  },
  coronata: {
    storm: {
      pt: "Os Vinhedos de Coronata acompanham de perto o tempo da capital: espera-se a mesma frente, com chuva um pouco mais fraca por causa do abrigo das colinas. Risco de encharcamento nas fileiras baixas.",
      en: "The Coronata Vineyards closely follow the capital's weather: the same front is expected, with slightly weaker rain thanks to the shelter of the hills. Risk of waterlogging in the lower rows.",
    },
    snow: {
      pt: "A neve é rara nas encostas de Coronata, mas a geada da madrugada queima as folhas jovens. Fogueiras de aquecimento entre as fileiras são recomendadas.",
      en: "Snow is rare on Coronata's slopes, yet the pre-dawn frost burns young leaves. Warming fires between the rows are recommended.",
    },
    fog: {
      pt: "A neblina desce dos morros e cobre as parcelas mais altas. Colheita manual deve começar apenas quando o sol abrir a névoa.",
      en: "Mist descends from the hills and covers the higher plots. Hand-picking should begin only once the sun burns the fog away.",
    },
    heat: {
      pt: "O solo seco de Coronata sofre com ondas de calor prolongadas. Irrigação noturna e sombreamento das mudas novas são aconselhados.",
      en: "Coronata's dry soil suffers under prolonged heat waves. Night irrigation and shading of young plants are advised.",
    },
    blood: {
      pt: "Os vinhateiros recolhem o gado e acendem tochas nas divisas. Diz-se que o vinho colhido sob a lua vermelha guarda um travo estranho.",
      en: "The vintners bring in the cattle and light torches along the boundaries. It is said that wine harvested under the red moon carries a strange aftertaste.",
    },
  },
  vermentino: {
    storm: {
      pt: "Na Floresta de Vermentino, o perigo é a queda de galhos e árvores sobre as trilhas de caça. Lenhadores e caçadores devem deixar a mata antes da frente chegar.",
      en: "In the Vermentino Forest, the danger is falling branches and trees over the hunting trails. Woodsmen and hunters should leave the wood before the front arrives.",
    },
    snow: {
      pt: "A neve encobre as trilhas e desorienta viajantes. As marcações de caminho ficam invisíveis; recomenda-se contornar a mata pela estrada principal.",
      en: "Snow blankets the trails and disorients travellers. Path markers become invisible; skirting the wood by the main road is recommended.",
    },
    fog: {
      pt: "Vermentino é a região mais afetada por neblina densa do ducado. Nessas condições, avistamentos de criaturas sob a copa das árvores tornam-se frequentes.",
      en: "Vermentino is the duchy's region most affected by dense fog. Under such conditions, sightings of creatures beneath the canopy become frequent.",
    },
    heat: {
      pt: "A copa fechada segura o calor e o ar fica abafado. Risco elevado de incêndio no folhiço seco: proibidas fogueiras abertas na mata.",
      en: "The closed canopy traps the heat and the air turns stifling. High fire risk in the dry leaf litter: open fires are forbidden in the wood.",
    },
    blood: {
      pt: "Sob a Lua de Sangue, a floresta é considerada intransitável. Nenhuma escolta ducal cruzará Vermentino até o amanhecer.",
      en: "Under the Blood Moon, the forest is deemed impassable. No ducal escort will cross Vermentino until dawn.",
    },
  },
  pomerol: {
    storm: {
      pt: "As estradas de terra de Pomerol viram atoleiro sob chuva forte. Comboios de vinho devem aguardar liberação dos batedores da Guarda.",
      en: "Pomerol's dirt roads turn to quagmire under heavy rain. Wine convoys should await clearance from the Guard's outriders.",
    },
    snow: {
      pt: "As encostas de Pomerol acumulam neve nas curvas sombreadas. Carroças sem correntes não devem tentar a subida.",
      en: "Pomerol's slopes gather snow on the shaded bends. Carts without chains should not attempt the climb.",
    },
    fog: {
      pt: "A névoa se acumula nos vales estreitos ao amanhecer, reduzindo a visão nas curvas da estrada de comércio.",
      en: "Fog gathers in the narrow valleys at daybreak, cutting visibility on the bends of the trade road.",
    },
    heat: {
      pt: "O calor castiga os animais de tração. Recomenda-se viajar apenas ao amanhecer e ao anoitecer, com paradas de água a cada légua.",
      en: "The heat punishes draught animals. Travel is advised only at dawn and dusk, with watering stops every league.",
    },
    blood: {
      pt: "Os postos de guarda ao longo da estrada permanecem guarnecidos a noite toda. Viajantes devem buscar abrigo na próxima estalagem.",
      en: "The guard posts along the road remain manned all night. Travellers should seek shelter at the nearest inn.",
    },
  },
  dun_tynne: {
    storm: {
      pt: "O castelo de Dun Tynne fica exposto ao vento no alto do platô. Rajadas podem arrancar telhas e derrubar estandartes das muralhas.",
      en: "Dun Tynne castle stands exposed to the wind atop the plateau. Gusts may tear off tiles and bring down banners from the walls.",
    },
    snow: {
      pt: "A subida até Dun Tynne torna-se traiçoeira com gelo. A guarnição deve garantir lenha e mantimentos para vários dias.",
      en: "The ascent to Dun Tynne turns treacherous with ice. The garrison should secure firewood and provisions for several days.",
    },
    fog: {
      pt: "A névoa esconde a estrada de acesso ao castelo; sentinelas devem manter fogueiras acesas nos torreões.",
      en: "Fog conceals the castle approach road; sentries should keep beacons lit on the turrets.",
    },
    heat: {
      pt: "O pátio de pedra acumula calor. Treinos de armas ficam suspensos nas horas centrais e a cisterna passa a ser racionada.",
      en: "The stone courtyard stores heat. Weapons drills are suspended in the central hours and the cistern falls under rationing.",
    },
    blood: {
      pt: "A guarnição dobra as sentinelas. Ordens ducais determinam ponte levadiça erguida do pôr do sol ao nascer do dia.",
      en: "The garrison doubles its sentries. Ducal orders require the drawbridge raised from sunset to sunrise.",
    },
  },
  monte_gorgona: {
    storm: {
      pt: "No Monte Górgona, a tempestade vem acompanhada de rajadas fortes e risco de raios nas cristas expostas. Escaladas e caçadas em altitude devem ser canceladas.",
      en: "On Mount Gorgon, the storm comes with strong gusts and lightning risk on the exposed ridges. Climbs and high-altitude hunts should be cancelled.",
    },
    snow: {
      pt: "A nevasca fecha as passagens do Monte Górgona. Há risco real de avalanche nas encostas norte; nenhum guia deve subir sem ordem expressa.",
      en: "Blizzards close the Mount Gorgon passes. There is genuine avalanche risk on the northern slopes; no guide should ascend without express orders.",
    },
    fog: {
      pt: "A montanha passa boa parte do dia dentro da nuvem. Sem visibilidade, qualquer travessia pelas cornijas é considerada suicídio.",
      en: "The mountain spends much of the day inside the cloud. Without visibility, any traverse along the ledges is considered suicide.",
    },
    heat: {
      pt: "Mesmo no calor, a altitude engana: o sol queima com força redobrada e a radiação é a mais alta do ducado. Proteja a pele e os olhos.",
      en: "Even in heat, altitude deceives: the sun burns twice as hard and radiation is the highest in the duchy. Protect skin and eyes.",
    },
    blood: {
      pt: "Os grifos das encostas ficam agitados sob a lua vermelha. Rebanhos das aldeias de sopé devem ser recolhidos ao anoitecer.",
      en: "The griffins of the slopes grow restless under the red moon. Flocks in the foothill villages must be brought in at dusk.",
    },
  },
  belhaven: {
    storm: {
      pt: "Belhaven recebe a chuva com atraso, mas em maior volume: o riacho da aldeia transborda com facilidade e isola as casas mais baixas.",
      en: "Belhaven receives the rain later, but in greater volume: the village brook overflows easily and cuts off the lower houses.",
    },
    snow: {
      pt: "A aldeia fica isolada com facilidade sob neve. Recomenda-se estocar lenha e alimentos e manter os caminhos até o poço limpos.",
      en: "The village is easily cut off under snow. Stocking firewood and food and keeping the paths to the well clear is advised.",
    },
    fog: {
      pt: "A neblina fica presa no vale de Belhaven até tarde. Pastores devem manter o rebanho junto às cercas.",
      en: "Fog stays trapped in the Belhaven valley until late. Shepherds should keep their flocks near the fences.",
    },
    heat: {
      pt: "O poço da aldeia baixa depressa em ondas de calor. Racionamento e vigília noturna sobre as reservas são recomendados.",
      en: "The village well drops quickly during heat waves. Rationing and a night watch over the reserves are recommended.",
    },
    blood: {
      pt: "A aldeia acende fogueiras nas divisas e nenhuma criança deve sair após o anoitecer, conforme o costume antigo.",
      en: "The village lights fires along its boundaries and no child should go out after dark, as old custom demands.",
    },
  },
};

const NEWS_TEMPLATES = {
  storm: {
    emoji: "⛈️",
    sev: { pt: "Alerta Laranja", en: "Orange Alert" },
    sevClass: "news-sev-orange",
    title: {
      pt: "Frente de tempestade avança sobre o ducado",
      en: "Storm front advances over the duchy",
    },
    kicker: { pt: "Boletim de Tempestade", en: "Storm Bulletin" },
    lead: {
      pt: (w, loc) =>
        `Os astrônomos ducais confirmam a aproximação de uma frente carregada vinda do mar de Cintra, com chegada prevista a ${loc}. Espera-se aparato elétrico, rajadas de vento e chuva concentrada em poucas horas.`,
      en: (w, loc) =>
        `The ducal astronomers confirm the approach of a laden front from the Cintran sea, expected to reach ${loc}. Lightning, wind gusts and rain concentrated within a few hours are anticipated.`,
    },
    body: {
      pt: [
        "A queda de pressão registrada nos barômetros do observatório indica instabilidade acentuada. Chuvas de curta duração e alta intensidade podem provocar enxurradas nas estradas de terra e transbordamento de valas de irrigação.",
        "A Guarda Ducal recomenda que comboios de vinho e carroças de mercadoria aguardem a passagem da frente antes de retomar viagem. Pontes de madeira sobre córregos devem ser evitadas enquanto durar o temporal.",
      ],
      en: [
        "The pressure drop recorded on the observatory barometers points to marked instability. Short, intense downpours may cause flash floods on dirt roads and overflow irrigation ditches.",
        "The Ducal Guard advises that wine convoys and merchant carts wait for the front to pass before resuming travel. Wooden bridges over streams should be avoided while the storm lasts.",
      ],
    },
    advice: {
      pt: [
        "Recolha animais, barris e ferramentas deixados a céu aberto.",
        "Evite abrigar-se sob árvores isoladas ou junto a torres e mastros.",
        "Adie travessias por vaus e pontes baixas.",
        "Mantenha lamparinas e velas afastadas de cortinas ao fechar as janelas.",
      ],
      en: [
        "Bring in animals, barrels and tools left in the open.",
        "Do not shelter under lone trees or beside towers and masts.",
        "Postpone crossings at fords and low bridges.",
        "Keep lamps and candles away from curtains when shutting the windows.",
      ],
    },
  },
  snow: {
    emoji: "❄️",
    sev: { pt: "Alerta Azul", en: "Blue Alert" },
    sevClass: "news-sev-blue",
    title: {
      pt: "Massa de ar frio traz neve às terras altas",
      en: "Cold air mass brings snow to the highlands",
    },
    kicker: { pt: "Boletim de Neve e Geada", en: "Snow and Frost Bulletin" },
    lead: {
      pt: (w, loc) =>
        `Uma massa de ar frio descida das Montanhas Amell deve alcançar ${loc}, com precipitação em forma de neve e mínimas próximas de ${w.tempMin}°C.`,
      en: (w, loc) =>
        `A cold air mass descending from the Amell Mountains is expected to reach ${loc}, with precipitation as snow and lows near ${w.tempMin}°C.`,
    },
    body: {
      pt: [
        "Toussaint raramente conhece o inverno rigoroso do Norte, e é justamente por isso que a neve causa transtorno: telhados leves, estradas sem cascalho e vinhedos descobertos sofrem mais aqui do que em Kaedwen.",
        "As estradas para as terras altas podem tornar-se intransitáveis para carroças. Recomenda-se rota alternativa pela estrada baixa do vale de Sansretour enquanto durar a nevada.",
      ],
      en: [
        "Toussaint seldom knows the harsh winter of the North, and that is precisely why snow causes disruption: light roofs, ungravelled roads and uncovered vineyards suffer more here than in Kaedwen.",
        "Roads to the highlands may become impassable for carts. An alternative route along the low road of the Sansretour valley is advised while the snowfall lasts.",
      ],
    },
    advice: {
      pt: [
        "Proteja as videiras jovens e cubra as fileiras expostas ao vento norte.",
        "Estoque lenha e mantimentos para ao menos três dias.",
        "Não viaje à noite por estradas de montanha.",
        "Vigie idosos e animais de pequeno porte contra o frio da madrugada.",
      ],
      en: [
        "Protect young vines and cover the rows exposed to the north wind.",
        "Stock firewood and provisions for at least three days.",
        "Do not travel mountain roads by night.",
        "Watch over the elderly and small livestock against the pre-dawn cold.",
      ],
    },
  },
  fog: {
    emoji: "🌫️",
    sev: { pt: "Alerta Amarelo", en: "Yellow Alert" },
    sevClass: "news-sev-yellow",
    title: {
      pt: "Neblina densa reduz visibilidade nas estradas",
      en: "Dense fog cuts visibility on the roads",
    },
    kicker: { pt: "Boletim de Visibilidade", en: "Visibility Bulletin" },
    lead: {
      pt: (w, loc) =>
        `Prevê-se formação de nevoeiro cerrado em ${loc}, com visibilidade estimada em cerca de ${w.visibility} km e dissipação apenas após o meio da manhã.`,
      en: (w, loc) =>
        `Thick fog is forecast for ${loc}, with visibility estimated at about ${w.visibility} km and dispersal only after mid-morning.`,
    },
    body: {
      pt: [
        "O ar úmido represado nos vales, somado ao resfriamento noturno, cria bancos de névoa que se estendem por léguas. Nas estradas, marcos e placas tornam-se invisíveis a poucos passos de distância.",
        "Além do risco a viajantes, a Guarda lembra que a névoa favorece emboscadas e a aproximação de criaturas. Escoltas devem viajar em grupo, com lanternas acesas mesmo durante o dia.",
      ],
      en: [
        "Damp air trapped in the valleys, combined with night cooling, creates fog banks stretching for leagues. On the roads, markers and signs become invisible from a few paces away.",
        "Beyond the risk to travellers, the Guard recalls that fog favours ambushes and the approach of creatures. Escorts should travel in groups, lanterns lit even by day.",
      ],
    },
    advice: {
      pt: [
        "Viaje somente após a dissipação da névoa, se possível.",
        "Mantenha lanternas acesas e reduza o passo dos cavalos.",
        "Não se afaste das trilhas marcadas em áreas de mata.",
        "Anuncie-se em voz alta ao cruzar com outros viajantes.",
      ],
      en: [
        "Travel only after the fog lifts, if possible.",
        "Keep lanterns lit and slow your horses.",
        "Do not stray from marked trails in wooded areas.",
        "Announce yourself aloud when meeting other travellers.",
      ],
    },
  },
  heat: {
    emoji: "🌡️",
    sev: { pt: "Alerta Vermelho", en: "Red Alert" },
    sevClass: "news-sev-red",
    title: {
      pt: "Onda de calor atinge o Ducado de Toussaint",
      en: "Heat wave strikes the Duchy of Toussaint",
    },
    kicker: { pt: "Boletim de Calor Extremo", en: "Extreme Heat Bulletin" },
    lead: {
      pt: (w, loc) =>
        `O observatório prevê temperaturas de até ${w.tempMax}°C em ${loc}, com sensação térmica próxima de ${w.feelsLikeDay}°C e índice de radiação solar em ${w.uvIndex}.`,
      en: (w, loc) =>
        `The observatory forecasts temperatures up to ${w.tempMax}°C in ${loc}, with a felt temperature near ${w.feelsLikeDay}°C and a solar radiation index of ${w.uvIndex}.`,
    },
    body: {
      pt: [
        "O ar seco e estagnado sobre o vale de Sansretour deve persistir por vários dias, com noites igualmente quentes e pouca chance de chuva. A combinação de calor e baixa umidade eleva o risco de incêndio em campos de restolho e matas secas.",
        "Vinhateiros relatam maturação acelerada das uvas e estresse hídrico nas parcelas mais expostas. Recomenda-se irrigação nas horas frescas e antecipação parcial da colheita onde for possível.",
      ],
      en: [
        "The dry, stagnant air over the Sansretour valley is expected to persist for several days, with equally warm nights and little chance of rain. Heat combined with low humidity raises the fire risk in stubble fields and dry woods.",
        "Vintners report accelerated grape ripening and water stress in the most exposed plots. Irrigation during the cool hours and partial early harvesting where feasible are advised.",
      ],
    },
    advice: {
      pt: [
        "Beba água com frequência e evite vinho nas horas mais quentes.",
        "Suspenda trabalhos pesados entre a quinta e a nona hora do dia.",
        "Proíba fogueiras abertas em campos e matas.",
        "Ofereça sombra e água a cavalos e animais de tração.",
      ],
      en: [
        "Drink water often and avoid wine during the hottest hours.",
        "Suspend heavy labour between the fifth and ninth hour of the day.",
        "Forbid open fires in fields and woods.",
        "Provide shade and water to horses and draught animals.",
      ],
    },
  },
  blood: {
    emoji: "🔴",
    sev: { pt: "Alerta Ducal", en: "Ducal Alert" },
    sevClass: "news-sev-blood",
    title: {
      pt: "Lua de Sangue prevista sobre Toussaint",
      en: "Blood Moon foretold over Toussaint",
    },
    kicker: { pt: "Édito da Guarda Ducal", en: "Edict of the Ducal Guard" },
    lead: {
      pt: (w, loc) =>
        `Por cálculo dos astrônomos da corte, a lua erguer-se-á vermelha sobre ${loc}. O édito ducal determina recolhimento após o pôr do sol e reforço das guarnições.`,
      en: (w, loc) =>
        `By reckoning of the court astronomers, the moon shall rise red over ${loc}. The ducal edict orders a curfew after sunset and reinforcement of the garrisons.`,
    },
    body: {
      pt: [
        "Registros do arquivo de Beauclair associam essas noites a maior atividade de necrófagos, lobisomens e outras criaturas das trevas, sobretudo entre o equinócio de outono e o fim do inverno.",
        "A Guarda Ducal manterá postos avançados nas estradas principais e nas divisas dos vinhedos. Bruxos e cavaleiros andantes disponíveis podem apresentar-se ao quartel da capital para contratos de escolta.",
      ],
      en: [
        "Records in the Beauclair archive link such nights to heightened activity of ghouls, werewolves and other creatures of darkness, chiefly between the autumn equinox and the end of winter.",
        "The Ducal Guard will hold forward posts on the main roads and at the vineyard boundaries. Available witchers and knights errant may report to the capital barracks for escort contracts.",
      ],
    },
    advice: {
      pt: [
        "Recolha-se antes do anoitecer e tranque portas e postigos.",
        "Mantenha o gado abrigado e os cães soltos no pátio.",
        "Não viaje sozinho entre aldeias durante a noite.",
        "Comunique avistamentos ao posto de guarda mais próximo.",
      ],
      en: [
        "Return home before nightfall and bar doors and shutters.",
        "Keep livestock sheltered and dogs loose in the yard.",
        "Do not travel alone between villages at night.",
        "Report any sightings to the nearest guard post.",
      ],
    },
  },
};

const ELVEN_DATA = {
  monthMap: [
    "Yule",
    "Imbaelk",
    "Birke",
    "Blathe",
    "Belleteyn",
    "Feainn",
    "Feainn",
    "Lammas",
    "Velen",
    "Velen",
    "Saovine",
    "Yule",
  ],
  weekdays: ["Sul", "Che", "Teir", "Cear", "Pemp", "Whe", "Seith"],
  seasonNames: {
    spring: "Birke",
    summer: "Midaëte",
    autumn: "Velen",
    winter: "Midinváerne",
  },
  moonPhases: {
    "Lua Nova": "Lleuad Newydd",
    "Lua Crescente": "Lleuad Cilgant",
    "Quarto Crescente": "Lleuad Chwarter",
    "Gibosa Crescente": "Lleuad Gibous",
    "Lua Cheia": "Lleuad Lawn",
    "Gibosa Minguante": "Lleuad Wan",
    "Quarto Minguante": "Lleuad Olaf",
    "Lua Minguante": "Lleuad Marw",
    "Lua de Sangue": "Lleuad Gwaed",
  },
};

// --- SAVAEDS CONFIGURAÇÃO (Modelo Contínuo) ---
// Mês JS é 0-indexed (Jan=0, Nov=10, Dez=11)
const ELVEN_SAVAEDS = [
  { name: "Imbaelk", startMonth: 1, startDay: 1 }, // 1 Fev
  { name: "Birke", startMonth: 2, startDay: 21 }, // 21 Mar
  { name: "Belleteyn", startMonth: 4, startDay: 1 }, // 1 Mai
  { name: "Midaëte", startMonth: 5, startDay: 21 }, // 21 Jun
  { name: "Lammas", startMonth: 7, startDay: 1 }, // 1 Ago
  { name: "Velen", startMonth: 8, startDay: 23 }, // 23 Set
  { name: "Saovine", startMonth: 10, startDay: 1 }, // 1 Nov (Ano Novo)
  { name: "Midinváerne", startMonth: 11, startDay: 22 }, // 22 Dez
];

// Família vetorial autoral para as quatro estações. Os desenhos compartilham
// proporção, peso de traço e acabamento para permanecerem coerentes entre si.
const SEASON_ICONS = {
  spring: `<svg class="season-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21V10m0 5c-3.6 0-6-2.1-6-5.5 3.6 0 6 2.1 6 5.5Zm0-4c0-3.6 2.4-5.5 6-5.5 0 3.4-2.4 5.5-6 5.5Z"/><path d="M9 21h6"/></svg>`,
  summer: `<svg class="season-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.5"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M4.9 4.9 7 7m10 10 2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1"/></svg>`,
  autumn: `<svg class="season-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round"><path d="M20 4c-7 .2-12.8 3.1-14.7 8.3-1.1 3 .3 5.7 3.2 6.3 5.5 1.1 9.9-4 11.5-14.6Z"/><path d="M4 21c2.8-5 6.8-8.7 12-11"/></svg>`,
  winter: `<svg class="season-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round"><path transform="rotate(0 12 12)" d="M12 2v10M9.5 4.5 12 7l2.5-2.5"/><path transform="rotate(60 12 12)" d="M12 2v10M9.5 4.5 12 7l2.5-2.5"/><path transform="rotate(120 12 12)" d="M12 2v10M9.5 4.5 12 7l2.5-2.5"/><path transform="rotate(180 12 12)" d="M12 2v10M9.5 4.5 12 7l2.5-2.5"/><path transform="rotate(240 12 12)" d="M12 2v10M9.5 4.5 12 7l2.5-2.5"/><path transform="rotate(300 12 12)" d="M12 2v10M9.5 4.5 12 7l2.5-2.5"/></svg>`,
};

const ELVEN_SEASONS_INFO = {
  spring: {
    name: "Birke",
    icon: SEASON_ICONS.spring,
    desc: {
      pt: "O Equinócio de Primavera. Em Birke, os campos despertam e as dríades cantam. O renascimento da natureza é celebrado em Blathe com ritos de fertilidade.",
      en: "The Spring Equinox. In Birke, the fields awaken and dryads sing. Nature's rebirth is celebrated at Blathe with rites of fertility.",
    },
  },
  summer: {
    name: "Midaëte",
    icon: SEASON_ICONS.summer,
    desc: {
      pt: "O Solstício de Verão. A época de Feainn traz dias longos e calorosos, ideais para as vinhas. Lammas marca o início da maturação e a gratidão pela luz.",
      en: "The Summer Solstice. Feainn brings long, warm days that favor the vineyards. Lammas marks the start of ripening and gratitude for the light.",
    },
  },
  autumn: {
    name: "Velen",
    icon: SEASON_ICONS.autumn,
    desc: {
      pt: "O Equinócio de Outono. O tempo da colheita final e o início do declínio da luz. Tempo de Velen e Saovine.",
      en: "The Autumn Equinox. A time for the final harvest and the fading of the light. The season of Velen and Saovine.",
    },
  },
  winter: {
    name: "Midinváerne",
    icon: SEASON_ICONS.winter,
    desc: {
      pt: "O Solstício de Inverno. Yule e Imbaelk cobrem Toussaint de geada. É um tempo de histórias ao redor do fogo e respeito pelas forças antigas.",
      en: "The Winter Solstice. Yule and Imbaelk cover Toussaint in frost. It is a time for fireside tales and respect for ancient forces.",
    },
  },
};

const SEASONS = {
  spring: {
    name: "Primavera",
    icon: SEASON_ICONS.spring,
    desc: "O degelo das Montanhas Górgona alimenta o Sansretour. As vinhas de Belgaard despertam com vigor. É a época dos festivais de plantio e dos primeiros brotos.",
    tempMin: 14,
    tempMax: 27,
    precip: 15,
    fog: 10,
  },
  summer: {
    name: "Verão",
    icon: SEASON_ICONS.summer,
    desc: "O calor dourado banha o ducado. As uvas amadurecem sob o sol inclemente, exigindo cuidado constante dos vignerons. As noites são curtas e cheias de vida.",
    tempMin: 18,
    tempMax: 35,
    // Verão mediterrâneo e seco, mas com pancadas ocasionais entre períodos estáveis.
    precip: 20,
    fog: 2,
  },
  autumn: {
    name: "Outono",
    icon: SEASON_ICONS.autumn,
    desc: "A Grande Colheita. O ar cheira a mosto e folhas secas. As adegas se enchem e Toussaint celebra a generosidade da terra antes do repouso.",
    tempMin: 12,
    tempMax: 26,
    precip: 35,
    fog: 25,
  },
  winter: {
    name: "Inverno",
    icon: SEASON_ICONS.winter,
    desc: "O ducado dorme sob um manto pálido. A geada cobre os campos, e o vinho novo descansa nos barris. É tempo de lendas contadas ao redor da lareira.",
    tempMin: 5,
    tempMax: 16,
    precip: 40,
    fog: 40,
  },
};

const HOLIDAYS = {
  "1-1": { name: "Ano Novo Ducal", desc: "Celebração do início do ano novo." },
  "2-2": { name: "Imbaelk", desc: "Germinação." },
  "3-12": { name: "Dia do Profeta Lebioda", desc: "Dia de oração." },
  "3-21": { name: "Birke", desc: "Equinócio de Primavera." },
  "5-1": { name: "Belleteyn", desc: "Florescimento." },
  "6-21": { name: "Midaëte", desc: "Solstício de Verão." },
  "8-1": { name: "Lammas", desc: "Maturação." },
  "9-23": { name: "Velen", desc: "Equinócio de Outono." },
  "11-1": { name: "Saovine", desc: "Ano Novo Élfico." },
  "12-21": { name: "Midinváerne", desc: "Solstício de Inverno." },
  "4-20": { name: "Día da Coragem", desc: "Bravura dos cavaleiros." },
  "6-15": {
    name: "Festival das Vinhas Novas",
    desc: "Estação de crescimento.",
  },
  "7-25": { name: "Festa de Beauclair", desc: "Festa da capital." },
  "9-22": { name: "Dia da Dama do Lago", desc: "Peregrinação." },
  "10-31": { name: "Colheita do Sangue de Uva", desc: "Auge da colheita." },
};

const WEATHER_CONDITIONS = {
  clear_day: { name: "Ensolarado", icon: "☀️" },
  clear_night: { name: "Céu Limpo", icon: "✨" },
  cloudy_day: { name: "Parcialmente Nublado", icon: "⛅" },
  cloudy_night: { name: "Noite Nublada", icon: "☁️" },
  overcast_day: { name: "Nublado", icon: "☁️" },
  overcast_night: { name: "Noite Encoberta", icon: "☁️" },
  fog_day: { name: "Neblina", icon: "🌫️" },
  fog_night: { name: "Neblina Noturna", icon: "🌫️" },
  light_rain_day: { name: "Chuva Leve", icon: "🌦️" },
  light_rain_night: { name: "Chuva Leve", icon: "🌧️" },
  heavy_rain_day: { name: "Chuva Forte", icon: "🌧️" },
  heavy_rain_night: { name: "Chuva Forte", icon: "🌧️" },
  storm_day: { name: "Tempestade", icon: "⛈️" },
  storm_night: { name: "Tempestade", icon: "⛈️" },
  snow_day: { name: "Neve Fraca", icon: "❄️" },
  snow_night: { name: "Neve Fraca", icon: "❄️" },
  hot_day: { name: "Calor Extremo", icon: "🌡️" },
  cold_night: { name: "Noite Fria", icon: "❄️" },
};

const MOON_PHASES_PT = [
  {
    name: "Lua Nova",
    icon: "🌑",
    index: 0,
    desc: "A lua está escondida na escuridão. Momento propício para rituais secretos e furtividade.",
  },
  {
    name: "Lua Crescente",
    icon: "🌒",
    index: 1,
    desc: "Um fino crescente de luz. A magia começa a se acumular novamente.",
  },
  {
    name: "Quarto Crescente",
    icon: "🌓",
    index: 2,
    desc: "Metade da face iluminada. O equilíbrio entre luz e sombra.",
  },
  {
    name: "Gibosa Crescente",
    icon: "🌔",
    index: 3,
    desc: "Quase cheia. A antecipação do poder máximo cresce.",
  },
  {
    name: "Lua Cheia",
    icon: "🌕",
    index: 4,
    desc: "O ápice do poder lunar. Lobisomens são forçados à transformação e a magia selvagem pulsa fortemente.",
  },
  {
    name: "Gibosa Minguante",
    icon: "🌖",
    index: 5,
    desc: "A luz começa a recuar. Um tempo de reflexão e colheita.",
  },
  {
    name: "Quarto Minguante",
    icon: "🌗",
    index: 6,
    desc: "As sombras ganham força novamente. Favorece feitiços de proteção e ocultação.",
  },
  {
    name: "Lua Minguante",
    icon: "🌘",
    index: 7,
    desc: "O último suspiro de luz antes da escuridão total. Espectros tornam-se mais inquietos.",
  },
];

// === ÍCONES METEOROLÓGICOS SVG AUTORAIS ===
// Tamanho base 64x64, sempre escalável via classe (.wx-icon-sm/md/lg).
const WX_SVG = {
  clear_day: `<svg class="wx-icon spin-slow" viewBox="0 0 64 64"><g class="wx-sun"><circle cx="32" cy="32" r="12"/><g stroke="#FBBF24" stroke-width="3" stroke-linecap="round"><line x1="32" y1="6"  x2="32" y2="14"/><line x1="32" y1="50" x2="32" y2="58"/><line x1="6"  y1="32" x2="14" y2="32"/><line x1="50" y1="32" x2="58" y2="32"/><line x1="13" y1="13" x2="19" y2="19"/><line x1="45" y1="45" x2="51" y2="51"/><line x1="51" y1="13" x2="45" y2="19"/><line x1="19" y1="45" x2="13" y2="51"/></g></g></svg>`,
  clear_night: `<svg class="wx-icon" viewBox="0 0 64 64"><path class="wx-moon" d="M44 36c-10 0-18-8-18-18 0-3 0.7-5.8 2-8.3C18.5 11.7 10 21 10 32c0 12.2 9.8 22 22 22 11 0 20.3-8.5 22.3-19.5C51.8 35.3 49 36 44 36z"/></svg>`,
  cloudy_day: `<svg class="wx-icon spin-slow" viewBox="0 0 64 64"><g class="wx-sun"><circle cx="22" cy="22" r="8"/><g stroke="#FBBF24" stroke-width="2.5" stroke-linecap="round"><line x1="22" y1="6"  x2="22" y2="11"/><line x1="6"  y1="22" x2="11" y2="22"/><line x1="11" y1="11" x2="14" y2="14"/><line x1="33" y1="11" x2="30" y2="14"/></g></g><path class="wx-cloud" d="M22 44c0-6 5-11 11-11 4 0 8 2.5 10 6 1-0.5 2-0.8 3.5-0.8 5 0 9 4 9 9s-4 9-9 9H22c-4.4 0-8-3.6-8-8s3.6-8 8-8z"/></svg>`,
  cloudy_night: `<svg class="wx-icon" viewBox="0 0 64 64"><path class="wx-moon" d="M30 22c-6 0-11-5-11-11 0-1.5 0.3-3 0.8-4.3C13.5 8 8 14 8 21c0 7.7 6.3 14 14 14 7 0 12.8-5 13.8-11.7C34.5 22 32 22 30 22z"/><path class="wx-cloud-dark" d="M24 48c0-6 5-11 11-11 4 0 8 2.5 10 6 1-0.5 2-0.8 3.5-0.8 5 0 9 4 9 9s-4 9-9 9H24c-4.4 0-8-3.6-8-8s3.6-8 8-8z"/></svg>`,
  overcast_day: `<svg class="wx-icon" viewBox="0 0 64 64"><path class="wx-cloud-dark" d="M14 28c0-7 6-13 13-13 5 0 9.5 3 11.5 7.3 1-0.3 2-0.5 3.2-0.5 6 0 10.8 4.8 10.8 10.8 0 5.7-4.4 10.4-10 10.8H16c-5.5 0-10-4.5-10-10s4.5-10 10-10c-1.3 1.4-2 3.3-2 4.6z"/><path class="wx-cloud" d="M18 48c0-5 4-9 9-9 3 0 6 1.6 7.5 4 0.8-0.3 1.7-0.5 2.5-0.5 4 0 7 3 7 7s-3 7-7 7H18c-3.3 0-6-2.7-6-6s2.7-6 6-6z" opacity="0.85"/></svg>`,
  overcast_night: `<svg class="wx-icon" viewBox="0 0 64 64"><path class="wx-cloud-dark" d="M14 28c0-7 6-13 13-13 5 0 9.5 3 11.5 7.3 1-0.3 2-0.5 3.2-0.5 6 0 10.8 4.8 10.8 10.8 0 5.7-4.4 10.4-10 10.8H16c-5.5 0-10-4.5-10-10s4.5-10 10-10c-1.3 1.4-2 3.3-2 4.6z"/></svg>`,
  fog_day: `<svg class="wx-icon" viewBox="0 0 64 64"><path class="wx-cloud" d="M18 26c0-7 6-13 13-13 6 0 11 4 12.5 9.5 1-0.3 2-0.5 3.2-0.5 5 0 9 4 9 9s-4 9-9 9H18c-5 0-9-4-9-9s4-9 9-9z"/><g class="wx-fog"><line x1="10" y1="44" x2="54" y2="44"/><line x1="6"  y1="50" x2="50" y2="50"/><line x1="14" y1="56" x2="58" y2="56"/></g></svg>`,
  fog_night: `<svg class="wx-icon" viewBox="0 0 64 64"><path class="wx-cloud-dark" d="M18 26c0-7 6-13 13-13 6 0 11 4 12.5 9.5 1-0.3 2-0.5 3.2-0.5 5 0 9 4 9 9s-4 9-9 9H18c-5 0-9-4-9-9s4-9 9-9z"/><g class="wx-fog"><line x1="10" y1="44" x2="54" y2="44"/><line x1="6"  y1="50" x2="50" y2="50"/><line x1="14" y1="56" x2="58" y2="56"/></g></svg>`,
  light_rain_day: `<svg class="wx-icon" viewBox="0 0 64 64"><path class="wx-cloud" d="M16 26c0-7 6-13 13-13 5 0 9.5 3 11.5 7.3 1-0.3 2-0.5 3.2-0.5 6 0 10.8 4.8 10.8 10.8 0 6-4.8 10.8-10.8 10.8H16c-6 0-11-5-11-11s5-11 11-11c-1 0.8-1 4.6 0 6.6z"/><g><line class="wx-rain r1" x1="22" y1="46" x2="20" y2="54"/><line class="wx-rain r2" x1="32" y1="46" x2="30" y2="54"/><line class="wx-rain r3" x1="42" y1="46" x2="40" y2="54"/></g></svg>`,
  light_rain_night: `<svg class="wx-icon" viewBox="0 0 64 64"><path class="wx-cloud-dark" d="M16 26c0-7 6-13 13-13 5 0 9.5 3 11.5 7.3 1-0.3 2-0.5 3.2-0.5 6 0 10.8 4.8 10.8 10.8 0 6-4.8 10.8-10.8 10.8H16c-6 0-11-5-11-11s5-11 11-11c-1 0.8-1 4.6 0 6.6z"/><g><line class="wx-rain r1" x1="22" y1="46" x2="20" y2="54"/><line class="wx-rain r2" x1="32" y1="46" x2="30" y2="54"/><line class="wx-rain r3" x1="42" y1="46" x2="40" y2="54"/></g></svg>`,
  heavy_rain_day: `<svg class="wx-icon" viewBox="0 0 64 64"><path class="wx-cloud-dark" d="M14 26c0-7 6-13 13-13 5 0 9.5 3 11.5 7.3 1-0.3 2-0.5 3.2-0.5 6 0 10.8 4.8 10.8 10.8 0 6-4.8 10.8-10.8 10.8H14c-6 0-11-5-11-11s5-11 11-11c-1 0.8-1 4.6 0 6.6z"/><g><line class="wx-rain r1" x1="18" y1="44" x2="14" y2="58"/><line class="wx-rain r2" x1="28" y1="44" x2="24" y2="58"/><line class="wx-rain r3" x1="38" y1="44" x2="34" y2="58"/><line class="wx-rain r1" x1="48" y1="44" x2="44" y2="58"/></g></svg>`,
  heavy_rain_night: `<svg class="wx-icon" viewBox="0 0 64 64"><path class="wx-cloud-dark" d="M14 26c0-7 6-13 13-13 5 0 9.5 3 11.5 7.3 1-0.3 2-0.5 3.2-0.5 6 0 10.8 4.8 10.8 10.8 0 6-4.8 10.8-10.8 10.8H14c-6 0-11-5-11-11s5-11 11-11c-1 0.8-1 4.6 0 6.6z"/><g><line class="wx-rain r1" x1="18" y1="44" x2="14" y2="58"/><line class="wx-rain r2" x1="28" y1="44" x2="24" y2="58"/><line class="wx-rain r3" x1="38" y1="44" x2="34" y2="58"/><line class="wx-rain r1" x1="48" y1="44" x2="44" y2="58"/></g></svg>`,
  storm_day: `<svg class="wx-icon" viewBox="0 0 64 64"><path class="wx-cloud-dark" d="M14 26c0-7 6-13 13-13 5 0 9.5 3 11.5 7.3 1-0.3 2-0.5 3.2-0.5 6 0 10.8 4.8 10.8 10.8 0 6-4.8 10.8-10.8 10.8H14c-6 0-11-5-11-11s5-11 11-11c-1 0.8-1 4.6 0 6.6z"/><polygon class="wx-bolt" points="30,40 36,40 32,50 40,50 26,62 30,52 24,52"/><g><line class="wx-rain r2" x1="18" y1="46" x2="16" y2="54"/><line class="wx-rain r3" x1="46" y1="46" x2="44" y2="54"/></g></svg>`,
  storm_night: `<svg class="wx-icon" viewBox="0 0 64 64"><path class="wx-cloud-dark" d="M14 26c0-7 6-13 13-13 5 0 9.5 3 11.5 7.3 1-0.3 2-0.5 3.2-0.5 6 0 10.8 4.8 10.8 10.8 0 6-4.8 10.8-10.8 10.8H14c-6 0-11-5-11-11s5-11 11-11c-1 0.8-1 4.6 0 6.6z"/><polygon class="wx-bolt" points="30,40 36,40 32,50 40,50 26,62 30,52 24,52"/><g><line class="wx-rain r2" x1="18" y1="46" x2="16" y2="54"/><line class="wx-rain r3" x1="46" y1="46" x2="44" y2="54"/></g></svg>`,
  snow_day: `<svg class="wx-icon" viewBox="0 0 64 64"><path class="wx-cloud" d="M16 26c0-7 6-13 13-13 5 0 9.5 3 11.5 7.3 1-0.3 2-0.5 3.2-0.5 6 0 10.8 4.8 10.8 10.8 0 6-4.8 10.8-10.8 10.8H16c-6 0-11-5-11-11s5-11 11-11c-1 0.8-1 4.6 0 6.6z"/><g fill="#e0f2fe"><circle class="wx-snow s1" cx="22" cy="50" r="2.5"/><circle class="wx-snow s2" cx="32" cy="54" r="2.5"/><circle class="wx-snow s3" cx="42" cy="50" r="2.5"/></g></svg>`,
  snow_night: `<svg class="wx-icon" viewBox="0 0 64 64"><path class="wx-cloud-dark" d="M16 26c0-7 6-13 13-13 5 0 9.5 3 11.5 7.3 1-0.3 2-0.5 3.2-0.5 6 0 10.8 4.8 10.8 10.8 0 6-4.8 10.8-10.8 10.8H16c-6 0-11-5-11-11s5-11 11-11c-1 0.8-1 4.6 0 6.6z"/><g fill="#e0f2fe"><circle class="wx-snow s1" cx="22" cy="50" r="2.5"/><circle class="wx-snow s2" cx="32" cy="54" r="2.5"/><circle class="wx-snow s3" cx="42" cy="50" r="2.5"/></g></svg>`,
  hot_day: `<svg class="wx-icon spin-slow" viewBox="0 0 64 64"><g class="wx-sun"><circle cx="32" cy="32" r="14" fill="#ef4444"/><g stroke="#ef4444" stroke-width="3.5" stroke-linecap="round"><line x1="32" y1="4"  x2="32" y2="14"/><line x1="32" y1="50" x2="32" y2="60"/><line x1="4"  y1="32" x2="14" y2="32"/><line x1="50" y1="32" x2="60" y2="32"/><line x1="11" y1="11" x2="18" y2="18"/><line x1="46" y1="46" x2="53" y2="53"/><line x1="53" y1="11" x2="46" y2="18"/><line x1="18" y1="46" x2="11" y2="53"/></g></g></svg>`,
  cold_night: `<svg class="wx-icon" viewBox="0 0 64 64"><path class="wx-moon" d="M44 36c-10 0-18-8-18-18 0-3 0.7-5.8 2-8.3C18.5 11.7 10 21 10 32c0 12.2 9.8 22 22 22 11 0 20.3-8.5 22.3-19.5C51.8 35.3 49 36 44 36z"/></svg>`,
  blood_moon: `<svg class="wx-icon" viewBox="0 0 64 64"><circle class="wx-blood" cx="32" cy="32" r="22"/><circle cx="26" cy="26" r="3" fill="#7f1d1d"/><circle cx="40" cy="34" r="4" fill="#7f1d1d"/><circle cx="30" cy="42" r="2.5" fill="#7f1d1d"/></svg>`,
};

export {
  ELVEN_DATA,
  ELVEN_SAVAEDS,
  ELVEN_SEASONS_INFO,
  HOLIDAYS,
  LOCATIONS,
  MOON_PHASES_PT,
  NEWS_REGION,
  NEWS_SOURCES,
  NEWS_TEMPLATES,
  SEASONS,
  SEASON_ICONS,
  WEATHER_CONDITIONS,
  WX_SVG,
};

// --- HELPER ---
