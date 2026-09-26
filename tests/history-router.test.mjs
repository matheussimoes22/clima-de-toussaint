import assert from "node:assert/strict";

import {
  createHistoryState,
  getHistoryDepth,
  getInitialView,
  pushLayer,
  pushView,
} from "../assets/js/navigation/history-router.js";

const calls = [];
globalThis.window = {
  location: {
    href: "https://example.test/clima-de-toussaint.html",
    hash: "",
  },
};
globalThis.history = {
  state: createHistoryState("today"),
  pushState(state, _title, url) {
    this.state = state;
    calls.push({ method: "push", state, url });
  },
  replaceState(state, _title, url) {
    this.state = state;
    calls.push({ method: "replace", state, url });
  },
};

assert.equal(getInitialView("today", "#calendar"), "calendar");
assert.equal(getInitialView("inválida", "#inválida"), "today");

pushView("calendar", "today");
assert.equal(calls.at(-1).method, "push");
assert.equal(calls.at(-1).url, "/clima-de-toussaint.html#calendar");
assert.equal(calls.at(-1).state.depth, 1);
assert.equal(getHistoryDepth(calls.at(-1).state), 1);

pushLayer("calendar", "modal");
assert.equal(calls.at(-1).state.layer, "modal");
assert.equal(calls.at(-1).method, "push");
assert.equal(calls.at(-1).state.depth, 2);

pushView("moon", "calendar");
assert.equal(calls.at(-1).method, "replace");
assert.equal(calls.at(-1).state.layer, null);
assert.equal(calls.at(-1).state.depth, 2);

assert.equal(getHistoryDepth({ appId: "outro-app", depth: 99 }), 0);

console.log("Histórico de navegação: todos os testes passaram.");
