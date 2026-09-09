"use client"

import { useEffect, useState } from "react"
import { ArrowRight, Radio } from "lucide-react"
import type { WorkspaceTab } from "../../lib/workspaces"

type Props = {
  onNavigate: (tab: WorkspaceTab) => void
}

type SavedMatchSummary = {
  seconds: number
  home: number
  away: number
  activePeriod: number
}

const storageKey = "football-os-matchday-state-v4"

function formatClock(seconds: number) {
  const safe = Math.max(0, Math.floor(seconds || 0))
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, "0")}`
}

function readSavedMatch(): SavedMatchSummary | null {
  try {
    const raw = window.localStorage.getItem(storageKey)
    if (!raw) return null
    const value = JSON.parse(raw) as Partial<SavedMatchSummary>
    const summary = {
      seconds: Number(value.seconds ?? 0),
      home: Number(value.home ?? 0),
      away: Number(value.away ?? 0),
      activePeriod: Number(value.activePeriod ?? 0),
    }
    if (!summary.seconds && !summary.home && !summary.away) return null
    return summary
  } catch {
    return null
  }
}

export default function ActiveMatchBanner({ onNavigate }: Props) {
  const [match, setMatch] = useState<SavedMatchSummary | null>(null)

  useEffect(() => {
    const refresh = () => setMatch(readSavedMatch())
    refresh()
    window.addEventListener("focus", refresh)
    window.addEventListener("storage", refresh)
    const timer = window.setInterval(refresh, 2500)

    return () => {
      window.removeEventListener("focus", refresh)
      window.removeEventListener("storage", refresh)
      window.clearInterval(timer)
    }
  }, [])

  if (!match) return null

  return (
    <button
      type="button"
      onClick={() => onNavigate("matchday")}
      aria-label={`Resume match, score ${match.home} to ${match.away}, period ${match.activePeriod + 1}, ${formatClock(match.seconds)}`}
      style={banner}
    >
      <span style={liveMark}>
        <Radio size={17} />
      </span>
      <span style={copy}>
        <span style={eyebrow}>MATCH IN PROGRESS · PERIOD {match.activePeriod + 1}</span>
        <span style={mainLine}>
          <strong style={score}>{match.home}–{match.away}</strong>
          <span style={clock}>{formatClock(match.seconds)}</span>
        </span>
        <span style={hint}>Your match is saved. Tap to return to live control.</span>
      </span>
      <span style={action}>
        Resume <ArrowRight size={16} />
      </span>
    </button>
  )
}

const banner = {
  width: "100%",
  display: "grid",
  gridTemplateColumns: "46px minmax(0,1fr) auto",
  gap: 12,
  alignItems: "center",
  border: "1px solid rgba(74,222,128,.24)",
  borderRadius: 24,
  padding: 14,
  color: "white",
  background: "radial-gradient(circle at 8% 20%,rgba(34,197,94,.2),transparent 28%),linear-gradient(135deg,rgba(6,78,59,.72),rgba(6,25,38,.94) 52%,rgba(15,23,42,.96))",
  boxShadow: "0 22px 52px rgba(2,6,23,.36),inset 0 1px 0 rgba(255,255,255,.05)",
  textAlign: "left" as const,
  cursor: "pointer",
  touchAction: "manipulation" as const,
}

const liveMark = {
  width: 46,
  height: 46,
  display: "grid",
  placeItems: "center",
  borderRadius: 16,
  color: "#bbf7d0",
  background: "rgba(22,163,74,.2)",
  border: "1px solid rgba(74,222,128,.2)",
  boxShadow: "0 0 0 6px rgba(34,197,94,.06)",
}

const copy = { display: "grid", gap: 3, minWidth: 0 }
const eyebrow = { color: "#86efac", fontSize: 9.5, fontWeight: 950, letterSpacing: .9 }
const mainLine = { display: "flex", alignItems: "baseline", gap: 9 }
const score = { fontSize: 24, lineHeight: 1, letterSpacing: -.8 }
const clock = { color: "#d1fae5", fontSize: 14, fontWeight: 900 }
const hint = { color: "rgba(226,232,240,.62)", fontSize: 11.5, fontWeight: 700, lineHeight: 1.35 }
const action = { display: "inline-flex", alignItems: "center", gap: 5, color: "#bbf7d0", fontSize: 11.5, fontWeight: 950, whiteSpace: "nowrap" as const }
