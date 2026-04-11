"use client"

import { TEAM, type MainTab } from "../../lib/types"

type Props = {
  tab: MainTab
  setTab: (tab: MainTab) => void
}

const ITEMS: Array<{
  value: MainTab
  label: string
  icon: string
}> = [
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
        zIndex: 80,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          maxWidth: 980,
          margin: "0 auto",
          pointerEvents: "auto",
          background: "rgba(255,255,255,0.96)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          border: "1px solid #dbe3ef",
          borderRadius: 26,
          boxShadow: "0 12px 30px rgba(15,23,42,0.14)",
          padding: 8,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
            gap: 6,
            alignItems: "stretch",
          }}
        >
          {ITEMS.map((item) => {
            const active = tab === item.value

            return (
              <button
                key={item.value}
                onClick={() => setTab(item.value)}
                aria-label={item.label}
                style={{
                  border: "none",
                  background: active ? "#eff6ff" : "transparent",
                  color: active ? TEAM.primary : "#475569",
                  borderRadius: 18,
                  minWidth: 0,
                  padding: "10px 4px",
                  display: "grid",
                  justifyItems: "center",
                  alignContent: "center",
                  gap: 4,
                  fontWeight: 800,
                  boxShadow: active ? "inset 0 0 0 1px #bfdbfe" : "none",
                }}
              >
                <div
                  style={{
                    fontSize: 24,
                    lineHeight: 1,
                  }}
                >
                  {item.icon}
                </div>

                <div
                  style={{
                    fontSize: 12,
                    lineHeight: 1.1,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "100%",
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
