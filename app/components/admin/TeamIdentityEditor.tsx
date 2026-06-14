"use client"

import { useEffect, useState } from "react"
import type { TeamIdentity } from "../../lib/teamAccess"

type Props = {
  team?: TeamIdentity | null
  open?: boolean
  onClose?: () => void
  onSave?: (team: TeamIdentity) => void | Promise<void>
}

const blankTeam: TeamIdentity = {
  id: "",
  name: "",
  ageGroup: "",
  badgeUrl: "",
  wallpaperUrl: "",
  teamPhotoUrl: "",
  primaryColour: "#0ea5e9",
  secondaryColour: "#ffffff",
}

export default function TeamIdentityEditor({ team, open = false, onClose, onSave }: Props) {
  const [draft, setDraft] = useState<TeamIdentity>(team || blankTeam)

  useEffect(() => {
    setDraft(team || blankTeam)
  }, [team])

  if (!open) return null

  function update<K extends keyof TeamIdentity>(key: K, value: TeamIdentity[K]) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 90,
        background: "rgba(2,6,23,0.72)",
        padding: 16,
        display: "grid",
        placeItems: "center",
      }}
    >
      <div className="sharks-glass sharks-card-shine" style={{ width: "min(620px, 100%)", borderRadius: 28, padding: 18, display: "grid", gap: 12 }}>
        <div>
          <div style={{ color: "#7dd3fc", fontSize: 11, fontWeight: 1000, letterSpacing: ".16em", textTransform: "uppercase" }}>
            Team Setup
          </div>
          <div style={{ color: "white", fontSize: 26, fontWeight: 1000, marginTop: 4 }}>
            Edit Team Identity
          </div>
        </div>

        <Field label="Team name" value={draft.name} onChange={(value) => update("name", value)} />
        <Field label="Age group" value={draft.ageGroup || ""} onChange={(value) => update("ageGroup", value)} />
        <Field label="Badge image URL" value={draft.badgeUrl || ""} onChange={(value) => update("badgeUrl", value)} />
        <Field label="Wallpaper image URL" value={draft.wallpaperUrl || ""} onChange={(value) => update("wallpaperUrl", value)} />
        <Field label="Team photo URL" value={draft.teamPhotoUrl || ""} onChange={(value) => update("teamPhotoUrl", value)} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Field label="Primary colour" value={draft.primaryColour || "#0ea5e9"} onChange={(value) => update("primaryColour", value)} />
          <Field label="Secondary colour" value={draft.secondaryColour || "#ffffff"} onChange={(value) => update("secondaryColour", value)} />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, flexWrap: "wrap", marginTop: 6 }}>
          <button onClick={onClose} style={{ border: "1px solid rgba(148,163,184,0.30)", background: "rgba(148,163,184,0.12)", color: "white", borderRadius: 14, padding: "10px 13px", fontWeight: 1000 }}>
            Cancel
          </button>
          <button onClick={() => void onSave?.(draft)} style={{ border: "1px solid rgba(34,197,94,0.42)", background: "rgba(34,197,94,0.16)", color: "#bbf7d0", borderRadius: 14, padding: "10px 13px", fontWeight: 1000 }}>
            Save Team
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ color: "#cbd5e1", fontSize: 12, fontWeight: 900 }}>{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={{ width: "100%", borderRadius: 14, border: "1px solid rgba(125,211,252,0.24)", background: "rgba(15,23,42,0.86)", color: "white", padding: 11, fontWeight: 800 }}
      />
    </label>
  )
}
