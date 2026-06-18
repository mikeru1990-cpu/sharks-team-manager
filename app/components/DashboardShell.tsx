"use client"

import nextDynamic from "next/dynamic"
import PlayersManager from "./PlayersManager"
import HomeTab from "./tabs/HomeTab"
import EventsTabContent from "./tabs/EventsTabContent"
import MatchTabContent from "./tabs/MatchTabContent"
import CoachesTabContent from "./tabs/CoachesTabContent"
import UserApprovalCentre from "./admin/UserApprovalCentre"
import TeamsAdminPanel from "./admin/TeamsAdminPanel"
import EventFormModal from "./modals/EventFormModal"
import MatchEventModal from "./modals/MatchEventModal"
import SeasonModal from "./modals/SeasonModal"
import DashboardHeader from "./layout/DashboardHeader"
import BottomNav from "./layout/BottomNav"
import SeasonSwitcher from "./layout/SeasonSwitcher"
import ClubBrandBackdrop from "./layout/ClubBrandBackdrop"
import SharksIdentityBanner from "./layout/SharksIdentityBanner"
import TeamLocationBadge from "./layout/TeamLocationBadge"
import TeamSwitcherBar from "./layout/TeamSwitcherBar"
import AppPolishFrame from "./layout/AppPolishFrame"
import DashboardOverview from "./dashboard/DashboardOverview"
import ExperienceUpgradePanel from "./dashboard/ExperienceUpgradePanel"

import { defaultClubTeams } from "../lib/defaultTeams"
import {
  TEAM,
  cardStyle,
  type MainTab,
  type MatchEventDraft,
  type TimelineEventType,
} from "../lib/types"

import type { MatchEventDraftSetter } from "../lib/dashboardTypes"

const StatsTab = nextDynamic(() => import("./tabs/StatsTab"))

type Props = any

function ShellSection({ children }: { children: React.ReactNode }) {
  return <section style={{ minWidth: 0, display: "grid", gap: 22 }}>{children}</section>
}

function PageIntro({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return (
    <div className="sharks-elite-panel sharks-card-shine" style={{ padding: 20, borderRadius: 28, display: "grid", gap: 8, overflow: "hidden" }}>
      <div style={{ color: "#7dd3fc", fontSize: 11, fontWeight: 1000, letterSpacing: ".16em", textTransform: "uppercase" }}>{eyebrow}</div>
      <div style={{ color: "white", fontSize: 32, fontWeight: 1000, lineHeight: 1, letterSpacing: "-0.045em" }}>{title}</div>
      <div style={{ color: "#cbd5e1", fontWeight: 700, lineHeight: 1.55, maxWidth: 760 }}>{subtitle}</div>
    </div>
  )
}

function formatClock(seconds?: number) {
  const safe = Math.max(0, Number(seconds || 0))
  const mins = Math.floor(safe / 60)
  const secs = safe % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

function titleCase(value?: string) {
  const safe = String(value || "Home")
  return safe.charAt(0).toUpperCase() + safe.slice(1)
}

function MatchLiveRibbon({ props }: { props: Props }) {
  const live = Boolean(props.running)
  const activeMatch = props.activeMatchEvent
  const title = activeMatch?.title || "Match Centre"
  const opponent = activeMatch?.opponent || props.awayTeam || "Opposition"
  const home = props.homeTeam || "Sharks"
  const away = props.awayTeam || opponent
  const quarter = props.currentQuarter || 1

  return (
    <div className="sharks-elite-panel sharks-card-shine" style={{ padding: 18, borderRadius: 30, position: "relative", overflow: "hidden" }}>
      <div className="sharks-hero-watermark" />
      <div style={{ position: "relative", zIndex: 1, display: "grid", gap: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ color: "#7dd3fc", fontSize: 11, fontWeight: 1000, letterSpacing: ".16em" }}>LIVE MATCH CONTROL</div>
            <div style={{ color: "white", fontSize: 24, fontWeight: 1000, marginTop: 5, letterSpacing: "-0.04em" }}>{title}</div>
          </div>
          <div style={{ borderRadius: 999, padding: "9px 13px", background: live ? "rgba(34,197,94,0.16)" : "rgba(148,163,184,0.12)", border: live ? "1px solid rgba(34,197,94,0.52)" : "1px solid rgba(148,163,184,0.25)", color: live ? "#86efac" : "#cbd5e1", fontWeight: 1000 }}>
            {live ? "● LIVE" : "MATCH READY"}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto minmax(0,1fr)", gap: 12, alignItems: "center" }}>
          <div style={{ textAlign: "center", minWidth: 0 }}>
            <div style={{ color: "#cbd5e1", fontSize: 12, fontWeight: 1000, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{home}</div>
            <div style={{ color: "white", fontSize: 52, fontWeight: 1000, lineHeight: 1 }}>{props.homeScore ?? 0}</div>
          </div>
          <div style={{ textAlign: "center", minWidth: 106, borderRadius: 22, padding: "12px 10px", background: "rgba(2,6,23,0.54)", border: "1px solid rgba(125,211,252,0.24)" }}>
            <div style={{ color: "#7dd3fc", fontSize: 12, fontWeight: 1000 }}>Q{quarter}</div>
            <div style={{ color: "white", fontSize: 26, fontWeight: 1000 }}>{formatClock(props.seconds)}</div>
          </div>
          <div style={{ textAlign: "center", minWidth: 0 }}>
            <div style={{ color: "#cbd5e1", fontSize: 12, fontWeight: 1000, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{away}</div>
            <div style={{ color: "white", fontSize: 52, fontWeight: 1000, lineHeight: 1 }}>{props.awayScore ?? 0}</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10 }}>
          {[
            ["Available", props.matchPlayers?.length || 0, "#22c55e"],
            ["Bench", props.benchIds?.length || 0, "#facc15"],
            ["Events", props.timeline?.length || 0, "#38bdf8"],
            ["Coaches", props.availableCoaches?.length || 0, "#a78bfa"],
          ].map(([label, value, colour]) => (
            <div key={String(label)} style={{ borderRadius: 18, padding: 12, background: "rgba(2,6,23,0.42)", border: `1px solid ${colour}55`, color: String(colour), fontWeight: 1000 }}>
              <div style={{ color: "#94a3b8", fontSize: 10, letterSpacing: ".09em", textTransform: "uppercase" }}>{label}</div>
              <div style={{ fontSize: 24, lineHeight: 1, marginTop: 4 }}>{String(value)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function MatchQuickActions({ props }: { props: Props }) {
  const actions: Array<{ label: string; icon: string; type: TimelineEventType; colour: string }> = [
    { label: "Goal", icon: "⚽", type: "goal", colour: "#22c55e" },
    { label: "Assist", icon: "🎯", type: "assist", colour: "#38bdf8" },
    { label: "Sub", icon: "🔄", type: "sub", colour: "#facc15" },
    { label: "Injury", icon: "⚕️", type: "injury", colour: "#fb7185" },
    { label: "Note", icon: "📝", type: "note", colour: "#a78bfa" },
  ]

  function openAction(type: TimelineEventType) {
    props.setEventDraft?.({ type, playerId: "", secondPlayerId: "", note: "" })
    props.openCreateEvent?.()
  }

  return (
    <div className="sharks-glass sharks-card-shine" style={{ borderRadius: 26, padding: 14, display: "grid", gap: 12, border: "1px solid rgba(125,211,252,0.22)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div>
          <div style={{ color: "#7dd3fc", fontSize: 11, fontWeight: 1000, letterSpacing: ".15em" }}>MATCHDAY QUICK ACTIONS</div>
          <div style={{ color: "#cbd5e1", fontSize: 13, fontWeight: 750, marginTop: 4 }}>One-tap event capture for live match moments.</div>
        </div>
        <div style={{ color: "#94a3b8", fontSize: 12, fontWeight: 900 }}>{props.timeline?.length || 0} events logged</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 8 }}>
        {actions.map((action) => (
          <button key={action.type} onClick={() => openAction(action.type)} className="sharks-touch-target" style={{ border: `1px solid ${action.colour}66`, background: `linear-gradient(135deg, ${action.colour}20, rgba(2,6,23,0.58))`, borderRadius: 18, padding: "12px 6px", color: "white", fontWeight: 1000, cursor: "pointer", display: "grid", gap: 5, justifyItems: "center", boxShadow: `0 12px 28px ${action.colour}16` }}>
            <span style={{ fontSize: 22, lineHeight: 1 }}>{action.icon}</span>
            <span style={{ fontSize: 12 }}>{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default function DashboardShell(props: Props) {
  const { loading, tab, isAdmin, signOut } = props

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", padding: 24, background: "radial-gradient(circle at top, rgba(37,99,235,0.28), transparent 34%), linear-gradient(180deg, #020617 0%, #0f172a 100%)" }}>
        <ClubBrandBackdrop />
        <AppPolishFrame />
        <div style={{ ...cardStyle(), position: "relative", zIndex: 1, maxWidth: 840, margin: "0 auto", borderRadius: 30, padding: 30, background: "rgba(15,23,42,0.86)", color: "white", border: "1px solid rgba(125,211,252,0.20)", boxShadow: "0 25px 70px rgba(0,0,0,0.42)", fontWeight: 900 }}>Loading Sharks Coaching Console...</div>
      </main>
    )
  }

  const switcherTeams = props.clubTeams || defaultClubTeams
  const activeTeamId = props.activeTeamId || "all"

  return (
    <main style={{ minHeight: "100vh", padding: 16, paddingBottom: 142, background: "radial-gradient(circle at top left, rgba(37,99,235,0.24), transparent 34%), radial-gradient(circle at top right, rgba(14,165,233,0.18), transparent 34%), linear-gradient(180deg, #020617 0%, #07111f 48%, #020617 100%)", overflowX: "hidden", boxSizing: "border-box", position: "relative", color: "#e5eefc" }}>
      <ClubBrandBackdrop />
      <AppPolishFrame />
      <div style={{ position: "relative", zIndex: 1, maxWidth: 1140, margin: "0 auto", display: "grid", gap: 24, minWidth: 0 }}>
        <TeamLocationBadge teamName={props.activeTeamName || TEAM.name} roleLabel={isAdmin ? "Club Admin" : "Coach"} sectionLabel={titleCase(tab)} modeLabel={isAdmin ? "Club-wide view" : "Team workspace"} />
        <TeamSwitcherBar teams={switcherTeams} activeTeamId={activeTeamId} canSwitch={Boolean(isAdmin)} onChangeTeam={props.setActiveTeamId} />

        {tab === "home" ? (
          <>
            <DashboardHeader teamName={TEAM.name} isAdmin={isAdmin} onSignOut={signOut} nextEventTitle={props.selectedDateEvents?.[0]?.title || "No upcoming event"} nextEventDateLabel={props.selectedDateEvents?.[0] ? `${props.selectedDateEvents[0].date}${props.selectedDateEvents[0].startTime ? ` • ${props.selectedDateEvents[0].startTime}` : ""}` : "Select a day in the planner"} availablePlayersCount={props.availableCount} totalPlayersCount={props.players?.length} />
            {props.seasons && props.setActiveSeasonId ? <SeasonSwitcher seasons={props.seasons} activeSeasonId={props.activeSeasonId} onChange={props.setActiveSeasonId} onCreate={() => props.setShowSeasonModal(true)} /> : null}
          </>
        ) : null}

        {tab === "home" && (
          <ShellSection>
            <SharksIdentityBanner />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
              {[
                { label: "Available", value: props.availableCount || 0, color: "#22c55e" },
                { label: "Maybe", value: props.maybeCount || 0, color: "#f59e0b" },
                { label: "Unavailable", value: props.unavailableCount || 0, color: "#ef4444" },
                { label: "Squad Size", value: props.players?.length || 0, color: "#38bdf8" },
              ].map((item) => <div key={item.label} className="sharks-glass sharks-card-shine" style={{ borderRadius: 26, padding: 22, border: `1px solid ${item.color}55`, boxShadow: `0 16px 42px ${item.color}16` }}><div style={{ fontSize: 12, color: "#aebed4", marginBottom: 10, fontWeight: 900, letterSpacing: ".11em", textTransform: "uppercase" }}>{item.label}</div><div style={{ fontSize: 42, fontWeight: 1000, color: item.color, lineHeight: 1, textShadow: `0 0 22px ${item.color}33` }}>{item.value}</div></div>)}
            </div>
            <ExperienceUpgradePanel isAdmin={isAdmin} onOpenPlayers={() => props.setTab?.("players")} onOpenEvents={() => props.setTab?.("events")} onOpenMatchday={() => props.setTab?.("match")} onOpenAdmin={() => props.setTab?.("coaches")} />
            <DashboardOverview players={props.players} events={props.events} attendance={props.attendance} results={props.leagueResults} ratings={props.playerRatings} />
            <HomeTab teamName={TEAM.name} players={props.players} events={props.events} attendance={props.attendance} results={props.leagueResults} ratings={props.playerRatings} activeMatchEventId={props.activeMatchEventId} selectedDate={props.selectedDate} onOpenTab={props.setTab} />
          </ShellSection>
        )}

        {tab === "players" && <ShellSection><PageIntro eyebrow="Players" title="Squad Manager" subtitle="Player database, positions, development notes and squad management." /><PlayersManager players={props.players} isAdmin={props.isAdmin} onSavePlayers={props.savePlayers} /></ShellSection>}

        {tab === "events" && (
          <ShellSection>
            <PageIntro eyebrow="Events" title="Events Command" subtitle="Training, fixtures, attendance and recurring weekly sessions." />
            <EventsTabContent isAdmin={props.isAdmin} selectedDate={props.selectedDate} setSelectedDate={props.setSelectedDate} events={props.events} selectedDateEvents={props.selectedDateEvents} selectedEvent={props.selectedEvent} selectedEventId={props.selectedEventId} setSelectedEventId={props.setSelectedEventId} activeMatchEventId={props.activeMatchEventId} setActiveMatchEventId={props.setActiveMatchEventId} players={props.players} attendance={props.attendance} allTrainingPlans={props.allTrainingPlans} selectedTemplateId={props.selectedTemplateId} setSelectedTemplateId={props.setSelectedTemplateId} trainingPlan={props.trainingPlan} setTrainingPlan={props.setTrainingPlan} selectedDbTrainingPlanId={props.selectedDbTrainingPlanId} setSelectedDbTrainingPlanId={props.setSelectedDbTrainingPlanId} activeSession={props.activeSession} setActiveSession={props.setActiveSession} sessionHistory={props.sessionHistory} formatFullDate={props.formatFullDate} statusStyle={props.statusStyle} countAttendance={props.countAttendance} getPlayerStatus={props.getPlayerStatus} loadTrainingPlanFromEvent={props.loadTrainingPlanFromEvent} persistSettings={props.persistSettings} saveAttendance={props.saveAttendance} saveTrainingPlans={props.saveTrainingPlans} saveSessionRecord={props.saveSessionRecord} openAddCalendarEvent={props.openAddCalendarEvent} openEditCalendarEvent={props.openEditCalendarEvent} deleteCalendarEvent={props.deleteCalendarEvent} />
          </ShellSection>
        )}

        {tab === "coaches" && <ShellSection><PageIntro eyebrow="Coaches" title="Coaching Tools" subtitle="Coach availability, session support and planning control." /><CoachesTabContent isAdmin={props.isAdmin} selectedDate={props.selectedDate} coaches={props.coaches} coachAvailability={props.coachAvailability} selectedDateCoachAvailability={props.selectedDateCoachAvailability || []} formatFullDate={props.formatFullDate} saveCoaches={props.saveCoaches} saveCoachAvailability={props.saveCoachAvailability} />{props.isAdmin ? <><TeamsAdminPanel teams={switcherTeams} /><UserApprovalCentre /></> : null}</ShellSection>}

        {tab === "match" && <ShellSection><MatchLiveRibbon props={props} /><MatchQuickActions props={props} /><MatchTabContent {...props} /></ShellSection>}

        {tab === "stats" && <ShellSection><PageIntro eyebrow="Stats" title="Analytics Hub" subtitle="Team form, results, head-to-head records and performance trends." /><StatsTab teamName={props.normalizeTeamName ? props.normalizeTeamName(TEAM.name) : TEAM.name} results={props.leagueResults} players={props.players} ratings={props.playerRatings} timeline={props.timeline || []} /></ShellSection>}
      </div>

      <BottomNav tab={props.tab as MainTab} setTab={props.setTab} />

      <EventFormModal open={props.showEventForm} editingCalendarEventId={props.editingCalendarEventId} eventTitle={props.eventTitle} setEventTitle={props.setEventTitle} eventType={props.eventType} setEventType={props.setEventType} selectedDbTrainingPlanId={props.selectedDbTrainingPlanId} setSelectedDbTrainingPlanId={props.setSelectedDbTrainingPlanId} allTrainingPlans={props.allTrainingPlans} eventStartTime={props.eventStartTime} setEventStartTime={props.setEventStartTime} eventLocation={props.eventLocation} setEventLocation={props.setEventLocation} eventOpponent={props.eventOpponent} setEventOpponent={props.setEventOpponent} eventNotes={props.eventNotes} setEventNotes={props.setEventNotes} selectedDate={props.selectedDate} onSave={props.addEvent} onClose={() => { props.setShowEventForm(false); props.setEditingCalendarEventId(null); props.setEventTitle(""); props.setEventType("training"); props.setEventStartTime(""); props.setEventLocation(""); props.setEventOpponent(""); props.setEventNotes(""); props.setSelectedDbTrainingPlanId("") }} />
      <MatchEventModal open={props.showMatchEventModal} editingTimelineId={props.editingTimelineId} eventDraft={props.eventDraft || ({} as MatchEventDraft)} setEventDraft={props.setEventDraft as MatchEventDraftSetter} matchPlayers={props.matchPlayers || props.players} onSave={props.saveMatchEvent} onClose={() => { props.setShowMatchEventModal(false); props.setEditingTimelineId(null) }} />
      {props.setShowSeasonModal ? <SeasonModal open={props.showSeasonModal} value={props.seasonForm} setValue={props.setSeasonForm} onSave={props.handleCreateSeason} onClose={() => props.setShowSeasonModal(false)} /> : null}
    </main>
  )
}
