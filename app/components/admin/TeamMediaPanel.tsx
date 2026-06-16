"use client"

import type { TeamIdentity } from "../../lib/teamAccess"

type Props = {
  team?: TeamIdentity | null
}

export default function TeamMediaPanel({ team }: Props) {
  if (!team) return null

  const items = [
    { label: "Badge", value: team.badgeUrl },
    { label: "Wallpaper", value: team.wallpaperUrl },
    { label: "Team Photo", value: team.teamPhotoUrl },
  ]

  return (
    <section className="sharks-glass sharks-card-shine" style={{ borderRadius: 24, padding: 16, display: "grid", gap: 12 }}>
      <div>
        <div style={{ color: "#7dd3fc", fontSize: 11, fontWeight: 1000, letterSpacing: ".15em", textTransform: "uppercase" }}>
          Team Media
        </div>
        <div style={{ color: "white", fontSize: 22, fontWeight: 1000, marginTop: 4 }}>
          Badge, Wallpaper and Team Photo
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
        {items.map((item) => (
          <div key={item.label} style={{ borderRadius: 18, padding: 12, background: "rgba(15,23,42,0.72)", border: "1px solid rgba(125,211,252,0.22)", display: "grid", gap: 8 }}>
            <div style={{ color: "white", fontWeight: 1000 }}>{item.label}</div>
            <div style={{ color: item.value ? "#86efac" : "#facc15", fontSize: 12, fontWeight: 900 }}>
              {item.value ? "Set" : "Not set"}
            </div>
            <button style={{ border: "1px solid rgba(56,189,248,0.35)", background: "rgba(14,165,233,0.12)", color: "#bae6fd", borderRadius: 14, padding: "9px 10px", fontWeight: 1000 }}>
              Change {item.label}
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}
