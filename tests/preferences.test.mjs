import assert from "node:assert/strict";

import {
  readStoredChoice,
  readStoredInteger,
  readStoredJson,
  writeStoredValue,
} from "../assets/js/state/preferences.js";

function storage(values = {}) {
  return { getItem: (key) => values[key] ?? null };
}

assert.equal(
  readStoredInteger("month", 7, { min: 0, max: 11 }, storage({ month: "0" })),
  0,
);
assert.equal(
  readStoredInteger("month", 7, { min: 0, max: 11 }, storage({ month: "15" })),
  7,
);
assert.deepEqual(
  readStoredJson("diary", {}, storage({ diary: "{inválido" })),
  {},
);
assert.equal(
  readStoredChoice("lang", ["pt", "en"], "pt", storage({ lang: "fr" })),
  "pt",
);

const blockedStorage = {
  getItem: () => {
    throw new Error("blocked");
  },
  setItem: () => {
    throw new Error("blocked");
  },
};
assert.equal(readStoredInteger("month", 7, {}, blockedStorage), 7);
assert.equal(
  readStoredChoice("lang", ["pt", "en"], "pt", blockedStorage),
  "pt",
);
assert.equal(writeStoredValue("lang", "en", blockedStorage), false);

console.log("Preferências: todos os testes passaram.");
