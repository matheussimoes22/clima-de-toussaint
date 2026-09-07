/**
 * Persistência e atualização dos recordes climáticos por localidade.
 * As funções deste módulo não dependem da interface e podem ser testadas isoladamente.
 */

import { LOCATIONS } from "../data/world-data.js";

export const RECORDS_KEY = "toussaintApp_records_v2";
const LEGACY_RECORDS_KEY = "toussaintApp_records";

/** Lê JSON do armazenamento sem impedir o app de iniciar se o valor estiver corrompido. */
function readJson(storage, key) {
  try {
    const raw = storage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Cria a referência histórica inicial preservada desde a primeira versão do projeto. */
export function createDefaultRecord(locationKey) {
  const offset = LOCATIONS[locationKey]?.tempOffset || 0;
  return {
    max: {
      value: Math.round(37 + offset),
      date: null,
      source: "legacy-baseline",
    },
    min: {
      value: Math.round(-1 + offset),
      date: null,
      source: "legacy-baseline",
    },
    lastEvaluatedDate: null,
  };
}

/** Normaliza a versão atual e migra silenciosamente o formato legado {max, min}. */
export function loadRecords(storage = localStorage) {
  const current = readJson(storage, RECORDS_KEY);
  const legacy = readJson(storage, LEGACY_RECORDS_KEY) || {};
  const byLocation = {};

  for (const locationKey of Object.keys(LOCATIONS)) {
    const fallback = createDefaultRecord(locationKey);
    const saved =
      current?.version === 2 ? current.byLocation?.[locationKey] : null;
    const old = legacy[locationKey];

    byLocation[locationKey] = {
      max: {
        value: Number.isFinite(saved?.max?.value)
          ? saved.max.value
          : Number.isFinite(old?.max)
            ? old.max
            : fallback.max.value,
        date: saved?.max?.date || null,
        source: saved?.max?.source || "legacy-baseline",
      },
      min: {
        value: Number.isFinite(saved?.min?.value)
          ? saved.min.value
          : Number.isFinite(old?.min)
            ? old.min
            : fallback.min.value,
        date: saved?.min?.date || null,
        source: saved?.min?.source || "legacy-baseline",
      },
      lastEvaluatedDate: saved?.lastEvaluatedDate || null,
    };
  }

  return {
    version: 2,
    byLocation,
    updatedAt: current?.updatedAt || null,
  };
}

/** Atualiza somente a localidade informada; empates não substituem a data do recorde. */
export function updateLocationRecord(records, locationKey, weather, dateKey) {
  const record = records?.byLocation?.[locationKey];
  if (
    !record ||
    !Number.isFinite(weather?.tempMax) ||
    !Number.isFinite(weather?.tempMin)
  ) {
    return false;
  }

  let changed = false;
  if (weather.tempMax > record.max.value) {
    record.max = { value: weather.tempMax, date: dateKey, source: "generated" };
    changed = true;
  }
  if (weather.tempMin < record.min.value) {
    record.min = { value: weather.tempMin, date: dateKey, source: "generated" };
    changed = true;
  }
  if (record.lastEvaluatedDate !== dateKey) {
    record.lastEvaluatedDate = dateKey;
    changed = true;
  }
  return changed;
}

/** Compara uma temperatura já observada, sem antecipar máxima ou mínima futura. */
export function observeTemperature(records, locationKey, temperature, dateKey) {
  const record = records?.byLocation?.[locationKey];
  if (!record || !Number.isFinite(temperature)) return false;

  let changed = false;
  if (temperature > record.max.value) {
    record.max = { value: temperature, date: dateKey, source: "observed" };
    changed = true;
  }
  if (temperature < record.min.value) {
    record.min = { value: temperature, date: dateKey, source: "observed" };
    changed = true;
  }
  return changed;
}

/** Converte YYYY-MM-DD em meio-dia local para evitar mudanças de dia por UTC. */
export function localDateFromKey(dateKey) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey || "");
  if (!match) return null;
  const date = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
    12,
  );
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Grava uma fotografia completa e versionada dos recordes. */
export function saveRecords(records, storage = localStorage) {
  try {
    records.updatedAt = new Date().toISOString();
    storage.setItem(RECORDS_KEY, JSON.stringify(records));
    return true;
  } catch {
    return false;
  }
}
