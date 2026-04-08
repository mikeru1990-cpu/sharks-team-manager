"use client"

import { TEAM } from "../../lib/types"
import { PageCard, PrimaryButton, SectionHeader, Badge } from "../ui"

type Props = {
  isAdmin: boolean
  onSignOut: () => Promise<void>
}

export default function DashboardHeader({ isAdmin, onSignOut }: Props) {
  return (
    <PageCard tone="blue">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "auto 1fr auto",
          gap: 14,
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 16,
            background: "rgba(255,255,255,0.14)",
            border: "1px solid rgba(255,255,255,0.18)",
            display: "grid",
            placeItems: "center",
            color: "white",
            fontSize: 24,
            fontWeight: 900,
          }}
        >
          🦈
        </div>

        <div>
          <SectionHeader
            title={TEAM.name}
            subtitle="Club Hub"
            light
          />
          <div style={{ marginTop: -4, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Badge tone="blue">{isAdmin ? "Admin Mode" : "Coach View"}</Badge>
            <Badge tone="default">Mobile First</Badge>
          </div>
        </div>

        <div style={{ alignSelf: "start" }}>
          <PrimaryButton onClick={() => void onSignOut()}>Sign Out</PrimaryButton>
        </div>
      </div>
    </PageCard>
  )
}
