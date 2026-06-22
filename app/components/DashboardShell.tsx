"use client"

import { useEffect, useMemo, useState } from "react"
import nextDynamic from "next/dynamic"
import PlayersManager from "./PlayersManager"
import EventsTabContent from "./tabs/EventsTabContent"
import MatchTabContent from "./tabs/MatchTabContent"
import CoachesTabContent from "./tabs/CoachesTabContent"
import UserApprovalCentre from "./admin/UserApprovalCentre"
import TeamsAdminPanel from "./admin/TeamsAdminPanel"
import EventFormModal from "./modals/EventFormModal"
import MatchEventModal from "./modals/MatchEventModal"
import SeasonModal from "./modals/SeasonModal"
import BottomNav from "./layout/BottomNav"
import ClubBrandBackdrop from "./layout/ClubBrandBackdrop"
import TeamLocationBadge from "./layout/TeamLocationBadge"
import TeamSwitcherBar from "./layout/TeamSwitcherBar"
import AppPolishFrame from "./layout/AppPolishFrame"
import FootballHomeDashboard from "./dashboard/FootballHomeDashboard"
import ClubDashboard from "./dashboard/ClubDashboard"
import MatchLineupSnapshot from "./match/MatchLineupSnapshot"
import { defaultClubTeams } from "../lib/defaultTeams"
import { getTeamDisplayName } from "../lib/teamAccess"
import { TEAM, cardStyle, type MainTab, type MatchEventDraft } from "../lib/types"
import type { MatchEventDraftSetter } from "../lib/dashboardTypes"

const StatsTab = nextDynamic(() => import("./tabs/StatsTab"))
const TEAM_WORKSPACE_KEY = "sharks-active-team-id"
type Props = any

const U10_PLAYER_NAMES = new Set(["bailee dowler-rowles", "elsy harmer", "evelyn evans", "selena", "selina", "selena / selina"])
const U11_PLAYER_NAMES = new Set(["lyra twinning", "bella bainbridge", "betsy rowland", "connie luff", "darcy-rae russell", "ella wilson", "isabella ogden", "martha scrivens", "olivia hassall", "poppy bennett", "ruby salter"])

function ShellSection({ children }: { children: React.ReactNode }) {
  return <section style={{ minWidth: 0, display: "grid", gap: 14 }}>{children}</section>
}

function PageIntro({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return <div className="sharks-elite-panel sharks-card-shine" style={{ padding: 16, borderRadius: 22, display: "grid", gap: 6, overflow: "hidden" }}><div style={{ color: "#7dd3fc", fontSize: 10, fontWeight: 1000, letterSpacing: ".16em", textTransform: "uppercase" }}>{eyebrow}</div><div style={{ color: "white", fontSize: 26, fontWeight: 1000, lineHeight: 1, letterSpacing: "-0.045em" }}>{title}</div><div style={{ color: "#cbd5e1", fontWeight: 700, lineHeight: 1.42, maxWidth: 760 }}>{subtitle}</div></div>
}

function tabLabel(value?: string) {
  if (value === "players") return "Squad"
  if (value === "match") return "Matchday"
  if (value === "coaches") return "Admin"
  const safe = String(value || "Home")
  return safe.charAt(0).toUpperCase() + safe.slice(1)
}

function normaliseName(value?: string | null) {
  return String(value || "").trim().toLowerCase()
}

function itemTeamId(item: unknown) {
  const value = item as { teamId?: string | null; team_id?: string | null }
  return value?.teamId || value?.team_id || null
}

function inferPlayerTeamId(player: any) {
  const name = normaliseName(player?.name)
  if (U10_PLAYER_NAMES.has(name)) return "u10-girls-sharks"
  if (U11_PLAYER_NAMES.has(name)) return "u11-girls-lionesses"
  return null
}

function filterPlayersByTeam(players: any[] = [], activeTeamId: string) {
  if (activeTeamId === "all") return players
  const direct = players.filter((player) => itemTeamId(player) === activeTeamId)
  if (direct.length) return direct
  if (activeTeamId === "u10-girls-sharks") return players.filter((player) => inferPlayerTeamId(player) === "u10-girls-sharks")
  if (activeTeamId === "u11-girls-lionesses") return players.filter((player) => inferPlayerTeamId(player) === "u11-girls-lionesses")
  return []
}

function filterByTeam<T>(items: T[] = [], activeTeamId: string) {
  if (activeTeamId === "all") return items
  return items.filter((item) => itemTeamId(item) === activeTeamId)
}

function filterAttendanceByPlayers(attendance: any[] = [], players: any[] = []) {
  const ids = new Set(players.map((player) => player.id))
  return attendance.filter((item) => ids.has(item.playerId))
}

export default function DashboardShell(props: Props) {
  const { loading, tab, isAdmin } = props
  const [localActiveTeamId, setLocalActiveTeamId] = useState("all")

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(TEAM_WORKSPACE_KEY)
      if (saved) setLocalActiveTeamId(saved)
    } catch {}
  }, [])

  const switcherTeams = props.clubTeams || defaultClubTeams
  const validIds = new Set(["all", ...switcherTeams.map((team: any) => team.id)])
  const activeTeamId = validIds.has(props.activeTeamId || localActiveTeamId) ? props.activeTeamId || localActiveTeamId : "all"
  const activeTeam = switcherTeams.find((team: any) => team.id === activeTeamId)
  const activeTeamName = activeTeamId === "all" ? "All Teams" : activeTeam ? getTeamDisplayName(activeTeam) : props.activeTeamName || TEAM.name
  const activeColour = activeTeam?.primaryColour || "#38bdf8"
  const showClubDashboard = tab === "home" && isAdmin && activeTeamId === "all"

  const scopedProps = useMemo(() => {
    const scopedPlayers = filterPlayersByTeam(props.players, activeTeamId)
    return { ...props, activeTeamId, activeTeamName, players: scopedPlayers, matchPlayers: filterPlayersByTeam(props.matchPlayers || props.players, activeTeamId), maybePlayers: filterPlayersByTeam(props.maybePlayers || [], activeTeamId), unavailablePlayers: filterPlayersByTeam(props.unavailablePlayers || [], activeTeamId), attendance: filterAttendanceByPlayers(props.attendance, scopedPlayers), coaches: filterByTeam(props.coaches, activeTeamId), events: filterByTeam(props.events, activeTeamId), leagueResults: filterByTeam(props.leagueResults, activeTeamId), playerRatings: filterByTeam(props.playerRatings, activeTeamId), matchReports: filterByTeam(props.matchReports, activeTeamId) }
  }, [props, activeTeamId, activeTeamName])

  function setActiveTeam(nextTeamId: string) {
    setLocalActiveTeamId(nextTeamId)
    try { window.localStorage.setItem(TEAM_WORKSPACE_KEY, nextTeamId) } catch {}
    props.setActiveTeamId?.(nextTeamId)
  }

  if (loading) {
    return <main style={{ minHeight: "100vh", padding: 24, background: "radial-gradient(circle at top, rgba(37,99,235,0.28), transparent 34%), linear-gradient(180deg, #020617 0%, #0f172a 100%)" }}><ClubBrandBackdrop /><AppPolishFrame /><div style={{ ...cardStyle(), position: "relative", zIndex: 1, maxWidth: 840, margin: "0 auto", borderRadius: 30, padding: 30, background: "rgba(15,23,42,0.86)", color: "white", border: "1px solid rgba(125,211,252,0.20)", boxShadow: "0 25px 70px rgba(0,0,0,0.42)", fontWeight: 900 }}>Loading Sharks Coaching Console...</div></main>
  }

  return (
    <main style={{ minHeight: "100vh", padding: 14, paddingBottom: 112, background: "radial-gradient(circle at top left, rgba(37,99,235,0.24), transparent 34%), radial-gradient(circle at top right, rgba(14,165,233,0.18), transparent 34%), linear-gradient(180deg, #020617 0%, #07111f 48%, #020617 100%)", overflowX: "hidden", boxSizing: "border-box", position: "relative", color: "#e5eefc" }}>
      <ClubBrandBackdrop />
      <AppPolishFrame />
      <div style={{ position: "relative", zIndex: 1, maxWidth: 1140, margin: "0 auto", display: "grid", gap: 12, minWidth: 0 }}>
        <TeamLocationBadge teamName={activeTeamName} roleLabel={isAdmin ? "Club Admin" : "Coach"} sectionLabel={tabLabel(tab)} modeLabel={activeTeamId === "all" ? "Club-wide view" : "Team workspace"} primaryColour={activeColour} />
        <TeamSwitcherBar teams={switcherTeams} activeTeamId={activeTeamId} canSwitch={Boolean(isAdmin)} onChangeTeam={setActiveTeam} />
        {showClubDashboard ? <ClubDashboard teams={switcherTeams} players={props.players} events={props.events} attendance={props.attendance} results={props.leagueResults} onOpenTeam={setActiveTeam} /> : null}
        {tab === "home" && !showClubDashboard ? <FootballHomeDashboard teamName={activeTeamName} players={scopedProps.players} events={scopedProps.events} attendance={scopedProps.attendance} results={scopedProps.leagueResults} ratings={scopedProps.playerRatings} activeMatchEventId={props.activeMatchEventId} onOpenTab={props.setTab} /> : null}
        {tab === "players" ? <PlayersManager players={scopedProps.players} isAdmin={props.isAdmin} onSavePlayers={props.savePlayers} /> : null}
        {tab === "events" ? <ShellSection><PageIntro eyebrow="Events" title="Events Command" subtitle="Training, fixtures, attendance and recurring weekly sessions." /><EventsTabContent {...scopedProps} /></ShellSection> : null}
        {tab === "coaches" ? <ShellSection><PageIntro eyebrow="Admin" title="Club Admin" subtitle="Coaches, team setup, approvals and club management." /><CoachesTabContent {...scopedProps} />{props.isAdmin ? <><TeamsAdminPanel teams={switcherTeams} /><UserApprovalCentre /></> : null}</ShellSection> : null}
        {tab === "match" ? <ShellSection><MatchLineupSnapshot {...scopedProps} /><MatchTabContent {...scopedProps} /></ShellSection> : null}
        {tab === "stats" ? <ShellSection><PageIntro eyebrow="Stats" title="Analytics Hub" subtitle="Team form, results, head-to-head records and performance trends." /><StatsTab teamName={props.normalizeTeamName ? props.normalizeTeamName(activeTeamName) : activeTeamName} results={scopedProps.leagueResults} players={scopedProps.players} ratings={scopedProps.playerRatings} timeline={props.timeline || []} /></ShellSection> : null}
      </div>
      <BottomNav tab={props.tab as MainTab} setTab={props.setTab} />
      <EventFormModal {...props} open={props.showEventForm} onSave={props.addEvent} onClose={() => props.setShowEventForm(false)} />
      <MatchEventModal open={props.showMatchEventModal} editingTimelineId={props.editingTimelineId} eventDraft={props.eventDraft || ({} as MatchEventDraft)} setEventDraft={props.setEventDraft as MatchEventDraftSetter} matchPlayers={scopedProps.matchPlayers || scopedProps.players} onSave={props.saveMatchEvent} onClose={() => props.setShowMatchEventModal(false)} />
      {props.setShowSeasonModal ? <SeasonModal open={props.showSeasonModal} value={props.seasonForm} setValue={props.setSeasonForm} onSave={props.handleCreateSeason} onClose={() => props.setShowSeasonModal(false)} /> : null}
    </main>
  )
}
