"use client"

import type { MainTab } from "../../lib/types"

type NavItem = {
  key: MainTab
  label: string
  hint: string
}

type Props = {
  tab: MainTab
  setTab: (tab: MainTab) => void
  isAdmin?: boolean
}

const navItems: NavItem[] = [
  { key: "home", label: "Overview", hint: "Club and team snapshot" },
  { key: "players", label: "Players", hint: "Squad and development" },
  { key: "events", label: "Events", hint: "Fixtures and training" },
  { key: "match", label: "Matchday", hint: "Live match control" },
  { key: "stats", label: "Stats", hint: "Results and trends" },
  { key: "coaches", label: "Admin", hint: "Coaches and teams" },
]

export default function ClubNavigationBar({ tab, setTab, isAdmin = false }: Props) {
  return (
    <nav className="sharks-glass sharks-card-shine" style={{ borderRadius: 26, padding: 10, display: "grid", gap: 8, border: "1px solid rgba(125,211,252,0.22)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", flexWrap: "wrap", padding: "2px 4px" }}>
        <div style={{ color: "#7dd3fc", fontSize: 11, fontWeight: 1000, letterSpacing: ".16em", textTransform: "uppercase" }}>
          Club Navigation
        </div>
        <div style={{ color: "#94a3b8", fontSize: 12, fontWeight: 900 }}>
          {isAdmin ? "Full club access" : "Team access"}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(118px, 1fr))", gap: 8 }}>
        {navItems.map((item) => {
          const active = tab === item.key
          return (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              style={{
                border: active ? "1px solid rgba(125,211,252,0.60)" : "1px solid rgba(148,163,184,0.18)",
                background: active ? "linear-gradient(135deg, rgba(14,165,233,0.26), rgba(37,99,235,0.18))" : "rgba(15,23,42,0.50)",
                color: active ? "white" : "#cbd5e1",
                borderRadius: 18,
                padding: "12px 10px",
                textAlign: "left",
                cursor: "pointer",
                display: "grid",
                gap: 4,
                boxShadow: active ? "0 14px 34px rgba(14,165,233,0.18)" : "none",
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 1000 }}>{item.label}</span>
              <span style={{ fontSize: 11, fontWeight: 750, color: active ? "#bae6fd" : "#94a3b8" }}>{item.hint}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
