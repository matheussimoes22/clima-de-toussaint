/** Variações editoriais estáveis por data: recarregar não troca o comunicado. */
const titles = {
  heat: [
    [
      "Calor acentuado nas terras do ducado",
      "Viticultores em atenção ao calor persistente",
      "Observatório acompanha temperaturas elevadas",
    ],
    [
      "Marked heat across the duchy",
      "Winegrowers watch a spell of sustained heat",
      "Observatory monitors elevated temperatures",
    ],
  ],
  cold: [
    [
      "Frio intenso exige atenção nas estradas",
      "Queda térmica alcança as terras de Toussaint",
      "Guarda Ducal orienta proteção contra o frio",
    ],
    [
      "Intense cold calls for care on the roads",
      "Cold conditions reach Toussaint",
      "Ducal Guard advises protection from the cold",
    ],
  ],
  front: [
    [
      "Virada de tempo traz resfriamento ao ducado",
      "Ar mais frio muda as condições de viagem",
      "Observatório acompanha queda de temperatura",
    ],
    [
      "A change in weather brings cooling",
      "Cooler air changes travel conditions",
      "Observatory tracks a temperature drop",
    ],
  ],
  storm: [
    [
      "Instabilidade elétrica exige atenção em Toussaint",
      "Temporais podem interromper as rotas do vinho",
      "Guarda Ducal acompanha passagem de tempestades",
    ],
    [
      "Electrical storms call for vigilance in Toussaint",
      "Thunderstorms may disrupt the wine routes",
      "Ducal Guard monitors passing thunderstorms",
    ],
  ],
  rain: [
    [
      "Chuva concentrada pede cuidado nas travessias",
      "Pancadas intensas atingem as rotas do ducado",
      "Observatório alerta para precipitação volumosa",
    ],
    [
      "Concentrated rain calls for care at crossings",
      "Heavy showers affect ducal routes",
      "Observatory warns of substantial precipitation",
    ],
  ],
  wind: [
    [
      "Ventos fortes exigem atenção nas estradas",
      "Rajadas podem afetar carroças e estruturas leves",
      "Guarda Ducal acompanha intensificação do vento",
    ],
    [
      "Strong winds call for care on roads",
      "Gusts may affect carts and light structures",
      "Ducal Guard monitors strengthening winds",
    ],
  ],
  fog: [
    [
      "Baixa visibilidade nas rotas de Toussaint",
      "Nevoeiro pede cautela aos viajantes",
      "Observatório acompanha bancos de neblina",
    ],
    [
      "Low visibility on Toussaint routes",
      "Fog calls for caution among travellers",
      "Observatory monitors fog banks",
    ],
  ],
  snow: [
    [
      "Neve exige cuidado nas terras do ducado",
      "Precipitação invernal afeta as rotas de viagem",
      "Guarda Ducal acompanha condições de neve",
    ],
    [
      "Snow calls for care across the duchy",
      "Wintry precipitation affects travel routes",
      "Ducal Guard monitors snowy conditions",
    ],
  ],
  blood: [
    [
      "Observatório anuncia a Lua de Sangue",
      "Vigília ducal sob a lua rubra",
      "Um brilho incomum no céu de Toussaint",
    ],
    [
      "Observatory announces the Blood Moon",
      "Ducal vigil under the crimson moon",
      "An unusual glow in the sky of Toussaint",
    ],
  ],
};

/** Cria metadados apenas para fenômenos novos; severidades anteriores são preservadas. */
export function extraTemplate(key, lang) {
  const levels = {
    cold: "yellow",
    front: "yellow",
    rain: "orange",
    wind: "yellow",
  };
  const level = levels[key];
  if (!level) return null;
  const en = lang === "en";
  const label =
    level === "orange"
      ? en
        ? "Orange Alert"
        : "Alerta Laranja"
      : en
        ? "Yellow Alert"
        : "Alerta Amarelo";
  return {
    sevClass: `news-sev-${level}`,
    sev: { [lang]: label },
    kicker: {
      [lang]: en ? "Ducal weather bulletin" : "Boletim meteorológico ducal",
    },
    body: { [lang]: [] },
    advice: {
      [lang]: [
        en
          ? "Check conditions before travelling and follow the Ducal Guard’s guidance."
          : "Consulte as condições antes de viajar e siga as orientações da Guarda Ducal.",
      ],
    },
  };
}

/** Relata somente métricas simuladas e impactos condicionais, sem inventar uma origem. */
export function bulletinCopy(key, day, hours, location, lang) {
  const en = lang === "en";
  const variant =
    (day.date.getDate() * 7 +
      day.date.getMonth() * 11 +
      day.date.getFullYear() +
      location.length) %
    3;
  const extraTitles = {
    heat: [
      "Calor acima do padrão exige atenção nos vinhedos",
      "Above-normal heat calls for vigilance in vineyards",
    ],
    cold: [
      "Vigília ducal acompanha as horas de frio mais intenso",
      "Ducal watch monitors the coldest hours",
    ],
    front: [
      "Vento e resfriamento marcam passagem de ar mais frio",
      "Wind and cooling mark a passage of cooler air",
    ],
    storm: [
      "Rotas expostas em atenção durante atividade elétrica",
      "Exposed routes on watch during electrical activity",
    ],
    rain: [
      "Travessias do ducado em atenção à chuva intensa",
      "Ducal crossings on watch for heavy rain",
    ],
    wind: [
      "Vento forte pede cuidado com cargas e toldos",
      "Strong winds call for care with cargo and awnings",
    ],
    fog: [
      "Vigília orienta cautela sob visibilidade reduzida",
      "Watch advises caution under reduced visibility",
    ],
    snow: [
      "Viajantes devem acompanhar a passagem de neve",
      "Travellers should monitor passing snow",
    ],
    blood: [
      "Lua rubra mobiliza a vigília do Observatório",
      "Crimson moon calls the Observatory to vigil",
    ],
  };
  const titleIndex =
    (day.date.getDate() + day.date.getMonth() * 3 + location.length) % 4;
  const title = [...titles[key][en ? 1 : 0], extraTitles[key][en ? 1 : 0]][
    titleIndex
  ];
  const max = Math.max(...hours.map((h) => h.temp));
  const min = Math.min(...hours.map((h) => h.temp));
  const wind = Math.max(...hours.map((h) => h.windSpeed));
  const rain = Math.max(...hours.map((h) => h.precipAmountMm));
  const visibility = Math.min(...hours.map((h) => h.visibility));
  const metrics =
    key === "heat"
      ? en
        ? `temperatures reaching ${max}°C`
        : `temperaturas de até ${max}°C`
      : /cold|front|snow/.test(key)
        ? en
          ? `temperatures as low as ${min}°C`
          : `temperaturas chegando a ${min}°C`
        : /rain|storm/.test(key)
          ? en
            ? `rainfall peaking at ${rain} mm/h and winds up to ${wind} km/h`
            : `pico de precipitação de ${rain} mm/h e vento de até ${wind} km/h`
          : key === "wind"
            ? en
              ? `winds up to ${wind} km/h`
              : `ventos de até ${wind} km/h`
            : key === "fog"
              ? en
                ? `visibility down to ${visibility} km`
                : `visibilidade reduzida a ${visibility} km`
              : en
                ? "the rare crimson lunar phase"
                : "a rara fase lunar rubra";
  const introductions = en
    ? [
        "The Ducal Observatory reports",
        "The latest ducal bulletin indicates",
        "The watch at Beauclair reports",
      ]
    : [
        "O Observatório Ducal informa",
        "O boletim mais recente do ducado indica",
        "A vigília de Beauclair comunica",
      ];
  // O texto responde à intensidade física; não recalcula a severidade do alerta.
  const impacts = {
    heat:
      max >= 38
        ? [
            "O pico de calor exige pausas prolongadas à sombra nos vinhedos e água para os animais de carga.",
            "Peak heat calls for longer breaks in vineyard shade and water for pack animals.",
          ]
        : [
            "Os vignerons devem concentrar o trabalho pesado nas horas mais frescas e acompanhar a evolução do calor.",
            "Winegrowers should schedule heavy work in cooler hours and monitor the heat.",
          ],
    cold:
      min <= -3
        ? [
            "O frio abaixo de zero pode congelar água exposta e tornar escorregadias as rotas do ducado.",
            "Sub-zero cold may freeze exposed water and make ducal roads slippery.",
          ]
        : [
            "A Guarda recomenda agasalhos para vigílias e viagens nas horas mais frias.",
            "The Guard recommends warm clothing for watches and journeys during the coldest hours.",
          ],
    front: [
      "O resfriamento, o vento e a passagem de nuvens indicam mudança nas condições das rotas do vinho.",
      "Cooling, wind and passing clouds indicate changing conditions along the wine routes.",
    ],
    storm: [
      "Durante a atividade elétrica, evite árvores isoladas e suspenda trabalhos expostos nos vinhedos.",
      "During electrical activity, avoid lone trees and suspend exposed work in the vineyards.",
    ],
    rain:
      rain >= 6
        ? [
            "A chuva mais concentrada pode produzir escoamento rápido nas encostas; adie travessias por vaus.",
            "More concentrated rainfall may produce rapid hillside runoff; postpone ford crossings.",
          ]
        : [
            "As pancadas podem encharcar estradas de terra e interromper temporariamente as atividades ao ar livre.",
            "Showers may soak dirt roads and temporarily interrupt outdoor work.",
          ],
    wind:
      wind >= 60
        ? [
            "Ventos muito fortes podem derrubar galhos e comprometer estruturas leves nos mercados.",
            "Very strong winds may bring down branches and damage light market structures.",
          ]
        : [
            "Fixe toldos e cargas de vinho antes de percorrer trechos expostos ao vento.",
            "Secure awnings and wine cargo before travelling on exposed roads.",
          ],
    fog:
      visibility <= 1
        ? [
            "A visibilidade muito reduzida pode ocultar curvas e pontes; comboios devem aguardar melhora.",
            "Very poor visibility may hide bends and bridges; convoys should await improvement.",
          ]
        : [
            "Bancos de neblina podem ocultar os marcos das estradas; reduza o ritmo das carroças.",
            "Fog banks may obscure road markers; slow down carts.",
          ],
    snow: [
      "A neve pode dificultar a passagem de carroças e pede atenção aos caminhos das terras altas.",
      "Snow may hinder cart travel and calls for care on highland paths.",
    ],
    blood: [
      "O Observatório mantém a vigília lunar tradicional do ducado.",
      "The Observatory maintains the duchy's traditional lunar watch.",
    ],
  };
  const season = {
    summer: ["verão", "summer"],
    autumn: ["outono", "autumn"],
    winter: ["inverno", "winter"],
    spring: ["primavera", "spring"],
  }[day.seasonKey][en ? 1 : 0];
  const span = formatEventHours(hours);
  const total =
    Math.round(hours.reduce((sum, h) => sum + h.precipAmountMm, 0) * 10) / 10;
  const brief = hours.length <= 3;
  const details = en
    ? [
        `During this ${season} episode, the watch in ${location} expects ${brief ? "a brief passage" : "several hours of effects"}: ${span}.`,
        `The ${season} watch in ${location} highlights ${hours.length} forecast hours requiring attention (${span}).`,
        `Travellers through ${location} should allow for ${brief ? "a short interruption" : "a longer period requiring care"} this ${season}, during ${span}.`,
      ]
    : [
        `Neste episódio de ${season}, a vigília de ${location} prevê ${brief ? "uma passagem breve" : "várias horas de efeitos"}: ${span}.`,
        `A vigília de ${season} em ${location} destaca ${hours.length} horas de atenção na previsão (${span}).`,
        `Viajantes que passam por ${location} devem considerar ${brief ? "um intervalo breve de atenção" : "um período prolongado de atenção"} neste ${season}, entre ${span}.`,
      ];
  const rainfall = /rain|storm|snow/.test(key)
    ? en
      ? ` The affected hours total ${total} mm of precipitation.`
      : ` As horas afetadas somam ${total} mm de precipitação.`
    : "";
  const caveat = en
    ? " Effects may ease between the listed intervals."
    : " Os efeitos podem amenizar entre os intervalos indicados.";
  return {
    title: variant === 2 ? `${title} — ${location}` : title,
    lead: `${introductions[variant]} ${metrics} ${en ? "in" : "em"} ${location}.`,
    impact: impacts[key][en ? 1 : 0],
    context: details[variant] + rainfall + caveat,
  };
}

/** Agrupa somente horas consecutivas, sem ocultar intervalos de melhora. */
export function formatEventHours(hours) {
  const groups = [];
  for (const row of hours) {
    const h = parseInt(row.hour);
    const last = groups.at(-1);
    if (last && last[1] === h) last[1] = h + 1;
    else groups.push([h, h + 1]);
  }
  return groups
    .map(
      ([a, b]) =>
        `${String(a).padStart(2, "0")}:00–${String(b).padStart(2, "0")}:00`,
    )
    .join(" · ");
}
