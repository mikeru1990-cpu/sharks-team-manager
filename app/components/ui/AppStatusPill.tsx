"use client"

import { useEffect, useState } from "react"

export default function AppStatusPill() {
  const [online, setOnline] = useState(true)

  useEffect(() => {
    const sync = () => setOnline(window.navigator.onLine)
    sync()

    window.addEventListener("online", sync)
    window.addEventListener("offline", sync)

    return () => {
      window.removeEventListener("online", sync)
      window.removeEventListener("offline", sync)
    }
  }, [])

  return (
    <div
      className={`fos-app-status ${online ? "fos-app-status--online" : "fos-app-status--offline"}`}
      aria-live="polite"
      title={online ? "Football OS is connected" : "Football OS is working offline"}
    >
      <span className="fos-app-status__dot" aria-hidden="true" />
      <span>{online ? "Online" : "Offline"}</span>
      <span className="fos-app-status__divider" aria-hidden="true" />
      <span>Private Alpha</span>
    </div>
  )
}
