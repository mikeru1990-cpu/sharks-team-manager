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

const items: Array<{
  key: MainTab
  label: string
  shortLabel: string
  icon: React.ReactNode
}> = [
  { key: "home", label: "Club Overview", shortLabel: "Overview", icon: <HomeIcon /> },
  { key: "events", label: "Events", shortLabel: "Events", icon: <CalendarIcon /> },
  { key: "match", label: "Matchday", shortLabel: "Match", icon: <FootballIcon /> },
  { key: "players", label: "Players", shortLabel: "Players", icon: <UsersIcon /> },
  { key: "stats", label: "Stats", shortLabel: "Stats", icon: <ChartIcon /> },
  { key: "coaches", label: "Admin", shortLabel: "Admin", icon: <CapIcon /> },
]

export default function BottomNav({ tab, setTab }: Props) {
  function changeTab(nextTab: MainTab) {
    setTab(nextTab)
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" })
    })
  }

  return (
    <nav
      aria-label="Main app navigation"
      style={{
        position: "fixed",
        left: "50%",
        transform: "translateX(-50%)",
        bottom: 12,
        width: "min(96vw, 880px)",
        zIndex: 100,
        borderRadius: 32,
        padding: 8,
        background:
          "radial-gradient(circle at top left, rgba(56,189,248,0.18), transparent 34%), radial-gradient(circle at top right, rgba(250,204,21,0.08), transparent 30%), linear-gradient(135deg, rgba(2,6,23,0.96), rgba(15,23,42,0.90))",
        border: "1px solid rgba(125,211,252,0.30)",
        boxShadow:
          "0 28px 70px rgba(0,0,0,0.62), 0 0 48px rgba(14,165,233,0.16), inset 0 1px 0 rgba(255,255,255,0.12)",
        backdropFilter: "blur(26px)",
        WebkitBackdropFilter: "blur(26px)",
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
        {items.map((item) => {
          const active = tab === item.key

          return (
            <button
              key={item.key}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
              onClick={() => changeTab(item.key)}
              style={{
                border: active
                  ? "1px solid rgba(125,211,252,0.68)"
                  : "1px solid rgba(148,163,184,0.12)",
                background: active
                  ? "linear-gradient(135deg, #2563eb 0%, #0284c7 52%, #0f172a 100%)"
                  : "linear-gradient(135deg, rgba(255,255,255,0.056), rgba(255,255,255,0.026))",
                color: active ? "white" : "#cbd5e1",
                borderRadius: 22,
                padding: "11px 4px 9px",
                display: "grid",
                justifyItems: "center",
                alignContent: "center",
                gap: 5,
                minWidth: 0,
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
                transition: "transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease, background 0.18s ease",
                boxShadow: active
                  ? "0 16px 38px rgba(37,99,235,0.48), inset 0 1px 0 rgba(255,255,255,0.22)"
                  : "inset 0 1px 0 rgba(255,255,255,0.04)",
              }}
            >
              {active ? (
                <>
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 100%)",
                      pointerEvents: "none",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      left: "50%",
                      bottom: 3,
                      width: 28,
                      height: 3,
                      borderRadius: 999,
                      background: "#7dd3fc",
                      transform: "translateX(-50%)",
                      boxShadow: "0 0 18px rgba(125,211,252,0.98)",
                    }}
                  />
                </>
              ) : null}

              <div
                style={{
                  lineHeight: 1,
                  transform: active ? "translateY(-2px) scale(1.08)" : "none",
                  display: "grid",
                  placeItems: "center",
                  transition: "all 0.2s ease",
                  position: "relative",
                  zIndex: 1,
                  filter: active
                    ? "drop-shadow(0 8px 14px rgba(125,211,252,0.30))"
                    : "none",
                }}
              >
                {item.icon}
              </div>

              <div
                style={{
                  fontSize: 11,
                  fontWeight: active ? 1000 : 850,
                  whiteSpace: "nowrap",
                  letterSpacing: 0.2,
                  opacity: active ? 1 : 0.82,
                  position: "relative",
                  zIndex: 1,
                }}
              >
                {item.shortLabel}
              </div>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
