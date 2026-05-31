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

const colours = {
  text: "#f8fafc",
  softText: "#cbd5e1",
  muted: "#94a3b8",
  blue: "#7dd3fc",
  green: "#22c55e",
  yellow: "#facc15",
  orange: "#fdba74",
}

function playerName(players: Player[], id?: string | null) {
  return players.find((player) => player.id === id)?.name || "Empty"
}

function cardStyle() {
  return {
    borderRadius: 18,
    background: "linear-gradient(135deg, rgba(15,23,42,0.92), rgba(30,41,59,0.74))",
    border: "1px solid rgba(125,211,252,0.20)",
    color: colours.text,
    boxShadow: "0 18px 42px rgba(2,6,23,0.30)",
  }
}

function periodChipStyle(active: boolean) {
  return {
    border: active ? "1px solid rgba(125,211,252,0.75)" : "1px solid rgba(148,163,184,0.22)",
    background: active ? "linear-gradient(135deg, rgba(14,165,233,0.28), rgba(37,99,235,0.22))" : "rgba(255,255,255,0.06)",
    color: active ? colours.blue : colours.softText,
    borderRadius: 16,
    padding: "12px 14px",
    fontWeight: 900 as const,
    fontSize: 14,
    minWidth: 64,
    boxShadow: active ? "0 0 22px rgba(56,189,248,0.18)" : "none",
    cursor: "pointer",
  }
}

function MiniStat({ label, value, tone = "blue" }: { label: string; value: string | number; tone?: "blue" | "green" | "yellow" | "default" }) {
  const colour = tone === "green" ? colours.green : tone === "yellow" ? colours.yellow : tone === "default" ? colours.softText : colours.blue
  return (
    <div style={{ ...cardStyle(), padding: 12, border: `1px solid ${colour}55` }}>
      <div style={{ fontSize: 11, fontWeight: 1000, letterSpacing: ".09em", color: colours.muted, textTransform: "uppercase" }}>{label}</div>
      <div style={{ marginTop: 5, fontSize: 24, fontWeight: 1000, lineHeight: 1, color: colour }}>{value}</div>
    </div>
  )
}

function SnapshotRow({ label, value }: { label: string; value: string }) {
  const empty = value === "Empty"
  return (
    <div style={{ display: "grid", gridTemplateColumns: "112px minmax(0, 1fr)", gap: 10, padding: "11px 0", borderBottom: "1px solid rgba(148,163,184,0.16)" }}>
      <div style={{ fontWeight: 1000, color: colours.text }}>{label}</div>
      <div style={{ color: empty ? colours.muted : colours.softText, fontWeight: empty ? 700 : 850 }}>{value}</div>
    </div>
  )
}

function SavedPlanCard({ title, plan, players, currentSlots, onLoad }: { title: string; plan?: QuarterPlan; players: Player[]; currentSlots: PitchSlot[]; onLoad: () => void }) {
  const filledSlots = plan ? currentSlots.filter((slot) => plan.lineup[slot.id]).length : 0
  const gkSlot = currentSlots.find((slot) => slot.position === "GK")
  const goalkeeperName = plan ? playerName(players, plan.lineup[gkSlot?.id || ""]) : "Not set"
  const benchNames = plan ? plan.bench.map((id) => playerName(players, id)).filter((name) => name !== "Empty") : []

  return (
    <div style={{ ...cardStyle(), padding: 16, display: "grid", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontWeight: 1000, fontSize: 20, color: colours.text }}>{title}</div>
          <div style={{ color: colours.muted, marginTop: 4, fontSize: 14, fontWeight: 750 }}>{plan ? "Saved rotation plan ready to load." : "No saved plan yet."}</div>
        </div>
        <div style={{ minWidth: 100 }}><SecondaryButton onClick={onLoad}>Load</SecondaryButton></div>
      </div>

      {!plan ? (
        <div style={{ borderRadius: 16, border: "1px dashed rgba(148,163,184,0.34)", background: "rgba(255,255,255,0.045)", padding: 14, color: colours.softText, fontWeight: 750 }}>Save the current setup or auto-generate to create this plan.</div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 10 }}>
            <MiniStat label="Starters" value={filledSlots} tone="blue" />
            <MiniStat label="Bench" value={plan.bench.length} tone="yellow" />
            <MiniStat label="Goalkeeper" value={goalkeeperName === "Empty" ? "—" : "1"} tone="green" />
          </div>
          <div style={{ color: colours.softText, fontSize: 14, lineHeight: 1.5, fontWeight: 750 }}>
            <strong style={{ color: colours.text }}>GK:</strong> {goalkeeperName}<br />
            <strong style={{ color: colours.text }}>Bench:</strong> {benchNames.length ? benchNames.join(", ") : "None"}
          </div>
        </>
      )}
    </div>
  )
}

export default function QuarterPlanner({ isAdmin, currentQuarter, setCurrentQuarter, quarterPlans, quarterWarnings, currentSlots, players, lineupMap, benchIds, onSaveCurrentQuarter, onLoadQuarter, onAutoGenerate, periodMode, periodLength }: Props) {
  const periodCount = periodMode === "quarters" ? 4 : 2
  const periodName = periodMode === "quarters" ? "Quarter" : "Half"
  const shortLabel = periodMode === "quarters" ? "Q" : "H"
  const currentFilledCount = currentSlots.filter((slot) => lineupMap[slot.id]).length
  const gkSlot = currentSlots.find((slot) => slot.position === "GK")
  const currentGoalkeeper = playerName(players, lineupMap[gkSlot?.id || ""])

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <PageCard>
        <SectionHeader title={`${periodName} Planner Engine`} subtitle={`${periodCount} ${periodName.toLowerCase()}${periodCount > 1 ? "s" : ""} • ${periodLength} minutes each`} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10, marginBottom: 14 }}>
          <MiniStat label={`Current ${periodName}`} value={`${shortLabel}${currentQuarter}`} tone="blue" />
          <MiniStat label="Starters" value={currentFilledCount} tone="green" />
          <MiniStat label="Bench" value={benchIds.length} tone="yellow" />
          <MiniStat label="Length" value={`${periodLength}m`} tone="default" />
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
          {Array.from({ length: periodCount }, (_, i) => i + 1).map((q) => <button key={q} onClick={() => setCurrentQuarter(q)} style={periodChipStyle(currentQuarter === q)}>{shortLabel}{q}</button>)}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: isAdmin ? "repeat(3, minmax(0,1fr))" : "1fr", gap: 10 }}>
          {isAdmin ? <><PrimaryButton onClick={() => void onSaveCurrentQuarter()}>Save {shortLabel}{currentQuarter}</PrimaryButton><SecondaryButton onClick={() => onLoadQuarter(currentQuarter)}>Load {shortLabel}{currentQuarter}</SecondaryButton><SecondaryButton onClick={() => void onAutoGenerate()}>Auto Generate</SecondaryButton></> : <div style={{ color: colours.muted }}>Admin only.</div>}
        </div>
      </PageCard>

      <PageCard>
        <SectionHeader title="Goalkeeper Rules" subtitle={`${periodName} generation priority order`} />
        <div style={{ ...cardStyle(), padding: 16, color: colours.softText, lineHeight: 1.65, fontWeight: 750 }}>
          Generation always tries <strong style={{ color: colours.text }}>Main GK</strong> first, then <strong style={{ color: colours.text }}>Backup GK</strong>, then any other goalkeeper-capable player.
        </div>
      </PageCard>

      {quarterWarnings.length > 0 ? (
        <PageCard tone="softYellow">
          <SectionHeader title={`${periodName} Warnings`} subtitle="Things to review before loading a plan" />
          <div style={{ display: "grid", gap: 10 }}>
            {quarterWarnings.map((warning, index) => <div key={index} style={{ color: colours.orange, fontWeight: 1000, borderRadius: 16, background: "rgba(154,52,18,0.22)", padding: 14, border: "1px solid rgba(251,146,60,0.52)", boxShadow: "0 10px 28px rgba(154,52,18,0.16)" }}>{warning}</div>)}
          </div>
        </PageCard>
      ) : null}

      <PageCard>
        <SectionHeader title={`Current ${periodName} Snapshot`} subtitle="What is currently selected right now" />
        <div style={{ ...cardStyle(), padding: 14 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
            <Badge tone="blue">{shortLabel}{currentQuarter}</Badge>
            <Badge tone="green">Starters: {currentFilledCount}</Badge>
            <Badge tone="yellow">Bench: {benchIds.length}</Badge>
            {currentGoalkeeper !== "Empty" ? <Badge>GK: {currentGoalkeeper}</Badge> : null}
          </div>
          <div style={{ display: "grid" }}>{currentSlots.map((slot) => <SnapshotRow key={slot.id} label={slot.label} value={playerName(players, lineupMap[slot.id])} />)}</div>
          <div style={{ marginTop: 12, color: colours.softText, lineHeight: 1.5, fontWeight: 750 }}><strong style={{ color: colours.text }}>Bench:</strong> {benchIds.map((id) => playerName(players, id)).filter((name) => name !== "Empty").join(", ") || "None"}</div>
        </div>
      </PageCard>

      <PageCard>
        <SectionHeader title={`Saved ${periodName} Plans`} subtitle={`Load a prepared ${periodName.toLowerCase()} in one tap`} />
        <div style={{ display: "grid", gap: 12 }}>{Array.from({ length: periodCount }, (_, i) => i + 1).map((q) => <SavedPlanCard key={q} title={`${periodName} ${q}`} plan={quarterPlans[q]} players={players} currentSlots={currentSlots} onLoad={() => onLoadQuarter(q)} />)}</div>
      </PageCard>
    </div>
  )
}
