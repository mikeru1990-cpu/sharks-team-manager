"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Player = {
  id: string;
  name: string;
  position: string;
};

type Fixture = {
  id: string;
  opponent: string;
  match_date: string;
  venue: string;
};

type Squad = {
  starters: Player[];
  bench: Player[];
  quarters: Player[][];
};

export default function Page() {

  const [players, setPlayers] = useState<Player[]>([
    { id: "1", name: "Bailee Dowler-Rowles", position: "MID" },
    { id: "2", name: "Bella Bainbridge", position: "MID" },
    { id: "3", name: "Betsy Rowland", position: "DEF" },
    { id: "4", name: "Connie Luff", position: "FWD" },
    { id: "5", name: "Darcy-Rae Russell", position: "DEF" },
    { id: "6", name: "Ella Wilson", position: "MID" },
    { id: "7", name: "Elsy Harmer", position: "GK" },
    { id: "8", name: "Evelyn Evans", position: "FWD" },
    { id: "9", name: "Isabella Ogden", position: "DEF" },
    { id: "10", name: "Lyra Twinning", position: "MID" },
  ]);

  const [fixtures] = useState<Fixture[]>([
    {
      id: "1",
      opponent: "Tigers",
      match_date: "2026-03-15",
      venue: "Home",
    },
  ]);

  const [availability, setAvailability] = useState<Record<string, Set<string>>>({});
  const [generatedSquads, setGeneratedSquads] = useState<Record<string, Squad>>({});

  useEffect(() => {
    loadSavedSquads();
  }, []);

  async function loadSavedSquads() {

    const { data } = await supabase
      .from("saved_squads")
      .select("*");

    if (!data) return;

    const loaded: Record<string, Squad> = {};

    data.forEach((row: any) => {

      loaded[row.fixture_id] = {
        starters: JSON.parse(row.starters_json || "[]"),
        bench: JSON.parse(row.bench_json || "[]"),
        quarters: JSON.parse(row.quarters_json || "[]"),
      };

    });

    setGeneratedSquads(loaded);
  }

  function toggleAvailability(fixtureId: string, playerId: string) {

    const current = availability[fixtureId] || new Set<string>();
    const updated = new Set(current);

    if (updated.has(playerId)) {
      updated.delete(playerId);
    } else {
      updated.add(playerId);
    }

    setAvailability((prev) => ({
      ...prev,
      [fixtureId]: updated,
    }));
  }

  function isAvailable(fixtureId: string, playerId: string) {
    return availability[fixtureId]?.has(playerId) || false;
  }

  async function generateSquad(fixtureId: string) {

    const available = players.filter((p) => isAvailable(fixtureId, p.id));

    const starters = available.slice(0, 7);
    const bench = available.slice(7);

    const quarters = [
      starters,
      [...starters.slice(0,5), ...bench.slice(0,2)],
      [...starters.slice(0,5), ...bench.slice(2,4)],
      starters
    ];

    const newSquad = { starters, bench, quarters };

    setGeneratedSquads((prev) => ({
      ...prev,
      [fixtureId]: newSquad,
    }));

    await supabase
      .from("saved_squads")
      .upsert(
        {
          fixture_id: fixtureId,
          starters_json: JSON.stringify(starters),
          bench_json: JSON.stringify(bench),
          quarters_json: JSON.stringify(quarters),
        },
        { onConflict: "fixture_id" }
      );
  }

  return (

    <main style={{ padding: 20, maxWidth: 500, margin: "auto" }}>

      <h1>Sharks Team Manager</h1>

      <h2>Players</h2>

      {players.map((p) => (
        <div key={p.id}>
          {p.name} • {p.position}
        </div>
      ))}

      <h2 style={{ marginTop: 40 }}>Fixtures</h2>

      {fixtures.map((f) => {

        const squad = generatedSquads[f.id];

        return (

          <div key={f.id} style={{ border: "1px solid #ddd", padding: 16, marginTop: 20 }}>

            <h3>{f.opponent}</h3>
            <p>{f.match_date} • {f.venue}</p>

            <button onClick={() => generateSquad(f.id)}>
              Generate Squad
            </button>

            {squad && (

              <div style={{ marginTop: 20 }}>

                <h4>Starting 7</h4>
                {squad.starters.map((p) => (
                  <div key={p.id}>{p.name}</div>
                ))}

                <h4>Bench</h4>
                {squad.bench.map((p) => (
                  <div key={p.id}>{p.name}</div>
                ))}

              </div>

            )}

            <div style={{ marginTop: 20 }}>

              {players.map((player) => (

                <label key={player.id} style={{ display: "block" }}>

                  <input
                    type="checkbox"
                    checked={isAvailable(f.id, player.id)}
                    onChange={() => toggleAvailability(f.id, player.id)}
                  />

                  {player.name}

                </label>

              ))}

            </div>

          </div>

        );

      })}

    </main>
  );
}
