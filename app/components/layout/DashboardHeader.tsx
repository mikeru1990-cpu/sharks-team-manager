"use client"

import { TEAM } from "../../lib/types"
import { Badge, PageCard, PrimaryButton } from "../ui"

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
          gridTemplateColumns: "auto minmax(0, 1fr) auto",
          gap: 12,
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: 50,
            height: 50,
            borderRadius: 16,
            background: "rgba(255,255,255,0.14)",
            border: "1px solid rgba(255,255,255,0.18)",
            display: "grid",
            placeItems: "center",
            color: "white",
            fontSize: 24,
            fontWeight: 900,
            flexShrink: 0,
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12)",
          }}
        >
          🦈
        </div>

        <div style={{ minWidth: 0 }}>
          <div
            style={{
              color: "white",
              fontSize: 18,
              fontWeight: 900,
              lineHeight: 1.1,
              overflowWrap: "anywhere",
            }}
          >
            {TEAM.name}
          </div>

          <div
            style={{
              marginTop: 4,
              color: "rgba(255,255,255,0.82)",
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            Club Hub
          </div>

          <div
            style={{
              marginTop: 10,
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <Badge tone="blue">{isAdmin ? "Admin Mode" : "Coach View"}</Badge>
            <Badge tone="default">Mobile First</Badge>
          </div>
        </div>

        <div style={{ alignSelf: "start", flexShrink: 0 }}>
          <PrimaryButton onClick={() => void onSignOut()}>
            Sign Out
          </PrimaryButton>
        </div>
      </div>
    </PageCard>
  )
}
