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

  const activeTeam = teams.find((team) => team.id === activeTeamId)
  const colour = activeTeam?.primaryColour || "#38bdf8"
  const activeLabel = activeTeam ? getTeamDisplayName(activeTeam) : "All Teams"

  return (
    <div
      className="sharks-glass"
      style={{
        borderRadius: 20,
        padding: 10,
        display: "grid",
        gridTemplateColumns: "auto minmax(0, 1fr)",
        gap: 10,
        alignItems: "center",
        border: `1px solid ${colour}44`,
      }}
    >
      <div style={{ width: 8, height: 42, borderRadius: 999, background: colour, boxShadow: `0 0 18px ${colour}` }} />
      <div style={{ display: "grid", gap: 6, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
          <div style={{ color: "#94a3b8", fontSize: 10, fontWeight: 1000, letterSpacing: ".12em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
            Team Workspace
          </div>
          <div style={{ color: colour, fontSize: 11, fontWeight: 1000, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {activeLabel}
          </div>
        </div>
        <select
          value={activeTeamId}
          onChange={(event) => onChangeTeam?.(event.target.value)}
          style={{
            width: "100%",
            border: `1px solid ${colour}55`,
            background: "rgba(2,6,23,0.72)",
            color: "white",
            borderRadius: 14,
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
    </div>
  )
}
