const DB_NAME = "jb-virtual-perfume-lab";
const DB_VERSION = 3;
const STORE_NAME = "creations";
const EXPERIMENT_STORE = "sensory-experiments";
const PROFILE_STORE = "creative-profiles";
const FALLBACK_KEY = "jb-vpl-archive-v1";
const EXPERIMENTS_FALLBACK_KEY = "jb-vpl-sensory-experiments-v1";
const PROFILES_FALLBACK_KEY = "jb-vpl-creative-profiles-v1";

function requestResult(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Falló una operación del archivo local."));
  });
}

function transactionFinished(transaction) {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onabort = () => reject(transaction.error || new Error("La operación local fue cancelada."));
    transaction.onerror = () => reject(transaction.error || new Error("Falló la transacción local."));
  });
}

function readFallback(storage, key) {
  const raw = storage.getItem(key);
  if (!raw) return [];
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed : [];
}

function writeFallback(storage, key, records) {
  storage.setItem(key, JSON.stringify(records));
}

export function createArchiveRepository({
  indexedDBApi = globalThis.indexedDB,
  storage = globalThis.localStorage
} = {}) {
  let databasePromise = null;
  let fallbackRequired = !indexedDBApi;

  async function openDatabase() {
    if (fallbackRequired) return null;
    if (!databasePromise) {
      databasePromise = new Promise((resolve, reject) => {
        const request = indexedDBApi.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = () => {
          const database = request.result;
          if (!database.objectStoreNames.contains(STORE_NAME)) database.createObjectStore(STORE_NAME, { keyPath: "id" });
          if (!database.objectStoreNames.contains(EXPERIMENT_STORE)) database.createObjectStore(EXPERIMENT_STORE, { keyPath: "id" });
          if (!database.objectStoreNames.contains(PROFILE_STORE)) database.createObjectStore(PROFILE_STORE, { keyPath: "id" });
        };
        request.onsuccess = () => {
          const database = request.result;
          database.onversionchange = () => database.close();
          resolve(database);
        };
        request.onerror = () => reject(request.error || new Error("No se pudo abrir el archivo local."));
        request.onblocked = () => reject(new Error("Cerrá otras pestañas del laboratorio para actualizar el archivo local."));
      }).catch(() => {
        fallbackRequired = true;
        databasePromise = Promise.resolve(null);
        return null;
      });
    }
    return databasePromise;
  }

  async function list() {
    const database = await openDatabase();
    if (!database) return readFallback(storage, FALLBACK_KEY).sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
    const transaction = database.transaction(STORE_NAME, "readonly");
    const finished = transactionFinished(transaction);
    const result = await requestResult(transaction.objectStore(STORE_NAME).getAll());
    await finished;
    return result.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
  }

  async function get(id) {
    const database = await openDatabase();
    if (!database) return readFallback(storage, FALLBACK_KEY).find((creation) => creation.id === id) ?? null;
    const transaction = database.transaction(STORE_NAME, "readonly");
    const finished = transactionFinished(transaction);
    const result = await requestResult(transaction.objectStore(STORE_NAME).get(id));
    await finished;
    return result ?? null;
  }

  async function put(creation) {
    const database = await openDatabase();
    if (!database) {
      const creations = readFallback(storage, FALLBACK_KEY);
      const index = creations.findIndex((item) => item.id === creation.id);
      if (index >= 0) creations[index] = creation; else creations.push(creation);
      writeFallback(storage, FALLBACK_KEY, creations);
      return creation;
    }
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).put(creation);
    await transactionFinished(transaction);
    return creation;
  }

  async function putMany(creations) {
    const database = await openDatabase();
    if (!database) {
      const current = readFallback(storage, FALLBACK_KEY);
      const map = new Map(current.map((item) => [item.id, item]));
      for (const creation of creations) map.set(creation.id, creation);
      writeFallback(storage, FALLBACK_KEY, [...map.values()]);
      return;
    }
    const transaction = database.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    for (const creation of creations) store.put(creation);
    await transactionFinished(transaction);
  }

  async function remove(id) {
    const database = await openDatabase();
    if (!database) {
      writeFallback(storage, FALLBACK_KEY, readFallback(storage, FALLBACK_KEY).filter((item) => item.id !== id));
      return;
    }
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).delete(id);
    await transactionFinished(transaction);
  }

  async function clear() {
    const database = await openDatabase();
    if (!database) {
      storage.removeItem(FALLBACK_KEY);
      return;
    }
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).clear();
    await transactionFinished(transaction);
  }

  async function listExperiments() {
    const database = await openDatabase();
    if (!database) return readFallback(storage, EXPERIMENTS_FALLBACK_KEY)
      .sort((a, b) => String(b.observedAt).localeCompare(String(a.observedAt)));
    const transaction = database.transaction(EXPERIMENT_STORE, "readonly");
    const finished = transactionFinished(transaction);
    const result = await requestResult(transaction.objectStore(EXPERIMENT_STORE).getAll());
    await finished;
    return result.sort((a, b) => String(b.observedAt).localeCompare(String(a.observedAt)));
  }

  async function putExperiment(experiment) {
    const database = await openDatabase();
    if (!database) {
      const records = readFallback(storage, EXPERIMENTS_FALLBACK_KEY);
      const index = records.findIndex((item) => item.id === experiment.id);
      if (index >= 0) records[index] = experiment; else records.push(experiment);
      writeFallback(storage, EXPERIMENTS_FALLBACK_KEY, records);
      return experiment;
    }
    const transaction = database.transaction(EXPERIMENT_STORE, "readwrite");
    transaction.objectStore(EXPERIMENT_STORE).put(experiment);
    await transactionFinished(transaction);
    return experiment;
  }

  async function putExperiments(experiments) {
    const database = await openDatabase();
    if (!database) {
      const current = readFallback(storage, EXPERIMENTS_FALLBACK_KEY);
      const map = new Map(current.map((item) => [item.id, item]));
      for (const experiment of experiments) map.set(experiment.id, experiment);
      writeFallback(storage, EXPERIMENTS_FALLBACK_KEY, [...map.values()]);
      return;
    }
    const transaction = database.transaction(EXPERIMENT_STORE, "readwrite");
    const store = transaction.objectStore(EXPERIMENT_STORE);
    for (const experiment of experiments) store.put(experiment);
    await transactionFinished(transaction);
  }

  async function removeExperiment(id) {
    const database = await openDatabase();
    if (!database) {
      writeFallback(storage, EXPERIMENTS_FALLBACK_KEY, readFallback(storage, EXPERIMENTS_FALLBACK_KEY).filter((item) => item.id !== id));
      return;
    }
    const transaction = database.transaction(EXPERIMENT_STORE, "readwrite");
    transaction.objectStore(EXPERIMENT_STORE).delete(id);
    await transactionFinished(transaction);
  }

  async function removeExperimentsForCreation(creationId) {
    const records = await listExperiments();
    const remaining = records.filter((item) => item.creationId !== creationId);
    const database = await openDatabase();
    if (!database) {
      writeFallback(storage, EXPERIMENTS_FALLBACK_KEY, remaining);
      return;
    }
    const transaction = database.transaction(EXPERIMENT_STORE, "readwrite");
    const store = transaction.objectStore(EXPERIMENT_STORE);
    for (const record of records) if (record.creationId === creationId) store.delete(record.id);
    await transactionFinished(transaction);
  }

  async function clearExperiments() {
    const database = await openDatabase();
    if (!database) {
      storage.removeItem(EXPERIMENTS_FALLBACK_KEY);
      return;
    }
    const transaction = database.transaction(EXPERIMENT_STORE, "readwrite");
    transaction.objectStore(EXPERIMENT_STORE).clear();
    await transactionFinished(transaction);
  }

  async function listProfiles() {
    const database = await openDatabase();
    if (!database) return readFallback(storage, PROFILES_FALLBACK_KEY)
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    const transaction = database.transaction(PROFILE_STORE, "readonly");
    const finished = transactionFinished(transaction);
    const result = await requestResult(transaction.objectStore(PROFILE_STORE).getAll());
    await finished;
    return result.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  }

  async function putProfile(profile) {
    const database = await openDatabase();
    if (!database) {
      const records = readFallback(storage, PROFILES_FALLBACK_KEY);
      const index = records.findIndex((item) => item.id === profile.id);
      if (index >= 0) records[index] = profile; else records.push(profile);
      writeFallback(storage, PROFILES_FALLBACK_KEY, records);
      return profile;
    }
    const transaction = database.transaction(PROFILE_STORE, "readwrite");
    transaction.objectStore(PROFILE_STORE).put(profile);
    await transactionFinished(transaction);
    return profile;
  }

  async function removeProfile(id) {
    const database = await openDatabase();
    if (!database) {
      writeFallback(storage, PROFILES_FALLBACK_KEY, readFallback(storage, PROFILES_FALLBACK_KEY).filter((item) => item.id !== id));
      return;
    }
    const transaction = database.transaction(PROFILE_STORE, "readwrite");
    transaction.objectStore(PROFILE_STORE).delete(id);
    await transactionFinished(transaction);
  }

  async function clearProfiles() {
    const database = await openDatabase();
    if (!database) {
      storage.removeItem(PROFILES_FALLBACK_KEY);
      return;
    }
    const transaction = database.transaction(PROFILE_STORE, "readwrite");
    transaction.objectStore(PROFILE_STORE).clear();
    await transactionFinished(transaction);
  }

  return {
    list, get, put, putMany, remove, clear,
    listExperiments, putExperiment, putExperiments, removeExperiment, removeExperimentsForCreation, clearExperiments,
    listProfiles, putProfile, removeProfile, clearProfiles,
    getStorageMode: () => fallbackRequired ? "localStorage" : "IndexedDB"
  };
}
