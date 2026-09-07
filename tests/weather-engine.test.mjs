import assert from "node:assert/strict";
import { LOCATIONS } from "../assets/js/data/world-data.js";
import { WeatherEngine } from "../assets/js/engine/weather-engine.js";

// O clima conhecido de Beauclair em 23/08/2026 não deve ser rerrolado pela migração.
const reference = WeatherEngine.getWeatherForDay(
  new Date(2026, 7, 23),
  "beauclair",
);
assert.equal(reference.tempMax, 22);
assert.equal(reference.tempMin, 10);
assert.equal(reference.conditionKey, "cloudy_day");

// Índices precisam avançar exatamente um dia, inclusive após ano bissexto.
const leapIndexes = [
  new Date(2024, 11, 30),
  new Date(2024, 11, 31),
  new Date(2025, 0, 1),
  new Date(2025, 0, 2),
].map((date) => WeatherEngine._getSequentialDayIndex(date));
for (let index = 1; index < leapIndexes.length; index += 1) {
  assert.equal(leapIndexes[index] - leapIndexes[index - 1], 1);
}

assert.equal(WeatherEngine.getSeason(new Date(2026, 8, 22)).name, "Verão");
assert.equal(WeatherEngine.getSeason(new Date(2026, 8, 23)).name, "Outono");

// A curva original de Toussaint mantém o sol até depois das 20h no verão.
const solstice = WeatherEngine.getWeatherForDay(
  new Date(2026, 5, 21),
  "beauclair",
);
assert.ok(
  solstice.sunriseMinutes >= 4 * 60 + 55 &&
    solstice.sunriseMinutes <= 5 * 60 + 5,
  solstice.sunrise,
);
assert.ok(
  solstice.sunsetMinutes >= 20 * 60 + 25 &&
    solstice.sunsetMinutes <= 20 * 60 + 35,
  solstice.sunset,
);
const lateSummer = WeatherEngine.getWeatherForDay(
  new Date(2026, 7, 26),
  "beauclair",
);
const winterSolstice = WeatherEngine.getWeatherForDay(
  new Date(2026, 11, 21),
  "beauclair",
);
assert.ok(solstice.sunsetMinutes > lateSummer.sunsetMinutes);
assert.ok(lateSummer.sunsetMinutes > winterSolstice.sunsetMinutes);
assert.ok(winterSolstice.sunriseMinutes > solstice.sunriseMinutes);

// Probabilidade, ocorrência e volume não podem se contradizer.
const locations = Object.keys(LOCATIONS);
for (const location of locations) {
  for (let day = 0; day < 366; day += 1) {
    const weather = WeatherEngine.getWeatherForDay(
      new Date(2026, 0, 1 + day),
      location,
    );
    const wet = /rain|storm|snow/.test(weather.conditionKey);
    assert.equal(weather.precipitationOccurs, wet);
    assert.ok(weather.precipChance >= 0 && weather.precipChance <= 100);
    if (wet) {
      assert.ok(
        weather.precipChance >= 65,
        `${location} ${weather.conditionKey} ${weather.precipChance}%`,
      );
      assert.ok(weather.precipAmountMm > 0);
    } else {
      assert.ok(
        weather.precipChance <= 55,
        `${location} ${weather.conditionKey} ${weather.precipChance}%`,
      );
      assert.equal(weather.precipAmountMm, 0);
    }
  }
}

// O verão de 2026 não pode voltar a produzir a estiagem artificial de meses.
for (const location of locations) {
  let dryRun = 0;
  let longestDryRun = 0;
  for (let day = 0; day < 94; day += 1) {
    const weather = WeatherEngine.getWeatherForDay(
      new Date(2026, 5, 21 + day),
      location,
    );
    dryRun = weather.precipitationOccurs ? 0 : dryRun + 1;
    longestDryRun = Math.max(longestDryRun, dryRun);
  }
  assert.ok(
    longestDryRun <= 21,
    `${location}: ${longestDryRun} dias consecutivos sem precipitação`,
  );
}

// Uma onda em andamento é um alerta atual, não um novo evento "amanhã".
const heatMatcher = (weather) => weather.heatWaveBonus > 0;
const heatTomorrow = WeatherEngine.findNextEvent(
  new Date(2026, 7, 24),
  "beauclair",
  heatMatcher,
  30,
);
assert.equal(heatTomorrow.daysAhead, 1);
assert.equal(heatTomorrow.isActive, false);
const activeHeat = WeatherEngine.findNextEvent(
  new Date(2026, 7, 26),
  "beauclair",
  heatMatcher,
  30,
);
assert.equal(activeHeat.daysAhead, 0);
assert.equal(activeHeat.isActive, true);

// Em dias chuvosos de verão, as pancadas predominam no fim da tarde/noite.
let morningWetHours = 0;
let lateDayWetHours = 0;
for (let day = 0; day < 94; day += 1) {
  const date = new Date(2026, 5, 21 + day);
  const weather = WeatherEngine.getWeatherForDay(date, "beauclair");
  if (!/rain|storm/.test(weather.conditionKey)) continue;
  const hourly = WeatherEngine.getHourlyForecast(weather, "beauclair");
  morningWetHours += hourly
    .slice(6, 14)
    .filter((hour) => /rain|storm/.test(hour.conditionKey)).length;
  lateDayWetHours += hourly
    .slice(16, 22)
    .filter((hour) => /rain|storm/.test(hour.conditionKey)).length;
}
assert.ok(lateDayWetHours > morningWetHours, {
  morningWetHours,
  lateDayWetHours,
});

// A Lua deve avançar continuamente, sem saltos de três horas por mudança de fase.
const lunarTimes = [0, 1, 2, 3, 4].map(
  (offset) =>
    WeatherEngine.getWeatherForDay(new Date(2026, 7, 23 + offset), "beauclair")
      .moonrise,
);
const asMinutes = (clock) => {
  const [hours, minutes] = clock.split(":").map(Number);
  return hours * 60 + minutes;
};
for (let index = 1; index < lunarTimes.length; index += 1) {
  const delta =
    (asMinutes(lunarTimes[index]) - asMinutes(lunarTimes[index - 1]) + 1440) %
    1440;
  assert.ok(
    delta >= 35 && delta <= 65,
    `${lunarTimes[index - 1]} → ${lunarTimes[index]}`,
  );
}

// Consultar outro ano não pode alterar uma previsão horária já determinada.
const hourlyBefore = JSON.stringify(
  WeatherEngine.getHourlyForecast(
    WeatherEngine.getWeatherForDay(new Date(2026, 7, 23), "beauclair"),
    "beauclair",
  ),
);
WeatherEngine.getWeatherForDay(new Date(2032, 0, 1), "beauclair");
const hourlyAfter = JSON.stringify(
  WeatherEngine.getHourlyForecast(
    WeatherEngine.getWeatherForDay(new Date(2026, 7, 23), "beauclair"),
    "beauclair",
  ),
);
assert.equal(hourlyAfter, hourlyBefore);

console.log("Motor climático: todos os testes passaram.");
