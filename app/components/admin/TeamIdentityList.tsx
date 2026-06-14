"use client"

import type { TeamIdentity } from "../../lib/teamAccess"

type Props = {
  teams?: TeamIdentity[]
  canEdit?: boolean
  onEdit?: (team: TeamIdentity) => void
}

export default function TeamIdentityList({ teams = [], canEdit = false, onEdit }: Props) {
  return (
    <section style={{ display: "grid", gap: 14 }}>
      <div className="sharks-elite-panel sharks-card-shine" style={{ borderRadius: 28, padding: 18 }}>
        <div style={{ color: "#7dd3fc", fontSize: 11, fontWeight: 1000, letterSpacing: ".16em", textTransform: "uppercase" }}>
          Team Identity
        </div>
        <div style={{ color: "white", fontSize: 26, fontWeight: 1000, marginTop: 6 }}>
          Club Team Branding
        </div>
        <div style={{ color: "#cbd5e1", fontWeight: 750, marginTop: 6 }}>
          Manage team names, age groups, badges, wallpapers and colour themes.
        </div>
      </div>

      {teams.length === 0 ? (
        <div className="sharks-glass" style={{ borderRadius: 22, padding: 16, color: "#cbd5e1", fontWeight: 800 }}>
          No teams added yet.
        </div>
      ) : (
        teams.map((team) => (
          <div key={team.id} className="sharks-glass sharks-card-shine" style={{ borderRadius: 24, padding: 14, border: "1px solid rgba(125,211,252,0.22)", display: "grid", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
              <div>
                <div style={{ color: "white", fontSize: 20, fontWeight: 1000 }}>{team.name}</div>
                <div style={{ color: "#94a3b8", fontSize: 13, fontWeight: 850 }}>{team.ageGroup || "Age group not set"}</div>
              </div>
              <div style={{ width: 42, height: 42, borderRadius: 14, background: team.primaryColour || "#0ea5e9", border: "1px solid rgba(255,255,255,0.22)" }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 8, color: "#cbd5e1", fontSize: 12, fontWeight: 850 }}>
              <div>Badge: {team.badgeUrl ? "Set" : "Not set"}</div>
              <div>Wallpaper: {team.wallpaperUrl ? "Set" : "Not set"}</div>
              <div>Photo: {team.teamPhotoUrl ? "Set" : "Not set"}</div>
            </div>

            {canEdit ? (
              <button onClick={() => onEdit?.(team)} style={{ border: "1px solid rgba(56,189,248,0.35)", background: "rgba(14,165,233,0.12)", color: "#bae6fd", borderRadius: 14, padding: "10px 12px", fontWeight: 1000 }}>
                Edit Team Identity
              </button>
            ) : null}
          </div>
        ))
      )}
    </section>
  )
}
