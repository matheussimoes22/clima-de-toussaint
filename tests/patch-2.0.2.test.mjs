import assert from "node:assert/strict";
import {
  readStoredChoice,
  readStoredInteger,
  readStoredJson,
  writeStoredValue,
} from "../assets/js/state/preferences.js";
import { loadRecords, saveRecords } from "../assets/js/state/records.js";
import { bindCalendarSwipe } from "../assets/js/navigation/calendar-swipe.js";
import {
  WeatherEngine,
  isBloodMoonVisible,
} from "../assets/js/engine/weather-engine.js";
import { setCurrentLanguage } from "../assets/js/i18n/translations.js";
import { LOCATIONS } from "../assets/js/data/world-data.js";
import { TodayView } from "../assets/js/views/today-view.js";

// O getter pode lançar antes mesmo de getItem: inicialização precisa sobreviver.
Object.defineProperty(globalThis, "localStorage", {
  configurable: true,
  get() {
    throw new Error("SecurityError");
  },
});
assert.equal(readStoredChoice("lang", ["pt", "en"], "pt"), "pt");
assert.equal(readStoredInteger("month", 9), 9);
assert.deepEqual(readStoredJson("diary", {}), {});
assert.equal(writeStoredValue("lang", "en"), false);
const initialRecords = loadRecords();
assert.ok(initialRecords.byLocation.beauclair);
assert.equal(saveRecords(initialRecords), false);

function element() {
  const classes = new Set();
  return {
    innerHTML: "",
    textContent: "",
    scrollTop: 0,
    inert: false,
    addEventListener() {},
    setAttribute() {},
    removeAttribute() {},
    focus() {},
    classList: {
      contains: (c) => classes.has(c),
      add: (c) => classes.add(c),
      remove: (c) => classes.delete(c),
      toggle(c, on) {
        if (on) classes.add(c);
        else classes.delete(c);
      },
    },
  };
}
const dom = new Map();
globalThis.document = {
  getElementById(id) {
    if (!dom.has(id)) dom.set(id, element());
    return dom.get(id);
  },
  querySelectorAll: () => [],
  body: { children: [] },
  activeElement: element(),
};
globalThis.window = {
  location: { href: "https://example.test/clima-de-toussaint.html", hash: "" },
};
let pushes = 0,
  backs = 0;
globalThis.history = {
  state: null,
  pushState(s) {
    this.state = s;
    pushes++;
  },
  replaceState(s) {
    this.state = s;
  },
  back() {
    backs++;
  },
};
globalThis.matchMedia = () => ({ matches: false });
const { App } = await import("../assets/js/app/app-controller.js");
Object.defineProperty(globalThis, "localStorage", {
  configurable: true,
  value: { getItem: () => null, setItem() {} },
});

// A mesma data civil não pode mudar de dia élfico conforme a hora local.
const previousTimezone = process.env.TZ;
try {
  for (const zone of [
    "America/New_York",
    "Europe/Lisbon",
    "America/Sao_Paulo",
  ]) {
    process.env.TZ = zone;
    for (let i = 0; i < 365; i++) {
      const midnight = new Date(2026, 0, i + 1);
      const noon = new Date(midnight);
      noon.setHours(12);
      assert.deepEqual(
        App.getElvenData(midnight),
        App.getElvenData(noon),
        `${zone}: ${midnight}`,
      );
    }
  }
} finally {
  if (previousTimezone === undefined) delete process.env.TZ;
  else process.env.TZ = previousTimezone;
}

// Avançar deve reconstruir o dia em inglês, sem acrescentar entrada no histórico.
setCurrentLanguage("pt");
const ctx = {
  ...App,
  state: {
    ...App.state,
    currentView: "calendar",
    currentDate: new Date(2026, 9, 31, 12),
  },
  elements: {
    ...App.elements,
    modal: element(),
    modalClose: element(),
    modalBody: element(),
    modalTitle: element(),
    navButtons: [],
  },
  render() {},
};
ctx.openDayModal(new Date(2026, 9, 9));
const savedState = structuredClone(history.state);
assert.equal(savedState.detail.date, "2026-10-09");
ctx.setModalOpen(false);
setCurrentLanguage("en");
const beforeRestore = pushes;
ctx.applyHistoryState(savedState);
assert.match(ctx.elements.modalTitle.textContent, /October/);
assert.match(ctx.elements.modalBody.innerHTML, /Sunny/);
assert.doesNotMatch(ctx.elements.modalBody.innerHTML, /Ensolarado|Previsão/);
assert.equal(pushes, beforeRestore);

// Navegar durante um fechamento pendente não pode disparar history.back depois.
let finishClose;
ctx.animateDayModalToSource = () =>
  new Promise((resolve) => {
    finishClose = resolve;
  });
ctx.closeModal();
ctx.navigate("moon", { historyMode: "none" });
finishClose();
await Promise.resolve();
await Promise.resolve();
assert.equal(backs, 0);
assert.equal(ctx.state.currentView, "moon");

// Fechar interrompe também as animações internas, não só a caixa externa.
let cancellations = 0;
const animation = () => ({
  cancel() {
    cancellations++;
  },
});
ctx._modalAnimation = animation();
ctx._modalRevealAnimations = [animation(), animation()];
ctx._sourceAnimation = animation();
ctx.setModalOpen(false);
assert.equal(cancellations, 4);

// Toques intermediários não devem alcançar os dias do mês de saída.
const handlers = {};
let finishMonth;
const viewport = {
  clientWidth: 360,
  isConnected: true,
  addEventListener(n, fn) {
    handlers[n] = fn;
  },
};
const track = {
  style: {},
  animate() {
    return {
      finished: new Promise((r) => {
        finishMonth = r;
      }),
      cancel() {},
    };
  },
};
let monthChanges = 0;
const swipe = bindCalendarSwipe(viewport, track, () => monthChanges++);
swipe.moveTo(1);
assert.equal(viewport.inert, true);
let blocked = false;
handlers.click({
  preventDefault() {
    blocked = true;
  },
  stopImmediatePropagation() {},
});
assert.ok(blocked);
finishMonth();
await Promise.resolve();
assert.equal(viewport.inert, false);
assert.equal(monthChanges, 1);
swipe.destroy();

// Renderização real da tela Hoje deve obedecer ao mesmo critério dos ícones.
setCurrentLanguage("pt");
const timeout = globalThis.setTimeout;
globalThis.setTimeout = () => 0;
try {
  const date = new Date(2028, 10, 12, 1);
  const render = (location) => {
    const view = {
      ...App,
      state: {
        ...App.state,
        currentDate: date,
        currentLocation: location,
        isElven: false,
      },
      elements: { main: element() },
      updateRecords() {},
      renderNextEventsPanel: () => "",
      renderDetailCard: () => "",
      applyStaticTranslations() {},
    };
    TodayView.renderToday.call(view);
    return view.elements.main.innerHTML;
  };
  const cloudy = WeatherEngine.getCurrentWeather(date, "monte_gorgona");
  assert.equal(cloudy.conditionKey, "fog_night");
  assert.equal(cloudy.moon.isBloodMoon, true);
  assert.doesNotMatch(render("monte_gorgona"), /Eclipse Lunar: Lua de Sangue/);
  const clear = Object.keys(LOCATIONS).find((key) => {
    const w = WeatherEngine.getCurrentWeather(date, key);
    return isBloodMoonVisible(w.conditionKey, 1, w.moon.isBloodMoon);
  });
  assert.ok(clear);
  assert.match(render(clear), /Eclipse Lunar: Lua de Sangue/);
} finally {
  globalThis.setTimeout = timeout;
}

// Um aviso dispensado não volta ao trocar o idioma; um novo dia pode avisar.
let alerts = 0;
const alertHost = {
  insertAdjacentHTML() {
    alerts++;
  },
};
dom.set("mobile-alert-container", alertHost);
const alertCtx = {
  ...App,
  state: {
    ...App.state,
    currentDate: new Date(2026, 9, 31),
    currentLocation: "beauclair",
  },
  elements: { desktopAlert: alertHost },
  _dismissedAlerts: new Set([
    encodeURIComponent("2026-10-31:beauclair:holiday:11-1"),
  ]),
};
alertCtx.renderAlert("Tomorrow: Saovine", "info", "holiday:11-1");
assert.equal(alerts, 0);
alertCtx.state.currentDate = new Date(2026, 10, 1);
alertCtx.renderAlert("Outro aviso", "info", "holiday:11-1");
assert.equal(alerts, 2);
console.log(
  "Patch 2.0.2: storage bloqueado, fusos, histórico, animações, toques, Lua de Sangue e avisos passaram.",
);
