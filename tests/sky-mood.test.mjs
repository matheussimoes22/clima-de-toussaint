import assert from "node:assert/strict";
import { skyMood } from "../assets/js/views/sky-atmosphere.js";
import { solarPosition } from "../assets/js/views/sky-sun.js";
assert.equal(skyMood({ conditionKey: "hot_day" }), "heat");
assert.equal(skyMood({ conditionKey: "clear_day" }), "day");
assert.equal(
  skyMood({ conditionKey: "storm_day", currentTemp: 35, heatWaveBonus: 5 }),
  "muted",
);
assert.equal(
  skyMood({ conditionKey: "clear_night", currentTemp: 35, heatWaveBonus: 5 }),
  "night",
);
assert.equal(solarPosition(720, 300, 1140).x, 50);
assert.equal(solarPosition(720, 300, 1140).y, 15);
assert.equal(solarPosition(1141, 300, 1140).visible, false);
console.log("Cenários diurnos, calor e arco solar passaram.");
