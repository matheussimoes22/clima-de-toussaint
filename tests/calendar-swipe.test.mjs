import assert from "node:assert/strict";
import { bindCalendarSwipe } from "../assets/js/navigation/calendar-swipe.js";

const original = globalThis.matchMedia;
let mobile = true;
globalThis.matchMedia = () => ({ matches: mobile });
const handlers = {};
const changes = [];
bindCalendarSwipe(
  {
    clientWidth: 360,
    addEventListener: (name, handler) => {
      handlers[name] = handler;
    },
  },
  (delta) => changes.push(delta),
);
const point = (x, y) => ({ clientX: x, clientY: y });
let prevented = false;
const begin = (x, y) => handlers.touchstart({ touches: [point(x, y)] });
const end = (x, y) =>
  handlers.touchend({
    changedTouches: [point(x, y)],
    preventDefault: () => {
      prevented = true;
    },
  });
begin(250, 100);
end(90, 105);
assert.deepEqual(changes, [1]);
assert.ok(prevented);
let blockedClick = false;
handlers.click({
  preventDefault() {},
  stopImmediatePropagation() {
    blockedClick = true;
  },
});
assert.ok(blockedClick);
begin(90, 100);
end(250, 105);
assert.deepEqual(changes, [1, -1]);
begin(250, 100);
handlers.touchmove({ touches: [point(240, 140)] });
end(90, 145);
assert.equal(changes.length, 2);
begin(250, 100);
handlers.touchcancel();
end(90, 100);
assert.equal(changes.length, 2);
begin(250, 100);
handlers.touchmove({ touches: [point(200, 100), point(100, 100)] });
end(90, 100);
assert.equal(changes.length, 2);
mobile = false;
begin(250, 100);
end(90, 100);
assert.equal(changes.length, 2);
globalThis.matchMedia = original;
console.log(
  "Gesto do calendário: direção, cancelamento, multitouch e clique passaram.",
);

// O mês muda após a saída; a entrada anima o novo grid.
const originalDocument = globalThis.document;
const animatedHandlers = {};
const style = {};
let finishExit;
let entries = 0;
let monthChanges = 0;
globalThis.matchMedia = (query) => ({ matches: query.includes("max-width") });
globalThis.document = {
  getElementById: () => ({
    animate() {
      entries++;
    },
  }),
};
const grid = {
  style,
  clientWidth: 390,
  isConnected: true,
  addEventListener(name, handler) {
    animatedHandlers[name] = handler;
  },
  animate() {
    return {
      finished: new Promise((resolve) => {
        finishExit = resolve;
      }),
    };
  },
};
bindCalendarSwipe(grid, () => {
  monthChanges++;
});
animatedHandlers.touchstart({ touches: [point(280, 100)] });
animatedHandlers.touchmove({ touches: [point(140, 105)] });
assert.match(style.transform, /translateX\(-/);
animatedHandlers.touchend({
  changedTouches: [point(130, 105)],
  preventDefault() {},
});
assert.equal(
  monthChanges,
  0,
  "Nao pode trocar o mes antes da animacao de saida",
);
finishExit();
await Promise.resolve();
assert.equal(monthChanges, 1);
assert.equal(entries, 1);
// Cancelamento por multitouch restaura a posicao sem navegar.
const cancelledHandlers = {};
bindCalendarSwipe(
  {
    style,
    clientWidth: 390,
    addEventListener(n, h) {
      cancelledHandlers[n] = h;
    },
  },
  () => {
    throw new Error("Navegacao indevida");
  },
);
cancelledHandlers.touchstart({ touches: [point(280, 100)] });
cancelledHandlers.touchmove({ touches: [point(140, 105)] });
cancelledHandlers.touchmove({ touches: [point(130, 105), point(150, 120)] });
assert.equal(style.transform, "");
globalThis.matchMedia = original;
globalThis.document = originalDocument;
console.log("Arraste, sequencia de animacoes e cancelamento visual: passaram.");
