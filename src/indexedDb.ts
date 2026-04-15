import { openDB, type DBSchema } from 'idb'

export type DataStoreKey =
  | 'snippets'
  | 'links'
  | 'logins'
  | 'templates'
  | 'snippetFolders'
  | 'linkFolders'
  | 'loginFolders'
  | 'templateFolders'

type DataStoreRow = {
  key: DataStoreKey
  value: unknown
}

interface AppDataDB extends DBSchema {
  appData: {
    key: DataStoreKey
    value: DataStoreRow
  }
}

/** Legacy name — keeps existing IndexedDB database after app rename */
const DB_NAME = 'hirehunter-db'
const DB_VERSION = 1
const STORE_NAME = 'appData'

const dbPromise = openDB<AppDataDB>(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME, { keyPath: 'key' })
    }
  },
})

export const getStoredValue = async <T,>(
  key: DataStoreKey,
): Promise<T | undefined> => {
  const db = await dbPromise
  const row = await db.get(STORE_NAME, key)
  return row?.value as T | undefined
}

export const setStoredValue = async <T,>(key: DataStoreKey, value: T) => {
  const db = await dbPromise
  await db.put(STORE_NAME, { key, value })
}
