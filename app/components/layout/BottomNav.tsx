"use client"

import type { MainTab } from "../../lib/types"

type Props = {
  tab: MainTab
  setTab: (tab: MainTab) => void
}

const items: Array<{ id: MainTab; label: string; icon: string }> = [
  { id: "home", label: "Home", icon: "🏠" },
  { id: "events", label: "Events", icon: "📅" },
  { id: "match", label: "Match", icon: "⚽" },
  { id: "players", label: "Players", icon: "👥" },
  { id: "stats", label: "Stats", icon: "📊" },
  { id: "coaches", label: "Coaches", icon: "🧢" },
]

export default function BottomNav({ tab, setTab }: Props) {
  return (
    <div
      style={{
        position: "sticky",
        bottom: 12,
        zIndex: 20,
        marginTop: 16,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))`,
          gap: 8,
          padding: 8,
          borderRadius: 22,
          border: "1px solid #e2e8f0",
          background: "rgba(255,255,255,0.96)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 10px 28px rgba(15, 23, 42, 0.08)",
        }}
      >
        {items.map((item) => {
          const active = tab === item.id

          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              style={{
                border: active ? "1px solid #bfdbfe" : "1px solid transparent",
                background: active ? "linear-gradient(180deg, #dbeafe 0%, #eff6ff 100%)" : "transparent",
                color: active ? "#1e3a8a" : "#475569",
                borderRadius: 16,
                padding: "10px 6px",
                display: "grid",
                gap: 4,
                placeItems: "center",
                fontWeight: 800,
                fontSize: 12,
                boxShadow: active ? "0 4px 12px rgba(29, 78, 216, 0.10)" : "none",
              }}
            >
              <span style={{ fontSize: 18, lineHeight: 1 }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
