"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Player } from "@/lib/types";

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPlayers() {
      const { data, error } = await supabase.from("players").select("*").order("name");
      if (error) {
        setError(error.message);
      } else {
        setPlayers((data || []) as Player[]);
      }
      setLoading(false);
    }
    loadPlayers();
  }, []);

  return (
    <div className="grid">
      <section className="card stack">
        <p className="eyebrow">Squad</p>
        <h2 className="page-title">Players</h2>
        <p className="subtle">This page reads the squad from Supabase. Darcy-Rae should be marked as goalkeeper.</p>
      </section>

      <section className="card">
        {loading ? <p>Loading players…</p> : error ? <p>{error}</p> : (
          <div className="list">
            {players.map((player) => (
              <div key={player.id} className="list-item space-between">
                <div>
                  <strong>{player.name}</strong>
                  <div className="row" style={{ marginTop: 8 }}>
                    {player.is_goalkeeper && <span className="badge blue">GK</span>}
                    {player.can_cover_goal && <span className="badge orange">GK cover</span>}
                    {player.active ? <span className="badge green">Active</span> : <span className="badge red">Inactive</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
