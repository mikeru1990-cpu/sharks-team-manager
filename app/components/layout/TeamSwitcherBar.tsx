"use client"

import type { TeamIdentity } from "../../lib/teamAccess"
import { getTeamDisplayName } from "../../lib/teamAccess"

type Props = {
  teams?: TeamIdentity[]
  activeTeamId?: string
  canSwitch?: boolean
  onChangeTeam?: (teamId: string) => void
}

function quickTeamStyle(active: boolean, colour: string): React.CSSProperties {
  return {
    border: active ? `1px solid ${colour}99` : "1px solid rgba(148,163,184,0.16)",
    background: active ? `${colour}22` : "rgba(255,255,255,0.045)",
    color: active ? "white" : "#cbd5e1",
    borderRadius: 999,
    padding: "8px 10px",
    fontWeight: 1000,
    fontSize: 11,
    cursor: "pointer",
    whiteSpace: "nowrap",
  }
}

export default function TeamSwitcherBar({ teams = [], activeTeamId = "all", canSwitch = false, onChangeTeam }: Props) {
  if (!canSwitch) return null

  const activeTeam = teams.find((team) => team.id === activeTeamId)
  const colour = activeTeam?.primaryColour || "#38bdf8"
  const activeLabel = activeTeam ? getTeamDisplayName(activeTeam) : "All Teams"
  const quickTeams = teams.slice(0, 3)

  function choose(teamId: string) {
    onChangeTeam?.(teamId)
  }

  return (
    <div className="sharks-glass sharks-card-shine" style={{ borderRadius: 22, padding: 12, display: "grid", gap: 10, border: `1px solid ${colour}44`, overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", minWidth: 0 }}>
        <div style={{ display: "grid", gap: 3, minWidth: 0 }}>
          <div style={{ color: "#94a3b8", fontSize: 10, fontWeight: 1000, letterSpacing: ".14em", textTransform: "uppercase" }}>Current Team</div>
          <div style={{ color: "white", fontSize: 17, fontWeight: 1000, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{activeLabel}</div>
        </div>
        <div style={{ borderRadius: 999, padding: "7px 10px", background: `${colour}18`, border: `1px solid ${colour}55`, color: colour, fontWeight: 1000, fontSize: 11, whiteSpace: "nowrap" }}>{activeTeamId === "all" ? "Club-wide" : "Workspace"}</div>
      </div>
      <select value={activeTeamId} onChange={(event) => choose(event.target.value)} style={{ width: "100%", border: `1px solid ${colour}55`, background: "rgba(2,6,23,0.72)", color: "white", borderRadius: 15, padding: "11px 12px", fontWeight: 1000, minWidth: 0 }}>
        <option value="all">All Teams</option>
        {teams.map((team) => <option key={team.id} value={team.id}>{getTeamDisplayName(team)}</option>)}
      </select>
      <div style={{ display: "flex", gap: 7, overflowX: "auto", paddingBottom: 2 }}>
        <button onClick={() => choose("all")} style={quickTeamStyle(activeTeamId === "all", colour)}>All Teams</button>
        {quickTeams.map((team) => <button key={team.id} onClick={() => choose(team.id)} style={quickTeamStyle(activeTeamId === team.id, team.primaryColour || colour)}>{getTeamDisplayName(team)}</button>)}
      </div>
    </div>
  )
}
