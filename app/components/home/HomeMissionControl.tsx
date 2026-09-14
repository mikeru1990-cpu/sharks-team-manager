"use client"

import { useEffect, useMemo, useState, type ReactNode } from "react"
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Dumbbell,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react"
import TeamContextHeader from "../layout/TeamContextHeader"
import { useTeamAccess } from "../system/TeamAccessProvider"
import type { WorkspaceTab } from "../../lib/workspaces"
import { getContinuingTeamTbcPlayers, leonardStanleyEvents } from "../../lib/realTeamData"
import { useSquadPlayers } from "../../lib/useSquadPlayers"

type Props = { onNavigate: (tab: WorkspaceTab) => void }
type MatchState = {
  home?: number
  away?: number
  seconds?: number
  period?: number
  running?: boolean
  finished?: boolean
  timeline?: unknown[]
}
type MatchRecord = { id: number; home: number; away: number; date: string }

const continuingTbc = getContinuingTeamTbcPlayers()
const matchKey = "football-os-matchday-workflow-v6"
const historyKey = "football-os-match-history-v1"

function nextKnownEvent() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return leonardStanleyEvents.find((event) => {
    const timestamp = Date.parse(event.dateLabel)
    return Number.isFinite(timestamp) && timestamp >= today.getTime()
  }) ?? null
}

function roleLabel(value: string) {
  return value.replaceAll("_", " ").replace(/w/g, (letter) => letter.toUpperCase())
}

export default function HomeMissionControl({ onNavigate }: Props) {
  const { activeTeam } = useTeamAccess()
  const canManage = activeTeam?.canManage ?? true
  const players = useSquadPlayers()
  const [match, setMatch] = useState<MatchState>({})
  const [history, setHistory] = useState<MatchRecord[]>([])

  useEffect(() => {
    try {
      setMatch(JSON.parse(localStorage.getItem(matchKey) ?? "{}"))
      setHistory(JSON.parse(localStorage.getItem(historyKey) ?? "[]"))
    } catch {}
  }, [activeTeam?.teamId])

  const nextEvent = useMemo(nextKnownEvent, [])
  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"
  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })
  const hasLive = canManage && !!match.running && !match.finished
  const hasStarted = canManage && (match.seconds ?? 0) > 0 && !match.finished
  const matchStatus = hasLive ? "LIVE" : hasStarted ? "IN PROGRESS" : "READY"
  const matchDetail = hasLive
    ? `${match.home ?? 0}-${match.away ?? 0} · ${Math.floor((match.seconds ?? 0) / 60)}' · live match running`
    : hasStarted
      ? `${match.home ?? 0}-${match.away ?? 0} · saved on this device`
      : "Squad, lineup and formation ready to manage"

  const teamName = activeTeam?.teamName ?? "U11 Girls"
  const clubName = activeTeam?.clubName ?? "Leonard Stanley FC"
  const role = activeTeam?.role ? roleLabel(activeTeam.role) : "Coach"
  const reviewCount = activeTeam?.ageGroup === "U11" ? continuingTbc.length : 0

  if (!canManage) {
    return (
      <div className="fos-command-dashboard">
        <section className="fos-command-welcome">
          <div>
            <span className="fos-command-eyebrow"><Sparkles size={13} /> TEAM VIEW</span>
            <h1>{greeting}.</h1>
            <p>{today} · {clubName} · {teamName}</p>
          </div>
          <div className="fos-command-state">
            <i />
            <span>Team access</span>
          </div>
        </section>

        <TeamContextHeader
          clubName={clubName}
          activeTeamName={teamName}
          role={role}
          currentSection="Home"
          nextEventLabel={nextEvent ? `${nextEvent.title}: ${nextEvent.dateLabel}` : "No upcoming event scheduled"}
        />

        <section className="fos-command-grid">
          <button className="fos-command-primary" type="button" onClick={() => onNavigate("players")}>
            <div className="fos-command-primary-top">
              <span>YOUR TEAM</span>
              <Users size={20} />
            </div>
            <div>
              <small>{teamName}</small>
              <h2>{players.length} squad players</h2>
              <p>View the team, player roles and current availability.</p>
            </div>
            <strong>Open team <ArrowRight size={17} /></strong>
          </button>

          <div className="fos-command-kpis">
            <Metric value={String(players.length)} label="Squad" note="team players" icon={<Users />} />
            <Metric value={String(players.filter((player) => player.availability === "Available").length)} label="Available" note="current status" icon={<CheckCircle2 />} />
            <Metric value={role} label="Access" note="your team role" icon={<ShieldCheck />} />
            <Metric value={nextEvent ? "Set" : "TBC"} label="Next event" note={nextEvent?.dateLabel ?? "not scheduled"} icon={<CalendarDays />} />
          </div>
        </section>

        <section className="fos-command-section">
          <div className="fos-command-heading">
            <div><small>TEAM ACCESS</small><h2>Your football space</h2></div>
            <span>Private team view</span>
          </div>
          <div className="fos-command-attention">
            <Action
              tone="blue"
              label="PLAYERS"
              title="Team squad"
              detail="View players, positions and availability for your assigned team."
              cta="Open"
              onClick={() => onNavigate("players")}
            />
            <Action
              tone="navy"
              label="CLUB"
              title="Policies & Respect"
              detail="Open club information, Respect codes and your account controls."
              cta="Open"
              onClick={() => onNavigate("club")}
            />
          </div>
        </section>

        <section className="fos-command-trust">
          <ShieldCheck size={19} />
          <div>
            <strong>Team-scoped access is active</strong>
            <p>You only see the team your club has assigned to this account. Coaching controls are hidden from view-only roles.</p>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="fos-command-dashboard">
      <section className="fos-command-welcome">
        <div>
          <span className="fos-command-eyebrow"><Sparkles size={13} /> COACH COMMAND</span>
          <h1>{greeting}.</h1>
          <p>{today} · {clubName} · {teamName}</p>
        </div>
        <div className={`fos-command-state ${hasLive ? "live" : ""}`}>
          <i />
          <span>{hasLive ? "Match live" : "Team ready"}</span>
        </div>
      </section>

      <TeamContextHeader
        clubName={clubName}
        activeTeamName={teamName}
        role={role}
        currentSection="Home"
        nextEventLabel={
          hasStarted
            ? `Matchday: ${match.home ?? 0}-${match.away ?? 0}`
            : nextEvent
              ? `${nextEvent.title}: ${nextEvent.dateLabel}`
              : "No upcoming event scheduled"
        }
      />

      <section className="fos-command-grid">
        <button
          className="fos-command-primary"
          type="button"
          onClick={() => onNavigate(hasStarted ? "matchday" : nextEvent ? "training" : "club")}
        >
          <div className="fos-command-primary-top">
            <span>{hasStarted ? matchStatus : nextEvent ? "NEXT EVENT" : "SCHEDULE"}</span>
            <Trophy size={20} />
          </div>
          <div>
            <small>{hasStarted ? "MATCHDAY" : nextEvent ? "COMING UP" : "NO EVENT SET"}</small>
            <h2>
              {hasStarted
                ? `${clubName} ${match.home ?? 0} – ${match.away ?? 0} Opposition`
                : nextEvent?.title ?? "Add your next team event"}
            </h2>
            <p>
              {hasStarted
                ? matchDetail
                : nextEvent
                  ? `${nextEvent.dateLabel} · ${nextEvent.timeLabel ?? "TBC"}${nextEvent.location ? ` · ${nextEvent.location}` : ""}`
                  : "Keep the team calendar current so everyone knows what comes next."}
            </p>
          </div>
          <strong>
            {hasStarted ? "Open Matchday" : nextEvent ? "Prepare session" : "Open club"}
            <ArrowRight size={17} />
          </strong>
        </button>

        <div className="fos-command-kpis">
          <Metric value={String(players.length)} label="Squad" note="active players" icon={<Users />} />
          <Metric value={String(reviewCount)} label="Review" note="squad decisions" icon={<ClipboardCheck />} />
          <Metric value={String(history.length)} label="Matches" note="completed" icon={<Trophy />} />
          <Metric
            value={hasStarted ? `${match.home ?? 0}-${match.away ?? 0}` : "Ready"}
            label={hasStarted ? "Score" : "Status"}
            note={hasStarted ? `${Math.floor((match.seconds ?? 0) / 60)} minutes` : "matchday setup"}
            icon={<ShieldCheck />}
          />
        </div>
      </section>

      <section className="fos-command-section">
        <div className="fos-command-heading">
          <div><small>YOUR DAY</small><h2>What needs attention</h2></div>
          <span>{reviewCount + (hasStarted ? 1 : 1)} items</span>
        </div>
        <div className="fos-command-attention">
          {hasStarted && (
            <Action
              tone="blue"
              label={hasLive ? "LIVE MATCH" : "MATCH SAVED"}
              title={hasLive ? "Return to the touchline" : "Continue Matchday"}
              detail={matchDetail}
              cta="Open"
              onClick={() => onNavigate("matchday")}
            />
          )}
          {nextEvent && (
            <Action
              tone="green"
              label="NEXT SESSION"
              title={nextEvent.title}
              detail={`${nextEvent.dateLabel} · ${nextEvent.timeLabel ?? "TBC"}`}
              cta="Plan"
              onClick={() => onNavigate("training")}
            />
          )}
          {reviewCount > 0 && (
            <Action
              tone="amber"
              label="SQUAD REVIEW"
              title={`${reviewCount} player decision${reviewCount === 1 ? "" : "s"}`}
              detail="Review the continuing squad and confirm the correct team status."
              cta="Review"
              onClick={() => onNavigate("players")}
            />
          )}
          <Action
            tone="navy"
            label="MATCHDAY"
            title="Lineup & match preparation"
            detail="Select the squad, adjust the lineup, choose the formation and prepare substitutions."
            cta="Prepare"
            onClick={() => onNavigate("matchday")}
          />
        </div>
      </section>

      <section className="fos-command-section">
        <div className="fos-command-heading">
          <div><small>QUICK ACCESS</small><h2>Football tools</h2></div>
          <span>One tap</span>
        </div>
        <div className="fos-command-tools">
          <Tool label="Matchday" note="Squad · lineup · live" icon={<Trophy />} tab="matchday" go={onNavigate} />
          <Tool label="Training" note="Plan · attendance" icon={<Dumbbell />} tab="training" go={onNavigate} />
          <Tool label="Players" note="Profiles · development" icon={<Users />} tab="players" go={onNavigate} />
          <Tool label="Attendance" note="Take the register" icon={<ClipboardCheck />} tab="training" go={onNavigate} />
          <Tool label="Calendar" note="Fixtures & events" icon={<CalendarDays />} tab="club" go={onNavigate} />
          <Tool label="Parents" note="Team communication" icon={<MessageSquare />} tab="club" go={onNavigate} />
        </div>
      </section>

      <section className="fos-command-trust">
        <CheckCircle2 size={19} />
        <div>
          <strong>{history.length ? `${history.length} real match${history.length === 1 ? "" : "es"} recorded` : "Football OS is ready"}</strong>
          <p>{history.length ? "Matchday history is connected to this dashboard." : "No manufactured performance numbers. Team information appears here as it is recorded."}</p>
        </div>
      </section>
    </div>
  )
}

function Metric({ value, label, note, icon }: { value: string; label: string; note: string; icon: ReactNode }) {
  return (
    <div className="fos-command-metric">
      <span>{icon}</span>
      <strong>{value}</strong>
      <b>{label}</b>
      <small>{note}</small>
    </div>
  )
}

function Action({
  label,
  title,
  detail,
  cta,
  onClick,
  tone,
}: {
  label: string
  title: string
  detail: string
  cta: string
  onClick: () => void
  tone: string
}) {
  return (
    <button type="button" className={`fos-command-action ${tone}`} onClick={onClick}>
      <i />
      <span>
        <small>{label}</small>
        <strong>{title}</strong>
        <em>{detail}</em>
      </span>
      <b>{cta}<ArrowRight size={14} /></b>
    </button>
  )
}

function Tool({
  label,
  note,
  icon,
  tab,
  go,
}: {
  label: string
  note: string
  icon: ReactNode
  tab: WorkspaceTab
  go: (tab: WorkspaceTab) => void
}) {
  return (
    <button type="button" onClick={() => go(tab)}>
      <span>{icon}</span>
      <div>
        <strong>{label}</strong>
        <small>{note}</small>
      </div>
      <ArrowRight size={15} />
    </button>
  )
}
