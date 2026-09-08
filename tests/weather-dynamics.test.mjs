import assert from "node:assert/strict";
import { WeatherEngine } from "../assets/js/engine/weather-engine.js";
import { LOCATIONS } from "../assets/js/data/world-data.js";
import {
  eventHours,
  findWeatherEvent,
  affectedAreas,
} from "../assets/js/engine/weather-events.js";
import {
  formatEventHours,
  bulletinCopy,
} from "../assets/js/views/bulletin-copy.js";
import { swipeDirection } from "../assets/js/navigation/calendar-swipe.js";

const keys = [
  "heat",
  "cold",
  "front",
  "storm",
  "rain",
  "wind",
  "fog",
  "snow",
  "blood",
];
const seen = new Set();
const report = {};
let exceptionalHotNights = 0;
for (const loc of Object.keys(LOCATIONS)) {
  let dry = 0,
    maxDry = 0,
    wetDays = 0,
    morning = 0,
    evening = 0;
  for (let offset = 0; offset < 365; offset++) {
    const date = new Date(2026, 0, offset + 1);
    const day = WeatherEngine.getWeatherForDay(date, loc);
    const hourly = WeatherEngine.getHourlyForecast(day, loc);
    assert.equal(hourly.length, 24);
    const total = hourly.reduce((sum, h) => sum + h.precipAmountMm, 0);
    assert.ok(
      Math.abs(total - day.precipAmountMm) < 0.011,
      `${loc} volume diário ${total}/${day.precipAmountMm}`,
    );
    assert.ok(Math.min(...hourly.map((h) => h.temp)) === day.tempMin);
    assert.ok(Math.max(...hourly.map((h) => h.temp)) === day.tempMax);
    dry = total > 0 ? 0 : dry + 1;
    maxDry = Math.max(dry, maxDry);
    wetDays += total > 0;
    for (const [h, hour] of hourly.entries()) {
      assert.equal(hour.precipitationOccurs, hour.precipAmountMm > 0);
      assert.equal(
        /rain|storm|snow/.test(hour.conditionKey),
        hour.precipitationOccurs,
      );
      assert.ok(Number.isFinite(hour.temp) && Number.isFinite(hour.humidity));
      assert.ok(hour.humidity >= 10 && hour.humidity <= 100);
      if (day.seasonKey === "summer" && hour.isNight && hour.temp >= 30) {
        exceptionalHotNights++;
        assert.ok(
          day.heatWaveBonus >= 4,
          `${loc} ${date.toISOString()}: noite quente sem onda intensa`,
        );
        assert.ok(
          eventHours("heat", date, loc).hours.some(
            (eventHour) => eventHour.hour === hour.hour,
          ),
          `${loc} ${date.toISOString()}: noite excepcional sem alerta`,
        );
      }
      if (h > 0) {
        assert.ok(
          !(
            hour.conditionKey.includes("storm") &&
            /clear|cloudy/.test(hourly[h - 1].conditionKey)
          ),
          "Tempestade sem formação prévia",
        );
        assert.ok(
          Math.abs(hour.temp - hourly[h - 1].temp) <= 6,
          "Salto térmico horário",
        );
      }
    }
    if (day.seasonKey === "summer") {
      morning += hourly
        .slice(6, 14)
        .filter((h) => h.precipitationOccurs).length;
      evening += hourly
        .slice(16, 22)
        .filter((h) => h.precipitationOccurs).length;
    }
    // Uma região e todas as datas cobrem ocorrência, expiração e todos os fenômenos.
    if (loc !== "beauclair") continue;
    for (const key of keys) {
      const occurrence = eventHours(key, date, loc);
      if (!occurrence.hours.length) continue;
      seen.add(key);
      const now = new Date(date);
      now.setHours(parseInt(occurrence.hours[0].hour));
      const found = findWeatherEvent(key, now, loc, 0);
      assert.ok(found?.isActive, key);
      const later = new Date(date);
      later.setHours(parseInt(occurrence.hours.at(-1).hour) + 1);
      if (later.getDate() === date.getDate())
        assert.equal(
          findWeatherEvent(key, later, loc, 0),
          null,
          `${key}: evento expirado`,
        );
      if (offset % 7 === 0) {
        for (const region of affectedAreas(key, date, occurrence.hours)) {
          assert.ok(
            eventHours(key, date, region).hours.some((h) =>
              occurrence.hours.some((other) => other.hour === h.hour),
            ),
          );
        }
      }
    }
  }
  assert.ok(maxDry < 30, `${loc}: estiagem ${maxDry}`);
  assert.ok(wetDays < 240, `${loc}: chuva excessiva ${wetDays}`);
  if (loc === "beauclair")
    assert.ok(evening > morning, `${loc}: manhã ${morning}, tarde ${evening}`);
  report[loc] = { wetDays, maxDry, morning, evening };
}
assert.ok(exceptionalHotNights > 0, "A simulação perdeu noites extremas raras");
assert.ok(
  seen.has("heat") &&
    seen.has("storm") &&
    seen.has("rain") &&
    seen.has("front"),
);
// O status de calor não acompanha uma noite amena apenas por pertencer ao mesmo dia.
assert.equal(
  findWeatherEvent("heat", new Date(2026, 7, 26, 2), "beauclair", 0)
    ?.isActive ?? false,
  false,
);
// Histórico futuro/consultas em ordem inversa não modificam a simulação.
const before = WeatherEngine.getCurrentWeather(
  new Date(2026, 7, 26, 17),
  "beauclair",
);
WeatherEngine.getCurrentWeather(new Date(2032, 0, 1, 4), "belhaven");
assert.deepEqual(
  WeatherEngine.getCurrentWeather(new Date(2026, 7, 26, 17), "beauclair"),
  before,
);
const day = WeatherEngine.getWeatherForDay(new Date(2026, 7, 26), "beauclair");
const hour = WeatherEngine.getHourlyForecast(day, "beauclair")[17];
assert.equal(before.currentTemp, hour.temp);
assert.equal(before.conditionKey, hour.conditionKey);
assert.equal(before.precipAmountMm, hour.precipAmountMm);
assert.deepEqual(
  WeatherEngine.getHourlyForecast(before, "beauclair"),
  before.hourly,
);
assert.equal(
  formatEventHours([{ hour: "02:00" }, { hour: "03:00" }, { hour: "07:00" }]),
  "02:00–04:00 · 07:00–08:00",
);
for (const lang of ["pt", "en"])
  for (const key of keys) {
    const copy = bulletinCopy(key, day, [hour], "Beauclair", lang);
    assert.ok(!JSON.stringify(copy).includes("undefined"));
  }
assert.equal(swipeDirection(-90, 12, 350, 360), 1);
assert.equal(swipeDirection(90, 12, 350, 360), -1);
assert.equal(swipeDirection(-30, 5, 300, 360), 0);
assert.equal(swipeDirection(-90, 100, 350, 360), 0);
assert.equal(swipeDirection(-90, 10, 1500, 360), 0);
console.table(report);
console.log("Dinâmica, regiões, boletins, volumes e gestos: testes passaram.");
