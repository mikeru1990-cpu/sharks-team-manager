"use client"

import { TEAM } from "../../lib/types"
import { PageCard, PrimaryButton, SectionHeader } from "../ui"

type Props = {
  isAdmin: boolean
  onSignOut: () => Promise<void>
}

export default function DashboardHeader({ isAdmin, onSignOut }: Props) {
  return (
    <PageCard tone="blue">
      <SectionHeader
        title={TEAM.name}
        subtitle={isAdmin ? "Club Hub • Admin" : "Club Hub"}
        light
        action={<PrimaryButton onClick={() => void onSignOut()}>Sign Out</PrimaryButton>}
      />
    </PageCard>
  )
}
