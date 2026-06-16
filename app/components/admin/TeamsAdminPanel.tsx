"use client"

import { useState } from "react"
import type { TeamIdentity } from "../../lib/teamAccess"
import { defaultClubTeams } from "../../lib/defaultTeams"
import TeamsAdminList from "./TeamsAdminList"
import TeamEditorPanel from "./TeamEditorPanel"
import TeamMediaStatus from "./TeamMediaStatus"

type Props = {
  teams?: TeamIdentity[]
}

export default function TeamsAdminPanel({ teams = defaultClubTeams }: Props) {
  const [selectedTeamId, setSelectedTeamId] = useState(teams[0]?.id || "")
  const selectedTeam = teams.find((team) => team.id === selectedTeamId) || teams[0] || null

  return (
    <section style={{ display: "grid", gap: 14 }}>
      <TeamsAdminList teams={teams} onEditTeam={setSelectedTeamId} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
        <TeamEditorPanel team={selectedTeam} />
        <TeamMediaStatus team={selectedTeam} />
      </div>
    </section>
  )
}
