"use client"

import { useState } from "react"
import type { MainTab } from "../../lib/types"

type Props = {
  setTab: (tab: MainTab) => void
  openCreateEvent?: () => void
}

function actionStyle(): React.CSSProperties {
  return {
    border: "1px solid rgba(125,211,252,0.26)",
    background: "rgba(15,23,42,0.96)",
    color: "white",
    borderRadius: 999,
    padding: "10px 13px",
    fontWeight: 1000,
    boxShadow: "0 14px 30px rgba(0,0,0,0.35)",
    cursor: "pointer",
  }
}

export default function QuickActionDock({ setTab, openCreateEvent }: Props) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ position: "fixed", right: 14, bottom: 86, zIndex: 120, display: "grid", gap: 8, justifyItems: "end" }}>
      {open ? (
        <div style={{ display: "grid", gap: 7, justifyItems: "end" }}>
          <button style={actionStyle()} onClick={() => { setTab("match"); setOpen(false) }}>Matchday</button>
          <button style={actionStyle()} onClick={() => { setTab("events"); setOpen(false) }}>Training</button>
          <button style={actionStyle()} onClick={() => { setTab("players"); setOpen(false) }}>Players</button>
          <button style={actionStyle()} onClick={() => { openCreateEvent ? openCreateEvent() : setTab("events"); setOpen(false) }}>Create Event</button>
        </div>
      ) : null}
      <button aria-label="Quick actions" onClick={() => setOpen((value) => !value)} style={{ width: 56, height: 56, borderRadius: 999, border: "1px solid rgba(125,211,252,0.55)", background: "linear-gradient(135deg,#2563eb,#0284c7)", color: "white", fontSize: 26, fontWeight: 1000, boxShadow: "0 18px 44px rgba(37,99,235,0.42)", cursor: "pointer" }}>{open ? "x" : "+"}</button>
    </div>
  )
}
