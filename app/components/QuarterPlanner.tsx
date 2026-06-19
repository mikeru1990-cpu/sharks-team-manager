"use client"

import type { PitchSlot, Player, QuarterPlan } from "../lib/types"
import { Badge, PageCard, PrimaryButton, SecondaryButton, SectionHeader } from "./ui"

type PeriodMode = "quarters" | "halves"

type Props = {
  isAdmin: boolean
  currentQuarter: number
  setCurrentQuarter: (q: number) => void
  quarterPlans: Record<number, QuarterPlan>
  quarterWarnings: string[]
  currentSlots: PitchSlot[]
  players: Player[]
  lineupMap: Record<string, string | null>
  benchIds: string[]
  onSaveCurrentQuarter: () => Promise<void>
  onLoadQuarter: (quarter: number) => void
  onAutoGenerate: () => Promise<void>
  periodMode: PeriodMode
  periodLength: number
}

function playerName(players: Player[], id?: string | null) {
  return players.find((player) => player.id === id)?.name || "Empty"
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ borderRadius: 16, background: "rgba(2,6,23,0.46)", border: "1px solid rgba(125,211,252,0.22)", padding: 11 }}>
      <div style={{ fontSize: 10, fontWeight: 1000, letterSpacing: ".09em", color: "#94a3b8", textTransform: "uppercase" }}>{label}</div>
      <div style={{ marginTop: 5, fontSize: 22, fontWeight: 1000, lineHeight: 1, color: "#7dd3fc" }}>{value}</div>
    </div>
  )
}

function chip(active: boolean) {
  return {
    border: active ? "1px solid rgba(125,211,252,0.75)" : "1px solid rgba(148,163,184,0.22)",
    background: active ? "rgba(14,165,233,0.22)" : "rgba(255,255,255,0.06)",
    color: active ? "#7dd3fc" : "#cbd5e1",
    borderRadius: 14,
    padding: "10px 12px",
    fontWeight: 1000 as const,
    fontSize: 13,
    minWidth: 58,
    cursor: "pointer",
  }
}

export default function QuarterPlanner({ isAdmin, currentQuarter, setCurrentQuarter, quarterPlans, quarterWarnings, currentSlots, players, lineupMap, benchIds, onSaveCurrentQuarter, onLoadQuarter, onAutoGenerate, periodMode, periodLength }: Props) {
  const periodCount = periodMode === "quarters" ? 4 : 2
  const periodName = periodMode === "quarters" ? "Quarter" : "Half"
  const shortLabel = periodMode === "quarters" ? "Q" : "H"
  const currentFilledCount = currentSlots.filter((slot) => lineupMap[slot.id]).length
  const gkSlot = currentSlots.find((slot) => slot.position === "GK")
  const currentGoalkeeper = playerName(players, lineupMap[gkSlot?.id || ""])

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <PageCard>
        <SectionHeader title={`${periodName} Planner`} subtitle={`${periodCount} periods • ${periodLength} minutes`} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 8, marginBottom: 12 }}>
          <Stat label="Now" value={`${shortLabel}${currentQuarter}`} />
          <Stat label="On" value={currentFilledCount} />
          <Stat label="Bench" value={benchIds.length} />
          <Stat label="Length" value={`${periodLength}m`} />
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          {Array.from({ length: periodCount }, (_, i) => i + 1).map((q) => <button key={q} onClick={() => setCurrentQuarter(q)} style={chip(currentQuarter === q)}>{shortLabel}{q}</button>)}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: isAdmin ? "repeat(3, minmax(0,1fr))" : "1fr", gap: 8 }}>
          {isAdmin ? <><PrimaryButton onClick={() => void onSaveCurrentQuarter()}>Save</PrimaryButton><SecondaryButton onClick={() => onLoadQuarter(currentQuarter)}>Load</SecondaryButton><SecondaryButton onClick={() => void onAutoGenerate()}>Auto</SecondaryButton></> : <div style={{ color: "#94a3b8" }}>Admin only.</div>}
        </div>
      </PageCard>

      {quarterWarnings.length > 0 ? (
        <PageCard tone="softYellow">
          <SectionHeader title={`${quarterWarnings.length} Rotation Checks`} subtitle="Review before loading an auto plan" />
          <div style={{ display: "grid", gap: 8 }}>
            {quarterWarnings.slice(0, 3).map((warning, index) => <div key={index} style={{ color: "#fdba74", fontWeight: 1000, borderRadius: 14, background: "rgba(154,52,18,0.18)", padding: 12, border: "1px solid rgba(251,146,60,0.42)" }}>{warning}</div>)}
          </div>
        </PageCard>
      ) : null}

      <PageCard>
        <SectionHeader title={`Current ${periodName}`} subtitle="Quick snapshot" />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Badge tone="blue">{shortLabel}{currentQuarter}</Badge>
          <Badge tone="green">Starters {currentFilledCount}</Badge>
          <Badge tone="yellow">Bench {benchIds.length}</Badge>
          {currentGoalkeeper !== "Empty" ? <Badge>GK {currentGoalkeeper}</Badge> : null}
        </div>
      </PageCard>

      <PageCard>
        <SectionHeader title={`Saved ${periodName} Plans`} subtitle="Load a saved rotation" />
        <div style={{ display: "grid", gap: 10 }}>{Array.from({ length: periodCount }, (_, i) => i + 1).map((q) => {
          const plan = quarterPlans[q]
          return <div key={q} style={{ borderRadius: 18, padding: 13, background: "rgba(15,23,42,0.74)", border: "1px solid rgba(125,211,252,0.18)", display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}><div><div style={{ color: "white", fontWeight: 1000 }}>{periodName} {q}</div><div style={{ color: "#94a3b8", fontSize: 12, fontWeight: 800 }}>{plan ? "Saved" : "No saved plan"}</div></div><div style={{ minWidth: 78 }}><SecondaryButton onClick={() => onLoadQuarter(q)}>Load</SecondaryButton></div></div>
        })}</div>
      </PageCard>
    </div>
  )
}
