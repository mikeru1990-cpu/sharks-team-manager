"use client"

import { createContext, useContext, type ReactNode } from "react"
import type { TeamAccess } from "../../lib/auth"

type TeamAccessContextValue = {
  activeTeam: TeamAccess | null
  teams: TeamAccess[]
  setActiveTeamId: (teamId: string) => void
}

const TeamAccessContext = createContext<TeamAccessContextValue>({
  activeTeam: null,
  teams: [],
  setActiveTeamId: () => {},
})

export function TeamAccessProvider({
  activeTeam,
  teams,
  setActiveTeamId,
  children,
}: TeamAccessContextValue & { children: ReactNode }) {
  return (
    <TeamAccessContext.Provider value={{ activeTeam, teams, setActiveTeamId }}>
      {children}
    </TeamAccessContext.Provider>
  )
}

export function useTeamAccess() {
  return useContext(TeamAccessContext)
}
