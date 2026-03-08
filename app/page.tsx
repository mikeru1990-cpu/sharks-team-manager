"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function Page() {
  const [players, setPlayers] = useState<any[]>([])

  useEffect(() => {
    async function loadPlayers() {
      const { data } = await supabase.from("players").select("*")
      setPlayers(data || [])
    }

    loadPlayers()
  }, [])

  return (
    <main style={{ padding: 20 }}>
      <h1>Sharks Team Manager</h1>

      {players.map((player) => (
        <div key={player.id}>
          {player.name}
        </div>
      ))}
    </main>
  )
}
