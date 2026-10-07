"use client"

import { useEffect, useState, type ComponentProps } from 'react'
import { supabase } from '../../lib/supabase'
import { ratingsForSlots, type PositionRatings } from '../../lib/quarterPlanner'
import { useTeamAccess } from '../system/TeamAccessProvider'
import QuarterPlanner from './QuarterPlanner'

type Props = Omit<ComponentProps<typeof QuarterPlanner>, 'players'> & {
  layout: { key: string; x: number }[]
  players: (ComponentProps<typeof QuarterPlanner>['players'][number] & { cloudId?: string })[]
}
export default function RatedQuarterPlanner(props: Props) {
  const { activeTeam } = useTeamAccess()
  const teamId = activeTeam?.canManage ? activeTeam.teamId : ''
  const [result, setResult] = useState<{ team: string; rows: Record<string, PositionRatings>; error: string } | null>(null)
  const [retry, setRetry] = useState(0)
  useEffect(() => {
    let active = true
    if (!teamId) return
    supabase.from('player_position_profiles').select('player_id,goalkeeper,defence,centre_mid,wide,striker').eq('team_id', teamId)
      .then(({ data, error }) => {
        if (active) setResult({ team: teamId, rows: error ? {} : Object.fromEntries((data ?? []).map(row => [row.player_id, row])), error: error ? 'Saved ratings could not be loaded. Retry before building a new plan.' : '' })
      }, () => { if (active) setResult({ team: teamId, rows: {}, error: 'Saved ratings could not be loaded. Retry before building a new plan.' }) })
    return () => { active = false }
  }, [teamId, retry])
  const current = result?.team === teamId ? result : null
  const players = props.players.map(player => {
    const profile = current?.rows[player.cloudId ?? player.id]
    return { ...player, slotRatings: profile ? ratingsForSlots(profile, props.layout) : undefined }
  })
  const count = players.filter(player => player.slotRatings).length
  return <>
    <p role="status">{!teamId ? 'No coach cloud connection. Using preferred roles only.' : !current ? 'Loading saved coach ratings…' : current.error || `Saved coach ratings loaded for ${count}/${players.length} selected players. Rebuild to use updated ratings; existing plans stay unchanged.`}</p>
    {current?.error && <button onClick={() => { setResult(null); setRetry(n => n + 1) }}>Retry ratings</button>}
    <QuarterPlanner {...props} players={players} ratingsPending={Boolean(teamId && (!current || current.error))} />
  </>
}
