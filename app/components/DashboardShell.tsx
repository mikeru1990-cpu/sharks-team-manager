"use client"

import nextDynamic from "next/dynamic"
import PlayersManager from "./PlayersManager"
import HomeTab from "./tabs/HomeTab"
import EventsTabContent from "./tabs/EventsTabContent"
import MatchTabContent from "./tabs/MatchTabContent"
import CoachesTabContent from "./tabs/CoachesTabContent"
import EventFormModal from "./modals/EventFormModal"
import MatchEventModal from "./modals/MatchEventModal"
import SeasonModal from "./modals/SeasonModal"
import DashboardHeader from "./layout/DashboardHeader"
import BottomNav from "./layout/BottomNav"
import SeasonSwitcher from "./layout/SeasonSwitcher"
import ClubBrandBackdrop from "./layout/ClubBrandBackdrop"
import SharksIdentityBanner from "./layout/SharksIdentityBanner"
import DashboardOverview from "./dashboard/DashboardOverview"

import {
  TEAM,
  cardStyle,
  type MainTab,
  type MatchEventDraft,
} from "../lib/types"

import type { MatchEventDraftSetter } from "../lib/dashboardTypes"

const StatsTab = nextDynamic(() => import("./tabs/StatsTab"))

type Props = any

function ShellSection({ children }: { children: React.ReactNode }) {
  return (
    <section style={{ minWidth: 0, display: "grid", gap: 22 }}>
      {children}
    </section>
  )
}

function PageIntro({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return (
    <div
      className="sharks-elite-panel sharks-card-shine"
      style={{
        padding: 20,
        borderRadius: 28,
        display: "grid",
        gap: 8,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          color: "#7dd3fc",
          fontSize: 11,
          fontWeight: 1000,
          letterSpacing: ".16em",
          textTransform: "uppercase",
        }}
      >
        {eyebrow}
      </div>
      <div
        style={{
          color: "white",
          fontSize: 32,
          fontWeight: 1000,
          lineHeight: 1,
          letterSpacing: "-0.045em",
        }}
      >
        {title}
      </div>
      <div style={{ color: "#cbd5e1", fontWeight: 700, lineHeight: 1.55, maxWidth: 760 }}>
        {subtitle}
      </div>
    </div>
  )
}

export default function DashboardShell(props: Props) {
  const { loading, tab, isAdmin, signOut } = props

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          padding: 24,
          background:
            "radial-gradient(circle at top, rgba(37,99,235,0.28), transparent 34%), linear-gradient(180deg, #020617 0%, #0f172a 100%)",
        }}
      >
        <ClubBrandBackdrop />
        <div
          style={{
            ...cardStyle(),
            position: "relative",
            zIndex: 1,
            maxWidth: 840,
            margin: "0 auto",
            borderRadius: 30,
            padding: 30,
            background: "rgba(15,23,42,0.86)",
            color: "white",
            border: "1px solid rgba(125,211,252,0.20)",
            boxShadow: "0 25px 70px rgba(0,0,0,0.42)",
            fontWeight: 900,
          }}
        >
          Loading Sharks Coaching Console...
        </div>
      </main>
    )
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 16,
        paddingBottom: 142,
        background:
          "radial-gradient(circle at top left, rgba(37,99,235,0.24), transparent 34%), radial-gradient(circle at top right, rgba(14,165,233,0.18), transparent 34%), linear-gradient(180deg, #020617 0%, #07111f 48%, #020617 100%)",
        overflowX: "hidden",
        boxSizing: "border-box",
        position: "relative",
        color: "#e5eefc",
      }}
    >
      <ClubBrandBackdrop />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1140,
          margin: "0 auto",
          display: "grid",
          gap: 24,
          minWidth: 0,
        }}
      >
        {tab === "home" ? (
          <>
            <DashboardHeader
              teamName={TEAM.name}
              isAdmin={isAdmin}
              onSignOut={signOut}
              nextEventTitle={props.selectedDateEvents?.[0]?.title || "No upcoming event"}
              nextEventDateLabel={
                props.selectedDateEvents?.[0]
                  ? `${props.selectedDateEvents[0].date}${props.selectedDateEvents[0].startTime ? ` • ${props.selectedDateEvents[0].startTime}` : ""}`
                  : "Select a day in the planner"
              }
              availablePlayersCount={props.availableCount}
              totalPlayersCount={props.players?.length}
            />

            {props.seasons && props.setActiveSeasonId ? (
              <SeasonSwitcher
                seasons={props.seasons}
                activeSeasonId={props.activeSeasonId}
                onChange={props.setActiveSeasonId}
                onCreate={() => props.setShowSeasonModal(true)}
              />
            ) : null}
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
              ].map((item) => (
                <div
                  key={item.label}
                  className="sharks-glass sharks-card-shine"
                  style={{ borderRadius: 26, padding: 22, border: `1px solid ${item.color}55`, boxShadow: `0 16px 42px ${item.color}16` }}
                >
                  <div style={{ fontSize: 12, color: "#aebed4", marginBottom: 10, fontWeight: 900, letterSpacing: ".11em", textTransform: "uppercase" }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: 42, fontWeight: 1000, color: item.color, lineHeight: 1, textShadow: `0 0 22px ${item.color}33` }}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>

            <DashboardOverview
              players={props.players}
              events={props.events}
              attendance={props.attendance}
              results={props.leagueResults}
              ratings={props.playerRatings}
            />

            <HomeTab
              teamName={TEAM.name}
              players={props.players}
              events={props.events}
              attendance={props.attendance}
              results={props.leagueResults}
              ratings={props.playerRatings}
              activeMatchEventId={props.activeMatchEventId}
              selectedDate={props.selectedDate}
              onOpenTab={props.setTab}
            />
          </ShellSection>
        )}

        {tab === "players" && (
          <ShellSection>
            <PageIntro eyebrow="Players" title="Squad Manager" subtitle="Player database, positions, development notes and squad management." />
            <PlayersManager players={props.players} isAdmin={props.isAdmin} onSavePlayers={props.savePlayers} />
          </ShellSection>
        )}

        {tab === "events" && (
          <ShellSection>
            <PageIntro eyebrow="Events" title="Events Command" subtitle="Training, fixtures, attendance and recurring weekly sessions." />
            <EventsTabContent
              isAdmin={props.isAdmin}
              selectedDate={props.selectedDate}
              setSelectedDate={props.setSelectedDate}
              events={props.events}
              selectedDateEvents={props.selectedDateEvents}
              selectedEvent={props.selectedEvent}
              selectedEventId={props.selectedEventId}
              setSelectedEventId={props.setSelectedEventId}
              activeMatchEventId={props.activeMatchEventId}
              setActiveMatchEventId={props.setActiveMatchEventId}
              players={props.players}
              attendance={props.attendance}
              allTrainingPlans={props.allTrainingPlans}
              selectedTemplateId={props.selectedTemplateId}
              setSelectedTemplateId={props.setSelectedTemplateId}
              trainingPlan={props.trainingPlan}
              setTrainingPlan={props.setTrainingPlan}
              selectedDbTrainingPlanId={props.selectedDbTrainingPlanId}
              setSelectedDbTrainingPlanId={props.setSelectedDbTrainingPlanId}
              activeSession={props.activeSession}
              setActiveSession={props.setActiveSession}
              sessionHistory={props.sessionHistory}
              formatFullDate={props.formatFullDate}
              statusStyle={props.statusStyle}
              countAttendance={props.countAttendance}
              getPlayerStatus={props.getPlayerStatus}
              loadTrainingPlanFromEvent={props.loadTrainingPlanFromEvent}
              persistSettings={props.persistSettings}
              saveAttendance={props.saveAttendance}
              saveTrainingPlans={props.saveTrainingPlans}
              saveSessionRecord={props.saveSessionRecord}
              openAddCalendarEvent={props.openAddCalendarEvent}
              openEditCalendarEvent={props.openEditCalendarEvent}
              deleteCalendarEvent={props.deleteCalendarEvent}
            />
          </ShellSection>
        )}

        {tab === "coaches" && (
          <ShellSection>
            <PageIntro eyebrow="Coaches" title="Coaching Tools" subtitle="Coach availability, session support and planning control." />
            <CoachesTabContent
              isAdmin={props.isAdmin}
              selectedDate={props.selectedDate}
              coaches={props.coaches}
              coachAvailability={props.coachAvailability}
              selectedDateCoachAvailability={props.selectedDateCoachAvailability || []}
              formatFullDate={props.formatFullDate}
              saveCoaches={props.saveCoaches}
              saveCoachAvailability={props.saveCoachAvailability}
            />
          </ShellSection>
        )}

        {tab === "match" && (
          <ShellSection>
            <PageIntro eyebrow="Match" title="Match Centre" subtitle="Live score, tactical board, quarter planning, rotations and match timeline." />
            <MatchTabContent {...props} />
          </ShellSection>
        )}

        {tab === "stats" && (
          <ShellSection>
            <PageIntro eyebrow="Stats" title="Analytics Hub" subtitle="Team form, results, head-to-head records and performance trends." />
            <StatsTab
              teamName={props.normalizeTeamName ? props.normalizeTeamName(TEAM.name) : TEAM.name}
              results={props.leagueResults}
              players={props.players}
              ratings={props.playerRatings}
              timeline={props.timeline || []}
            />
          </ShellSection>
        )}
      </div>

      <BottomNav tab={props.tab as MainTab} setTab={props.setTab} />

      <EventFormModal
        open={props.showEventForm}
        editingCalendarEventId={props.editingCalendarEventId}
        eventTitle={props.eventTitle}
        setEventTitle={props.setEventTitle}
        eventType={props.eventType}
        setEventType={props.setEventType}
        selectedDbTrainingPlanId={props.selectedDbTrainingPlanId}
        setSelectedDbTrainingPlanId={props.setSelectedDbTrainingPlanId}
        allTrainingPlans={props.allTrainingPlans}
        eventStartTime={props.eventStartTime}
        setEventStartTime={props.setEventStartTime}
        eventLocation={props.eventLocation}
        setEventLocation={props.setEventLocation}
        eventOpponent={props.eventOpponent}
        setEventOpponent={props.setEventOpponent}
        eventNotes={props.eventNotes}
        setEventNotes={props.setEventNotes}
        selectedDate={props.selectedDate}
        onSave={props.addEvent}
        onClose={() => {
          props.setShowEventForm(false)
          props.setEditingCalendarEventId(null)
          props.setEventTitle("")
          props.setEventType("training")
          props.setEventStartTime("")
          props.setEventLocation("")
          props.setEventOpponent("")
          props.setEventNotes("")
          props.setSelectedDbTrainingPlanId("")
        }}
      />

      <MatchEventModal
        open={props.showMatchEventModal}
        editingTimelineId={props.editingTimelineId}
        eventDraft={props.eventDraft || ({} as MatchEventDraft)}
        setEventDraft={props.setEventDraft as MatchEventDraftSetter}
        matchPlayers={props.matchPlayers || props.players}
        onSave={props.saveMatchEvent}
        onClose={() => {
          props.setShowMatchEventModal(false)
          props.setEditingTimelineId(null)
        }}
      />

      {props.setShowSeasonModal ? (
        <SeasonModal
          open={props.showSeasonModal}
          value={props.seasonForm}
          setValue={props.setSeasonForm}
          onSave={props.handleCreateSeason}
          onClose={() => props.setShowSeasonModal(false)}
        />
      ) : null}
    </main>
  )
}
