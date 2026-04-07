const store = new Map<string, { data: any; ts: number }>()
const TTL = 30_000 // 30 secondes

export function cacheGet<T>(key: string): T | null {
  const entry = store.get(key)
  if (!entry) return null
  if (Date.now() - entry.ts > TTL) { store.delete(key); return null }
  return entry.data as T
}

export function cacheSet(key: string, data: any) {
  store.set(key, { data, ts: Date.now() })
}

export function cacheInvalidate(prefix: string) {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key)
  }
}
