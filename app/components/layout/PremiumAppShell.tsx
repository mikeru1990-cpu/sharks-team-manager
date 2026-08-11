"use client"

import type { ReactNode } from "react"
import { WORKSPACES } from "../../lib/workspaces"
import type { WorkspaceTab } from "../../lib/workspaces"
import { defaultPlatformContext } from "../../lib/platform"
import AppStatusPill from "../ui/AppStatusPill"
import InstallAppBanner from "../ui/InstallAppBanner"

type Props = {
  children: ReactNode
  activeTab: WorkspaceTab
  onTabChange: (tab: WorkspaceTab) => void
  isAdmin?: boolean
  signOut?: () => Promise<void>
}

export default function PremiumAppShell({ children, activeTab, onTabChange }: Props) {
  const context = defaultPlatformContext
  const activeWorkspace = WORKSPACES.find((workspace) => workspace.id === activeTab) ?? WORKSPACES[0]

  return (
    <div className="fos-app-shell">
      <div className="fos-app-aurora" aria-hidden="true" />

      <header className="fos-shell-header">
        <div className="fos-shell-header__topline">
          <div className="fos-brand-lockup">
            <div className="fos-brand-mark" aria-hidden="true">
              <span>⚽</span>
            </div>
            <div>
              <div className="fos-shell-header__eyebrow">FOOTBALL OS</div>
              <div className="fos-brand-subtitle">Private Alpha · Coach Workspace</div>
            </div>
          </div>
          <AppStatusPill />
        </div>

        <div className="fos-shell-header__row">
          <div className="fos-shell-header__identity">
            <div className="fos-shell-header__club">{context.club.name}</div>
            <div className="fos-shell-header__team">{context.team.name} · {context.team.season}</div>
          </div>
          <div className="fos-current-workspace" aria-label={`Current workspace: ${activeWorkspace.label}`}>
            <span aria-hidden="true">{activeWorkspace.icon}</span>
            <strong>{activeWorkspace.shortLabel}</strong>
          </div>
        </div>
      </header>

      <main className="fos-shell-main">
        <InstallAppBanner />
        <div className="fos-workspace-stage" key={activeTab}>
          {children}
        </div>
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
              <span className="fos-shell-nav__indicator" aria-hidden="true" />
              <span className="fos-shell-nav__icon" aria-hidden="true">{workspace.icon}</span>
              <span className="fos-shell-nav__label">{workspace.shortLabel}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
