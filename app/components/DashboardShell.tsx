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

function ShellSection({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <section
      style={{
        minWidth: 0,
        display: "grid",
        gap: 20,
      }}
    >
      {children}
    </section>
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
            "linear-gradient(180deg, #020617 0%, #0f172a 40%, #111827 100%)",
        }}
      >
        <div
          style={{
            ...cardStyle(),
            maxWidth: 840,
            margin: "0 auto",
            borderRadius: 28,
            padding: 28,
            background: "rgba(255,255,255,0.95)",
            boxShadow: "0 25px 60px rgba(0,0,0,0.35)",
            fontWeight: 700,
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
        padding: 18,
        paddingBottom: 140,
        background:
          "radial-gradient(circle at top, #1e3a8a 0%, #0f172a 30%, #020617 100%)",
        overflowX: "hidden",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          display: "grid",
          gap: 24,
          minWidth: 0,
        }}
      >
        <DashboardHeader
          teamName={TEAM.name}
          isAdmin={isAdmin}
          onSignOut={signOut}
          nextEventTitle={props.selectedDateEvents?.[0]?.title || "No upcoming event"}
          nextEventDateLabel={
            props.selectedDateEvents?.[0]
              ? `${props.selectedDateEvents[0].date}${
                  props.selectedDateEvents[0].startTime
                    ? ` • ${props.selectedDateEvents[0].startTime}`
                    : ""
                }`
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

        {tab === "home" && (
          <ShellSection>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 16,
              }}
            >
              {[
                {
                  label: "Available",
                  value: props.availableCount || 0,
                  color: "#22c55e",
                },
                {
                  label: "Maybe",
                  value: props.maybeCount || 0,
                  color: "#f59e0b",
                },
                {
                  label: "Unavailable",
                  value: props.unavailableCount || 0,
                  color: "#ef4444",
                },
                {
                  label: "Squad Size",
                  value: props.players?.length || 0,
                  color: "#3b82f6",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    borderRadius: 24,
                    padding: 22,
                    background: "rgba(15,23,42,0.82)",
                    border: `1px solid ${item.color}55`,
                    boxShadow: `0 10px 30px ${item.color}22`,
                    backdropFilter: "blur(12px)",
                  }}
                >
                  <div
                    style={{
                      fontSize: 14,
                      color: "#cbd5e1",
                      marginBottom: 10,
                      fontWeight: 600,
                    }}
                  >
                    {item.label}
                  </div>

                  <div
                    style={{
                      fontSize: 40,
                      fontWeight: 900,
                      color: "white",
                      lineHeight: 1,
                    }}
                  >
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
            <PlayersManager
              players={props.players}
              isAdmin={props.isAdmin}
              onSavePlayers={props.savePlayers}
            />
          </ShellSection>
        )}

        {tab === "events" && (
          <ShellSection>
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
            <MatchTabContent {...props} />
          </ShellSection>
        )}

        {tab === "stats" && (
          <ShellSection>
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
