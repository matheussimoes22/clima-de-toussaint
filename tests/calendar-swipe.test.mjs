import assert from "node:assert/strict";
import { bindCalendarSwipe } from "../assets/js/navigation/calendar-swipe.js";

const originalMatchMedia = globalThis.matchMedia;
let mobile = true;
let reducedMotion = true;
globalThis.matchMedia = (query) => ({
  matches: query.includes("max-width") ? mobile : reducedMotion,
});

const point = (x, y) => ({ clientX: x, clientY: y });
const handlers = {};
const track = { style: {} };
const changes = [];
const viewport = {
  clientWidth: 360,
  addEventListener(name, handler) {
    handlers[name] = handler;
  },
};

const controller = bindCalendarSwipe(viewport, track, (delta) =>
  changes.push(delta),
);
assert.match(track.style.transform, /translate3d\(-360px/);

handlers.touchstart({ touches: [point(280, 100)] });
let movePrevented = false;
handlers.touchmove({
  touches: [point(150, 104)],
  preventDefault() {
    movePrevented = true;
  },
});
assert.ok(movePrevented, "o arraste horizontal deve assumir o gesto");
assert.match(
  track.style.transform,
  /-490px/,
  "o trilho deve acompanhar o dedo e revelar o mes seguinte",
);
let endPrevented = false;
handlers.touchend({
  changedTouches: [point(130, 104)],
  preventDefault() {
    endPrevented = true;
  },
});
assert.deepEqual(changes, [1]);
assert.ok(endPrevented);

let blockedClick = false;
handlers.click({
  preventDefault() {},
  stopImmediatePropagation() {
    blockedClick = true;
  },
});
assert.ok(blockedClick, "o toque que navegou nao pode abrir um dia");

handlers.touchstart({ touches: [point(90, 100)] });
handlers.touchend({
  changedTouches: [point(260, 105)],
  preventDefault() {},
});
assert.deepEqual(changes, [1, -1]);

handlers.touchstart({ touches: [point(260, 100)] });
handlers.touchmove({
  touches: [point(250, 150)],
  preventDefault() {
    throw new Error("rolagem vertical nao deve ser bloqueada");
  },
});
handlers.touchend({
  changedTouches: [point(80, 150)],
  preventDefault() {},
});
assert.equal(changes.length, 2);
assert.match(track.style.transform, /translate3d\(-360px/);

handlers.touchstart({ touches: [point(260, 100)] });
handlers.touchmove({
  touches: [point(200, 100), point(100, 100)],
  preventDefault() {},
});
assert.match(track.style.transform, /translate3d\(-360px/);

mobile = false;
handlers.touchstart({ touches: [point(260, 100)] });
handlers.touchend({
  changedTouches: [point(80, 100)],
  preventDefault() {},
});
assert.equal(changes.length, 2);

mobile = true;
controller.moveTo(1);
assert.deepEqual(changes, [1, -1, 1]);
let blockedAfterToolbar = false;
handlers.click({
  preventDefault() {},
  stopImmediatePropagation() {
    blockedAfterToolbar = true;
  },
});
assert.equal(
  blockedAfterToolbar,
  false,
  "navegar pelos botoes nao pode bloquear o proximo card",
);

// Com movimento normal, a troca acontece somente após o trilho chegar à lateral.
reducedMotion = false;
const animatedHandlers = {};
const animatedTrack = {
  style: {},
  frames: null,
  animate(frames) {
    this.frames = frames;
    return {
      finished: new Promise((resolve) => {
        this.finish = resolve;
      }),
    };
  },
};
let animatedChanges = 0;
const animatedViewport = {
  clientWidth: 390,
  addEventListener(name, handler) {
    animatedHandlers[name] = handler;
  },
};
bindCalendarSwipe(animatedViewport, animatedTrack, () => {
  animatedChanges++;
});
animatedHandlers.touchstart({ touches: [point(280, 100)] });
animatedHandlers.touchmove({
  touches: [point(130, 105)],
  preventDefault() {},
});
assert.match(animatedTrack.style.transform, /-540px/);
animatedHandlers.touchend({
  changedTouches: [point(120, 105)],
  preventDefault() {},
});
assert.equal(animatedChanges, 0);
assert.equal(
  "opacity" in animatedTrack.frames[0],
  false,
  "o mes nao deve sumir durante a transicao",
);
assert.match(animatedTrack.frames[1].transform, /-780px/);
animatedTrack.finish();
await Promise.resolve();
assert.equal(animatedChanges, 1);

globalThis.matchMedia = originalMatchMedia;
console.log(
  "Calendario: mes vizinho acompanha o dedo, cancelamentos e troca animada passaram.",
);
