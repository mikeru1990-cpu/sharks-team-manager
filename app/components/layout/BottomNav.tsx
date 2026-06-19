"use client"

import type { MainTab } from "../../lib/types"
import {
  HomeIcon,
  CalendarIcon,
  FootballIcon,
  UsersIcon,
  ChartIcon,
  CapIcon,
} from "../AppIcons"

type Props = {
  tab: MainTab
  setTab: (tab: MainTab) => void
}

const items: Array<{ key: MainTab; label: string; shortLabel: string; icon: React.ReactNode }> = [
  { key: "home", label: "Home", shortLabel: "Home", icon: <HomeIcon /> },
  { key: "events", label: "Events", shortLabel: "Events", icon: <CalendarIcon /> },
  { key: "match", label: "Matchday", shortLabel: "Match", icon: <FootballIcon /> },
  { key: "players", label: "Squad", shortLabel: "Squad", icon: <UsersIcon /> },
  { key: "stats", label: "Stats", shortLabel: "Stats", icon: <ChartIcon /> },
  { key: "coaches", label: "Admin", shortLabel: "Admin", icon: <CapIcon /> },
]

export default function BottomNav({ tab, setTab }: Props) {
  function changeTab(nextTab: MainTab) {
    setTab(nextTab)
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: "smooth" }))
  }

  return (
    <nav
      aria-label="Main app navigation"
      style={{
        position: "fixed",
        left: "50%",
        transform: "translateX(-50%)",
        bottom: 8,
        width: "min(94vw, 760px)",
        zIndex: 100,
        borderRadius: 22,
        padding: 5,
        background: "linear-gradient(135deg, rgba(2,6,23,0.96), rgba(15,23,42,0.92))",
        border: "1px solid rgba(125,211,252,0.24)",
        boxShadow: "0 16px 42px rgba(0,0,0,0.54), 0 0 30px rgba(14,165,233,0.12), inset 0 1px 0 rgba(255,255,255,0.10)",
        backdropFilter: "blur(22px)",
        WebkitBackdropFilter: "blur(22px)",
      }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: 4 }}>
        {items.map((item) => {
          const active = tab === item.key
          return (
            <button
              key={item.key}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
              onClick={() => changeTab(item.key)}
              style={{
                border: active ? "1px solid rgba(125,211,252,0.62)" : "1px solid rgba(148,163,184,0.10)",
                background: active ? "linear-gradient(135deg, #2563eb 0%, #0284c7 60%, #0f172a 100%)" : "rgba(255,255,255,0.045)",
                color: active ? "white" : "#cbd5e1",
                borderRadius: 16,
                padding: "6px 2px 6px",
                display: "grid",
                justifyItems: "center",
                alignContent: "center",
                gap: 2,
                minWidth: 0,
                minHeight: 50,
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
                boxShadow: active ? "0 10px 24px rgba(37,99,235,0.38), inset 0 1px 0 rgba(255,255,255,0.18)" : "inset 0 1px 0 rgba(255,255,255,0.04)",
              }}
            >
              {active ? <div style={{ position: "absolute", left: "50%", bottom: 2, width: 20, height: 2, borderRadius: 999, background: "#7dd3fc", transform: "translateX(-50%)", boxShadow: "0 0 12px rgba(125,211,252,0.95)" }} /> : null}
              <div style={{ lineHeight: 1, transform: active ? "translateY(-1px) scale(0.98)" : "scale(0.88)", display: "grid", placeItems: "center", position: "relative", zIndex: 1 }}>
                {item.icon}
              </div>
              <div style={{ fontSize: 9, fontWeight: active ? 1000 : 850, whiteSpace: "nowrap", opacity: active ? 1 : 0.82, position: "relative", zIndex: 1 }}>
                {item.shortLabel}
              </div>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
