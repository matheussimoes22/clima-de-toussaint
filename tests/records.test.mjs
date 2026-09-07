import assert from "node:assert/strict";

import {
  loadRecords,
  observeTemperature,
  RECORDS_KEY,
  saveRecords,
  updateLocationRecord,
} from "../assets/js/state/records.js";

function createStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
  };
}

const migrated = loadRecords(
  createStorage({
    toussaintApp_records: JSON.stringify({ beauclair: { max: 40, min: -4 } }),
  }),
);
assert.equal(migrated.byLocation.beauclair.max.value, 40);
assert.equal(migrated.byLocation.beauclair.min.value, -4);
assert.equal(migrated.byLocation.beauclair.max.date, null);

const recovered = loadRecords(createStorage({ [RECORDS_KEY]: "{inválido" }));
assert.ok(recovered.byLocation.beauclair);

const records = loadRecords(createStorage());
const coronataBefore = structuredClone(records.byLocation.coronata);
assert.equal(
  updateLocationRecord(
    records,
    "beauclair",
    { tempMax: 41, tempMin: -2 },
    "2026-08-23",
  ),
  true,
);
assert.equal(records.byLocation.beauclair.max.value, 41);
assert.equal(records.byLocation.beauclair.max.date, "2026-08-23");
assert.deepEqual(records.byLocation.coronata, coronataBefore);

assert.equal(observeTemperature(records, "beauclair", 42, "2026-08-24"), true);
assert.equal(records.byLocation.beauclair.max.value, 42);
assert.equal(records.byLocation.beauclair.max.date, "2026-08-24");

updateLocationRecord(
  records,
  "beauclair",
  { tempMax: 42, tempMin: 2 },
  "2026-08-25",
);
assert.equal(records.byLocation.beauclair.max.date, "2026-08-24");

const persistedStorage = createStorage();
saveRecords(records, persistedStorage);
const restored = loadRecords(persistedStorage);
assert.equal(restored.byLocation.beauclair.max.value, 42);
assert.deepEqual(restored.byLocation.coronata, coronataBefore);

console.log("Recordes regionais: todos os testes passaram.");
