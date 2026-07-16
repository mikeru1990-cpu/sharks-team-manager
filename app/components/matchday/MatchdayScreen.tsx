"use client"

import { useEffect, useState } from "react"
import MatchdayCockpit from "./MatchdayCockpit"
import MatchdayStatsBridge from "./MatchdayStatsBridge"
import TacticalBoardWorkspace from "./TacticalBoardWorkspace"
import "./matchday-premium.css"

type Workspace = "match" | "tactics" | "report"

const workspaceStorageKey = "football-os-matchday-workspace-v1"

const workspaces: Array<{
  id: Workspace
  label: string
  shortLabel: string
  description: string
  icon: string
}> = [
  {
    id: "match",
    label: "Match Centre",
    shortLabel: "Match",
    description: "Clock, score, substitutions, rotations and live coach intelligence.",
    icon: "◉",
  },
  {
    id: "tactics",
    label: "Tactical Board",
    shortLabel: "Tactics",
    description: "Move the live lineup, shape the team and save formations.",
    icon: "◇",
  },
  {
    id: "report",
    label: "Match Report",
    shortLabel: "Report",
    description: "Player events, statistics, opposition and full-time summary.",
    icon: "▤",
  },
]

export default function MatchdayScreen() {
  const [workspace, setWorkspace] = useState<Workspace>("match")
  const active = workspaces.find((item) => item.id === workspace) ?? workspaces[0]

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(workspaceStorageKey) as Workspace | null
      if (saved && workspaces.some((item) => item.id === saved)) setWorkspace(saved)
    } catch {}
  }, [])

  function selectWorkspace(next: Workspace) {
    setWorkspace(next)
    try {
      window.localStorage.setItem(workspaceStorageKey, next)
    } catch {}
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="matchday-premium-shell" style={shell}>
      <section style={workspaceHero}>
        <div>
          <div style={eyebrow}>MATCHDAY WORKSPACE</div>
          <h1 style={heroTitle}>{active.label}</h1>
          <p style={heroCopy}>{active.description}</p>
        </div>
        <div style={workspaceBadge}>{active.icon}</div>
      </section>

      <nav aria-label="Matchday workspaces" style={workspaceNav}>
        {workspaces.map((item) => {
          const selected = item.id === workspace
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={selected}
              onClick={() => selectWorkspace(item.id)}
              style={selected ? activeWorkspaceButton : workspaceButton}
            >
              <span style={navIcon}>{item.icon}</span>
              <span style={navText}>
                <strong>{item.shortLabel}</strong>
                <small>{item.id === "match" ? "Live control" : item.id === "tactics" ? "Shape & roles" : "Stats & summary"}</small>
              </span>
            </button>
          )
        })}
      </nav>

      <main style={workspaceBody}>
        {workspace === "match" && <MatchdayCockpit />}
        {workspace === "tactics" && <TacticalBoardWorkspace />}
        {workspace === "report" && <MatchdayStatsBridge />}
      </main>

      <div style={mobileQuickBar}>
        {workspaces.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => selectWorkspace(item.id)}
            style={workspace === item.id ? mobileQuickActive : mobileQuickButton}
          >
            <span>{item.icon}</span>
            <strong>{item.shortLabel}</strong>
          </button>
        ))}
      </div>
    </div>
  )
}

const shell = {
  display: "grid",
  gap: 14,
  paddingBottom: 118,
}

const workspaceHero = {
  borderRadius: 30,
  padding: 18,
  background: "radial-gradient(circle at top right,rgba(124,58,237,.34),transparent 38%),radial-gradient(circle at bottom left,rgba(37,99,235,.42),transparent 42%),rgba(15,23,42,.96)",
  border: "1px solid rgba(147,197,253,.2)",
  boxShadow: "0 24px 54px rgba(0,0,0,.25)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
  color: "white",
}

const eyebrow = {
  fontSize: 11,
  fontWeight: 950,
  letterSpacing: 1.1,
  color: "#bfdbfe",
}

const heroTitle = {
  margin: "6px 0 0",
  fontSize: 30,
  lineHeight: 1,
  letterSpacing: -1,
}

const heroCopy = {
  margin: "7px 0 0",
  maxWidth: 580,
  color: "rgba(226,232,240,.7)",
  fontWeight: 750,
  lineHeight: 1.4,
}

const workspaceBadge = {
  width: 54,
  height: 54,
  flex: "0 0 54px",
  borderRadius: 19,
  display: "grid",
  placeItems: "center",
  background: "linear-gradient(135deg,#2563eb,#7c3aed)",
  border: "1px solid rgba(255,255,255,.22)",
  boxShadow: "0 16px 30px rgba(37,99,235,.25)",
  fontSize: 25,
  fontWeight: 950,
}

const workspaceNav = {
  position: "sticky" as const,
  top: 8,
  zIndex: 30,
  display: "grid",
  gridTemplateColumns: "repeat(3,minmax(0,1fr))",
  gap: 7,
  padding: 7,
  borderRadius: 24,
  background: "rgba(2,6,23,.88)",
  border: "1px solid rgba(148,163,184,.14)",
  boxShadow: "0 18px 38px rgba(0,0,0,.28)",
  backdropFilter: "blur(18px)",
}

const workspaceButton = {
  minWidth: 0,
  border: "1px solid transparent",
  borderRadius: 18,
  padding: 11,
  background: "transparent",
  color: "rgba(226,232,240,.68)",
  display: "flex",
  alignItems: "center",
  gap: 9,
  textAlign: "left" as const,
  cursor: "pointer",
}

const activeWorkspaceButton = {
  ...workspaceButton,
  color: "white",
  background: "linear-gradient(135deg,rgba(37,99,235,.92),rgba(124,58,237,.9))",
  border: "1px solid rgba(191,219,254,.24)",
  boxShadow: "0 12px 26px rgba(37,99,235,.22)",
}

const navIcon = {
  width: 31,
  height: 31,
  flex: "0 0 31px",
  borderRadius: 11,
  display: "grid",
  placeItems: "center",
  background: "rgba(255,255,255,.08)",
  fontWeight: 950,
}

const navText = {
  display: "grid",
  gap: 2,
  minWidth: 0,
}

const workspaceBody = {
  minWidth: 0,
}

const mobileQuickBar = {
  position: "fixed" as const,
  left: "50%",
  bottom: 14,
  transform: "translateX(-50%)",
  zIndex: 50,
  width: "min(520px,calc(100vw - 28px))",
  display: "grid",
  gridTemplateColumns: "repeat(3,1fr)",
  gap: 7,
  padding: 7,
  borderRadius: 24,
  background: "rgba(2,6,23,.92)",
  border: "1px solid rgba(148,163,184,.18)",
  boxShadow: "0 22px 50px rgba(0,0,0,.42)",
  backdropFilter: "blur(20px)",
}

const mobileQuickButton = {
  border: "1px solid transparent",
  borderRadius: 17,
  padding: "10px 7px",
  background: "transparent",
  color: "rgba(226,232,240,.66)",
  display: "grid",
  placeItems: "center",
  gap: 3,
  fontSize: 11,
  cursor: "pointer",
}

const mobileQuickActive = {
  ...mobileQuickButton,
  color: "white",
  background: "linear-gradient(135deg,#2563eb,#7c3aed)",
  border: "1px solid rgba(191,219,254,.2)",
}
