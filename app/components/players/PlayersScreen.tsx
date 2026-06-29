"use client"

import RealPlayersList from "./RealPlayersList"

export default function PlayersScreen() {
  return (
    <div style={{ paddingBottom: 140, color: "white", display: "grid", gap: 16 }}>
      <section style={{ borderRadius: 24, padding: 18, background: "rgba(15,23,42,0.88)", border: "1px solid rgba(148,163,184,0.14)" }}>
        <div style={{ opacity: 0.72, fontSize: 12, fontWeight: 900, letterSpacing: 0.8 }}>TEAM PLAYERS</div>
        <h1 style={{ margin: "6px 0 4px", fontSize: 34 }}>U11 Girls</h1>
        <p style={{ margin: 0, color: "rgba(226,232,240,0.72)", lineHeight: 1.5 }}>
          Coach and parent view is scoped to Leonard Stanley U11 Girls only. Club-wide player lists belong in Club Admin.
        </p>
      </section>
      <RealPlayersList />
    </div>
  )
}
