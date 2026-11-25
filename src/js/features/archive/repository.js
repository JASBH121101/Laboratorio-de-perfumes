const DB_NAME = "jb-virtual-perfume-lab";
const DB_VERSION = 1;
const STORE_NAME = "creations";
const FALLBACK_KEY = "jb-vpl-archive-v1";

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

function readFallback(storage) {
  const raw = storage.getItem(FALLBACK_KEY);
  if (!raw) return [];
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed : [];
}

function writeFallback(storage, creations) {
  storage.setItem(FALLBACK_KEY, JSON.stringify(creations));
}

export function createArchiveRepository({
  indexedDBApi = globalThis.indexedDB,
  storage = globalThis.localStorage
} = {}) {
  let databasePromise = null;

  async function openDatabase() {
    if (!indexedDBApi) return null;
    if (!databasePromise) {
      databasePromise = new Promise((resolve, reject) => {
        const request = indexedDBApi.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = () => {
          const database = request.result;
          if (!database.objectStoreNames.contains(STORE_NAME)) {
            database.createObjectStore(STORE_NAME, { keyPath: "id" });
          }
        };
        request.onsuccess = () => {
          const database = request.result;
          database.onversionchange = () => database.close();
          resolve(database);
        };
        request.onerror = () => reject(request.error || new Error("No se pudo abrir el archivo local."));
        request.onblocked = () => reject(new Error("Cerrá otras pestañas del laboratorio para actualizar el archivo local."));
      }).catch((error) => {
        databasePromise = null;
        throw error;
      });
    }
    return databasePromise;
  }

  async function list() {
    const database = await openDatabase();
    if (!database) return readFallback(storage).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    const transaction = database.transaction(STORE_NAME, "readonly");
    const result = await requestResult(transaction.objectStore(STORE_NAME).getAll());
    await transactionFinished(transaction);
    return result.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async function get(id) {
    const database = await openDatabase();
    if (!database) return readFallback(storage).find((creation) => creation.id === id) ?? null;
    const transaction = database.transaction(STORE_NAME, "readonly");
    const result = await requestResult(transaction.objectStore(STORE_NAME).get(id));
    await transactionFinished(transaction);
    return result ?? null;
  }

  async function put(creation) {
    const database = await openDatabase();
    if (!database) {
      const creations = readFallback(storage);
      const index = creations.findIndex((item) => item.id === creation.id);
      if (index >= 0) creations[index] = creation;
      else creations.push(creation);
      writeFallback(storage, creations);
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
      const current = readFallback(storage);
      const map = new Map(current.map((item) => [item.id, item]));
      for (const creation of creations) map.set(creation.id, creation);
      writeFallback(storage, [...map.values()]);
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
      writeFallback(storage, readFallback(storage).filter((creation) => creation.id !== id));
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

  return { list, get, put, putMany, remove, clear };
}
