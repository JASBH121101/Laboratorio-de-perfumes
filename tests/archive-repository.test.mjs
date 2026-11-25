import test from "node:test";
import assert from "node:assert/strict";
import { createArchiveRepository } from "../src/js/features/archive/repository.js";
import { createArchiveCreation } from "../src/js/features/archive/model.js";

function memoryStorage() {
  const data = new Map();
  return {
    getItem(key) { return data.has(key) ? data.get(key) : null; },
    setItem(key, value) { data.set(key, String(value)); },
    removeItem(key) { data.delete(key); }
  };
}

function sample(id) {
  return createArchiveCreation({ name: `Creación ${id}`, id, now: "2026-11-25T12:00:00.000Z" });
}

test("localStorage fallback supports create, list, get, update and remove", async () => {
  const repository = createArchiveRepository({ indexedDBApi: null, storage: memoryStorage() });
  const first = sample("local-a");
  await repository.put(first);
  assert.equal((await repository.list()).length, 1);
  assert.equal((await repository.get(first.id)).name, "Creación local-a");
  const updated = { ...first, name: "Renombrada" };
  await repository.put(updated);
  assert.equal((await repository.list())[0].name, "Renombrada");
  await repository.remove(first.id);
  assert.deepEqual(await repository.list(), []);
});

test("localStorage fallback imports multiple records in one operation", async () => {
  const repository = createArchiveRepository({ indexedDBApi: null, storage: memoryStorage() });
  await repository.putMany([sample("local-a"), sample("local-b")]);
  assert.deepEqual((await repository.list()).map((item) => item.id).sort(), ["local-a", "local-b"]);
});

test("localStorage fallback can clear all stored creations", async () => {
  const storage = memoryStorage();
  const repository = createArchiveRepository({ indexedDBApi: null, storage });
  await repository.putMany([sample("local-a"), sample("local-b")]);
  await repository.clear();
  assert.deepEqual(await repository.list(), []);
});
