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
    <div
      className="sharks-glass"
      style={{
        borderRadius: 18,
        padding: 10,
        display: "grid",
        gridTemplateColumns: "auto minmax(0, 1fr)",
        gap: 10,
        alignItems: "center",
        border: "1px solid rgba(125,211,252,0.20)",
      }}
    >
      <div style={{ color: "#94a3b8", fontSize: 10, fontWeight: 1000, letterSpacing: ".12em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
        Team
      </div>
      <select
        value={activeTeamId}
        onChange={(event) => onChangeTeam?.(event.target.value)}
        style={{
          width: "100%",
          border: "1px solid rgba(125,211,252,0.22)",
          background: "rgba(2,6,23,0.72)",
          color: "white",
          borderRadius: 13,
          padding: "10px 12px",
          fontWeight: 1000,
          minWidth: 0,
        }}
      >
        <option value="all">All Teams</option>
        {teams.map((team) => (
          <option key={team.id} value={team.id}>
            {getTeamDisplayName(team)}
          </option>
        ))}
      </select>
    </div>
  )
}
