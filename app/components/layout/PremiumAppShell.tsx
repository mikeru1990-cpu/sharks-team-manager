"use client"

import type { ReactNode } from "react"
import { BarChart3, Dumbbell, Home, Settings, Trophy, Users } from "lucide-react"
import type { TeamAccess } from "../../lib/auth"
import { WORKSPACES, type WorkspaceTab } from "../../lib/workspaces"
import InstallAppBanner from "../ui/InstallAppBanner"

type Props = {
  children: ReactNode
  activeTab: WorkspaceTab
  onTabChange: (tab: WorkspaceTab) => void
  allowedTabs: WorkspaceTab[]
  activeTeam: TeamAccess
  teams: TeamAccess[]
  onTeamChange: (teamId: string) => void
  isAdmin?: boolean
  signOut?: () => Promise<void>
}

const icons: Record<WorkspaceTab, ReactNode> = {
  home: <Home />,
  matchday: <Trophy />,
  training: <Dumbbell />,
  players: <Users />,
  insights: <BarChart3 />,
  club: <Settings />,
}

function roleLabel(role: TeamAccess["role"]) {
  return role
    .replaceAll("_", " ")
    .replace(/w/g, (letter) => letter.toUpperCase())
}

export default function PremiumAppShell({
  children,
  activeTab,
  onTabChange,
  allowedTabs,
  activeTeam,
  teams,
  onTeamChange,
  signOut,
}: Props) {
  const visibleWorkspaces = WORKSPACES.filter((workspace) => allowedTabs.includes(workspace.id))
  const activeWorkspace =
    visibleWorkspaces.find((workspace) => workspace.id === activeTab) ??
    visibleWorkspaces[0] ??
    WORKSPACES[0]

  const teamLabel = activeTeam.season
    ? `${activeTeam.teamName} · ${activeTeam.season}`
    : activeTeam.teamName

  return (
    <div className="fos-app-shell fos-v4">
      <aside className="fos-desktop-sidebar">
        <div className="fos-desktop-brand">
          <div className="fos-desktop-mark">⚽</div>
          <div>
            <strong>Football OS</strong>
            <span>{activeTeam.clubName}</span>
          </div>
        </div>

        <div className="fos-desktop-team">
          <small>ACTIVE TEAM</small>
          {teams.length > 1 ? (
            <select
              aria-label="Active team"
              value={activeTeam.teamId}
              onChange={(event) => onTeamChange(event.target.value)}
              style={{
                width: "100%",
                minHeight: 42,
                borderRadius: 12,
                border: "1px solid rgba(148,163,184,.18)",
                background: "rgba(2,6,23,.55)",
                color: "white",
                padding: "0 10px",
                fontWeight: 850,
              }}
            >
              {teams.map((team) => (
                <option key={team.teamId} value={team.teamId}>
                  {team.teamName}{team.season ? ` · ${team.season}` : ""}
                </option>
              ))}
            </select>
          ) : (
            <strong>{activeTeam.teamName}</strong>
          )}
          <span>{roleLabel(activeTeam.role)}{activeTeam.ageGroup ? ` · ${activeTeam.ageGroup}` : ""}</span>
        </div>

        <nav className="fos-desktop-menu" aria-label="Football OS desktop navigation">
          {visibleWorkspaces.map((workspace) => (
            <button
              type="button"
              key={workspace.id}
              className={activeTab === workspace.id ? "active" : ""}
              onClick={() => onTabChange(workspace.id)}
            >
              <i>{icons[workspace.id]}</i>
              <span>
                <strong>{workspace.label}</strong>
                <small>{workspace.description}</small>
              </span>
            </button>
          ))}
        </nav>

        <div className="fos-desktop-foot">
          <span>{activeTeam.clubName}</span>
          {signOut && <button type="button" onClick={() => void signOut()}>Sign out</button>}
        </div>
      </aside>

      <div className="fos-v4-body">
        <header className="fos-shell-header fos-v4-header">
          <div className="fos-v4-brand">
            <div className="fos-v4-mark">⚽</div>
            <div>
              <strong>Football OS</strong>
              {teams.length > 1 ? (
                <select
                  aria-label="Active team"
                  value={activeTeam.teamId}
                  onChange={(event) => onTeamChange(event.target.value)}
                  style={{
                    display: "block",
                    maxWidth: 190,
                    minHeight: 30,
                    border: 0,
                    background: "transparent",
                    color: "rgba(226,232,240,.72)",
                    fontSize: 11,
                    fontWeight: 800,
                  }}
                >
                  {teams.map((team) => (
                    <option key={team.teamId} value={team.teamId}>
                      {team.teamName}{team.season ? ` · ${team.season}` : ""}
                    </option>
                  ))}
                </select>
              ) : (
                <span>{teamLabel}</span>
              )}
            </div>
          </div>

          <div className="fos-v4-context">
            <span>{icons[activeTab]}</span>
            <div>
              <small>{activeTeam.canManage ? "COACH WORKSPACE" : "TEAM VIEW"}</small>
              <strong>{activeWorkspace.label}</strong>
            </div>
          </div>
        </header>

        <main className="fos-shell-main fos-v4-main">
          <InstallAppBanner />
          <div className="fos-workspace-stage" key={`${activeTeam.teamId}:${activeTab}`}>
            {children}
          </div>
        </main>
      </div>

      <nav aria-label="Football OS workspaces" className="fos-shell-nav fos-v4-nav">
        {visibleWorkspaces.map((workspace) => {
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
              <span className="fos-shell-nav__icon">{icons[workspace.id]}</span>
              <span className="fos-shell-nav__label">{workspace.shortLabel}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
