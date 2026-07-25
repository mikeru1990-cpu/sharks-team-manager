"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"

import AuthGate from "./components/AuthGate"
import PremiumAppShell from "./components/layout/PremiumAppShell"
import AppRouter from "./components/navigation/AppRouter"

import type { WorkspaceTab } from "./lib/workspaces"

const LAST_WORKSPACE_KEY = "football-os:last-workspace"
const WORKSPACE_TABS: WorkspaceTab[] = ["home", "matchday", "training", "players", "insights", "club"]
const AUTH_REQUIRED = process.env.NEXT_PUBLIC_AUTH_REQUIRED === "true"

function AppDashboard({
  isAdmin,
  signOut,
}: {
  isAdmin: boolean
  signOut: () => Promise<void>
}) {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("home")

  useEffect(() => {
    const savedWorkspace = window.localStorage.getItem(LAST_WORKSPACE_KEY) as WorkspaceTab | null
    if (savedWorkspace && WORKSPACE_TABS.includes(savedWorkspace)) {
      setActiveTab(savedWorkspace)
    }
  }, [])

  function handleTabChange(tab: WorkspaceTab) {
    setActiveTab(tab)
    window.localStorage.setItem(LAST_WORKSPACE_KEY, tab)
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" })
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
    })
  }

  return (
    <PremiumAppShell
      activeTab={activeTab}
      onTabChange={handleTabChange}
      isAdmin={isAdmin}
      signOut={signOut}
    >
      <AppRouter activeTab={activeTab} onNavigate={handleTabChange} />
    </PremiumAppShell>
  )
}

async function previewSignOut() {
  // Authentication is intentionally disabled for the private preview build.
}

export default function Page() {
  if (!AUTH_REQUIRED) {
    return <AppDashboard isAdmin={true} signOut={previewSignOut} />
  }

  return (
    <AuthGate>
      {({ isAdmin, signOut }) => (
        <AppDashboard
          isAdmin={isAdmin}
          signOut={signOut}
        />
      )}
    </AuthGate>
  )
}
