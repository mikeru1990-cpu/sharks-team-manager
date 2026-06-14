"use client"

import type { TeamIdentity } from "../../lib/teamAccess"
import { getTeamDisplayName } from "../../lib/teamAccess"

type Props = {
  teams?: TeamIdentity[]
  activeTeamId?: string
  canSwitch?: boolean
  onChangeTeam?: (teamId: string) => void
}

export default function TeamSwitcherBar({ teams = [], activeTeamId = "all", canSwitch = false, onChangeTeam }: Props) {
  if (!canSwitch) return null

  return (
    <div className="sharks-glass sharks-card-shine" style={{ borderRadius: 22, padding: 12, display: "grid", gap: 8, border: "1px solid rgba(125,211,252,0.22)" }}>
      <label style={{ display: "grid", gap: 6 }}>
        <span style={{ color: "#94a3b8", fontSize: 11, fontWeight: 1000, letterSpacing: ".13em", textTransform: "uppercase" }}>
          Team Switcher
        </span>
        <select
          value={activeTeamId}
          onChange={(event) => onChangeTeam?.(event.target.value)}
          style={{
            width: "100%",
            border: "1px solid rgba(125,211,252,0.24)",
            background: "rgba(15,23,42,0.92)",
            color: "white",
            borderRadius: 14,
            padding: 12,
            fontWeight: 900,
          }}
        >
          <option value="all">All Teams</option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {getTeamDisplayName(team)}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
