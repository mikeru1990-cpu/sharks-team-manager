"use client"

import { useEffect, useState } from "react"
import { supabase } from "../supabase"

export default function Page() {
  const [players, setPlayers] = useState<any[]>([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadPlayers() {
      const { data, error } = await supabase.from("players").select("*")

      if (error) {
        setError(error.message)
      } else {
        setPlayers(data || [])
      }

      setLoading(false)
    }

    loadPlayers()
  }, [])

  return (
    <main style={{ padding: 20 }}>
      <h1>Sharks Team Manager</h1>

      {loading && <p>Loading...</p>}

      {error && (
        <p style={{ color: "red", whiteSpace: "pre-wrap" }}>
          Error: {error}
        </p>
      )}

      {!loading && !error && players.length === 0 && (
        <p>No players found.</p>
      )}

      {players.map((player) => (
        <div key={player.id}>{player.name}</div>
      ))}
    </main>
  )
}
