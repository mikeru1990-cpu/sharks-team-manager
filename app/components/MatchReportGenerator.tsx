"use client"

import { useState } from "react"
import {
  buttonPrimary,
  buttonSecondary,
  cardStyle,
  type MatchReport,
} from "../lib/types"

type Props = {
  isAdmin: boolean
  activeMatchTitle: string
  activeMatchDate: string
  opponent: string
  scoreLine: string
  playerOfTheMatch: string
  topPerformers: string[]
  goalsSummary: string[]
  onSaveReport: (coachNotes: string) => Promise<void>
  latestReport: MatchReport | null
}

export default function MatchReportGenerator({
  isAdmin,
  activeMatchTitle,
  activeMatchDate,
  opponent,
  scoreLine,
  playerOfTheMatch,
  topPerformers,
  goalsSummary,
  onSaveReport,
  latestReport,
}: Props) {
  const [coachNotes, setCoachNotes] = useState("")

  const previewText = [
    `${activeMatchTitle}`,
    `${activeMatchDate}`,
    `Result: ${scoreLine}`,
    `Opponent: ${opponent}`,
    `Player of the Match: ${playerOfTheMatch || "TBC"}`,
    topPerformers.length ? `Top performers: ${topPerformers.join(", ")}` : "",
    goalsSummary.length ? `Goals: ${goalsSummary.join(" | ")}` : "Goals: none logged",
    coachNotes.trim() ? `Coach notes: ${coachNotes.trim()}` : "",
  ]
    .filter(Boolean)
    .join("\n")

  async function handleSave() {
    if (!isAdmin) return
    await onSaveReport(coachNotes)
    setCoachNotes("")
  }

  async function copyText() {
    const text = latestReport?.reportText || previewText
    try {
      await navigator.clipboard.writeText(text)
      alert("Match report copied")
    } catch {
      alert("Could not copy report")
    }
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={cardStyle()}>
        <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>
          Match Report Generator
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          <div
            style={{
              padding: 12,
              borderRadius: 14,
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
            }}
          >
            <div style={{ fontWeight: 900 }}>{activeMatchTitle}</div>
            <div style={{ color: "#475569", marginTop: 4 }}>{activeMatchDate}</div>
            <div style={{ color: "#475569", marginTop: 4 }}>Score: {scoreLine}</div>
            <div style={{ color: "#475569", marginTop: 4 }}>Opponent: {opponent}</div>
            <div style={{ color: "#475569", marginTop: 4 }}>
              Player of the Match: {playerOfTheMatch || "TBC"}
            </div>
          </div>

          <textarea
            value={coachNotes}
            onChange={(e) => setCoachNotes(e.target.value)}
            placeholder="Coach notes for report..."
            style={{
              minHeight: 110,
              padding: 14,
              borderRadius: 14,
              border: "1px solid #cbd5e1",
              fontSize: 16,
              resize: "vertical",
            }}
          />

          <div
            style={{
              padding: 12,
              borderRadius: 14,
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              whiteSpace: "pre-wrap",
              color: "#334155",
            }}
          >
            {previewText}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
          {isAdmin ? (
            <button onClick={() => void handleSave()} style={buttonPrimary()}>
              Save Match Report
            </button>
          ) : null}
          <button onClick={() => void copyText()} style={buttonSecondary()}>
            Copy Report
          </button>
        </div>
      </div>

      {latestReport ? (
        <div style={cardStyle()}>
          <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>
            Latest Saved Report
          </div>
          <div
            style={{
              whiteSpace: "pre-wrap",
              color: "#334155",
              padding: 12,
              borderRadius: 14,
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
            }}
          >
            {latestReport.reportText}
          </div>
        </div>
      ) : null}
    </div>
  )
}
