"use client"

import type { ReactNode } from "react"
import { WORKSPACES } from "../../lib/workspaces"
import type { WorkspaceTab } from "../../lib/workspaces"
import { defaultPlatformContext } from "../../lib/platform"

const shellBackground = "radial-gradient(circle at top, rgba(37,99,235,0.22), transparent 34%), #020617"

type Props = {
  children: ReactNode
  activeTab: WorkspaceTab
  onTabChange: (tab: WorkspaceTab) => void
  isAdmin?: boolean
  signOut?: () => Promise<void>
}

export default function PremiumAppShell({ children, activeTab, onTabChange }: Props) {
  const context = defaultPlatformContext

  return (
    <div style={{ minHeight: "100vh", background: shellBackground, color: "white", paddingBottom: 92 }}>
      <header style={{ position: "sticky", top: 0, zIndex: 20, padding: "14px 16px 10px", backdropFilter: "blur(18px)", background: "rgba(2,6,23,0.86)", borderBottom: "1px solid rgba(148,163,184,0.12)" }}>
        <div style={{ fontSize: 12, opacity: 0.72, fontWeight: 800, letterSpacing: 0.7 }}>FOOTBALL OS</div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 900 }}>{context.club.name}</div>
            <div style={{ marginTop: 2, color: "rgba(226,232,240,0.62)", fontSize: 12, fontWeight: 800 }}>{context.team.name} · {context.team.season}</div>
          </div>
          <div style={{ borderRadius: 999, padding: "7px 10px", background: "rgba(37,99,235,0.2)", border: "1px solid rgba(96,165,250,0.25)", fontSize: 12, fontWeight: 800 }}>Recovery 23</div>
        </div>
      </header>

      <main style={{ padding: 16, width: "100%", maxWidth: 1080, margin: "0 auto" }}>{children}</main>

      <nav aria-label="Football OS workspaces" style={{ position: "fixed", left: 0, right: 0, bottom: 0, display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: 5, padding: "8px 7px", borderTop: "1px solid rgba(148,163,184,0.14)", background: "rgba(15,23,42,0.98)", zIndex: 100, boxShadow: "0 -18px 44px rgba(2,6,23,0.55)" }}>
        {WORKSPACES.map((workspace) => {
          const selected = activeTab === workspace.id
          return (
            <button type="button" key={workspace.id} aria-label={workspace.label} onClick={() => onTabChange(workspace.id)} style={{ background: selected ? "#2563eb" : "rgba(2,6,23,0.24)", color: "white", border: selected ? "1px solid rgba(147,197,253,0.36)" : "1px solid rgba(148,163,184,0.1)", borderRadius: 15, padding: "7px 2px", cursor: "pointer", minHeight: 55, touchAction: "manipulation" }}>
              <div style={{ fontSize: 18, lineHeight: 1 }}>{workspace.icon}</div>
              <div style={{ marginTop: 5, fontSize: 10.5, fontWeight: 900 }}>{workspace.shortLabel}</div>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
