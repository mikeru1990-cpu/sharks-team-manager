"use client"

import { useEffect, useMemo, useState, type FormEvent } from "react"
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
  Plus,
  RefreshCw,
  Trophy,
  Users,
  X,
} from "lucide-react"
import { useSquadPlayers } from "../../lib/useSquadPlayers"
import {
  createTeamEvent,
  loadEventResponses,
  loadGuardianPlayerIds,
  loadTeamEvents,
  setEventResponse,
  updateTeamEventStatus,
  type EventResponse,
  type EventResponseValue,
  type TeamEvent,
  type TeamEventType,
} from "../../lib/teamEvents"
import type { WorkspaceTab } from "../../lib/workspaces"
import { useTeamAccess } from "../system/TeamAccessProvider"

type Props = { onNavigate: (tab: WorkspaceTab) => void }

const responseOptions: Array<{ value: EventResponseValue; label: string }> = [
  { value: "available", label: "Available" },
  { value: "maybe", label: "Maybe" },
  { value: "unavailable", label: "Unavailable" },
]

const typeLabels: Record<TeamEventType, string> = {
  match: "Match",
  training: "Training",
  tournament: "Tournament",
  meeting: "Meeting",
  event: "Event",
}

function sameOrFuture(iso: string) {
  const date = new Date(iso)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date.getTime() >= today.getTime()
}

function formatDay(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  })
}

function formatTime(iso: string | null) {
  if (!iso) return ""
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

function responseCounts(eventId: string, responses: EventResponse[], playerIds: string[]) {
  const relevant = responses.filter(
    (item) => item.eventId === eventId && playerIds.includes(item.playerId),
  )
  return {
    available: relevant.filter((item) => item.response === "available").length,
    maybe: relevant.filter((item) => item.response === "maybe").length,
    unavailable: relevant.filter((item) => item.response === "unavailable").length,
    unanswered: Math.max(
      0,
      playerIds.length -
        relevant.filter((item) => item.response !== "unanswered").length,
    ),
  }
}

export default function ScheduleScreen({ onNavigate }: Props) {
  const { activeTeam } = useTeamAccess()
  const players = useSquadPlayers()
  const canManage = activeTeam?.canManage ?? false
  const [events, setEvents] = useState<TeamEvent[]>([])
  const [responses, setResponses] = useState<EventResponse[]>([])
  const [guardianPlayerIds, setGuardianPlayerIds] = useState<string[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  const playerKeys = useMemo(
    () => players.map((player) => player.cloudId ?? player.id),
    [players],
  )

  async function refresh() {
    if (!activeTeam) return
    setLoading(true)
    setMessage("")
    try {
      const nextEvents = await loadTeamEvents(activeTeam.teamId)
      const nextResponses = await loadEventResponses(
        activeTeam.teamId,
        nextEvents.map((event) => event.id),
      )
      setEvents(nextEvents)
      setResponses(nextResponses)
      if (!canManage) {
        setGuardianPlayerIds(await loadGuardianPlayerIds())
      } else {
        setGuardianPlayerIds([])
      }
      setSelectedId((current) =>
        current && nextEvents.some((event) => event.id === current)
          ? current
          : null,
      )
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Schedule could not be loaded.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [activeTeam?.teamId, canManage])

  const upcoming = useMemo(
    () => events.filter((event) => event.status !== "completed" && sameOrFuture(event.startsAt)),
    [events],
  )
  const history = useMemo(
    () =>
      events
        .filter((event) => event.status === "completed" || !sameOrFuture(event.startsAt))
        .sort((a, b) => Date.parse(b.startsAt) - Date.parse(a.startsAt)),
    [events],
  )
  const selected = events.find((event) => event.id === selectedId) ?? null

  if (selected) {
    return (
      <EventDetail
        event={selected}
        players={players}
        responses={responses}
        canManage={canManage}
        guardianPlayerIds={guardianPlayerIds}
        teamId={activeTeam?.teamId ?? ""}
        onBack={() => setSelectedId(null)}
        onNavigate={onNavigate}
        onChanged={refresh}
      />
    )
  }

  return (
    <div className="fos-everyday-page">
      <section className="fos-page-intro">
        <div>
          <span className="fos-page-kicker">SCHEDULE</span>
          <h1>Everything coming up.</h1>
          <p>
            {activeTeam?.teamName ?? "Your team"} · matches, training, availability and team events in one place.
          </p>
        </div>
        <div className="fos-page-icon"><CalendarDays /></div>
      </section>

      <section className="fos-schedule-toolbar">
        <div>
          <strong>{upcoming.length}</strong>
          <span>upcoming</span>
        </div>
        <div>
          <strong>{players.length}</strong>
          <span>squad</span>
        </div>
        <button type="button" onClick={() => void refresh()} disabled={loading}>
          <RefreshCw className={loading ? "spin" : ""} />
          Refresh
        </button>
        {canManage && (
          <button type="button" className="primary" onClick={() => setAdding(true)}>
            <Plus />
            Add event
          </button>
        )}
      </section>

      {message && <div className="fos-schedule-message">{message}</div>}

      {adding && activeTeam && (
        <NewEventForm
          teamId={activeTeam.teamId}
          onCancel={() => setAdding(false)}
          onCreated={async () => {
            setAdding(false)
            await refresh()
          }}
        />
      )}

      <section className="fos-schedule-card">
        <div className="fos-section-heading">
          <div>
            <span>NEXT UP</span>
            <h2>Team calendar</h2>
          </div>
          <CalendarDays />
        </div>

        {loading ? (
          <div className="fos-events-empty">
            <RefreshCw className="spin" />
            <div><strong>Loading team schedule</strong><span>Checking the latest team events and availability.</span></div>
          </div>
        ) : upcoming.length ? (
          <div className="fos-event-group">
            {upcoming.map((event) => {
              const counts = responseCounts(event.id, responses, playerKeys)
              return (
                <button
                  type="button"
                  className="fos-market-event"
                  key={event.id}
                  onClick={() => setSelectedId(event.id)}
                >
                  <div className={`fos-market-event-type ${event.eventType}`}>
                    {event.eventType === "match" ? <Trophy /> : <CalendarDays />}
                  </div>
                  <div className="fos-market-event-copy">
                    <span>{typeLabels[event.eventType]} · {formatDay(event.startsAt)}</span>
                    <strong>{event.title}</strong>
                    <small>
                      {event.meetAt ? `Meet ${formatTime(event.meetAt)} · ` : ""}
                      {formatTime(event.startsAt)}
                      {event.locationName ? ` · ${event.locationName}` : ""}
                    </small>
                    <div className="fos-rsvp-summary">
                      <b className="yes">{counts.available} yes</b>
                      <b className="maybe">{counts.maybe} maybe</b>
                      <b className="no">{counts.unavailable} no</b>
                      <b>{counts.unanswered} waiting</b>
                    </div>
                  </div>
                  <ChevronRight />
                </button>
              )
            })}
          </div>
        ) : (
          <div className="fos-events-empty">
            <CalendarDays />
            <div>
              <strong>No future events yet</strong>
              <span>{canManage ? "Add the next match or training session to start collecting availability." : "Your team has not published its next event yet."}</span>
            </div>
          </div>
        )}
      </section>

      {history.length > 0 && (
        <section className="fos-schedule-card">
          <div className="fos-section-heading">
            <div><span>HISTORY</span><h2>Recent events</h2></div>
          </div>
          <div className="fos-event-group">
            {history.slice(0, 8).map((event) => (
              <button
                type="button"
                className="fos-market-event muted"
                key={event.id}
                onClick={() => setSelectedId(event.id)}
              >
                <div className={`fos-market-event-type ${event.eventType}`}><Check /></div>
                <div className="fos-market-event-copy">
                  <span>{typeLabels[event.eventType]} · {formatDay(event.startsAt)}</span>
                  <strong>{event.title}</strong>
                  <small>{event.locationName || "No location recorded"}</small>
                </div>
                <ChevronRight />
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function EventDetail({
  event,
  players,
  responses,
  canManage,
  guardianPlayerIds,
  teamId,
  onBack,
  onNavigate,
  onChanged,
}: {
  event: TeamEvent
  players: ReturnType<typeof useSquadPlayers>
  responses: EventResponse[]
  canManage: boolean
  guardianPlayerIds: string[]
  teamId: string
  onBack: () => void
  onNavigate: (tab: WorkspaceTab) => void
  onChanged: () => Promise<void>
}) {
  const [busyPlayer, setBusyPlayer] = useState<string | null>(null)
  const [statusBusy, setStatusBusy] = useState(false)
  const playerKeys = players.map((player) => player.cloudId ?? player.id)
  const counts = responseCounts(event.id, responses, playerKeys)

  function responseFor(playerKey: string) {
    return responses.find(
      (response) => response.eventId === event.id && response.playerId === playerKey,
    )?.response ?? "unanswered"
  }

  async function respond(playerKey: string, value: EventResponseValue) {
    setBusyPlayer(playerKey)
    try {
      await setEventResponse({
        teamId,
        eventId: event.id,
        playerId: playerKey,
        response: value,
      })
      await onChanged()
    } finally {
      setBusyPlayer(null)
    }
  }

  return (
    <div className="fos-everyday-page">
      <button type="button" className="fos-back-button" onClick={onBack}>
        <ChevronLeft /> Schedule
      </button>

      <section className="fos-event-hero">
        <div className={`fos-event-hero-icon ${event.eventType}`}>
          {event.eventType === "match" ? <Trophy /> : <CalendarDays />}
        </div>
        <div>
          <span>{typeLabels[event.eventType].toUpperCase()}</span>
          <h1>{event.title}</h1>
          <p>{formatDay(event.startsAt)} · {formatTime(event.startsAt)}</p>
        </div>
      </section>

      <section className="fos-event-detail-grid">
        <div>
          <Clock3 />
          <span>Start</span>
          <strong>{formatTime(event.startsAt)}</strong>
        </div>
        <div>
          <Clock3 />
          <span>Meet</span>
          <strong>{event.meetAt ? formatTime(event.meetAt) : "—"}</strong>
        </div>
        <div className="wide">
          <MapPin />
          <span>Location</span>
          <strong>{event.locationName || "To be confirmed"}</strong>
        </div>
      </section>

      {event.notes && <section className="fos-event-notes"><strong>Event notes</strong><p>{event.notes}</p></section>}

      {event.eventType === "match" && canManage && event.status === "scheduled" && (
        <button type="button" className="fos-matchday-cta" onClick={() => onNavigate("matchday")}>
          <Trophy />
          <span><strong>Open Matchday</strong><small>Prepare squad, formation and live match tools</small></span>
          <ChevronRight />
        </button>
      )}

      <section className="fos-schedule-card">
        <div className="fos-section-heading">
          <div><span>AVAILABILITY</span><h2>{counts.available} of {players.length} available</h2></div>
          <Users />
        </div>
        <div className="fos-rsvp-total">
          <span className="yes"><strong>{counts.available}</strong>Yes</span>
          <span className="maybe"><strong>{counts.maybe}</strong>Maybe</span>
          <span className="no"><strong>{counts.unavailable}</strong>No</span>
          <span><strong>{counts.unanswered}</strong>Waiting</span>
        </div>

        <div className="fos-availability-list">
          {players.map((player) => {
            const playerKey = player.cloudId ?? player.id
            const current = responseFor(playerKey)
            const editable = canManage || guardianPlayerIds.includes(playerKey)
            return (
              <article key={player.id}>
                <div className="fos-availability-player">
                  <span>{player.knownAs ?? player.name.split(" ")[0]}</span>
                  <small>{player.primaryPosition} · {current === "unanswered" ? "Awaiting response" : current}</small>
                </div>
                <div className="fos-availability-buttons">
                  {responseOptions.map((option) => (
                    <button
                      type="button"
                      key={option.value}
                      disabled={!editable || busyPlayer === playerKey}
                      className={current === option.value ? `active ${option.value}` : ""}
                      onClick={() => void respond(playerKey, option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </article>
            )
          })}
        </div>

        {!canManage && guardianPlayerIds.length === 0 && (
          <p className="fos-parent-link-note">
            This account can view team availability. A club administrator must link your account to your player before you can respond for them.
          </p>
        )}
      </section>

      {canManage && event.status === "scheduled" && (
        <button
          type="button"
          className="fos-complete-event"
          disabled={statusBusy}
          onClick={async () => {
            setStatusBusy(true)
            try {
              await updateTeamEventStatus(event, "completed")
              await onChanged()
              onBack()
            } finally {
              setStatusBusy(false)
            }
          }}
        >
          <Check /> Mark event complete
        </button>
      )}
    </div>
  )
}

function NewEventForm({
  teamId,
  onCancel,
  onCreated,
}: {
  teamId: string
  onCancel: () => void
  onCreated: () => Promise<void>
}) {
  const [eventType, setEventType] = useState<TeamEventType>("match")
  const [title, setTitle] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("10:00")
  const [meetTime, setMeetTime] = useState("")
  const [location, setLocation] = useState("")
  const [notes, setNotes] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!title.trim() || !date || !time) {
      setError("Add a title, date and start time.")
      return
    }

    setSaving(true)
    setError("")
    try {
      const startsAt = new Date(`${date}T${time}`).toISOString()
      const meetAt = meetTime ? new Date(`${date}T${meetTime}`).toISOString() : null
      await createTeamEvent(teamId, {
        eventType,
        title: title.trim(),
        startsAt,
        meetAt,
        locationName: location,
        notes,
      })
      await onCreated()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The event could not be saved.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="fos-new-event" onSubmit={submit}>
      <div className="fos-new-event-head">
        <div><span>NEW EVENT</span><h2>Add to team schedule</h2></div>
        <button type="button" aria-label="Cancel" onClick={onCancel}><X /></button>
      </div>

      <div className="fos-event-type-tabs">
        {(["match", "training", "event", "tournament", "meeting"] as TeamEventType[]).map((type) => (
          <button
            type="button"
            key={type}
            className={eventType === type ? "active" : ""}
            onClick={() => setEventType(type)}
          >
            {typeLabels[type]}
          </button>
        ))}
      </div>

      <label>
        <span>Title</span>
        <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder={eventType === "match" ? "Opposition / fixture" : "Event name"} />
      </label>

      <div className="fos-form-row">
        <label><span>Date</span><input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>
        <label><span>Start</span><input type="time" value={time} onChange={(event) => setTime(event.target.value)} /></label>
        <label><span>Meet</span><input type="time" value={meetTime} onChange={(event) => setMeetTime(event.target.value)} /></label>
      </div>

      <label><span>Location</span><input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Pitch, venue or address" /></label>
      <label><span>Notes</span><textarea rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Arrival instructions, kit, parking or anything the team needs to know" /></label>

      {error && <p className="fos-form-error">{error}</p>}

      <div className="fos-new-event-actions">
        <button type="button" onClick={onCancel}>Cancel</button>
        <button type="submit" className="primary" disabled={saving}>
          {saving ? "Saving…" : "Add event"}
        </button>
      </div>
    </form>
  )
}
