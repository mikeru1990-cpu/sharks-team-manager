"use client"

export const dynamic = "force-dynamic"

import { useEffect, useMemo, useState } from "react"

import AuthGate from "./components/AuthGate"
import SameTabStorageSync from "./components/SameTabStorageSync"
import PremiumAppShell from "./components/layout/PremiumAppShell"
import AppRouter from "./components/navigation/AppRouter"
import SquadCloudBridge from "./components/system/SquadCloudBridge"
import { TeamAccessProvider } from "./components/system/TeamAccessProvider"

import type { TeamAccess } from "./lib/auth"
import type { WorkspaceTab } from "./lib/workspaces"

const LAST_WORKSPACE_KEY = "football-os:last-workspace"
const WORKSPACE_TABS: WorkspaceTab[] = ["home", "matchday", "training", "players", "insights", "club"]
const VIEW_ONLY_TABS: WorkspaceTab[] = ["home", "players", "club"]
const AUTH_REQUIRED = process.env.NEXT_PUBLIC_AUTH_REQUIRED === "true"

const PREVIEW_TEAM: TeamAccess = {
  teamId: "team-u11-girls",
  teamName: "U11 Girls",
  ageGroup: "U11",
  season: "2026/27",
  clubId: "club-leonard-stanley-fc",
  clubName: "Leonard Stanley FC",
  role: "manager",
  canManage: true,
}

function AppDashboard({
  isAdmin,
  teams,
  activeTeam,
  setActiveTeamId,
  signOut,
}: {
  isAdmin: boolean
  teams: TeamAccess[]
  activeTeam: TeamAccess
  setActiveTeamId: (teamId: string) => void
  signOut: () => Promise<void>
}) {
  const allowedTabs = useMemo(
    () => activeTeam.canManage ? WORKSPACE_TABS : VIEW_ONLY_TABS,
    [activeTeam.canManage],
  )
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("home")

  useEffect(() => {
    const savedWorkspace = window.localStorage.getItem(LAST_WORKSPACE_KEY) as WorkspaceTab | null
    if (savedWorkspace && allowedTabs.includes(savedWorkspace)) {
      setActiveTab(savedWorkspace)
    } else {
      setActiveTab("home")
      window.localStorage.setItem(LAST_WORKSPACE_KEY, "home")
    }
  }, [activeTeam.teamId, allowedTabs])

  function handleTabChange(tab: WorkspaceTab) {
    if (!allowedTabs.includes(tab)) return
    setActiveTab(tab)
    window.localStorage.setItem(LAST_WORKSPACE_KEY, tab)
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" })
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
    })
  }

  return (
    <TeamAccessProvider
      activeTeam={activeTeam}
      teams={teams}
      setActiveTeamId={setActiveTeamId}
    >
      <PremiumAppShell
        activeTab={activeTab}
        onTabChange={handleTabChange}
        allowedTabs={allowedTabs}
        activeTeam={activeTeam}
        teams={teams}
        onTeamChange={setActiveTeamId}
        isAdmin={isAdmin}
        signOut={signOut}
      >
        <SameTabStorageSync />
        <SquadCloudBridge />
        <AppRouter activeTab={activeTab} onNavigate={handleTabChange} />
      </PremiumAppShell>
    </TeamAccessProvider>
  )
}

async function previewSignOut() {
  // Authentication is intentionally disabled for the private preview build.
}

export default function Page() {
  if (!AUTH_REQUIRED) {
    return (
      <AppDashboard
        isAdmin={true}
        teams={[PREVIEW_TEAM]}
        activeTeam={PREVIEW_TEAM}
        setActiveTeamId={() => {}}
        signOut={previewSignOut}
      />
    )
  }

  return (
    <AuthGate>
      {({ isAdmin, teams, activeTeam, setActiveTeamId, signOut }) => (
        <AppDashboard
          isAdmin={isAdmin}
          teams={teams}
          activeTeam={activeTeam}
          setActiveTeamId={setActiveTeamId}
          signOut={signOut}
        />
      )}
    </AuthGate>
  )
}
