"use client"

import { Cloud, CloudOff, LockKeyhole, RefreshCw } from "lucide-react"
import { useSquadCloudStatus } from "../../lib/squadCloud"

export default function SquadSyncStatus() {
  const status = useSquadCloudStatus()
  const icon =
    status.mode === "syncing" ? <RefreshCw size={14} /> :
    status.mode === "offline" || status.mode === "error" ? <CloudOff size={14} /> :
    status.mode === "cloud" ? <Cloud size={14} /> :
    <LockKeyhole size={14} />

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        minHeight: 40,
        padding: "8px 11px",
        borderRadius: 14,
        border: "1px solid rgba(148,163,184,.12)",
        background: "rgba(2,6,23,.42)",
        color: status.mode === "error" ? "#fca5a5" : status.mode === "offline" ? "#fde68a" : "#bfdbfe",
        fontSize: 10,
        fontWeight: 850,
      }}
    >
      {icon}
      <span>{status.message}</span>
      {status.mode === "cloud" && (
        <strong style={{ marginLeft: "auto", color: status.canManage ? "#86efac" : "#cbd5e1" }}>
          {status.canManage ? "COACH" : "VIEW ONLY"}
        </strong>
      )}
    </div>
  )
}
