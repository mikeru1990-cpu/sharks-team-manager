"use client"

import { useState } from "react"

type OverallStatus = "developing" | "improving" | "strong"

type PlayerFeedbackValue = {
  overallStatus: OverallStatus | null
  strengthArea: string
  focusArea: string
  coachNote: string
}

type Props = {
  playerName: string
  initialValue?: PlayerFeedbackValue
  onSave: (value: PlayerFeedbackValue) => Promise<void> | void
  saving?: boolean
}

const strengthOptions = [
  "Effort",
  "Passing",
  "Tackling",
  "Positioning",
  "Dribbling",
  "Communication",
  "Confidence",
  "Teamwork",
]

const focusOptions = [
  "First touch",
  "Passing quicker",
  "Decision making",
  "Tracking back",
  "Scanning",
  "Composure",
  "Shooting",
  "Calling for the ball",
]

function chipStyle(active: boolean) {
  return {
    padding: "10px 12px",
    borderRadius: 14,
    border: active ? "1px solid #1d4ed8" : "1px solid #cbd5e1",
    background: active ? "#dbeafe" : "white",
    color: active ? "#1e3a8a" : "#0f172a",
    fontWeight: 800 as const,
    fontSize: 14,
    cursor: "pointer",
    textAlign: "center" as const,
  }
}

export default function PlayerFeedbackCard({
  playerName,
  initialValue,
  onSave,
  saving = false,
}: Props) {
  const [overallStatus, setOverallStatus] = useState<OverallStatus | null>(
    initialValue?.overallStatus ?? null
  )
  const [strengthArea, setStrengthArea] = useState(initialValue?.strengthArea ?? "")
  const [focusArea, setFocusArea] = useState(initialValue?.focusArea ?? "")
  const [coachNote, setCoachNote] = useState(initialValue?.coachNote ?? "")

  async function handleSave() {
    await onSave({
      overallStatus,
      strengthArea,
      focusArea,
      coachNote: coachNote.trim(),
    })
  }

  return (
    <div
      style={{
        padding: 16,
        borderRadius: 20,
        border: "1px solid #e2e8f0",
        background: "white",
        display: "grid",
        gap: 16,
      }}
    >
      <div style={{ fontSize: 18, fontWeight: 900 }}>{playerName}</div>

      <div style={{ display: "grid", gap: 8 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: "#334155" }}>
          Overall today
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 8,
          }}
        >
          <button
            type="button"
            onClick={() => setOverallStatus("developing")}
            style={chipStyle(overallStatus === "developing")}
          >
            Developing
          </button>
          <button
            type="button"
            onClick={() => setOverallStatus("improving")}
            style={chipStyle(overallStatus === "improving")}
          >
            Improving
          </button>
          <button
            type="button"
            onClick={() => setOverallStatus("strong")}
            style={chipStyle(overallStatus === "strong")}
          >
            Strong
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        <label
          htmlFor={`${playerName}-strength`}
          style={{ fontSize: 14, fontWeight: 800, color: "#334155" }}
        >
          Strength shown
        </label>
        <select
          id={`${playerName}-strength`}
          value={strengthArea}
          onChange={(e) => setStrengthArea(e.target.value)}
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: 14,
            border: "1px solid #cbd5e1",
            background: "white",
            fontSize: 15,
          }}
        >
          <option value="">Select strength</option>
          {strengthOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        <label
          htmlFor={`${playerName}-focus`}
          style={{ fontSize: 14, fontWeight: 800, color: "#334155" }}
        >
          Next focus
        </label>
        <select
          id={`${playerName}-focus`}
          value={focusArea}
          onChange={(e) => setFocusArea(e.target.value)}
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: 14,
            border: "1px solid #cbd5e1",
            background: "white",
            fontSize: 15,
          }}
        >
          <option value="">Select focus area</option>
          {focusOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        <label
          htmlFor={`${playerName}-note`}
          style={{ fontSize: 14, fontWeight: 800, color: "#334155" }}
        >
          Coach note
        </label>
        <textarea
          id={`${playerName}-note`}
          value={coachNote}
          onChange={(e) => setCoachNote(e.target.value)}
          placeholder="Short positive note and one next step..."
          rows={4}
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: 14,
            border: "1px solid #cbd5e1",
            resize: "vertical",
            fontSize: 15,
            fontFamily: "inherit",
          }}
        />
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        style={{
          border: "none",
          background: saving ? "#94a3b8" : "#0f2c73",
          color: "white",
          borderRadius: 16,
          padding: "14px 16px",
          fontWeight: 900,
          fontSize: 16,
          cursor: saving ? "not-allowed" : "pointer",
        }}
      >
        {saving ? "Saving..." : "Save Feedback"}
      </button>
    </div>
  )
}
