/** Leitura defensiva das preferências salvas pelo navegador. */

/** Retorna JSON salvo ou o valor padrão se o conteúdo estiver ausente/corrompido. */
export function readStoredJson(key, fallback, storage = localStorage) {
  try {
    const raw = storage.getItem(key);
    if (raw === null) return fallback;
    const parsed = JSON.parse(raw);
    if (
      fallback &&
      typeof fallback === "object" &&
      (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
    ) {
      return fallback;
    }
    return parsed;
  } catch {
    return fallback;
  }
}

/** Lê um inteiro salvo respeitando inclusive o valor zero e limites opcionais. */
export function readStoredInteger(
  key,
  fallback,
  { min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER } = {},
  storage = localStorage,
) {
  try {
    const value = Number.parseInt(storage.getItem(key), 10);
    return Number.isInteger(value) && value >= min && value <= max
      ? value
      : fallback;
  } catch {
    return fallback;
  }
}

/** Aceita somente escolhas presentes no conjunto permitido. */
export function readStoredChoice(
  key,
  choices,
  fallback,
  storage = localStorage,
) {
  try {
    const value = storage.getItem(key);
    return choices.includes(value) ? value : fallback;
  } catch {
    return fallback;
  }
}

/** Persiste uma preferência sem interromper o app quando o navegador bloqueia storage. */
export function writeStoredValue(key, value, storage = localStorage) {
  try {
    storage.setItem(key, String(value));
    return true;
  } catch {
    return false;
  }
}
