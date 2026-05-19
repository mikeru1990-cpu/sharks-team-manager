"use client"

export const dynamic = "force-dynamic"

import { useState } from "react"

import AuthGate from "./components/AuthGate"
import PremiumAppShell from "./components/layout/PremiumAppShell"
import AppRouter from "./components/navigation/AppRouter"

import type { MainTab } from "./lib/types"

function AppDashboard({
  isAdmin,
  signOut,
}: {
  isAdmin: boolean
  signOut: () => Promise<void>
}) {
  const [activeTab, setActiveTab] =
    useState<MainTab>("home")

  return (
    <PremiumAppShell
      activeTab={activeTab}
      onTabChange={setActiveTab}
      isAdmin={isAdmin}
      signOut={signOut}
    >
      <AppRouter activeTab={activeTab} />
    </PremiumAppShell>
  )
}

export default function Page() {
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
