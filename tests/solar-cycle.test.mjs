import assert from "node:assert/strict";
import { WeatherEngine as W } from "../assets/js/engine/weather-engine.js";
import { LOCATIONS } from "../assets/js/data/world-data.js";
for (const loc of Object.keys(LOCATIONS))
  for (const month of [0, 5, 10]) {
    const date = new Date(2026, month, 6);
    const day = W.getWeatherForDay(date, loc);
    for (const [minute, night] of [
      [day.sunriseMinutes - 1, true],
      [day.sunriseMinutes, false],
      [day.sunsetMinutes - 1, false],
      [day.sunsetMinutes, true],
      [day.sunsetMinutes + 1, true],
    ]) {
      const time = new Date(2026, month, 6, 0, minute);
      const w = W.getCurrentWeather(time, loc);
      assert.equal(w.conditionKey.endsWith("_night"), night, loc + " " + time);
      assert.equal(w.hourly[time.getHours()].conditionKey, w.conditionKey);
      assert.equal(w.hourly[time.getHours()].isNight, night);
      if (night) assert.equal(w.uvIndex, 0);
    }
  }
console.log("Ciclo solar por minuto: passou em todas as localidades.");
let wet = 0;
for (let i = 1; i <= 30; i++)
  wet += W.getWeatherForDay(new Date(2026, 10, i)).precipitationOccurs;
console.log({ novembroBeauclair: wet });
