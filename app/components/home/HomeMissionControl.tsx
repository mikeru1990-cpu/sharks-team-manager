"use client"

import { useEffect, useState, type ReactNode } from "react"
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
import { useSquadPlayers } from "../../lib/useSquadPlayers"
import { useHomeSummary } from "../../lib/useHomeSummary"
import { upcomingTeamEvents, eventAvailability, eventDateLabel } from "../../lib/homeSummary"
import { matchWorkflowKey, parseScheduledMatch, scheduledMatchKey } from "../../lib/scheduledMatch"

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

function roleLabel(value: string) {
  return value.replaceAll("_", " ").replace(/w/g, (letter) => letter.toUpperCase())
}

export default function HomeMissionControl({ onNavigate }: Props) {
  const { activeTeam } = useTeamAccess()
  const canManage = activeTeam?.canManage ?? false
  const players = useSquadPlayers()
  const [savedMatch, setSavedMatch] = useState<{ teamId: string; value: MatchState } | null>(null)
  const match = savedMatch?.teamId === activeTeam?.teamId ? savedMatch?.value ?? {} : {}
  const { snapshot, error, loading, refresh } = useHomeSummary(activeTeam?.teamId, canManage)

  useEffect(() => {
    try {
      setSavedMatch(null)
      if (!activeTeam?.teamId) return
      const scheduled = parseScheduledMatch(sessionStorage.getItem(scheduledMatchKey(activeTeam.teamId)), activeTeam.teamId)
      // Only a team-scoped fixture can advertise a resumable match on Home.
      if (scheduled) setSavedMatch({ teamId: activeTeam.teamId, value: JSON.parse(localStorage.getItem(matchWorkflowKey(scheduled)) ?? "{}") })
    } catch {}
  }, [activeTeam?.teamId])

  const upcoming = upcomingTeamEvents(snapshot?.events ?? [])
  const next = upcoming[0]
  const nextEvent = next ? { ...next, dateLabel: eventDateLabel(next.startsAt), timeLabel: next.meetAt ? `Meet ${new Date(next.meetAt).toLocaleTimeString('en-GB', { timeZone: 'Europe/London', hour: '2-digit', minute: '2-digit' })}` : null, location: next.locationName } : null
  const counts = eventAvailability(next?.id ?? '', snapshot?.responses ?? [], players.map(player => player.cloudId ?? player.id))
  const completed = (snapshot?.events ?? []).filter(event => event.status !== 'cancelled' && snapshot?.reports.some(report => report.event_id === event.id)).sort((a, b) => Date.parse(b.startsAt) - Date.parse(a.startsAt))
  const latest = completed[0]
  const latestOutcome = snapshot?.reports.find(report => report.event_id === latest?.id)?.outcome
  const summaryLabel = loading ? 'Loading team updates…' : error ? 'Team updates unavailable' : 'No upcoming event scheduled'
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
  const reviewCount = nextEvent ? counts.unanswered : 0

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
          nextEventLabel={nextEvent ? `${nextEvent.title}: ${nextEvent.dateLabel}` : summaryLabel}
        />

        <section className="fos-command-grid">
          <button className="fos-command-primary" type="button" onClick={() => onNavigate("team")}>
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
              onClick={() => onNavigate("team")}
            />
            <Action
              tone="navy"
              label="CLUB"
              title="Policies & Respect"
              detail="Open club information, Respect codes and your account controls."
              cta="Open"
              onClick={() => onNavigate("more")}
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
              : summaryLabel
        }
      />

      <section className="fos-command-trust" aria-label="Team updates">
        <CalendarDays size={19} />
        <div role="status"><strong>{loading ? 'Loading team updates…' : error || `Updated ${snapshot?.loadedAt ?? '—'}`}</strong><p>Fixtures, availability and results from your saved team records.</p></div>
        <button type="button" disabled={loading} onClick={refresh} style={{ minHeight: 44, padding: '8px 16px', marginLeft: 'auto' }}>{error ? 'Retry' : 'Refresh'}</button>
      </section>

      <section className="fos-command-grid">
        <button
          className="fos-command-primary"
          type="button"
          onClick={() => onNavigate(hasStarted ? "matchday" : "schedule")}
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
                : nextEvent?.title ?? (loading || error ? summaryLabel : "Add your next team event")}
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
            {hasStarted ? "Open Matchday" : "Open Schedule"}
            <ArrowRight size={17} />
          </strong>
        </button>

        <div className="fos-command-kpis">
          <Metric value={String(players.length)} label="Squad" note="active players" icon={<Users />} />
          <Metric value={snapshot ? String(reviewCount) : '—'} label="Awaiting" note="next event replies" icon={<ClipboardCheck />} />
          <Metric value={snapshot ? String(completed.length) : '—'} label="Results" note="saved match reports" icon={<Trophy />} />
          <Metric
            value={hasStarted ? `${match.home ?? 0}-${match.away ?? 0}` : "Ready"}
            label={hasStarted ? "Score" : "Status"}
            note={hasStarted ? `${Math.floor((match.seconds ?? 0) / 60)} minutes` : "matchday setup"}
            icon={<ShieldCheck />}
          />
        </div>
      </section>

      {nextEvent && <section className="fos-command-section">
        <div className="fos-command-heading"><div><small>NEXT EVENT</small><h2>Who can attend?</h2></div></div>
        <p>{nextEvent.title} · {nextEvent.dateLabel}</p>
        <div className="fos-command-kpis">
          <Metric value={String(counts.available)} label="Available" note="confirmed" icon={<CheckCircle2 />} />
          <Metric value={String(counts.maybe)} label="Maybe" note="to confirm" icon={<Users />} />
          <Metric value={String(counts.unavailable)} label="Unavailable" note="cannot attend" icon={<Users />} />
          <Metric value={String(counts.unanswered)} label="Awaiting" note="no answer yet" icon={<MessageSquare />} />
        </div>
      </section>}

      {latest && <section className="fos-command-section">
        <div className="fos-command-heading"><div><small>LATEST RESULT</small><h2>{latest.title}</h2></div><span>{latestOutcome === 'win' ? 'Win' : latestOutcome === 'draw' ? 'Draw' : 'Loss'}</span></div>
        <p>{eventDateLabel(latest.startsAt)}</p>
        {snapshot?.awards.length ? snapshot.awards.map(award => <p key={award}>{award}</p>) : <p>No Player of the Match awards recorded yet.</p>}
      </section>}

      <section className="fos-command-section">
        <div className="fos-command-heading">
          <div><small>YOUR DAY</small><h2>What needs attention</h2></div>
          <span>{1 + Number(hasStarted) + Number(!!nextEvent) + Number(reviewCount > 0)} items</span>
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
              label="NEXT EVENT"
              title={nextEvent.title}
              detail={`${nextEvent.dateLabel} · ${nextEvent.timeLabel ?? "TBC"}`}
              cta="Plan"
              onClick={() => onNavigate("schedule")}
            />
          )}
          {reviewCount > 0 && (
            <Action
              tone="amber"
              label="AVAILABILITY"
              title={`${reviewCount} unanswered response${reviewCount === 1 ? "" : "s"}`}
              detail="Check availability in Schedule before choosing your match squad."
              cta="Review"
              onClick={() => onNavigate("schedule")}
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
          <Tool label="Training" note="Plan · attendance" icon={<Dumbbell />} tab="schedule" go={onNavigate} />
          <Tool label="Players" note="Profiles · development" icon={<Users />} tab="team" go={onNavigate} />
          <Tool label="Attendance" note="Take the register" icon={<ClipboardCheck />} tab="schedule" go={onNavigate} />
          <Tool label="Calendar" note="Fixtures & events" icon={<CalendarDays />} tab="schedule" go={onNavigate} />
          <Tool label="Parents" note="Team communication" icon={<MessageSquare />} tab="more" go={onNavigate} />
        </div>
      </section>

      <section className="fos-command-trust">
        <CheckCircle2 size={19} />
        <div>
          <strong>{snapshot ? `${completed.length} saved match report${completed.length === 1 ? "" : "s"}` : summaryLabel}</strong>
          <p>Results show win, draw or loss here. Detailed scores remain in coach reports.</p>
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
