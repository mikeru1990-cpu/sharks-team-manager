"use client"

import { useEffect } from "react"

/**
 * Browsers only emit the native `storage` event in *other* tabs/windows.
 * Football OS has several workspaces that intentionally listen for that event
 * so they can reload shared local state (squad, matchday, team format, etc.).
 *
 * This bridge mirrors localStorage writes back into the current tab so edits
 * made in one workspace are visible immediately in the others without a
 * refresh, focus change or navigation workaround.
 */
export default function SameTabStorageSync() {
  useEffect(() => {
    const storagePrototype = Storage.prototype
    const originalSetItem = storagePrototype.setItem
    const originalRemoveItem = storagePrototype.removeItem
    const originalClear = storagePrototype.clear

    function emitStorageEvent(key: string | null, oldValue: string | null, newValue: string | null) {
      window.dispatchEvent(new StorageEvent("storage", {
        key,
        oldValue,
        newValue,
        storageArea: window.localStorage,
        url: window.location.href,
      }))
    }

    storagePrototype.setItem = function patchedSetItem(key: string, value: string) {
      const isLocalStorage = this === window.localStorage
      const oldValue = isLocalStorage ? window.localStorage.getItem(key) : null
      originalSetItem.call(this, key, value)

      if (isLocalStorage && oldValue !== value) {
        emitStorageEvent(key, oldValue, value)
      }
    }

    storagePrototype.removeItem = function patchedRemoveItem(key: string) {
      const isLocalStorage = this === window.localStorage
      const oldValue = isLocalStorage ? window.localStorage.getItem(key) : null
      originalRemoveItem.call(this, key)

      if (isLocalStorage && oldValue !== null) {
        emitStorageEvent(key, oldValue, null)
      }
    }

    storagePrototype.clear = function patchedClear() {
      const isLocalStorage = this === window.localStorage
      const hadValues = isLocalStorage && window.localStorage.length > 0
      originalClear.call(this)

      if (hadValues) {
        emitStorageEvent(null, null, null)
      }
    }

    return () => {
      storagePrototype.setItem = originalSetItem
      storagePrototype.removeItem = originalRemoveItem
      storagePrototype.clear = originalClear
    }
  }, [])

  return null
}
