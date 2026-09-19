"use client"

import { useEffect, useState } from "react"
import { Cloud, CloudOff } from "lucide-react"

export default function ConnectionStatus() {
  const [online, setOnline] = useState(true)

  useEffect(() => {
    const update = () => setOnline(window.navigator.onLine)
    update()
    window.addEventListener("online", update)
    window.addEventListener("offline", update)
    return () => {
      window.removeEventListener("online", update)
      window.removeEventListener("offline", update)
    }
  }, [])

  return (
    <div
      className={`fos-connection ${online ? "fos-connection--online" : "fos-connection--offline"}`}
      role="status"
      aria-live="polite"
    >
      {online ? <Cloud size={15} aria-hidden="true" /> : <CloudOff size={15} aria-hidden="true" />}
      <span>{online ? "Online" : "Offline mode"}</span>
    </div>
  )
}
