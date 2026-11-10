import assert from "node:assert/strict";
import { solarCycle } from "../assets/js/views/solar-cycle.js";
for (const [rise, set] of [
  [300, 1230],
  [360, 1170],
]) {
  for (let minute = 0; minute < 1440; minute++) {
    const current = solarCycle(minute, rise, set);
    assert.ok(!/NaN|undefined/.test(current.background));
    if (minute > 0) {
      const before = solarCycle(minute - 1, rise, set);
      const a = current.background.match(/#[0-9a-f]{6}/g),
        b = before.background.match(/#[0-9a-f]{6}/g);
      for (let j = 0; j < 3; j++)
        for (const offset of [1, 3, 5])
          assert.ok(
            Math.abs(
              parseInt(a[j].slice(offset, offset + 2), 16) -
                parseInt(b[j].slice(offset, offset + 2), 16),
            ) <= 8,
          );
    }
  }
  assert.equal(solarCycle(set + 75, rise, set).label, "Noite");
}
console.log("Etapas solares: continuidade minuto a minuto passou.");
