"use client"

import { useState, type ReactNode } from "react"
import {
  BarChart3,
  Bell,
  CalendarDays,
  ChevronDown,
  Dumbbell,
  Home,
  MoreHorizontal,
  Settings,
  ShieldCheck,
  Trophy,
  Users,
  X,
} from "lucide-react"
import type { TeamAccess } from "../../lib/auth"
import { PRIMARY_WORKSPACES, getWorkspace, type WorkspaceTab } from "../../lib/workspaces"
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

const icons: Partial<Record<WorkspaceTab, ReactNode>> = {
  home: <Home />,
  schedule: <CalendarDays />,
  matchday: <Trophy />,
  team: <Users />,
  more: <MoreHorizontal />,
  training: <Dumbbell />,
  players: <Users />,
  insights: <BarChart3 />,
  club: <Settings />,
}

function roleLabel(role: TeamAccess["role"]) {
  return role
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function primaryFor(tab: WorkspaceTab): WorkspaceTab {
  if (tab === "players") return "team"
  if (tab === "training" || tab === "insights" || tab === "club") return "more"
  return tab
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
  const [updatesOpen, setUpdatesOpen] = useState(false)
  const visiblePrimary = PRIMARY_WORKSPACES.filter((workspace) => allowedTabs.includes(workspace.id))
  const activeWorkspace = getWorkspace(activeTab)
  const activePrimary = primaryFor(activeTab)
  const isMatchday = activeTab === "matchday"

  return (
    <div className={`fos-market-shell ${isMatchday ? "fos-market-shell--matchday" : ""}`}>
      <aside className="fos-market-sidebar">
        <div className="fos-market-brand">
          <span className="fos-market-logo">⚽</span>
          <div><strong>Football OS</strong><small>{activeTeam.clubName}</small></div>
        </div>

        <div className="fos-team-switcher">
          <span>ACTIVE TEAM</span>
          {teams.length > 1 ? (
            <label>
              <select value={activeTeam.teamId} onChange={(event) => onTeamChange(event.target.value)} aria-label="Active team">
                {teams.map((team) => (
                  <option key={team.teamId} value={team.teamId}>
                    {team.teamName}{team.season ? ` · ${team.season}` : ""}
                  </option>
                ))}
              </select>
              <ChevronDown aria-hidden="true" />
            </label>
          ) : (
            <strong>{activeTeam.teamName}</strong>
          )}
          <small>{roleLabel(activeTeam.role)}{activeTeam.season ? ` · ${activeTeam.season}` : ""}</small>
        </div>

        <nav className="fos-market-side-nav" aria-label="Football OS navigation">
          {visiblePrimary.map((workspace) => {
            const selected = activePrimary === workspace.id
            return (
              <button
                type="button"
                key={workspace.id}
                className={selected ? "active" : ""}
                onClick={() => onTabChange(workspace.id)}
                aria-current={selected ? "page" : undefined}
              >
                <span>{icons[workspace.id]}</span>
                <div><strong>{workspace.label}</strong><small>{workspace.description}</small></div>
              </button>
            )
          })}
        </nav>

        <div className="fos-market-side-foot">
          <div><ShieldCheck /><span>Team-scoped access</span></div>
          {signOut && <button type="button" onClick={() => void signOut()}>Sign out</button>}
        </div>
      </aside>

      <div className="fos-market-body">
        <header className="fos-market-header">
          <div className="fos-market-header-team">
            <span className="fos-market-mobile-logo">⚽</span>
            <div>
              <strong>{activeTeam.teamName}</strong>
              <small>{activeTeam.clubName}</small>
            </div>
          </div>

          <div className="fos-market-header-actions">
            <div className="fos-market-current">
              <span>{icons[activeTab] ?? icons[activePrimary]}</span>
              <div><small>{isMatchday ? "FOOTBALL MODE" : "FOOTBALL OS"}</small><strong>{activeWorkspace.label}</strong></div>
            </div>
            <button
              type="button"
              className="fos-notification-button"
              aria-label="Open updates"
              aria-expanded={updatesOpen}
              onClick={() => setUpdatesOpen((open) => !open)}
            >
              <Bell />
            </button>
          </div>
        </header>

        {updatesOpen && (
          <div className="fos-updates-backdrop" onClick={() => setUpdatesOpen(false)}>
            <section className="fos-updates-panel" onClick={(event) => event.stopPropagation()} aria-label="Football OS updates">
              <div className="fos-updates-head">
                <div><span>UPDATES</span><h2>Your football activity</h2></div>
                <button type="button" aria-label="Close updates" onClick={() => setUpdatesOpen(false)}><X /></button>
              </div>
              <button type="button" onClick={() => { setUpdatesOpen(false); onTabChange("schedule") }}>
                <CalendarDays /><span><strong>Schedule & availability</strong><small>See matches, training and event responses.</small></span>
              </button>
              <button type="button" onClick={() => { setUpdatesOpen(false); onTabChange("team") }}>
                <Users /><span><strong>Team</strong><small>Check squad availability and player information.</small></span>
              </button>
              {activeTeam.canManage && (
                <button type="button" onClick={() => { setUpdatesOpen(false); onTabChange("matchday") }}>
                  <Trophy /><span><strong>Matchday</strong><small>Continue preparation or live match work.</small></span>
                </button>
              )}
            </section>
          </div>
        )}

        <main className="fos-market-main">
          <InstallAppBanner />
          <div className="fos-workspace-stage" key={`${activeTeam.teamId}:${activeTab}`}>
            {children}
          </div>
        </main>
      </div>

      <nav aria-label="Football OS primary navigation" className="fos-market-bottom-nav">
        {visiblePrimary.map((workspace) => {
          const selected = activePrimary === workspace.id
          return (
            <button
              type="button"
              key={workspace.id}
              aria-label={workspace.label}
              aria-current={selected ? "page" : undefined}
              onClick={() => onTabChange(workspace.id)}
              className={selected ? "active" : ""}
            >
              <span>{icons[workspace.id]}</span>
              <small>{workspace.shortLabel}</small>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
