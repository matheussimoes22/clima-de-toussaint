/** Regras dos boletins; nenhuma localidade é incluída sem uma hora compatível. */
import { LOCATIONS, SEASONS } from "../data/world-data.js";
import { WeatherEngine } from "./weather-engine.js";

/** Limiares ficcionais calibrados à estação e ao relevo, não alertas reais. */
export function matchesEvent(key, day, hour, previous, locKey) {
  const loc = LOCATIONS[locKey];
  const season = SEASONS[day.seasonKey];
  switch (key) {
    case "heat":
      return hour.isNight
        ? day.heatWaveBonus >= 4 &&
            day.tempMax >= season.tempMax + loc.tempOffset + 2 &&
            hour.temp >= 30
        : day.tempMax >= season.tempMax + loc.tempOffset + 2 &&
            hour.temp >= Math.max(30, season.tempMax + loc.tempOffset - 1) &&
            hour.temp >= day.tempMin + 6;
    case "cold":
      return hour.temp <= Math.min(2, season.tempMin + loc.tempOffset - 3);
    case "front":
      return (
        previous.tempMax - day.tempMax >= 5 &&
        hour.temp <= previous.tempMax - 5 &&
        hour.windSpeed >= 20 &&
        hour.cloudCover >= 70
      );
    case "storm":
      return (
        hour.conditionKey.includes("storm") &&
        hour.precipAmountMm > 0 &&
        hour.humidity >= 82 &&
        hour.cloudCover >= 90 &&
        hour.windSpeed >= 20
      );
    case "rain":
      return hour.precipAmountMm >= 2.5 && /rain|storm/.test(hour.conditionKey);
    case "wind":
      return hour.windSpeed >= 45;
    case "fog":
      return hour.conditionKey.includes("fog") && hour.visibility <= 3;
    case "snow":
      return hour.conditionKey.includes("snow");
    case "blood":
      return day.moon.isBloodMoon && hour.isNight && parseInt(hour.hour) <= 3;
    default:
      return false;
  }
}

/** Calcula as horas verificáveis de uma ocorrência na região e data pedidas. */
export function eventHours(key, date, locKey) {
  const day = WeatherEngine.getWeatherForDay(date, locKey);
  const previousDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() - 1,
  );
  const previous =
    key === "front" || key === "heat"
      ? WeatherEngine.getWeatherForDay(previousDate, locKey)
      : day;
  // A persistência térmica distingue um episódio de um pico isolado.
  const nextDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() + 1,
  );
  if (key === "heat") {
    const threshold =
      SEASONS[day.seasonKey].tempMax + LOCATIONS[locKey].tempOffset;
    const next = WeatherEngine.getWeatherForDay(nextDate, locKey);
    if (
      day.heatWaveBonus < 4 &&
      previous.tempMax < threshold &&
      next.tempMax < threshold
    )
      return { day, hours: [] };
  }
  if (
    key === "front" &&
    WeatherEngine.getWeatherForDay(nextDate, locKey).tempMax >
      previous.tempMax - 3
  )
    return { day, hours: [] };
  return {
    day,
    hours: WeatherEngine.getHourlyForecast(day, locKey).filter((hour) =>
      matchesEvent(key, day, hour, previous, locKey),
    ),
  };
}

/** Procura somente horas atuais/futuras; um episódio já encerrado não é ativo. */
export function findWeatherEvent(key, now, locKey, maxDays = 10) {
  for (let offset = 0; offset <= maxDays; offset++) {
    const date = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + offset,
    );
    const { day, hours } = eventHours(key, date, locKey);
    const remaining = hours.filter(
      (h) => offset > 0 || parseInt(h.hour) >= now.getHours(),
    );
    if (!remaining.length) continue;
    return {
      date,
      weather: day,
      hours: remaining,
      daysAhead: offset,
      isActive:
        offset === 0 &&
        remaining.some((h) => parseInt(h.hour) === now.getHours()),
    };
  }
  return null;
}

/** As áreas compartilham o intervalo publicado, não apenas uma vizinhança textual. */
export function affectedAreas(key, date, hours) {
  const validHours = new Set(hours.map((h) => h.hour));
  return Object.keys(LOCATIONS).filter((loc) =>
    eventHours(key, date, loc).hours.some((h) => validHours.has(h.hour)),
  );
}
