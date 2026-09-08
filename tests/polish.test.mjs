import assert from "node:assert/strict";
import { WeatherEngine as W } from "../assets/js/engine/weather-engine.js";
import { LOCATIONS, SEASONS } from "../assets/js/data/world-data.js";
import {
  eventHours,
  matchesEvent,
} from "../assets/js/engine/weather-events.js";
import { EventBulletinView } from "../assets/js/views/event-bulletins.js";
const report = [];
let summerNightHours = 0;
let hotSummerNightHours = 0;
for (const year of [2025, 2026, 2027, 2032]) {
  let worst = 0,
    total = 0,
    maxSummer = 0;
  for (const loc of Object.keys(LOCATIONS)) {
    let dry = 0,
      summerDry = 0;
    for (let i = 0; i < 365; i++) {
      const date = new Date(year, 0, i + 1),
        day = W.getWeatherForDay(date, loc);
      const rows = W.getHourlyForecast(day, loc);
      total += Number(day.precipitationOccurs);
      dry = day.precipitationOccurs ? 0 : dry + 1;
      worst = Math.max(worst, dry);
      summerDry =
        day.seasonKey === "summer" && !day.precipitationOccurs
          ? summerDry + 1
          : 0;
      maxSummer = Math.max(maxSummer, summerDry);
      assert.ok(
        Math.abs(
          rows.reduce((a, h) => a + h.precipAmountMm, 0) - day.precipAmountMm,
        ) < 0.011,
      );
      if (day.seasonKey === "summer") {
        const nightRows = rows.filter((hour) => hour.isNight);
        const exceptionalRows = nightRows.filter((hour) => hour.temp >= 30);
        summerNightHours += nightRows.length;
        hotSummerNightHours += exceptionalRows.length;
        for (const hour of exceptionalRows) {
          assert.ok(
            day.heatWaveBonus >= 4,
            `${loc} ${date.toISOString()} ${hour.hour}: ${hour.temp} °C, bônus ${day.heatWaveBonus}`,
          );
          assert.ok(
            eventHours("heat", date, loc).hours.some(
              (eventHour) => eventHour.hour === hour.hour,
            ),
            `${loc} ${date.toISOString()} ${hour.hour}: ${hour.temp} °C, máxima ${day.tempMax} °C, bônus ${day.heatWaveBonus}`,
          );
        }
      }
      if (i % 17 === 0) {
        const state = { currentLocation: loc, currentDate: date };
        const html = EventBulletinView.renderNextEventsPanel.call({
          state,
          eventDefs: EventBulletinView.eventDefs,
          dateKey: (d) => d.toISOString().slice(0, 10),
        });
        assert.ok((html.match(/data-event-key=/g) || []).length <= 2);
        for (const match of html.matchAll(/data-days-ahead="(\d+)"/g))
          assert.ok(Number(match[1]) <= 7);
      }
      if (loc === "beauclair") {
        const front = eventHours("front", date, loc);
        if (front.hours.length) {
          const previous = W.getWeatherForDay(new Date(year, 0, i), loc);
          const next = W.getWeatherForDay(new Date(year, 0, i + 2), loc);
          assert.ok(previous.tempMax - day.tempMax >= 5);
          assert.ok(previous.tempMax - next.tempMax >= 3);
        }
        const heat = eventHours("heat", date, loc);
        if (heat.hours.length)
          assert.ok(day.tempMax >= SEASONS[day.seasonKey].tempMax + 2);
      }
    }
  }
  report.push({
    year,
    maxDry: worst,
    maxSummerDry: maxSummer,
    wetDaysAverage: Math.round(total / 9),
  });
}
assert.ok(hotSummerNightHours > 0);
assert.ok(
  hotSummerNightHours / summerNightHours < 0.005,
  `${hotSummerNightHours}/${summerNightHours} horas noturnas de verão chegaram a 30 °C`,
);
const day = W.getWeatherForDay(new Date(2026, 7, 26), "beauclair");
assert.equal(
  matchesEvent(
    "front",
    day,
    { temp: 29, windSpeed: 30, cloudCover: 90 },
    { tempMax: 30 },
    "beauclair",
  ),
  false,
);
assert.equal(
  matchesEvent(
    "storm",
    day,
    {
      conditionKey: "storm_day",
      precipAmountMm: 0,
      humidity: 40,
      cloudCover: 0,
      windSpeed: 0,
    },
    day,
    "beauclair",
  ),
  false,
);
console.table(report);
console.log(
  "Coerência entre anos, volumes, classificação e limite dos boletins: passou.",
);
