"use client"

import type { PitchSlot, Player, QuarterPlan } from "../lib/types"
import { buttonPrimary, buttonSecondary, cardStyle, chipStyle } from "../lib/types"

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

export default function QuarterPlanner({
  isAdmin,
  currentQuarter,
  setCurrentQuarter,
  quarterPlans,
  quarterWarnings,
  currentSlots,
  players,
  lineupMap,
  benchIds,
  onSaveCurrentQuarter,
  onLoadQuarter,
  onAutoGenerate,
  periodMode,
  periodLength,
}: Props) {
  const periodCount = periodMode === "quarters" ? 4 : 2
  const periodName = periodMode === "quarters" ? "Quarter" : "Half"
  const shortLabel = periodMode === "quarters" ? "Q" : "H"

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={cardStyle()}>
        <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>
          {periodName} Planner Engine
        </div>

        <div style={{ color: "#475569", marginBottom: 12 }}>
          {periodCount} {periodName.toLowerCase()}
          {periodCount > 1 ? "s" : ""} • {periodLength} minutes each
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
          {Array.from({ length: periodCount }, (_, i) => i + 1).map((q) => (
            <button
              key={q}
              onClick={() => setCurrentQuarter(q)}
              style={{
                ...chipStyle(currentQuarter === q),
                minWidth: 56,
              }}
            >
              {shortLabel}
              {q}
            </button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 10 }}>
          {isAdmin ? (
            <>
              <button onClick={onSaveCurrentQuarter} style={buttonPrimary()}>
                Save {shortLabel}
                {currentQuarter}
              </button>
              <button onClick={() => onLoadQuarter(currentQuarter)} style={buttonSecondary()}>
                Load {shortLabel}
                {currentQuarter}
              </button>
              <button onClick={onAutoGenerate} style={buttonSecondary()}>
                Auto Generate
              </button>
            </>
          ) : (
            <div style={{ color: "#64748b" }}>Admin only.</div>
          )}
        </div>
      </div>

      <div style={cardStyle("#eff6ff")}>
        <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 8 }}>Goalkeeper Rules</div>
        <div style={{ color: "#334155" }}>
          {periodName} generation always tries <strong>Main GK</strong> first, then <strong>Backup GK</strong>, then any other GK-capable player.
        </div>
      </div>

      {quarterWarnings.length > 0 ? (
        <div style={{ ...cardStyle("#fff7ed"), border: "1px solid #fed7aa" }}>
          <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 10 }}>
            {periodName} Warnings
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {quarterWarnings.map((warning, index) => (
              <div key={index} style={{ color: "#9a3412", fontWeight: 700 }}>
                {warning}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div style={cardStyle()}>
        <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>
          Current {periodName} Snapshot
        </div>
        <div style={{ display: "grid", gap: 6 }}>
          {currentSlots.map((slot) => (
            <div key={slot.id}>
              {slot.label}: {players.find((p) => p.id === lineupMap[slot.id])?.name || "Empty"}
            </div>
          ))}
          <div style={{ marginTop: 8, color: "#475569" }}>
            Bench: {benchIds.map((id) => players.find((p) => p.id === id)?.name || "").join(", ") || "None"}
          </div>
        </div>
      </div>

      <div style={cardStyle()}>
        <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>
          Saved {periodName} Plans
        </div>
        <div style={{ display: "grid", gap: 12 }}>
          {Array.from({ length: periodCount }, (_, i) => i + 1).map((q) => {
            const plan = quarterPlans[q]
            return (
              <div
                key={q}
                style={{
                  padding: 14,
                  borderRadius: 16,
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                  <div style={{ fontWeight: 900, fontSize: 18 }}>
                    {periodName} {q}
                  </div>
                  <button onClick={() => onLoadQuarter(q)} style={buttonSecondary()}>
                    Load
                  </button>
                </div>

                {!plan ? (
                  <div style={{ marginTop: 8, color: "#64748b" }}>No saved plan.</div>
                ) : (
                  <>
                    <div style={{ marginTop: 10, fontWeight: 800 }}>Lineup</div>
                    <div style={{ display: "grid", gap: 6, marginTop: 6 }}>
                      {currentSlots.map((slot) => (
                        <div key={`${q}-${slot.id}`} style={{ color: "#475569" }}>
                          {slot.label}: {players.find((p) => p.id === plan.lineup[slot.id])?.name || "Empty"}
                        </div>
                      ))}
                    </div>

                    <div style={{ marginTop: 10, fontWeight: 800 }}>Bench</div>
                    <div style={{ color: "#475569", marginTop: 6 }}>
                      {plan.bench.length === 0
                        ? "No bench"
                        : plan.bench.map((id) => players.find((p) => p.id === id)?.name || "").join(", ")}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
