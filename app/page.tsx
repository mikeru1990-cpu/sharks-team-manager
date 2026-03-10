"use client";

import { useEffect, useState } from "react";
import { supabase } from "../supabase";

type Player = {
  id: string
  name: string
  positions: string[]
  gkBackup?: boolean
}

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

const [players] = useState<Player[]>([
{ id:"1", name:"Bailee Dowler-Rowles", positions:["DEF"], gkBackup:true },
{ id:"2", name:"Bella Bainbridge", positions:["MID"] },
{ id:"3", name:"Betsy Rowland", positions:["MID","DEF"], gkBackup:true },
{ id:"4", name:"Connie Luff", positions:["MID","FWD"] },
{ id:"5", name:"Darcy-Rae Russell", positions:["GK"] },
{ id:"6", name:"Ella Wilson", positions:["MID","DEF"] },
{ id:"7", name:"Elsy Harmer", positions:["DEF"] },
{ id:"8", name:"Evelyn Evans", positions:["MID","DEF"] },
{ id:"9", name:"Isabella Ogden", positions:["DEF","MID"] },
{ id:"10", name:"Lyra Twinning", positions:["MID","FWD"] },
{ id:"11", name:"Martha Scrivens", positions:["MID","FWD"] },
{ id:"12", name:"Olivia Hassall", positions:["DEF"] },
{ id:"13", name:"Poppy Bennett", positions:["MID","FWD"], gkBackup:true },
{ id:"14", name:"Ruby Salter", positions:["MID","DEF"] },
])

  const [fixtures] = useState<Fixture[]>([
    {
      id: "1",
      opponent: "Tigers",
      match_date: "2026-03-15",
      venue: "Home",
    },
  ]);

  const [availability, setAvailability] = useState<Record<string, Set<string>>>(
    {}
  );
  const [generatedSquads, setGeneratedSquads] = useState<Record<string, Squad>>(
    {}
  );
  const [currentQuarterByFixture, setCurrentQuarterByFixture] = useState<
    Record<string, number>
  >({});

  useEffect(() => {
    loadSavedSquads();
  }, []);

  async function loadSavedSquads() {
    const { data, error } = await supabase.from("saved_squads").select("*");

    if (error) {
      console.error("Error loading saved squads:", error);
      return;
    }

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

    const q1 = starters;

    const q2 = [...starters];
    if (bench[0]) q2[5] = bench[0];
    if (bench[1]) q2[6] = bench[1];

    const q3 = [...starters];
    if (bench[2]) q3[4] = bench[2];
    if (bench[3]) q3[5] = bench[3];

    const q4 = starters;

    const quarters = [q1, q2, q3, q4];

    const newSquad = { starters, bench, quarters };

    setGeneratedSquads((prev) => ({
      ...prev,
      [fixtureId]: newSquad,
    }));

    setCurrentQuarterByFixture((prev) => ({
      ...prev,
      [fixtureId]: 0,
    }));

    const { error } = await supabase.from("saved_squads").upsert(
      {
        fixture_id: fixtureId,
        starters_json: JSON.stringify(starters),
        bench_json: JSON.stringify(bench),
        quarters_json: JSON.stringify(quarters),
      },
      { onConflict: "fixture_id" }
    );

    if (error) {
      console.error("Error saving squad:", error);
    }
  }

  function nextQuarter(fixtureId: string) {
    setCurrentQuarterByFixture((prev) => ({
      ...prev,
      [fixtureId]: ((prev[fixtureId] ?? 0) + 1) % 4,
    }));
  }

  function previousQuarter(fixtureId: string) {
    setCurrentQuarterByFixture((prev) => ({
      ...prev,
      [fixtureId]: ((prev[fixtureId] ?? 0) + 3) % 4,
    }));
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
        const currentQuarter = currentQuarterByFixture[f.id] ?? 0;
        const currentQuarterPlayers = squad?.quarters?.[currentQuarter] || [];

        return (
          <div
            key={f.id}
            style={{
              border: "1px solid #ddd",
              padding: 16,
              marginTop: 20,
              borderRadius: 12,
            }}
          >
            <h3>{f.opponent}</h3>
            <p>
              {f.match_date} • {f.venue}
            </p>

            <button onClick={() => generateSquad(f.id)}>Generate Squad</button>

            {squad && (
              <div style={{ marginTop: 20 }}>
                <h4>Starting 7</h4>
                {squad.starters.length > 0 ? (
                  squad.starters.map((p) => <div key={p.id}>{p.name}</div>)
                ) : (
                  <div>None</div>
                )}

                <h4 style={{ marginTop: 16 }}>Bench</h4>
                {squad.bench.length > 0 ? (
                  squad.bench.map((p) => <div key={p.id}>{p.name}</div>)
                ) : (
                  <div>None</div>
                )}

                <h4 style={{ marginTop: 16 }}>Quarter Plan</h4>
                {squad.quarters.map((quarter, i) => (
                  <div key={i} style={{ marginTop: 12 }}>
                    <strong>Quarter {i + 1}</strong>
                    {quarter.length > 0 ? (
                      quarter.map((p) => (
                        <div key={`${i}-${p.id}`}>{p.name}</div>
                      ))
                    ) : (
                      <div>None</div>
                    )}
                  </div>
                ))}

                <div
                  style={{
                    marginTop: 20,
                    padding: 12,
                    background: "#f5f5f5",
                    borderRadius: 10,
                  }}
                >
                  <h4 style={{ marginTop: 0 }}>
                    Match Mode — Quarter {currentQuarter + 1}
                  </h4>

                  <div style={{ marginBottom: 12 }}>
                    <strong>On Field</strong>
                    {currentQuarterPlayers.length > 0 ? (
                      currentQuarterPlayers.map((p) => (
                        <div key={`field-${currentQuarter}-${p.id}`}>
                          {p.name}
                        </div>
                      ))
                    ) : (
                      <div>Generate a squad first</div>
                    )}
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <strong>Bench Pool</strong>
                    {squad.bench.length > 0 ? (
                      squad.bench.map((p) => (
                        <div key={`bench-${p.id}`}>{p.name}</div>
                      ))
                    ) : (
                      <div>None</div>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => previousQuarter(f.id)}>
                      Previous Quarter
                    </button>
                    <button onClick={() => nextQuarter(f.id)}>
                      Next Quarter
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div style={{ marginTop: 20 }}>
              {players.map((player) => (
                <label key={player.id} style={{ display: "block" }}>
                  <input
                    type="checkbox"
                    checked={isAvailable(f.id, player.id)}
                    onChange={() => toggleAvailability(f.id, player.id)}
                  />{" "}
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
