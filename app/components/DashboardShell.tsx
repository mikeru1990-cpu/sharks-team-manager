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

import {
  TEAM,
  cardStyle,
  type MainTab,
  type MatchEventDraft,
} from "../lib/types"

import type { MatchEventDraftSetter } from "../lib/dashboardTypes"

const StatsTab = nextDynamic(() => import("./tabs/StatsTab"))

type Props = any

export default function DashboardShell(props: Props) {
  const { loading, tab, isAdmin, signOut } = props

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", padding: 24 }}>
        <div style={{ ...cardStyle(), maxWidth: 840, margin: "0 auto" }}>
          Loading club data...
        </div>
      </main>
    )
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 16,
        paddingBottom: 120,
        background: "linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)",
        overflowX: "hidden",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: 980,
          margin: "0 auto",
          display: "grid",
          gap: 16,
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
        )}

        {tab === "players" && (
          <PlayersManager
            players={props.players}
            isAdmin={props.isAdmin}
            onSavePlayers={props.savePlayers}
          />
        )}

        {tab === "events" && (
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
        )}

        {tab === "coaches" && (
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
        )}

        {tab === "match" && <MatchTabContent {...props} />}

        {tab === "stats" && (
          <StatsTab
            teamName={props.normalizeTeamName ? props.normalizeTeamName(TEAM.name) : TEAM.name}
            results={props.leagueResults}
            players={props.players}
            ratings={props.playerRatings}
            timeline={props.timeline || []}
          />
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
