"use client"

import type { TeamIdentity } from "../../lib/teamAccess"

type Props = {
  teams?: TeamIdentity[]
  selectedTeamId?: string
  canViewAll?: boolean
  onSelectTeam?: (teamId: string) => void
}

export default function ClubTeamsOverview({ teams = [], selectedTeamId, canViewAll = false, onSelectTeam }: Props) {
  return (
    <section style={{ display: "grid", gap: 14 }}>
      <div className="sharks-elite-panel sharks-card-shine" style={{ borderRadius: 28, padding: 18 }}>
        <div style={{ color: "#7dd3fc", fontSize: 11, fontWeight: 1000, letterSpacing: ".16em", textTransform: "uppercase" }}>
          Club Structure
        </div>
        <div style={{ color: "white", fontSize: 26, fontWeight: 1000, marginTop: 6 }}>
          Leonard Stanley Youth Teams
        </div>
        <div style={{ color: "#cbd5e1", fontWeight: 750, marginTop: 6 }}>
          Club admins can view all teams. Team admins and coaches work inside their assigned team while club tables remain visible to everyone.
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
        {teams.length === 0 ? (
          <div className="sharks-glass" style={{ borderRadius: 22, padding: 16, color: "#cbd5e1", fontWeight: 800 }}>
            No club teams configured yet.
          </div>
        ) : (
          teams.map((team) => {
            const selected = team.id === selectedTeamId
            const primary = team.primaryColour || "#0ea5e9"
            return (
              <button
                key={team.id}
                onClick={() => onSelectTeam?.(team.id)}
                disabled={!canViewAll && !selected}
                className="sharks-glass sharks-card-shine"
                style={{
                  borderRadius: 22,
                  padding: 14,
                  textAlign: "left",
                  border: selected ? `1px solid ${primary}` : "1px solid rgba(125,211,252,0.22)",
                  background: selected ? `${primary}22` : "rgba(2,6,23,0.44)",
                  color: "white",
                  cursor: canViewAll || selected ? "pointer" : "not-allowed",
                  opacity: canViewAll || selected ? 1 : 0.55,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 1000, fontSize: 18, overflow: "hidden", textOverflow: "ellipsis" }}>{team.name}</div>
                    <div style={{ color: "#94a3b8", fontSize: 12, fontWeight: 850, marginTop: 3 }}>{team.ageGroup || "Age group not set"}</div>
                  </div>
                  <div style={{ width: 34, height: 34, borderRadius: 12, background: primary, border: "1px solid rgba(255,255,255,0.24)" }} />
                </div>
                <div style={{ color: selected ? "#bae6fd" : "#94a3b8", fontSize: 12, fontWeight: 900, marginTop: 10 }}>
                  {selected ? "Current team" : canViewAll ? "Available" : "Locked"}
                </div>
              </button>
            )
          })
        )}
      </div>
    </section>
  )
}
