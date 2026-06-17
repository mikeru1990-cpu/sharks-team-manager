"use client"

import type { MainTab } from "../../lib/types"

type Props = {
  tab: MainTab
  setTab: (tab: MainTab) => void
}

const items: Array<{ key: MainTab; label: string }> = [
  { key: "home", label: "Overview" },
  { key: "players", label: "Squad" },
  { key: "events", label: "Events" },
  { key: "match", label: "Matchday" },
  { key: "stats", label: "Stats" },
  { key: "coaches", label: "Admin" },
]

export default function ClubBottomNavPreview({ tab, setTab }: Props) {
  return (
    <nav className="sharks-glass sharks-card-shine" style={{ borderRadius: 28, padding: 10, display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: 8 }}>
      {items.map((item) => {
        const active = tab === item.key
        return (
          <button
            key={item.key}
            onClick={() => {
              setTab(item.key)
              window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }))
            }}
            style={{
              border: active ? "1px solid rgba(125,211,252,0.62)" : "1px solid rgba(148,163,184,0.14)",
              background: active ? "linear-gradient(135deg, rgba(14,165,233,0.30), rgba(37,99,235,0.22))" : "rgba(15,23,42,0.56)",
              color: active ? "white" : "#cbd5e1",
              borderRadius: 18,
              padding: "12px 6px",
              fontSize: 12,
              fontWeight: 1000,
              cursor: "pointer",
            }}
          >
            {item.label}
          </button>
        )
      })}
    </nav>
  )
}
