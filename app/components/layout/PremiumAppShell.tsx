"use client"

import type { ReactNode } from "react"
import { ACTIVE_TEAM_NAME, WORKSPACES } from "../../lib/workspaces"
import type { WorkspaceTab } from "../../lib/workspaces"

const shellBackground = "radial-gradient(circle at top, rgba(37,99,235,0.22), transparent 34%), #020617"

type Props = {
  children: ReactNode
  activeTab: WorkspaceTab
  onTabChange: (tab: WorkspaceTab) => void
  isAdmin?: boolean
  signOut?: () => Promise<void>
}

export default function PremiumAppShell({
  children,
  activeTab,
  onTabChange,
}: Props) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: shellBackground,
        color: "white",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          padding: "14px 16px 10px",
          backdropFilter: "blur(18px)",
          background: "rgba(2,6,23,0.76)",
          borderBottom: "1px solid rgba(148,163,184,0.12)",
        }}
      >
        <div style={{ fontSize: 12, opacity: 0.72, fontWeight: 800, letterSpacing: 0.7 }}>
          FOOTBALL OS
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
          <div style={{ fontSize: 18, fontWeight: 900 }}>{ACTIVE_TEAM_NAME}</div>
          <div
            style={{
              borderRadius: 999,
              padding: "7px 10px",
              background: "rgba(37,99,235,0.2)",
              border: "1px solid rgba(96,165,250,0.25)",
              fontSize: 12,
              fontWeight: 800,
            }}
          >
            Build 20
          </div>
        </div>
      </header>

      <main style={{ flex: 1, padding: 16, width: "100%", maxWidth: 1080, margin: "0 auto" }}>
        {children}
      </main>

      <nav
        aria-label="Football OS workspaces"
        style={{
          position: "sticky",
          bottom: 0,
          display: "grid",
          gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
          gap: 6,
          padding: "10px 8px calc(10px + env(safe-area-inset-bottom))",
          borderTop: "1px solid rgba(148,163,184,0.14)",
          background: "rgba(15,23,42,0.96)",
          backdropFilter: "blur(18px)",
          zIndex: 30,
        }}
      >
        {WORKSPACES.map((workspace) => {
          const selected = activeTab === workspace.id

          return (
            <button
              key={workspace.id}
              onClick={() => onTabChange(workspace.id)}
              style={{
                background: selected ? "linear-gradient(135deg,#2563eb,#7c3aed)" : "transparent",
                color: "white",
                border: selected ? "1px solid rgba(147,197,253,0.36)" : "1px solid transparent",
                borderRadius: 16,
                padding: "8px 4px",
                cursor: "pointer",
                minHeight: 56,
                boxShadow: selected ? "0 12px 34px rgba(37,99,235,0.32)" : "none",
              }}
            >
              <div style={{ fontSize: 18, lineHeight: 1 }}>{workspace.icon}</div>
              <div style={{ marginTop: 5, fontSize: 11, fontWeight: 900 }}>
                {workspace.shortLabel}
              </div>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
