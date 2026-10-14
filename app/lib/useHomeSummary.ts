"use client"

import { useEffect, useState } from 'react'
import { loadTeamEvents, loadEventResponses, type TeamEvent, type EventResponse } from './teamEvents'
import { upcomingTeamEvents } from './homeSummary'
import { supabase } from './supabase'
import { authRequired } from './runtimeConfig'

type Report = { event_id: string; outcome: 'win' | 'draw' | 'loss' }
type Snapshot = { teamId: string; events: TeamEvent[]; responses: EventResponse[]; reports: Report[]; awards: string[]; loadedAt: string }

export function useHomeSummary(teamId: string | undefined, canManage: boolean) {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [revision, setRevision] = useState(0)
  useEffect(() => {
    let active = true
    setLoading(true); setError(''); setSnapshot(null)
    if (!teamId) { setLoading(false); return }
    async function load() {
      const events = await loadTeamEvents(teamId!)
      const next = upcomingTeamEvents(events)[0]
      const [responses, reportResult] = await Promise.all([
        next ? loadEventResponses(teamId!, [next.id]) : Promise.resolve([]),
        canManage && authRequired ? supabase.from('team_match_reports').select('event_id,outcome').eq('team_id', teamId!) : Promise.resolve({ data: [], error: null }),
      ])
      if (reportResult.error) throw reportResult.error
      const reports = (reportResult.data ?? []) as Report[]
      const latest = [...events].filter(event => reports.some(report => report.event_id === event.id) && event.status !== 'cancelled')
        .sort((a, b) => Date.parse(b.startsAt) - Date.parse(a.startsAt))[0]
      let awards: string[] = []
      if (latest && canManage && authRequired) {
        const [winners, players] = await Promise.all([
          supabase.from('team_match_awards').select('player_id,category').eq('team_id', teamId!).eq('event_id', latest.id),
          supabase.from('players').select('id,first_name,last_name').eq('team_id', teamId!),
        ])
        if (winners.error || players.error) throw winners.error || players.error
        const names = new Map((players.data ?? []).map(player => [player.id, `${player.first_name} ${player.last_name}`.trim()]))
        const labels: Record<string, string> = { players: 'Players’ Player', spectators: 'Spectators’ Player', opponents: 'Opponents’ Player' }
        awards = Object.entries(labels).flatMap(([category, label]) => {
          const recipients = (winners.data ?? []).filter(winner => winner.category === category).map(winner => names.get(winner.player_id) ?? 'Former player')
          return recipients.length ? [`${label}: ${recipients.join(', ')}`] : []
        })
      }
      if (active) setSnapshot({ teamId: teamId!, events, responses, reports, awards, loadedAt: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) })
    }
    void load().catch(() => { if (active) setError('Could not load team updates. Retry or open Schedule.') }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [teamId, canManage, revision])
  // Never display the previous team's snapshot, even before its effect cleans up.
  return { snapshot: snapshot?.teamId === teamId ? snapshot : null, error, loading, refresh: () => setRevision(value => value + 1) }
}
