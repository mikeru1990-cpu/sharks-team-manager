"use client"

import { TEAM, type MainTab } from "../../lib/types"

type Props = {
  tab: MainTab
  setTab: (tab: MainTab) => void
}

const tabs: { key: MainTab; label: string; icon: string }[] = [
  { key: "home", label: "Home", icon: "🏠" },
  { key: "events", label: "Events", icon: "📅" },
  { key: "match", label: "Match", icon: "⚽" },
  { key: "players", label: "Players", icon: "👥" },
  { key: "stats", label: "Stats", icon: "📊" },
  { key: "coaches", label: "Coaches", icon: "🧢" },
]

export default function BottomNav({ tab, setTab }: Props) {
  return (
    <div
      style={{
        position: "fixed",
        left: 12,
        right: 12,
        bottom: "max(12px, env(safe-area-inset-bottom))",
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
          margin: "0 auto",
          background: "rgba(255,255,255,0.96)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          border: "1px solid #dbe3ef",
          borderRadius: 28,
          boxShadow: "0 12px 30px rgba(15,23,42,0.10)",
          padding: 10,
          pointerEvents: "auto",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
            gap: 6,
          }}
        >
          {tabs.map((item) => {
            const active = tab === item.key

            return (
              <button
                key={item.key}
                onClick={() => setTab(item.key)}
                style={{
                  border: active ? `1px solid #bfdbfe` : "1px solid transparent",
                  background: active ? "#eff6ff" : "transparent",
                  color: active ? TEAM.primary : "#475569",
                  borderRadius: 20,
                  padding: "10px 6px",
                  minWidth: 0,
                  fontWeight: 800,
                  display: "grid",
                  justifyItems: "center",
                  gap: 4,
                }}
              >
                <div style={{ fontSize: 28, lineHeight: 1 }}>{item.icon}</div>
                <div
                  style={{
                    fontSize: 12,
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
    </div>
  )
}
