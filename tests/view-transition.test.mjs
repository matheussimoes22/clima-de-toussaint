import assert from "node:assert/strict";
import { animateViewEntry } from "../assets/js/navigation/view-transition.js";
let reduced = false,
  cancelled = 0,
  started = 0;
globalThis.matchMedia = () => ({ matches: reduced });
const main = {
  classList: { remove() {}, add() {} },
  animate(frames, options) {
    started++;
    assert.equal(frames[0].opacity, 0);
    assert.equal(options.duration, 450);
    return {
      cancel() {
        cancelled++;
      },
    };
  },
};
let animation = animateViewEntry(main);
animation = animateViewEntry(main, animation);
assert.equal(started, 2);
assert.equal(cancelled, 1);
reduced = true;
assert.equal(animateViewEntry(main, animation), null);
assert.equal(started, 2);
assert.equal(cancelled, 2);
console.log("Transição: reinício, cancelamento e movimento reduzido passaram.");
