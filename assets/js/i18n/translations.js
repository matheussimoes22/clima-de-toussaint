/**
 * Traduções, ícones compartilhados e formatação de métricas.
 * Mantém o texto da interface separado dos dados e do motor climático.
 */

import { LOCATIONS, WEATHER_CONDITIONS } from "../data/world-data.js";

const REAL_DATE = new Date();

// --- ÍCONES VETORIAIS ---
const ICON_SUNRISE = `<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 inline-block text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 18a5 5 0 0 0-10 0"></path><line x1="12" y1="2" x2="12" y2="9"></line><line x1="4.22" y1="10.22" x2="5.64" y2="11.64"></line><line x1="1" y1="18" x2="3" y2="18"></line><line x1="21" y1="18" x2="23" y2="18"></line><line x1="18.36" y1="11.64" x2="19.78" y2="10.22"></line><line x1="23" y1="22" x2="1" y2="22"></line><polyline points="8 6 12 2 16 6"></polyline></svg>`;
const ICON_SUNSET = `<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 inline-block text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 18a5 5 0 0 0-10 0"></path><line x1="12" y1="9" x2="12" y2="2"></line><line x1="4.22" y1="10.22" x2="5.64" y2="11.64"></line><line x1="1" y1="18" x2="3" y2="18"></line><line x1="21" y1="18" x2="23" y2="18"></line><line x1="18.36" y1="11.64" x2="19.78" y2="10.22"></line><line x1="23" y1="22" x2="1" y2="22"></line><polyline points="16 5 12 9 8 5"></polyline></svg>`;
const ICON_MOONRISE = `<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 inline-block text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path><polyline points="8 6 12 2 16 6"></polyline><line x1="12" y1="2" x2="12" y2="12"></line></svg>`;
const ICON_MOONSET = `<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 inline-block text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path><polyline points="16 18 12 22 8 18"></polyline><line x1="12" y1="12" x2="12" y2="22"></line></svg>`;

// ============ I18N ============
const LANG_DATA = {
  pt: {
    // Nav
    Hoje: "Hoje",
    Calendário: "Calendário",
    Previsão: "Previsão",
    Lua: "Lua",
    Ajustes: "Ajustes",
    Fechar: "Fechar",
    "Navegação principal": "Navegação principal",
    "Ir para conteúdo": "Ir para conteúdo",
    Localidade: "Localidade",
    // Header
    "Clima Ducal": "Clima Ducal",
    Detalhes: "Detalhes",
    "Calendário Élfico": "Calendário Élfico",
    Idioma: "Idioma",
    Élfico: "Élfico",
    Desligado: "Desligado",
    "Aen Seidhe": "Aen Seidhe",
    // Today view
    Sensação: "Sensação",
    Chuva: "Chuva",
    Min: "Min",
    Max: "Max",
    "Atualizado há": "Atualizado há",
    minutos: "minutos",
    "Previsão 24h": "Previsão 24h",
    "Próximos eventos": "Próximos eventos",
    "Alertas e próximos eventos": "Alertas e próximos eventos",
    Alerta: "Alerta",
    "Alerta: Onda de calor no momento": "Alerta: Onda de calor no momento",
    "no momento": "no momento",
    amanhã: "amanhã",
    em: "em",
    dias: "dias",
    dia: "dia",
    "Eclipse Lunar: Lua de Sangue": "Eclipse Lunar: Lua de Sangue",
    blood_quote:
      '"Quando a lua sangra, os véus entre as esferas se rompem. É dito que nesta noite, o sangue dos vampiros ferve e o vinho das adegas de Beauclair ganha propriedades místicas inexplicáveis. Tranque as portas."',
    // Detail cards
    Vento: "Vento",
    Umidade: "Umidade",
    Pressão: "Pressão",
    Visibilidade: "Visibilidade",
    "Índice UV": "Índice UV",
    "Qualidade do Ar": "Qualidade do Ar",
    "Ponto de Orvalho": "Ponto de Orvalho",
    "de 11": "de 11",
    "Nascer do Sol": "Nascer do Sol",
    "Pôr do Sol": "Pôr do Sol",
    "Nascer da Lua": "Nascer da Lua",
    "Ocaso da Lua": "Ocaso da Lua",
    "Fase Lunar": "Fase Lunar",
    // Calendar
    "Voltar para Hoje": "Voltar para Hoje",
    Dom: "Dom",
    Seg: "Seg",
    Ter: "Ter",
    Qua: "Qua",
    Qui: "Qui",
    Sex: "Sex",
    Sáb: "Sáb",
    Dia: "Dia",
    // Monthly view
    "Previsão 30 Dias": "Panorama de 30 Dias",
    "Previsão confiável": "Previsão",
    Tendência: "Tendência",
    "Cenário climático": "Cenário climático",
    "Confiança alta": "Confiança alta",
    "Confiança moderada": "Confiança moderada",
    "Confiança baixa": "Confiança baixa",
    "A precisão diminui com a distância da data.":
      "A precisão diminui com a distância da data.",
    "Histórico e Tendências": "Histórico e Tendências",
    "Média Máx (30d)": "Média Máx (30d)",
    "Média Mín (30d)": "Média Mín (30d)",
    "Dias de Chuva (30d)": "Dias de Chuva (30d)",
    "Dias de Neve (30d)": "Dias de Neve (30d)",
    "Máximo Histórico": "Máximo registrado",
    "Mínimo Histórico": "Mínimo registrado",
    Recorde: "Recorde",
    "Registrado em": "Registrado em",
    "Data histórica desconhecida": "Registro herdado · data desconhecida",
    // Moon view
    "Ciclos Lunares": "Ciclos Lunares",
    Iluminada: "Iluminada",
    "Próximas Fases": "Próximas Fases",
    "Próxima Lua Nova": "Próxima Lua Nova",
    "Próxima Lua Cheia": "Próxima Lua Cheia",
    "Próxima Lua de Sangue": "Próxima Lua de Sangue",
    Desconhecido: "Desconhecido",
    hoje: "hoje",
    // Modal day
    Feriado: "Feriado",
    // Seasons modal
    "Estações de Toussaint": "Estações de Toussaint",
    // Alerts
    "Alerta: Tempestade prevista para hoje!":
      "Alerta: Tempestade prevista para hoje!",
    "Onda de Calor Extremo!": "Onda de Calor Extremo!",
    "Aviso: Noite fria. Cuidado com a geada.":
      "Aviso: Noite fria. Cuidado com a geada.",
    "Aviso: Neblina intensa. Cuidado nas estradas.":
      "Aviso: Neblina intensa. Cuidado nas estradas.",
    "Aviso: Rara neve prevista para hoje!":
      "Aviso: Rara neve prevista para hoje!",
    "Amanhã:": "Amanhã:",
    // Next events
    Tempestade: "Tempestade",
    Neve: "Neve",
    "Neblina densa": "Neblina densa",
    "Onda de calor": "Onda de calor",
    "Lua de Sangue": "Lua de Sangue",
    // Dew descriptions
    "Muito seco": "Muito seco",
    "Ar gélido, possibilidade de geada.": "Ar gélido, possibilidade de geada.",
    Seco: "Seco",
    "Ar fresco e confortável.": "Ar fresco e confortável.",
    Confortável: "Confortável",
    "Umidade agradável.": "Umidade agradável.",
    "Pouco abafado": "Pouco abafado",
    "Sensação levemente úmida.": "Sensação levemente úmida.",
    Abafado: "Abafado",
    "Ar pesado e tropical.": "Ar pesado e tropical.",
    Opressivo: "Opressivo",
    "Umidade extrema, desconforto severo.":
      "Umidade extrema, desconforto severo.",
  },
  en: {
    Hoje: "Today",
    Calendário: "Calendar",
    Previsão: "Forecast",
    Lua: "Moon",
    Ajustes: "Settings",
    Fechar: "Close",
    "Navegação principal": "Main navigation",
    "Ir para conteúdo": "Skip to content",
    Localidade: "Location",
    "Clima Ducal": "Ducal Weather",
    Detalhes: "Details",
    "Calendário Élfico": "Elven Calendar",
    Idioma: "Language",
    Élfico: "Elven",
    Desligado: "Off",
    "Aen Seidhe": "Aen Seidhe",
    Sensação: "Feels like",
    Chuva: "Rain",
    Min: "Min",
    Max: "Max",
    "Atualizado há": "Updated",
    minutos: "minutes ago",
    "Previsão 24h": "24h Forecast",
    "Próximos eventos": "Upcoming events",
    "Alertas e próximos eventos": "Alerts and upcoming events",
    Alerta: "Alert",
    "Alerta: Onda de calor no momento": "Alert: Heat wave in progress",
    "no momento": "in progress",
    amanhã: "tomorrow",
    em: "in",
    dias: "days",
    dia: "day",
    "Eclipse Lunar: Lua de Sangue": "Lunar Eclipse: Blood Moon",
    blood_quote:
      '"When the moon bleeds, the veils between worlds tear. It is said that on this night, vampire blood boils and the wine of Beauclair\'s cellars gains inexplicable mystical properties. Lock your doors."',
    Vento: "Wind",
    Umidade: "Humidity",
    "Umid.": "Hum.",
    Pressão: "Pressure",
    Visibilidade: "Visibility",
    "Índice UV": "UV Index",
    "Qualidade do Ar": "Air Quality",
    "Ponto de Orvalho": "Dew Point",
    "de 11": "of 11",
    "Nascer do Sol": "Sunrise",
    "Pôr do Sol": "Sunset",
    "Nascer da Lua": "Moonrise",
    "Ocaso da Lua": "Moonset",
    "Fase Lunar": "Moon Phase",
    "Voltar para Hoje": "Back to Today",
    Dom: "Sun",
    Seg: "Mon",
    Ter: "Tue",
    Qua: "Wed",
    Qui: "Thu",
    Sex: "Fri",
    Sáb: "Sat",
    Dia: "Day",
    "Previsão 30 Dias": "30-Day Outlook",
    "Previsão confiável": "Forecast",
    Tendência: "Trend",
    "Cenário climático": "Climate outlook",
    "Confiança alta": "High confidence",
    "Confiança moderada": "Moderate confidence",
    "Confiança baixa": "Low confidence",
    "A precisão diminui com a distância da data.":
      "Precision decreases farther into the future.",
    "Histórico e Tendências": "History and Trends",
    "Média Máx (30d)": "Avg High (30d)",
    "Média Mín (30d)": "Avg Low (30d)",
    "Dias de Chuva (30d)": "Rainy Days (30d)",
    "Dias de Neve (30d)": "Snowy Days (30d)",
    "Máximo Histórico": "Recorded High",
    "Mínimo Histórico": "Recorded Low",
    Recorde: "Record",
    "Registrado em": "Recorded on",
    "Data histórica desconhecida": "Legacy record · date unavailable",
    "Ciclos Lunares": "Lunar Cycles",
    Iluminada: "Illuminated",
    "Próximas Fases": "Upcoming Phases",
    "Próxima Lua Nova": "Next New Moon",
    "Próxima Lua Cheia": "Next Full Moon",
    "Próxima Lua de Sangue": "Next Blood Moon",
    Desconhecido: "Unknown",
    hoje: "today",
    Feriado: "Holiday",
    "Estações de Toussaint": "Seasons of Toussaint",
    "Alerta: Tempestade prevista para hoje!":
      "Alert: Storm forecast for today!",
    "Onda de Calor Extremo!": "Extreme Heat Wave!",
    "Aviso: Noite fria. Cuidado com a geada.":
      "Warning: Cold night. Beware of frost.",
    "Aviso: Neblina intensa. Cuidado nas estradas.":
      "Warning: Heavy fog. Drive carefully.",
    "Aviso: Rara neve prevista para hoje!":
      "Warning: Rare snow forecast for today!",
    "Amanhã:": "Tomorrow:",
    Tempestade: "Storm",
    Neve: "Snow",
    "Neblina densa": "Dense fog",
    "Onda de calor": "Heat wave",
    "Lua de Sangue": "Blood Moon",
    "Muito seco": "Very dry",
    "Ar gélido, possibilidade de geada.": "Frigid air, possible frost.",
    Seco: "Dry",
    "Ar fresco e confortável.": "Cool and comfortable air.",
    Confortável: "Comfortable",
    "Umidade agradável.": "Pleasant humidity.",
    "Pouco abafado": "Slightly muggy",
    "Sensação levemente úmida.": "Mildly damp feel.",
    Abafado: "Muggy",
    "Ar pesado e tropical.": "Heavy, tropical air.",
    Opressivo: "Oppressive",
    "Umidade extrema, desconforto severo.":
      "Extreme humidity, severe discomfort.",
    // Wind descriptions
    "Vento calmo. Brisa muito leve.": "Calm wind. Very light breeze.",
    "Brisa suave e refrescante.": "Gentle, refreshing breeze.",
    "Vento moderado, agita as árvores.": "Moderate wind, stirring the trees.",
    "Vento forte e constante.": "Strong, steady wind.",
    "Vendaval intenso. Cuidado com objetos soltos.":
      "Intense gale. Beware of loose objects.",
    // Humidity descriptions
    "Umidade alta devido à chuva.": "High humidity due to rain.",
    "Ar seco. Baixa umidade.": "Dry air. Low humidity.",
    "Umidade em nível confortável.": "Humidity at a comfortable level.",
    "Ar úmido e denso.": "Damp, heavy air.",
    // Pressure
    "Baixa pressão. Sistema instável.": "Low pressure. Unstable system.",
    "Alta pressão. Tempo estável.": "High pressure. Stable weather.",
    "Pressão atmosférica estável.": "Stable atmospheric pressure.",
    // Visibility
    "Visibilidade muito baixa. Neblina densa.":
      "Very low visibility. Dense fog.",
    "Visibilidade reduzida.": "Reduced visibility.",
    "Visibilidade clara e ampla.": "Clear, wide visibility.",
    // UV
    "Baixo (0-2):": "Low (0-2):",
    "Moderado (3-5):": "Moderate (3-5):",
    "Alto (6-7):": "High (6-7):",
    "Muito Alto (8-10):": "Very High (8-10):",
    "Extremo (11+):": "Extreme (11+):",
    "Risco mínimo. Proteção dispensável para a maioria.":
      "Minimal risk. Protection not needed for most.",
    "Requer alguma proteção em exposições longas.":
      "Some protection needed for long exposure.",
    "Proteção necessária. Busque sombra.": "Protection required. Seek shade.",
    "Risco rápido de queimaduras.": "Risk of fast sunburn.",
    "Risco severo. Evite exposição direta.":
      "Severe risk. Avoid direct exposure.",
    // Air quality
    Excelente: "Excellent",
    Boa: "Good",
    Moderada: "Moderate",
    Ruim: "Poor",
    "Muito Ruim": "Very Poor",
    "Ar puro de montanha e floresta.": "Pure mountain and forest air.",
    "Sem riscos relevantes à saúde.": "No significant health risks.",
    "Pessoas sensíveis podem sentir desconforto.":
      "Sensitive people may feel discomfort.",
    "Ar carregado, especialmente nas cidades.":
      "Heavy air, especially in the cities.",
    "Calor seco e estagnação acumulam particulados.":
      "Dry heat and stagnation accumulate particulates.",
    // Misc
    "Informação climática padrão.": "Standard weather information.",
    "Informação não disponível.": "Information not available.",
  },
};

// Translations for data-driven names
const COND_EN = {
  clear_day: "Sunny",
  clear_night: "Clear Sky",
  cloudy_day: "Partly Cloudy",
  cloudy_night: "Cloudy Night",
  overcast_day: "Overcast",
  overcast_night: "Overcast Night",
  fog_day: "Fog",
  fog_night: "Night Fog",
  light_rain_day: "Light Rain",
  light_rain_night: "Light Rain",
  heavy_rain_day: "Heavy Rain",
  heavy_rain_night: "Heavy Rain",
  storm_day: "Storm",
  storm_night: "Storm",
  snow_day: "Light Snow",
  snow_night: "Light Snow",
  hot_day: "Extreme Heat",
  cold_night: "Cold Night",
};
const SEASONS_EN = {
  spring: {
    name: "Spring",
    desc: "The thaw from the Gorgon Mountains feeds the Sansretour. Belgaard's vines awaken vigorously. It is the season of planting festivals and the first buds.",
  },
  summer: {
    name: "Summer",
    desc: "Golden heat bathes the duchy. Grapes ripen under the relentless sun, demanding constant care from the vignerons. Nights are short and full of life.",
  },
  autumn: {
    name: "Autumn",
    desc: "The Great Harvest. The air smells of must and dry leaves. Cellars fill and Toussaint celebrates the land's bounty before resting.",
  },
  winter: {
    name: "Winter",
    desc: "The duchy sleeps under a pale cloak. Frost covers the fields, and new wine rests in barrels. A time for tales by the hearth.",
  },
};
const MOON_EN = {
  "Lua Nova": "New Moon",
  "Lua Crescente": "Waxing Crescent",
  "Quarto Crescente": "First Quarter",
  "Gibosa Crescente": "Waxing Gibbous",
  "Lua Cheia": "Full Moon",
  "Gibosa Minguante": "Waning Gibbous",
  "Quarto Minguante": "Last Quarter",
  "Lua Minguante": "Waning Crescent",
  "Lua de Sangue": "Blood Moon",
};
const MOON_DESC_EN = {
  "Lua Nova":
    "The moon hides in darkness. A favourable moment for secret rituals and stealth.",
  "Lua Crescente":
    "A thin crescent of light. Magic begins to gather once more.",
  "Quarto Crescente":
    "Half the face lit. The balance between light and shadow.",
  "Gibosa Crescente": "Almost full. Anticipation of peak power grows.",
  "Lua Cheia":
    "The peak of lunar power. Werewolves are forced to transform and wild magic pulses strongly.",
  "Gibosa Minguante":
    "The light begins to recede. A time for reflection and harvest.",
  "Quarto Minguante":
    "Shadows gain strength again. Favours protection and concealment spells.",
  "Lua Minguante":
    "The last breath of light before total darkness. Spectres grow more restless.",
};
const HOLIDAYS_EN = {
  "1-1": { name: "Ducal New Year", desc: "Celebration of the new year." },
  "2-2": { name: "Imbaelk", desc: "Germination." },
  "3-12": { name: "Day of the Prophet Lebioda", desc: "A day of prayer." },
  "3-21": { name: "Birke", desc: "Spring Equinox." },
  "5-1": { name: "Belleteyn", desc: "Blossoming." },
  "6-21": { name: "Midaëte", desc: "Summer Solstice." },
  "8-1": { name: "Lammas", desc: "Ripening." },
  "9-23": { name: "Velen", desc: "Autumn Equinox." },
  "11-1": { name: "Saovine", desc: "Elven New Year." },
  "12-21": { name: "Midinváerne", desc: "Winter Solstice." },
  "4-20": { name: "Day of Courage", desc: "Bravery of the knights." },
  "6-15": { name: "Festival of the New Vines", desc: "Growing season." },
  "7-25": { name: "Feast of Beauclair", desc: "Capital's feast." },
  "9-22": { name: "Lady of the Lake Day", desc: "Pilgrimage." },
  "10-31": { name: "Grape Blood Harvest", desc: "Peak of harvest." },
};
const LOCATION_EN = {
  beauclair: "Beauclair",
  castel_ravello: "Castel Ravello",
  casteldaccia: "Casteldaccia",
  coronata: "Coronata Vineyards",
  vermentino: "Vermentino Forest",
  pomerol: "Pomerol",
  dun_tynne: "Dun Tynne",
  monte_gorgona: "Mount Gorgon",
  belhaven: "Belhaven",
};
// current language (mutable, initialized from localStorage in App.init)
let CURRENT_LANG = "pt";
try {
  const storedLanguage = localStorage.getItem("toussaintApp_lang");
  if (storedLanguage === "en" || storedLanguage === "pt") {
    CURRENT_LANG = storedLanguage;
  }
} catch {
  // Alguns modos privados bloqueiam o armazenamento; português é o fallback.
}

/** Retorna o idioma ativo sem expor estado mutável entre módulos. */
function getCurrentLanguage() {
  return CURRENT_LANG;
}

/** Define o idioma usado pelos formatadores e traduções. */
function setCurrentLanguage(language) {
  CURRENT_LANG = language === "en" ? "en" : "pt";
}

function t(key) {
  const dict = LANG_DATA[CURRENT_LANG] || LANG_DATA.pt;
  return dict[key] !== undefined
    ? dict[key]
    : LANG_DATA.pt[key] !== undefined
      ? LANG_DATA.pt[key]
      : key;
}
function tLocale() {
  return CURRENT_LANG === "en" ? "en-US" : "pt-BR";
}
function tCondName(key) {
  return CURRENT_LANG === "en"
    ? COND_EN[key] || WEATHER_CONDITIONS[key].name
    : WEATHER_CONDITIONS[key].name;
}
function tSeasonName(key, season) {
  return CURRENT_LANG === "en"
    ? SEASONS_EN[key]?.name || season.name
    : season.name;
}
function tSeasonDesc(key, season) {
  return CURRENT_LANG === "en"
    ? SEASONS_EN[key]?.desc || season.desc
    : season.desc;
}
function tMoonName(pt) {
  return CURRENT_LANG === "en" ? MOON_EN[pt] || pt : pt;
}
function tMoonDesc(pt, fallback) {
  return CURRENT_LANG === "en" ? MOON_DESC_EN[pt] || fallback : fallback;
}
function tHoliday(h, key) {
  if (CURRENT_LANG !== "en" || !key) return h;
  const en = HOLIDAYS_EN[key];
  return en || h;
}
function tLocationName(key) {
  return CURRENT_LANG === "en"
    ? LOCATION_EN[key] || LOCATIONS[key].name
    : LOCATIONS[key].name;
}
function tDaysLabel(n) {
  if (n === 0) return t("hoje");
  if (n === 1) return CURRENT_LANG === "en" ? "tomorrow" : t("amanhã");
  return `${t("em")} ${n} ${t("dias")}`;
}

// --- FUNÇÃO HELPER UV (GLOBAL) ---
function getUvColorClass(value) {
  const val = parseFloat(value);
  if (val <= 2) return "text-green-400";
  if (val <= 5) return "text-yellow-400";
  if (val <= 7) return "text-orange-400";
  if (val <= 10) return "text-red-400";
  return "text-purple-400";
}

// Helper para a borda
function getUvBorderClass(value) {
  const val = parseFloat(value);
  if (val <= 2) return "border-green-500";
  if (val <= 5) return "border-yellow-500";
  if (val <= 7) return "border-orange-500";
  if (val <= 10) return "border-red-500";
  return "border-purple-500";
}

// --- FUNÇÃO DE DESCRIÇÃO DINÂMICA (SIMPLIFICADA) ---
function getMetricDescription(type, value, conditionKey) {
  const val = parseFloat(value);
  const isRainy =
    conditionKey &&
    (conditionKey.includes("rain") || conditionKey.includes("storm"));

  if (type === "Vento") {
    if (val < 5) return t("Vento calmo. Brisa muito leve.");
    if (val < 20) return t("Brisa suave e refrescante.");
    if (val < 40) return t("Vento moderado, agita as árvores.");
    if (val < 60) return t("Vento forte e constante.");
    return t("Vendaval intenso. Cuidado com objetos soltos.");
  }
  if (type === "Umidade") {
    if (isRainy) return t("Umidade alta devido à chuva.");
    if (val < 40) return t("Ar seco. Baixa umidade.");
    if (val <= 70) return t("Umidade em nível confortável.");
    return t("Ar úmido e denso.");
  }
  if (type === "Pressão") {
    if (val < 1000) return t("Baixa pressão. Sistema instável.");
    if (val > 1020) return t("Alta pressão. Tempo estável.");
    return t("Pressão atmosférica estável.");
  }
  if (type === "Visibilidade") {
    if (val < 2) return t("Visibilidade muito baixa. Neblina densa.");
    if (val < 10) return t("Visibilidade reduzida.");
    return t("Visibilidade clara e ampla.");
  }
  if (type === "Índice UV") {
    if (val <= 2)
      return (
        "<strong>" +
        t("Baixo (0-2):") +
        "</strong> " +
        t("Risco mínimo. Proteção dispensável para a maioria.")
      );
    if (val <= 5)
      return (
        "<strong>" +
        t("Moderado (3-5):") +
        "</strong> " +
        t("Requer alguma proteção em exposições longas.")
      );
    if (val <= 7)
      return (
        "<strong>" +
        t("Alto (6-7):") +
        "</strong> " +
        t("Proteção necessária. Busque sombra.")
      );
    if (val <= 10)
      return (
        "<strong>" +
        t("Muito Alto (8-10):") +
        "</strong> " +
        t("Risco rápido de queimaduras.")
      );
    return (
      "<strong>" +
      t("Extremo (11+):") +
      "</strong> " +
      t("Risco severo. Evite exposição direta.")
    );
  }
  if (type === "Ponto de Orvalho") {
    if (val < 0)
      return (
        "<strong>" +
        t("Muito seco") +
        ":</strong> " +
        t("Ar gélido, possibilidade de geada.")
      );
    if (val < 10)
      return (
        "<strong>" + t("Seco") + ":</strong> " + t("Ar fresco e confortável.")
      );
    if (val < 15)
      return (
        "<strong>" + t("Confortável") + ":</strong> " + t("Umidade agradável.")
      );
    if (val < 20)
      return (
        "<strong>" +
        t("Pouco abafado") +
        ":</strong> " +
        t("Sensação levemente úmida.")
      );
    if (val < 24)
      return (
        "<strong>" + t("Abafado") + ":</strong> " + t("Ar pesado e tropical.")
      );
    return (
      "<strong>" +
      t("Opressivo") +
      ":</strong> " +
      t("Umidade extrema, desconforto severo.")
    );
  }
  if (type === "Qualidade do Ar") {
    if (val < 25)
      return (
        "<strong>" +
        t("Excelente") +
        ":</strong> " +
        t("Ar puro de montanha e floresta.")
      );
    if (val < 50)
      return (
        "<strong>" +
        t("Boa") +
        ":</strong> " +
        t("Sem riscos relevantes à saúde.")
      );
    if (val < 75)
      return (
        "<strong>" +
        t("Moderada") +
        ":</strong> " +
        t("Pessoas sensíveis podem sentir desconforto.")
      );
    if (val < 100)
      return (
        "<strong>" +
        t("Ruim") +
        ":</strong> " +
        t("Ar carregado, especialmente nas cidades.")
      );
    return (
      "<strong>" +
      t("Muito Ruim") +
      ":</strong> " +
      t("Calor seco e estagnação acumulam particulados.")
    );
  }
  return t("Informação climática padrão.");
}

// Rótulo curto da qualidade do ar
function getAirQualityLabel(val) {
  const v = parseFloat(val);
  if (v < 25) return t("Excelente");
  if (v < 50) return t("Boa");
  if (v < 75) return t("Moderada");
  if (v < 100) return t("Ruim");
  return t("Muito Ruim");
}

// Tradução de direção do vento (PT -> idioma atual)
const WIND_DIR_EN = {
  N: "N",
  NE: "NE",
  L: "E",
  SE: "SE",
  S: "S",
  SO: "SW",
  O: "W",
  NO: "NW",
};
function tWindDir(dir) {
  return CURRENT_LANG === "en" ? WIND_DIR_EN[dir] || dir : dir;
}

export {
  getAirQualityLabel,
  getCurrentLanguage,
  getMetricDescription,
  getUvBorderClass,
  getUvColorClass,
  ICON_MOONRISE,
  ICON_MOONSET,
  ICON_SUNRISE,
  ICON_SUNSET,
  REAL_DATE,
  setCurrentLanguage,
  t,
  tCondName,
  tDaysLabel,
  tHoliday,
  tLocale,
  tLocationName,
  tMoonDesc,
  tMoonName,
  tSeasonDesc,
  tSeasonName,
  tWindDir,
};
