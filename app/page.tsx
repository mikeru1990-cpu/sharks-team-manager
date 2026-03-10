"use client";

import { useState } from "react";

type Player = {
  id: string;
  name: string;
  position: "GK" | "DEF" | "MID" | "FWD";
};

type Fixture = {
  id: string;
  opponent: string;
  match_date: string;
  venue: string;
};

export default function Page() {
  const [players] = useState<Player[]>([
    { id: "1", name: "Bailee Dowler-Rowles", position: "DEF" },
    { id: "2", name: "Bella Bainbridge", position: "MID" },
    { id: "3", name: "Betsy Rowland", position: "MID" },
    { id: "4", name: "Connie Luff", position: "FWD" },
    { id: "5", name: "Darcy-Rae Russell", position: "GK" },
    { id: "6", name: "Ella Wilson", position: "MID" },
    { id: "7", name: "Elsy Harmer", position: "DEF" },
    { id: "8", name: "Evelyn Evans", position: "MID" },
    { id: "9", name: "Isabella Ogden", position: "DEF" },
    { id: "10", name: "Lyra Twinning", position: "MID" },
    { id: "11", name: "Martha Scrivens", position: "FWD" },
    { id: "12", name: "Olivia Hassall", position: "DEF" },
    { id: "13", name: "Poppy Bennett", position: "FWD" },
    { id: "14", name: "Ruby Salter", position: "MID" },
  ]);

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
  const [squadByFixture, setSquadByFixture] = useState<Record<string, Player[]>>(
    {}
  );
  const [benchByFixture, setBenchByFixture] = useState<Record<string, Player[]>>(
    {}
  );

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

  function shuffle<T>(items: T[]) {
    const arr = [...items];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function generateSquad(fixtureId: string) {
    const selectedPlayers = players.filter((p) =>
      isAvailable(fixtureId, p.id)
    );

    const gk = shuffle(selectedPlayers.filter((p) => p.position === "GK"));
    const def = shuffle(selectedPlayers.filter((p) => p.position === "DEF"));
    const mid = shuffle(selectedPlayers.filter((p) => p.position === "MID"));
    const fwd = shuffle(selectedPlayers.filter((p) => p.position === "FWD"));

    const squad: Player[] = [];

    if (gk.length) squad.push(gk[0]);
    squad.push(...def.slice(0, 2));
    squad.push(...mid.slice(0, 3));
    squad.push(...fwd.slice(0, 1));

    const squadIds = new Set(squad.map((p) => p.id));
    const leftovers = selectedPlayers.filter((p) => !squadIds.has(p.id));

    while (squad.length < 7 && leftovers.length > 0) {
      const next = leftovers.shift();
      if (next) squad.push(next);
    }

    const finalSquadIds = new Set(squad.map((p) => p.id));
    const bench = selectedPlayers.filter((p) => !finalSquadIds.has(p.id));

    setSquadByFixture((prev) => ({
      ...prev,
      [fixtureId]: squad,
    }));

    setBenchByFixture((prev) => ({
      ...prev,
      [fixtureId]: bench,
    }));
  }

  function playerAt(players: Player[], index: number) {
    return players[index]?.name || "-";
  }

  return (
    <main style={{ padding: 20, maxWidth: 560, margin: "0 auto" }}>
      <h1>Sharks Team Manager</h1>

      <h2>Players</h2>
      {players.map((p) => (
        <div key={p.id}>
          {p.name} • {p.position}
        </div>
      ))}

      <h2 style={{ marginTop: 40 }}>Fixtures</h2>

      {fixtures.map((f) => {
        const squad = squadByFixture[f.id] || [];
        const bench = benchByFixture[f.id] || [];

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

            {squad.length > 0 && (
              <>
                <div style={{ marginTop: 20 }}>
                  <h4>Starting 7</h4>
                  {squad.map((p) => (
                    <div key={p.id}>
                      {p.name} • {p.position}
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 20 }}>
                  <h4>Bench</h4>
                  {bench.length > 0 ? (
                    bench.map((p) => (
                      <div key={p.id}>
                        {p.name} • {p.position}
                      </div>
                    ))
                  ) : (
                    <div>None</div>
                  )}
                </div>

                <div style={{ marginTop: 24 }}>
                  <h4>Pitch View</h4>

                  <div
                    style={{
                      background: "#2e7d32",
                      color: "white",
                      padding: 20,
                      borderRadius: 14,
                    }}
                  >
                    <div style={{ textAlign: "center", marginBottom: 18 }}>
                      <div style={{ fontWeight: "bold" }}>FWD</div>
                      <div>{playerAt(squad, 6)}</div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-around",
                        marginBottom: 18,
                      }}
                    >
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontWeight: "bold" }}>MID</div>
                        <div>{playerAt(squad, 3)}</div>
                      </div>

                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontWeight: "bold" }}>MID</div>
                        <div>{playerAt(squad, 4)}</div>
                      </div>

                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontWeight: "bold" }}>MID</div>
                        <div>{playerAt(squad, 5)}</div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-around",
                        marginBottom: 18,
                      }}
                    >
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontWeight: "bold" }}>DEF</div>
                        <div>{playerAt(squad, 1)}</div>
                      </div>

                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontWeight: "bold" }}>DEF</div>
                        <div>{playerAt(squad, 2)}</div>
                      </div>
                    </div>

                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontWeight: "bold" }}>GK</div>
                      <div>{playerAt(squad, 0)}</div>
                    </div>
                  </div>
                </div>
              </>
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
