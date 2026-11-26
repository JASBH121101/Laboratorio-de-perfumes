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
  assert.equal(repository.getStorageMode(), "localStorage");
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


test("localStorage fallback stores sensory experiments separately from formula creations", async () => {
  const storage = memoryStorage();
  const repository = createArchiveRepository({ indexedDBApi: null, storage });
  const experiment = {
    id: "sensory-1", creationId: "creation-1", title: "Papel secante",
    observedAt: "2026-11-26T01:00:00.000Z", updatedAt: "2026-11-26T01:00:00.000Z"
  };
  await repository.put(sample("creation-1"));
  await repository.putExperiment(experiment);
  assert.equal((await repository.list()).length, 1);
  assert.deepEqual(await repository.listExperiments(), [experiment]);
  await repository.removeExperiment("sensory-1");
  assert.deepEqual(await repository.listExperiments(), []);
});

test("sensory experiment storage supports bulk import and creation-linked cleanup", async () => {
  const repository = createArchiveRepository({ indexedDBApi: null, storage: memoryStorage() });
  await repository.putExperiments([
    { id: "s-a", creationId: "creation-a", observedAt: "2026-11-26T01:00:00.000Z" },
    { id: "s-b", creationId: "creation-b", observedAt: "2026-11-26T02:00:00.000Z" },
    { id: "s-c", creationId: "creation-a", observedAt: "2026-11-26T03:00:00.000Z" }
  ]);
  assert.equal((await repository.listExperiments()).length, 3);
  await repository.removeExperimentsForCreation("creation-a");
  assert.deepEqual((await repository.listExperiments()).map((item) => item.id), ["s-b"]);
  await repository.clearExperiments();
  assert.deepEqual(await repository.listExperiments(), []);
});

test("IndexedDB schema is upgraded without replacing the existing creations store", async () => {
  const { readFile } = await import("node:fs/promises");
  const source = await readFile(new URL("../src/js/features/archive/repository.js", import.meta.url), "utf8");
  assert.match(source, /const DB_VERSION = 2/);
  assert.match(source, /createObjectStore\(STORE_NAME, \{ keyPath: "id" \}\)/);
  assert.match(source, /createObjectStore\(EXPERIMENT_STORE, \{ keyPath: "id" \}\)/);
});
