/**
 * Motor climático determinístico de Toussaint.
 * Gera tempo diário e horário coerente sem depender de uma API externa.
 */

import {
  HOLIDAYS,
  LOCATIONS,
  MOON_PHASES_PT,
  SEASONS,
  WEATHER_CONDITIONS,
  WX_SVG,
} from "../data/world-data.js";

import { buildHourlyWeather } from "./weather-dynamics.js";

function resolveWeatherIcon(conditionKey, moonData) {
  if (conditionKey === "clear_night") return moonData.icon;
  return WEATHER_CONDITIONS[conditionKey]
    ? WEATHER_CONDITIONS[conditionKey].icon
    : "?";
}
function resolveWxSvg(conditionKey, opts = {}) {
  // opts: { isBloodMoon, sizeClass }
  const size = opts.sizeClass || "wx-icon-md";
  let svg;
  if (opts.isBloodMoon && conditionKey === "clear_night")
    svg = WX_SVG.blood_moon;
  else svg = WX_SVG[conditionKey] || WX_SVG.cloudy_day;
  // Injetar classe de tamanho
  return svg.replace('class="wx-icon', `class="wx-icon ${size}`);
}

// === HELPERS DE REALISMO ===
// Sensação térmica (heat index + wind chill)
function calcFeelsLike(tempC, humidity, windKmh) {
  if (tempC >= 27 && humidity >= 55) {
    // Heat index (Rothfusz, convertido p/ ºC)
    const T = (tempC * 9) / 5 + 32;
    const R = humidity;
    let HI =
      -42.379 +
      2.04901523 * T +
      10.14333127 * R -
      0.22475541 * T * R -
      0.00683783 * T * T -
      0.05481717 * R * R +
      0.00122874 * T * T * R +
      0.00085282 * T * R * R -
      0.00000199 * T * T * R * R;
    const hiC = ((HI - 32) * 5) / 9;
    // cap: evita sensação exagerada de calor à noite em clima seco
    return Math.round(Math.min(hiC, tempC + 6));
  }
  if (tempC <= 10 && windKmh >= 5) {
    // Wind chill (Environment Canada)
    const WC =
      13.12 +
      0.6215 * tempC -
      11.37 * Math.pow(windKmh, 0.16) +
      0.3965 * tempC * Math.pow(windKmh, 0.16);
    return Math.round(WC);
  }
  return Math.round(tempC);
}
// Ponto de orvalho (Magnus)
function calcDewPoint(tempC, humidity) {
  const a = 17.27,
    b = 237.7;
  const alpha = (a * tempC) / (b + tempC) + Math.log(humidity / 100);
  return Math.round((b * alpha) / (a - alpha));
}

const DAY_MS = 24 * 60 * 60 * 1000;
const LUNAR_CYCLE_DAYS = 29.530588;
const SEQUENCE_ANCHOR_YEAR = 2026;
const SEQUENCE_ANCHOR_INDEX = SEQUENCE_ANCHOR_YEAR * 365 + 1;

/** Limita um valor ao intervalo fechado informado. */
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/** Normaliza minutos para um relógio de 24 horas. */
function normalizeMinutes(minutes) {
  return ((Math.round(minutes) % 1440) + 1440) % 1440;
}

/** Formata minutos desde meia-noite como HH:mm. */
function formatClockMinutes(minutes) {
  const normalized = normalizeMinutes(minutes);
  const hours = Math.floor(normalized / 60);
  const mins = normalized % 60;
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}

// --- MOTOR ---
const WeatherEngine = {
  _seed: 0,
  _seededRandom(daySeed) {
    let seed = daySeed + this._seed;
    let x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  },
  setAnnualSeed(year) {
    this._seed = year * 1000;
  },
  _getDaySeed(date) {
    return (
      date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate()
    );
  },
  /**
   * Retorna um índice diário contínuo, sem colisões em anos bissextos.
   * A âncora mantém os índices de 2026 iguais aos da versão original,
   * evitando rerrolar o clima já conhecido pelo usuário.
   */
  _getSequentialDayIndex(date) {
    const anchorUtc = Date.UTC(SEQUENCE_ANCHOR_YEAR, 0, 1);
    const dateUtc = Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );
    return SEQUENCE_ANCHOR_INDEX + Math.round((dateUtc - anchorUtc) / DAY_MS);
  },
  // Algoritmo de Ruído Suave
  _getSmoothNoise(index, offset) {
    const frequency = 0.3;
    const x = index * frequency + offset;
    const intX = Math.floor(x);
    const fractX = x - intX;
    const hash = (n) => {
      let s = Math.sin(n + this._seed) * 43758.5453;
      return s - Math.floor(s);
    };
    const v1 = hash(intX);
    const v2 = hash(intX + 1);
    const f = (1 - Math.cos(fractX * Math.PI)) * 0.5;
    return v1 * (1 - f) + v2 * f;
  },
  _getDayOfYear(date) {
    const startUtc = Date.UTC(date.getFullYear(), 0, 0);
    const dateUtc = Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );
    return Math.round((dateUtc - startUtc) / DAY_MS);
  },
  getSeason(date) {
    const m = date.getMonth();
    const d = date.getDate();

    // Primavera: 21 Março - 20 Junho
    if ((m == 2 && d >= 21) || (m > 2 && m < 5) || (m == 5 && d < 21))
      return SEASONS.spring;

    // Verão: 21 Junho - 22 Setembro
    if ((m == 5 && d >= 21) || (m > 5 && m < 8) || (m == 8 && d <= 22))
      return SEASONS.summer;

    // Outono: 23 Setembro - 20 Dezembro
    if ((m == 8 && d >= 23) || (m > 8 && m < 11) || (m == 11 && d < 21))
      return SEASONS.autumn;

    // Inverno: 21 Dezembro - 20 Março
    return SEASONS.winter;
  },
  getHoliday(date) {
    return HOLIDAYS[`${date.getMonth() + 1}-${date.getDate()}`] || null;
  },

  /** Calcula fase e idade lunar contínuas para qualquer data civil. */
  getLunarPhase(date) {
    const refUtc = Date.UTC(2023, 0, 1);
    const dateUtc = Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );
    const diffDays = (dateUtc - refUtc) / DAY_MS;
    const dayInCycle =
      ((diffDays % LUNAR_CYCLE_DAYS) + LUNAR_CYCLE_DAYS) % LUNAR_CYCLE_DAYS;
    const phaseIndex = Math.floor(dayInCycle / (LUNAR_CYCLE_DAYS / 8));
    const illumination =
      phaseIndex <= 4
        ? (phaseIndex / 4) * 100
        : (1 - (phaseIndex - 4) / 4) * 100;
    let phaseData = {
      ...MOON_PHASES_PT[phaseIndex],
      illumination: Math.round(illumination),
      ageDays: dayInCycle,
    };
    if (phaseIndex === 4) {
      const cycleNumber = Math.floor(diffDays / LUNAR_CYCLE_DAYS);
      // Lua de Sangue: a cada 18 ciclos, com jitter ±1 dia, APENAS em outono/inverno
      if (cycleNumber % 18 === 0) {
        const jitterRand = Math.sin(cycleNumber * 9301 + 49297) * 233280;
        const jitter =
          Math.floor((jitterRand - Math.floor(jitterRand)) * 3) - 1; // -1, 0 ou 1
        const targetDay = 15 + jitter;
        const month = date.getMonth();
        const isAutumnWinter = month >= 8 || month <= 2; // Set–Fev
        if (Math.floor(dayInCycle) === targetDay && isAutumnWinter) {
          phaseData = {
            name: "Lua de Sangue",
            icon: "🔴",
            index: 4,
            illumination: 100,
            ageDays: dayInCycle,
            isBloodMoon: true,
            desc: "Um evento raro e sinistro. A lua brilha vermelha como sangue, fortalecendo monstros e magia negra. Diz a lenda que só nos meses sombrios do ano, entre o equinócio de outono e o fim do inverno, o véu se rompe.",
          };
        }
      }
    }
    return phaseData;
  },

  // Regiões vizinhas seguem o tempo da região-mãe com pequenas variações locais.
  _softenCondition(key) {
    const MAP = {
      storm_day: "heavy_rain_day",
      heavy_rain_day: "light_rain_day",
      light_rain_day: "overcast_day",
      snow_day: "overcast_day",
      overcast_day: "cloudy_day",
      fog_day: "cloudy_day",
      cloudy_day: "clear_day",
      clear_day: "cloudy_day",
    };
    return MAP[key] || key;
  },

  _getSyncedWeather(date, locationKey) {
    const locData = LOCATIONS[locationKey];
    const parentKey = locData.syncWith;
    const parent = LOCATIONS[parentKey];
    const base = this.getWeatherForDay(date, parentKey);
    const seq = this._getSequentialDayIndex(date);
    const n = (o) => this._getSmoothNoise(seq, o);

    const dTemp = (locData.tempOffset || 0) - (parent.tempOffset || 0);
    const dHum = (locData.humOffset || 0) - (parent.humOffset || 0);
    const dWind = (locData.windOffset || 0) - (parent.windOffset || 0);
    const dRain = (locData.rainOffset || 0) - (parent.rainOffset || 0);

    // Condição: acompanha a região-mãe; pequena chance de um grau de diferença.
    const strength = locData.syncStrength != null ? locData.syncStrength : 0.9;
    let conditionKey = base.conditionKey;
    if (n(61) > strength)
      conditionKey = this._softenCondition(base.conditionKey);

    const tempMax = Math.round(base.tempMax + dTemp + (n(62) * 2 - 1));
    const tempMin = Math.round(base.tempMin + dTemp + (n(63) * 2 - 1));
    const humidity = clamp(
      Math.round(base.humidity + dHum + (n(64) * 6 - 3)),
      10,
      100,
    );
    const windSpeed = Math.max(
      0,
      Math.round(base.windSpeed + dWind + (n(65) * 4 - 2)),
    );
    const isWet = /rain|storm|snow/.test(conditionKey);
    const precipChance = isWet
      ? clamp(Math.round(base.precipChance + dRain + (n(66) * 8 - 4)), 65, 99)
      : clamp(Math.round(base.precipChance + dRain + (n(66) * 8 - 4)), 0, 55);
    const precipAmountMm = isWet
      ? Math.max(
          0.1,
          Math.round((base.precipAmountMm + n(70) * 2 - 1) * 10) / 10,
        )
      : 0;
    const pressure = Math.round(base.pressure + (n(67) * 4 - 2));
    const willFog = conditionKey.includes("fog");
    const visibility = willFog
      ? base.visibility
      : clamp(Math.round(base.visibility + (n(68) * 4 - 2)), 1, 20);

    // UV segue a região-mãe, ajustado por altitude e pela condição local
    const uvRatio =
      (locData.uvBoost != null ? locData.uvBoost : 1) /
      (parent.uvBoost != null ? parent.uvBoost : 1);
    let uvIndex = Math.round(base.uvIndex * uvRatio);
    if (conditionKey !== base.conditionKey) {
      if (conditionKey === "clear_day") uvIndex = Math.round(uvIndex * 1.15);
      else if (
        conditionKey.includes("rain") ||
        conditionKey.includes("overcast")
      )
        uvIndex = Math.round(uvIndex * 0.75);
    }
    uvIndex = clamp(uvIndex, 0, 11);

    const dAq =
      (locData.aqBase != null ? locData.aqBase : 25) -
      (parent.aqBase != null ? parent.aqBase : 25);
    const airQuality = clamp(
      Math.round(base.airQuality + dAq + (n(69) * 6 - 3)),
      5,
      150,
    );

    // Nascer/pôr do sol com o relevo próprio
    const sunriseMinutes = Math.round(
      base.sunriseMinutes -
        (parent.sunriseOffset || 0) +
        (locData.sunriseOffset || 0),
    );
    const sunsetMinutes = Math.round(
      base.sunsetMinutes -
        (parent.sunsetOffset || 0) +
        (locData.sunsetOffset || 0),
    );
    const fmt = (m) =>
      `${Math.floor(m / 60)
        .toString()
        .padStart(2, "0")}:${Math.floor(m % 60)
        .toString()
        .padStart(2, "0")}`;

    const tempAvg = Math.round((tempMax + tempMin) / 2);

    // Direção do vento mantém o viés local da região
    const DIRS_S = ["N", "NE", "L", "SE", "S", "SO", "O", "NO"];
    const dirBiasRoll = this._getSmoothNoise(seq, 10);
    const dirChoiceRoll = this._getSmoothNoise(seq, 18);
    const windDir =
      locData.windDirBias && dirBiasRoll < 0.6
        ? locData.windDirBias
        : DIRS_S[Math.floor(dirChoiceRoll * 8) % 8];

    return {
      ...base,
      location: locData.name,
      windDir,
      tempMax,
      tempMin,
      precipChance,
      precipAmountMm,
      precipitationOccurs: isWet,
      humidity,
      windSpeed,
      pressure,
      visibility,
      uvIndex,
      airQuality,
      conditionKey,
      dayConditionKey: conditionKey,
      fogChance: willFog
        ? Math.max(65, base.fogChance)
        : Math.min(45, base.fogChance),
      sunriseMinutes,
      sunsetMinutes,
      sunrise: fmt(sunriseMinutes),
      sunset: fmt(sunsetMinutes),
      dewPoint: calcDewPoint(tempAvg, humidity),
      feelsLikeDay: calcFeelsLike(tempMax, humidity, windSpeed),
    };
  },

  /**
   * Reconstitui umidade e estiagem recentes sem depender do histórico de visitas.
   * A convergência de 90 dias evita chuva forçada em um prazo fixo: a recuperação
   * só favorece precipitação quando há umidade e levantamento do ar suficientes.
   */
  _getRainState(date, loc) {
    const cacheKey = `${this._getSequentialDayIndex(date)}:${loc.humOffset}:${loc.rainOffset}:${loc.tempOffset}`;
    this._rainCache ??= new Map();
    if (this._rainCache.has(cacheKey)) return this._rainCache.get(cacheKey);
    let moisture = 45,
      dryDays = 0,
      wet = false;
    for (let back = 90; back >= 0; back--) {
      const d = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate() - back,
      );
      const index = this._getSequentialDayIndex(d);
      const season = this.getSeason(d);
      const signal = (offset) => {
        const x = index * 0.3 + offset;
        const hash = (n) => {
          const v = Math.sin(n + d.getFullYear() * 1000) * 43758.5453;
          return v - Math.floor(v);
        };
        const f = (1 - Math.cos((x - Math.floor(x)) * Math.PI)) / 2;
        return hash(Math.floor(x)) * (1 - f) + hash(Math.floor(x) + 1) * f;
      };
      const availableHumidity = clamp(
        40 + signal(11) * 50 + loc.humOffset,
        10,
        100,
      );
      const lift = signal(41);
      const seasonalWet =
        signal(3) * 100 < clamp(season.precip + loc.rainOffset, 0, 100);
      moisture = clamp(
        moisture * 0.75 +
          availableHumidity * 0.25 -
          (season === SEASONS.summer ? 2 : 0),
        10,
        100,
      );
      const recovery = Math.min(22, Math.max(0, dryDays - 4) * 1.7);
      const convective =
        season === SEASONS.summer &&
        availableHumidity >= 58 &&
        season.tempMin +
          signal(1) * (season.tempMax - season.tempMin) +
          loc.tempOffset >=
          25;
      wet =
        seasonalWet ||
        (availableHumidity >= 55 &&
          moisture + recovery > 69 &&
          lift > (convective ? 0.35 : 0.58));
      dryDays = wet ? 0 : dryDays + 1;
      if (wet) moisture = Math.min(95, moisture + 9);
    }
    const result = { wet, dryDays, moisture };
    if (this._rainCache.size > 12000) this._rainCache.clear();
    this._rainCache.set(cacheKey, result);
    return result;
  },

  getWeatherForDay(date, locationKey = "beauclair") {
    const locData = LOCATIONS[locationKey];
    this.setAnnualSeed(date.getFullYear());
    if (locData.syncWith && LOCATIONS[locData.syncWith]) {
      return this._getSyncedWeather(date, locationKey);
    }

    const seqIndex = this._getSequentialDayIndex(date);
    const rand = (variation) => this._getSmoothNoise(seqIndex, variation);

    const season = this.getSeason(date);

    // Identificar chave da estação para lógica interna
    let seasonKey = "winter";
    if (season === SEASONS.spring) seasonKey = "spring";
    else if (season === SEASONS.summer) seasonKey = "summer";
    else if (season === SEASONS.autumn) seasonKey = "autumn";

    const tempRange = season.tempMax - season.tempMin;
    const baseTempMax = season.tempMin + rand(1) * tempRange;
    const tempVariation =
      seasonKey === "summer" ? 10 + rand(2) * 4 : 5 + rand(2) * 5;

    // === ONDA DE CALOR (multi-dia, persistente) ===
    // Início raro (~5%) e duração 3-7 dias com intensidade decrescente.
    // Determinístico: olhamos para trás até 7 dias buscando o "início" da onda.
    let heatWaveBonus = 0;
    if (seasonKey === "summer") {
      for (let back = 0; back < 7; back++) {
        const dBack = new Date(date);
        dBack.setDate(dBack.getDate() - back);
        const sIdx = this._getSequentialDayIndex(dBack);
        const startR = this._seededRandom(sIdx * 7 + 13);
        if (startR > 0.95) {
          const dur = 3 + Math.floor(this._seededRandom(sIdx * 7 + 29) * 5); // 3-7
          if (back < dur) {
            heatWaveBonus = Math.max(3, 7 - back); // pico no dia 0, decai
            break;
          }
        }
      }
    }

    const tempMax = Math.round(
      baseTempMax + locData.tempOffset + heatWaveBonus,
    );
    const tempMin = Math.round(
      baseTempMax - tempVariation + locData.tempOffset + heatWaveBonus / 3,
    );

    // Ocorrência e probabilidade são conceitos distintos. O primeiro
    // define o cânone do dia; o segundo comunica a confiança ao usuário.
    const precipRoll = Math.round(rand(3) * 100);
    // A onda de calor eleva as temperaturas, mas não zera a possibilidade de
    // uma pancada convectiva. Isso evita estiagens artificiais de vários meses.
    const precipThreshold = clamp(season.precip + locData.rainOffset, 0, 100);
    const rainState = this._getRainState(date, locData);
    const willRain = rainState.wet;
    const moistureSignal = 100 - precipRoll;
    let precipChance = Math.round(
      precipThreshold * 0.55 + moistureSignal * 0.45 + (rand(31) * 12 - 6),
    );

    const fogRoll = Math.round(rand(4) * 100);
    const fogThreshold = clamp(season.fog + locData.fogOffset, 0, 100);
    const willFog = fogRoll < fogThreshold;
    let fogChance = Math.round(
      fogThreshold * 0.6 + (100 - fogRoll) * 0.4 + (rand(32) * 10 - 5),
    );
    fogChance = willFog ? clamp(fogChance, 65, 95) : clamp(fogChance, 0, 45);

    // === CICLO SOLAR CANÔNICO DE TOUSSAINT ===
    // Recupera a curva original inspirada no jogo: perto do início do verão,
    // o sol nasce por volta das 05h e se põe após as 20h. No inverno, nasce
    // mais tarde e se põe antes. A transição é contínua ao longo do ano.
    const dayOfYear = this._getDayOfYear(date);
    const seasonFactor = -Math.cos((2 * Math.PI * (dayOfYear + 10)) / 365);
    const sunriseMinutesBase = 6 * 60 - seasonFactor * 60;
    const sunsetMinutesBase = 19 * 60 + seasonFactor * 90;
    const noise = Math.round(rand(99) * 10 - 5);
    const sunriseMinutes = Math.round(
      sunriseMinutesBase + noise + (locData.sunriseOffset || 0),
    );
    const sunsetMinutes = Math.round(
      sunsetMinutesBase + noise + (locData.sunsetOffset || 0),
    );
    const sunrise = formatClockMinutes(sunriseMinutes);
    const sunset = formatClockMinutes(sunsetMinutes);

    let conditionKey = "clear_day";
    if (willRain) {
      const r = rand(5);
      if (
        r > 0.9 &&
        rainState.moisture >= 58 &&
        (tempMax >= 24 || rand(41) > 0.7)
      )
        conditionKey = "storm_day";
      else if (r > 0.7) conditionKey = "heavy_rain_day";
      else conditionKey = "light_rain_day";

      if (
        (seasonKey === "winter" && tempMin <= 2) ||
        (locData.snowRisk && tempMin <= 0)
      ) {
        if (rand(20) > (locData.snowRisk ? 0.6 : 0.8))
          conditionKey = "snow_day";
      }
    } else if (willFog) {
      conditionKey = "fog_day";
    } else {
      const r = rand(7);
      if (r > 0.9) conditionKey = "overcast_day";
      else if (r > 0.6) conditionKey = "cloudy_day";
      else conditionKey = "clear_day";
    }

    if (heatWaveBonus > 0 && !willRain) conditionKey = "clear_day";

    // === NEVE SECA: céu encoberto + frio extremo, mesmo sem "chuva" ===
    if (
      !willRain &&
      (conditionKey === "overcast_day" || conditionKey === "cloudy_day")
    ) {
      if (
        (seasonKey === "winter" && tempMax <= 0) ||
        (locData.snowRisk && tempMax <= -2)
      ) {
        if (rand(80) > 0.55) conditionKey = "snow_day";
      }
    }

    const isWetCondition = /rain|storm|snow/.test(conditionKey);
    if (isWetCondition) {
      const conditionFloor = conditionKey.includes("storm")
        ? 85
        : conditionKey.includes("heavy")
          ? 78
          : 68;
      precipChance = clamp(precipChance + 50, conditionFloor, 99);
    } else {
      precipChance = clamp(precipChance, 0, 55);
    }

    let precipAmountMm = 0;
    if (conditionKey.includes("storm")) precipAmountMm = 15 + rand(42) * 30;
    else if (conditionKey.includes("heavy_rain"))
      precipAmountMm = 8 + rand(42) * 18;
    else if (conditionKey.includes("light_rain"))
      precipAmountMm = 1 + rand(42) * 8;
    else if (conditionKey.includes("snow")) precipAmountMm = 0.5 + rand(42) * 8;
    precipAmountMm = Math.round(precipAmountMm * 10) / 10;

    // === PRESSÃO (calculada antes do vento p/ usar o delta) ===
    let pressure = 1005 + Math.round(rand(41) * 10);
    if (conditionKey.includes("storm"))
      pressure = 980 + Math.round(rand(41) * 12);
    else if (conditionKey.includes("heavy_rain"))
      pressure = 988 + Math.round(rand(41) * 12);
    else if (conditionKey.includes("light_rain"))
      pressure = 995 + Math.round(rand(41) * 13);
    else if (conditionKey.includes("clear"))
      pressure = 1015 + Math.round(rand(41) * 20);

    // Pressão de ontem (para vento)
    const yesterday = new Date(date);
    yesterday.setDate(yesterday.getDate() - 1);
    const ySeq = this._getSequentialDayIndex(yesterday);
    const yRand = (v) => this._getSmoothNoise(ySeq, v);
    let yPressure = 1000 + Math.round(yRand(12) * 25);
    const yPrecipRoll = Math.round(yRand(3) * 100);
    const ySeason = this.getSeason(yesterday);
    const yWillRain = this._getRainState(yesterday, locData).wet;
    if (yWillRain) yPressure = 985;
    const pressureDelta = Math.abs(pressure - yPressure);

    // Ontem-anteontem para umidade
    const dayBefore = new Date(date);
    dayBefore.setDate(dayBefore.getDate() - 2);
    const dbSeq = this._getSequentialDayIndex(dayBefore);
    const dbPrecipRoll = Math.round(this._getSmoothNoise(dbSeq, 3) * 100);
    const dbSeason = this.getSeason(dayBefore);
    const dbWillRain = this._getRainState(dayBefore, locData).wet;

    // === VENTO suavizado + ligado ao gradiente de pressão ===
    const windNoise = this._getSmoothNoise(seqIndex, 9);
    let windSpeed = Math.max(
      0,
      Math.round(5 + windNoise * 22 + locData.windOffset + pressureDelta * 0.6),
    );
    if (conditionKey.includes("storm"))
      windSpeed += 10 + Math.round(rand(33) * 15);
    // Direção do vento com viés regional: 60% chance da direção dominante, 40% sorteia
    const DIRS = ["N", "NE", "L", "SE", "S", "SO", "O", "NO"];
    let windDir;
    const dirBiasRoll = this._getSmoothNoise(seqIndex, 10);
    const dirChoiceRoll = this._getSmoothNoise(seqIndex, 18);
    if (locData.windDirBias && dirBiasRoll < 0.6) {
      windDir = locData.windDirBias;
    } else {
      windDir = DIRS[Math.floor(dirChoiceRoll * 8) % 8];
    }

    // === UMIDADE com carryover de chuva ===
    let humidity = 40 + Math.round(rand(11) * 50) + locData.humOffset;
    if (heatWaveBonus > 0) humidity = Math.max(15, humidity - 25);
    if (yWillRain) humidity += 14;
    if (dbWillRain) humidity += 7;
    if (windSpeed > 25 && !willRain) humidity = Math.max(15, humidity - 6);
    if (humidity > 100) humidity = 100;
    if (humidity < 10) humidity = 10;

    const visibility = willFog
      ? 1 + Math.round(rand(13) * 4)
      : 10 + Math.round(rand(13) * 10);

    // === UV (modelo solar realista) ===
    // Elevação solar ao meio-dia para a latitude de Toussaint (~44°N),
    // UV de céu limpo ≈ 12.5 * sen(elevação)^2.42 (aprox. padrão OMM).
    const uvLat = 44.0;
    const uvDoy = this._getDayOfYear(date);
    const decl = 23.44 * Math.sin((2 * Math.PI * (uvDoy - 81)) / 365);
    const noonElev = 90 - uvLat + decl;
    let clearSkyUv = 0;
    if (noonElev > 0) {
      clearSkyUv = 12.5 * Math.pow(Math.sin((noonElev * Math.PI) / 180), 2.42);
    }

    // Atenuação por nebulosidade / precipitação
    let uvFactor = 1.0;
    if (conditionKey === "clear_day") uvFactor = 0.97;
    else if (conditionKey === "cloudy_day")
      uvFactor = 0.8; // parcialmente nublado
    else if (conditionKey === "overcast_day")
      uvFactor = 0.34; // encoberto
    else if (conditionKey.includes("storm")) uvFactor = 0.15;
    else if (conditionKey.includes("rain")) uvFactor = 0.22;
    else if (conditionKey.includes("snow")) uvFactor = 0.3;
    else if (conditionKey.includes("fog")) uvFactor = 0.2;

    // Altitude aumenta o UV (~10% por 1000 m); Monte Górgona é o pico do ducado
    const uvAltFactor = locData.uvBoost != null ? locData.uvBoost : 1.0;

    // Ar úmido/enfumaçado e poeira dispersam parte da radiação
    let uvHazeFactor = 1.0;
    if (humidity > 80) uvHazeFactor -= 0.06;
    if (visibility < 8) uvHazeFactor -= 0.05;
    if (heatWaveBonus > 0) uvHazeFactor += 0.04; // céu seco e estável

    // Variação natural do dia (aerossóis, ozônio) ±8%
    const uvNoise = 0.92 + rand(50) * 0.16;

    let finalUvCalc = Math.round(
      clearSkyUv * uvFactor * uvAltFactor * uvHazeFactor * uvNoise,
    );
    if (finalUvCalc < 0) finalUvCalc = 0;
    if (finalUvCalc > 11) finalUvCalc = 11;

    // === QUALIDADE DO AR reativa ===
    // Base por localidade (urbano > rural), piora em calor seco e parado, melhora com chuva/vento.
    let airQuality = locData.aqBase != null ? locData.aqBase : 25;
    if (heatWaveBonus > 0) airQuality += 22;
    if (conditionKey === "clear_day" && windSpeed < 8) airQuality += 10;
    if (windSpeed > 20) airQuality -= 8;
    if (windSpeed > 35) airQuality -= 6;
    if (conditionKey.includes("rain") || conditionKey.includes("storm"))
      airQuality -= 12;
    if (yWillRain) airQuality -= 6;
    airQuality += Math.round((rand(15) - 0.5) * 8);
    if (airQuality < 5) airQuality = 5;
    if (airQuality > 150) airQuality = 150;

    const moon = this.getLunarPhase(date);
    // A Lua avança cerca de 49 minutos por dia. Um pequeno ruído
    // determinístico evita horários excessivamente mecânicos.
    const moonriseMinutes = normalizeMinutes(
      6 * 60 + moon.ageDays * (1440 / LUNAR_CYCLE_DAYS) + (rand(16) * 16 - 8),
    );
    const moonsetMinutes = normalizeMinutes(
      moonriseMinutes + 12 * 60 + 25 + (rand(17) * 10 - 5),
    );

    // Ponto de orvalho + sensação térmica do dia (usando média)
    const tempAvg = Math.round((tempMax + tempMin) / 2);
    const dewPoint = calcDewPoint(tempAvg, humidity);
    const feelsLikeDay = calcFeelsLike(tempMax, humidity, windSpeed);

    return {
      date,
      seasonName: season.name,
      seasonIcon: season.icon,
      seasonKey,
      location: locData.name,
      tempMax,
      tempMin,
      precipChance,
      precipAmountMm,
      precipitationOccurs: isWetCondition,
      fogChance,
      conditionKey,
      dayConditionKey: conditionKey,
      sunrise,
      sunset,
      sunriseMinutes,
      sunsetMinutes,
      windSpeed,
      windDir,
      humidity,
      pressure,
      visibility,
      uvIndex: finalUvCalc,
      airQuality,
      heatWaveBonus,
      dryDays: rainState.dryDays,
      moistureReserve: rainState.moisture,
      dewPoint,
      feelsLikeDay,
      moon,
      moonrise: formatClockMinutes(moonriseMinutes),
      moonset: formatClockMinutes(moonsetMinutes),
      holiday: this.getHoliday(date),
    };
  },

  /** A previsão horária é a fonte única das condições atuais e dos alertas. */
  getHourlyForecast(dayWeather, locationKey = "beauclair") {
    dayWeather = dayWeather.dailyWeather || dayWeather;
    this.setAnnualSeed(dayWeather.date.getFullYear());
    const seq = this._getSequentialDayIndex(dayWeather.date);
    const previousDate = new Date(dayWeather.date);
    previousDate.setDate(previousDate.getDate() - 1);
    const previous = this.getWeatherForDay(previousDate, locationKey);
    this.setAnnualSeed(dayWeather.date.getFullYear());
    return buildHourlyWeather(
      dayWeather,
      LOCATIONS[locationKey],
      (offset) => this._getSmoothNoise(seq, offset),
      calcFeelsLike,
      previous,
    );
  },

  getCurrentWeather(date, locationKey = "beauclair") {
    const dayWeather = this.getWeatherForDay(date, locationKey);
    const hourly = this.getHourlyForecast(dayWeather, locationKey);
    const currentHour = date.getHours();
    const currentHourData =
      hourly.find((h) => parseInt(h.hour.split(":")[0]) === currentHour) ||
      hourly[0];

    return {
      ...dayWeather,
      dailyWeather: dayWeather,
      hourly,
      currentTemp: currentHourData.temp,
      precipitationOccurs: currentHourData.precipitationOccurs,
      precipAmountMm: currentHourData.precipAmountMm,
      visibility: currentHourData.visibility,
      cloudCover: currentHourData.cloudCover,
      dewPoint: calcDewPoint(currentHourData.temp, currentHourData.humidity),
      currentFeelsLike: currentHourData.feelsLike,
      humidity: currentHourData.humidity,
      windSpeed: currentHourData.windSpeed,
      windDir: currentHourData.windDir,
      pressure: currentHourData.pressure,
      precipChance: currentHourData.precipChance,
      conditionKey: currentHourData.conditionKey,
      currentCondition: WEATHER_CONDITIONS[currentHourData.conditionKey],
      uvIndex: currentHourData.conditionKey.includes("night")
        ? 0
        : dayWeather.uvIndex,
      hourlyMoonIcon: currentHourData.moonIcon,
    };
  },

  /**
   * Encontra o evento ativo ou o próximo início real de um evento.
   * Dias consecutivos da mesma ocorrência não são anunciados como novos eventos.
   */
  findNextEvent(startDate, locationKey, matcher, maxDays = 60) {
    const currentDate = new Date(startDate);
    const currentWeather = this.getWeatherForDay(currentDate, locationKey);
    if (matcher(currentWeather)) {
      return {
        date: currentDate,
        weather: currentWeather,
        daysAhead: 0,
        isActive: true,
      };
    }

    let previousMatches = false;
    for (let i = 1; i <= maxDays; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const w = this.getWeatherForDay(d, locationKey);
      const matches = matcher(w);
      if (matches && !previousMatches) {
        return {
          date: d,
          weather: w,
          daysAhead: i,
          isActive: false,
        };
      }
      previousMatches = matches;
    }
    return null;
  },
};

export { resolveWeatherIcon, resolveWxSvg, WeatherEngine };
