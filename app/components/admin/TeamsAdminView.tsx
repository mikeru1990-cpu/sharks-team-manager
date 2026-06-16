"use client"

import { useMemo, useState } from "react"
import type { TeamIdentity } from "../../lib/teamAccess"
import { defaultClubTeams } from "../../lib/defaultTeams"
import TeamsAdminList from "./TeamsAdminList"
import TeamEditorPanel from "./TeamEditorPanel"
import TeamMediaStatus from "./TeamMediaStatus"
import TeamBrandPreview from "../layout/TeamBrandPreview"

type Props = {
  teams?: TeamIdentity[]
}

export default function TeamsAdminView({ teams }: Props) {
  const clubTeams = useMemo(() => teams && teams.length ? teams : defaultClubTeams, [teams])
  const [selectedTeamId, setSelectedTeamId] = useState(clubTeams[0]?.id || "")
  const selectedTeam = clubTeams.find((team) => team.id === selectedTeamId) || clubTeams[0] || null

  return (
    <section style={{ display: "grid", gap: 16 }}>
      <TeamBrandPreview team={selectedTeam} compact />
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.15fr) minmax(280px, .85fr)", gap: 16 }}>
        <TeamsAdminList teams={clubTeams} onEditTeam={setSelectedTeamId} />
        <div style={{ display: "grid", gap: 16, alignContent: "start" }}>
          <TeamEditorPanel team={selectedTeam} />
          <TeamMediaStatus team={selectedTeam} />
        </div>
      </div>
    </section>
  )
}
