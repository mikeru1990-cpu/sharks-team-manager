export type OfflineQueueItem<TPayload = Record<string, unknown>> = {
  id: string
  type: string
  payload: TPayload
  createdAt: string
  attempts: number
  lastError?: string
}

const STORAGE_KEY = "football-os:offline-queue:v1"

function readQueue(): OfflineQueueItem[] {
  if (typeof window === "undefined") return []

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeQueue(items: OfflineQueueItem[]) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  window.dispatchEvent(new CustomEvent("football-os:queue-changed", { detail: items.length }))
}

export function getOfflineQueue() {
  return readQueue()
}

export function getOfflineQueueCount() {
  return readQueue().length
}

export function enqueueOfflineAction<TPayload>(type: string, payload: TPayload) {
  const item: OfflineQueueItem<TPayload> = {
    id: crypto.randomUUID(),
    type,
    payload,
    createdAt: new Date().toISOString(),
    attempts: 0,
  }

  writeQueue([...readQueue(), item as OfflineQueueItem])
  return item
}

export async function flushOfflineQueue(
  processor: (item: OfflineQueueItem) => Promise<void>,
) {
  const queue = readQueue()
  if (!queue.length) return { synced: 0, remaining: 0 }

  const remaining: OfflineQueueItem[] = []
  let synced = 0

  for (const item of queue) {
    try {
      await processor(item)
      synced += 1
    } catch (error) {
      remaining.push({
        ...item,
        attempts: item.attempts + 1,
        lastError: error instanceof Error ? error.message : "Sync failed",
      })
    }
  }

  writeQueue(remaining)
  return { synced, remaining: remaining.length }
}

export function clearOfflineQueue() {
  writeQueue([])
}
