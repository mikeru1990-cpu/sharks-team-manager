"use client"

import { TEAM, type MainTab } from "../../lib/types"

type Props = {
  tab: MainTab
  setTab: (tab: MainTab) => void
}

const items: { value: MainTab; label: string; icon: string }[] = [
  { value: "home", label: "Home", icon: "🏠" },
  { value: "events", label: "Events", icon: "📅" },
  { value: "match", label: "Match", icon: "⚽" },
  { value: "players", label: "Players", icon: "👥" },
  { value: "stats", label: "Stats", icon: "📊" },
  { value: "coaches", label: "Coaches", icon: "🧢" },
]

export default function BottomNav({ tab, setTab }: Props) {
  return (
    <div
      style={{
        position: "fixed",
        left: 12,
        right: 12,
        bottom: 12,
        zIndex: 90,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 980,
          background: "rgba(255,255,255,0.96)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid #dbe3ef",
          borderRadius: 28,
          padding: 10,
          boxShadow: "0 12px 30px rgba(15,23,42,0.14)",
          display: "grid",
          gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
          gap: 8,
          pointerEvents: "auto",
        }}
      >
        {items.map((item) => {
          const active = tab === item.value

          return (
            <button
              key={item.value}
              onClick={() => setTab(item.value)}
              style={{
                border: active ? `1px solid #bfdbfe` : "1px solid transparent",
                borderRadius: 20,
                padding: "10px 6px",
                background: active ? "#eff6ff" : "transparent",
                color: active ? TEAM.primary : "#475569",
                fontWeight: 800,
                fontSize: 12,
                minWidth: 0,
                display: "grid",
                justifyItems: "center",
                gap: 4,
              }}
            >
              <div style={{ fontSize: 28, lineHeight: 1 }}>{item.icon}</div>
              <div
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {item.label}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
