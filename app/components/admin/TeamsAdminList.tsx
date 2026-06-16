"use client"

import type { TeamIdentity } from "../../lib/teamAccess"
import { getTeamDisplayName } from "../../lib/teamAccess"
import { defaultClubTeams } from "../../lib/defaultTeams"

type Props = {
  teams?: TeamIdentity[]
  onEditTeam?: (teamId: string) => void
}

export default function TeamsAdminList({ teams = defaultClubTeams, onEditTeam }: Props) {
  return (
    <section className="sharks-elite-panel sharks-card-shine" style={{ borderRadius: 28, padding: 18, display: "grid", gap: 14 }}>
      <div>
        <div style={{ color: "#7dd3fc", fontSize: 11, fontWeight: 1000, letterSpacing: ".16em", textTransform: "uppercase" }}>
          Club Admin
        </div>
        <div style={{ color: "white", fontSize: 28, fontWeight: 1000, marginTop: 6 }}>
          Teams Manager
        </div>
        <div style={{ color: "#cbd5e1", fontWeight: 750, marginTop: 6 }}>
          Manage boys, girls, mixed teams and multiple squads in the same age group.
        </div>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {teams.map((team) => (
          <div key={team.id} style={{ borderRadius: 18, padding: 12, background: "rgba(15,23,42,0.72)", border: `1px solid ${(team.primaryColour || "#38bdf8")}55`, display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <div>
              <div style={{ color: "white", fontWeight: 1000, fontSize: 18 }}>{getTeamDisplayName(team)}</div>
              <div style={{ color: "#94a3b8", fontSize: 12, fontWeight: 850 }}>
                {team.ageGroup || "No age"} • {team.section || "No section"} • {team.squadName || "No squad"}
              </div>
            </div>
            <button onClick={() => onEditTeam?.(team.id)} style={{ border: "1px solid rgba(56,189,248,0.45)", background: "rgba(14,165,233,0.14)", color: "#bae6fd", borderRadius: 14, padding: "10px 12px", fontWeight: 1000 }}>
              Edit
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}
