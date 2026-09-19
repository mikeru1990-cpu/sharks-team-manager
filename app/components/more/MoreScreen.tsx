"use client"

import {
  BarChart3,
  ChevronRight,
  Dumbbell,
  FileText,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react"
import { useTeamAccess } from "../system/TeamAccessProvider"
import type { WorkspaceTab } from "../../lib/workspaces"

type Props = { onNavigate: (tab: WorkspaceTab) => void }

type MenuItem = {
  label: string
  detail: string
  tab: WorkspaceTab
  icon: React.ReactNode
  coachOnly?: boolean
}

const items: MenuItem[] = [
  {
    label: "Training",
    detail: "Session planner, attendance and pitch mode",
    tab: "training",
    icon: <Dumbbell />,
    coachOnly: true,
  },
  {
    label: "Insights",
    detail: "Statistics, reports and coaching intelligence",
    tab: "insights",
    icon: <BarChart3 />,
    coachOnly: true,
  },
  {
    label: "Club",
    detail: "Teams, standards, Respect and administration",
    tab: "club",
    icon: <Settings />,
  },
]

export default function MoreScreen({ onNavigate }: Props) {
  const { activeTeam } = useTeamAccess()
  const visible = items.filter((item) => !item.coachOnly || activeTeam?.canManage)

  return (
    <div className="fos-everyday-page">
      <section className="fos-page-intro">
        <div>
          <span className="fos-page-kicker">MORE</span>
          <h1>Everything else, without the clutter.</h1>
          <p>Football tools, club controls and account settings stay close without overloading the main navigation.</p>
        </div>
        <div className="fos-page-icon"><Settings /></div>
      </section>

      <section className="fos-more-card">
        <div className="fos-section-heading">
          <div><span>FOOTBALL OS</span><h2>Tools & administration</h2></div>
        </div>
        <div className="fos-more-list">
          {visible.map((item) => (
            <button key={item.tab} type="button" onClick={() => onNavigate(item.tab)}>
              <span className="fos-more-icon">{item.icon}</span>
              <span className="fos-more-copy"><strong>{item.label}</strong><small>{item.detail}</small></span>
              <ChevronRight />
            </button>
          ))}
        </div>
      </section>

      <section className="fos-more-card fos-more-trust">
        <ShieldCheck />
        <div>
          <strong>Private team access</strong>
          <p>Football OS only shows the team and controls allowed by your club role.</p>
        </div>
      </section>

      <section className="fos-more-card">
        <div className="fos-more-mini-grid">
          <div><Users /><strong>{activeTeam?.teamName ?? "Team"}</strong><span>Active team</span></div>
          <div><FileText /><strong>{activeTeam?.season ?? "Current"}</strong><span>Season</span></div>
        </div>
      </section>
    </div>
  )
}
