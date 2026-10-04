import assert from "node:assert/strict";
import { bindCalendarSwipe } from "../assets/js/navigation/calendar-swipe.js";
import { MoonView } from "../assets/js/views/moon-view.js";
import { WeatherEngine } from "../assets/js/engine/weather-engine.js";
import { readFileSync } from "node:fs";
import { APP_VERSION } from "../assets/js/version.js";

globalThis.matchMedia = () => ({ matches: false });
let resize;
globalThis.ResizeObserver = class {
  constructor(fn) {
    resize = fn;
  }
  observe() {}
  disconnect() {}
};
let finish;
let changes = 0;
const viewport = { clientWidth: 360, isConnected: true, addEventListener() {} };
const track = {
  style: {},
  animate() {
    return {
      finished: new Promise((r) => {
        finish = r;
      }),
      cancel() {},
    };
  },
};
const swipe = bindCalendarSwipe(viewport, track, () => changes++);
viewport.clientWidth = 720;
resize();
assert.equal(track.style.transform, "translate3d(-720px, 0, 0)");
swipe.moveTo(1);
swipe.destroy();
finish();
await Promise.resolve();
assert.equal(
  changes,
  0,
  "animação encerrada não deve renderizar uma tela abandonada",
);

// A função real deve atravessar o fim da fase atual antes de anunciar a próxima.
const dates = [];
const ctx = {
  state: { currentDate: new Date(2026, 9, 6, 12), isElven: false },
  renderMoonSvg: () => "",
  formatDate: (d) => {
    dates.push(new Date(d));
    return "";
  },
  elements: { main: { innerHTML: "" } },
};
MoonView.renderMoon.call(ctx);
assert.equal(WeatherEngine.getLunarPhase(ctx.state.currentDate).index, 4);
assert.ok((dates[1] - ctx.state.currentDate) / 86400000 > 20);
const pkg = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url)),
);
assert.equal(pkg.version, APP_VERSION);
const gradle = readFileSync(
  new URL("../android/app/build.gradle", import.meta.url),
  "utf8",
);
assert.ok(gradle.includes(`versionName "${APP_VERSION}"`));
console.log("Patch 2.0.1: navegação, resize, ciclo lunar e versão passaram.");
