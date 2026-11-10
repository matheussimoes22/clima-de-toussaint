import assert from "node:assert/strict";
import { moonOrbit } from "../assets/js/views/sky-moon.js";
assert.equal(moonOrbit(1200, "20:00", "06:00").visible, true);
assert.equal(moonOrbit(1199, "20:00", "06:00").visible, false);
assert.equal(moonOrbit(360, "20:00", "06:00").visible, false);
const peak = moonOrbit(60, "20:00", "06:00");
assert.equal(peak.x, 50);
assert.equal(peak.y, 15);
assert.ok(moonOrbit(300, "20:00", "06:00").x > peak.x);
assert.equal(moonOrbit(600, "08:00", "18:00").visible, true);
assert.equal(moonOrbit(0, "bad", "06:00").visible, false);
console.log("Órbita lunar: horizonte, meia-noite e arco passaram.");

const setting = moonOrbit(359, "20:00", "06:00");
assert.equal(setting.fade, 1);
assert.ok(setting.y > 99);
assert.ok(setting.horizon > 0.99);
assert.equal(moonOrbit(360, "20:00", "06:00").y, 100);
