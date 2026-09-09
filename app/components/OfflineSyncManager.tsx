"use client"

import { useEffect } from "react"
import { syncQueuedMatchEvents } from "../lib/matchEventSync"

export default function OfflineSyncManager() {
  useEffect(() => {
    let syncing = false

    async function sync() {
      if (syncing || !navigator.onLine) return
      syncing = true
      try {
        await syncQueuedMatchEvents()
      } finally {
        syncing = false
      }
    }

    void sync()
    window.addEventListener("online", sync)
    const interval = window.setInterval(sync, 30_000)

    return () => {
      window.removeEventListener("online", sync)
      window.clearInterval(interval)
    }
  }, [])

  return null
}
