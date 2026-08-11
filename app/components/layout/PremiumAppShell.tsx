"use client"

import type { ReactNode } from "react"
import { WORKSPACES } from "../../lib/workspaces"
import type { WorkspaceTab } from "../../lib/workspaces"
import { defaultPlatformContext } from "../../lib/platform"
import AppStatusPill from "../ui/AppStatusPill"
import InstallAppBanner from "../ui/InstallAppBanner"

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
      <header className="fos-shell-header">
        <div className="fos-shell-header__eyebrow">FOOTBALL OS</div>
        <div className="fos-shell-header__row">
          <div className="fos-shell-header__identity">
            <div className="fos-shell-header__club">{context.club.name}</div>
            <div className="fos-shell-header__team">{context.team.name} · {context.team.season}</div>
          </div>
          <AppStatusPill />
        </div>
      </header>

      <main className="fos-shell-main">
        <InstallAppBanner />
        {children}
      </main>

      <nav aria-label="Football OS workspaces" className="fos-shell-nav">
        {WORKSPACES.map((workspace) => {
          const selected = activeTab === workspace.id
          return (
            <button
              type="button"
              key={workspace.id}
              aria-label={workspace.label}
              aria-current={selected ? "page" : undefined}
              onClick={() => onTabChange(workspace.id)}
              className={`fos-shell-nav__item ${selected ? "fos-shell-nav__item--active" : ""}`}
            >
              <span className="fos-shell-nav__icon" aria-hidden="true">{workspace.icon}</span>
              <span className="fos-shell-nav__label">{workspace.shortLabel}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
