"use client";

import { useState } from "react";

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
  const [name, setName] = useState("");
  const [position, setPosition] = useState("GK");

  const [players, setPlayers] = useState<Player[]>([
    { id: "1", name: "Bailee Dowler-Rowles", position: "MID" },
    { id: "2", name: "Bella Bainbridge", position: "MID" },
    { id: "3", name: "Betsy Rowland", position: "DEF" },
    { id: "4", name: "Connie Luff", position: "FWD" },
    { id: "5", name: "Darcy-Rae Russell", position: "GK" },
    { id: "6", name: "Ella Wilson", position: "MID" },
    { id: "7", name: "Elsy Harmer", position: "DEF" },
    { id: "8", name: "Evelyn Evans", position: "FWD" },
    { id: "9", name: "Isabella Ogden", position: "DEF" },
    { id: "10", name: "Lyra Twinning", position: "MID" },
    { id: "11", name: "Martha Scrivens", position: "DEF" },
    { id: "12", name: "Olivia Hassall", position: "FWD" },
    { id: "13", name: "Poppy Bennett", position: "MID" },
    { id: "14", name: "Ruby Salter", position: "FWD" },
  ]);

  const [fixtures] = useState<Fixture[]>([
    {
      id: "1",
      opponent: "Tigers",
      match_date: "2026-03-15",
      venue: "Home",
    },
  ]);

  const [availability, setAvailability] = useState<
    Record<string, Set<string>>
  >({});

  const [generatedSquads, setGeneratedSquads] = useState<
    Record<string, Squad>
  >({});

  function addPlayer() {
    if (!name.trim()) return;

    const newPlayer: Player = {
      id: Date.now().toString(),
      name,
      position,
    };

    setPlayers([...players, newPlayer]);
    setName("");
    setPosition("GK");
  }

  function deletePlayer(id: string) {
    setPlayers(players.filter((p) => p.id !== id));
  }

  function toggleAvailability(fixtureId: string, playerId: string) {
    const current = availability[fixtureId] || new Set<string>();
    const updated = new Set(current);

    if (updated.has(playerId)) updated.delete(playerId);
    else updated.add(playerId);

    setAvailability({
      ...availability,
      [fixtureId]: updated,
    });
  }

  function isAvailable(fixtureId: string, playerId: string) {
    return availability[fixtureId]?.has(playerId) || false;
  }

  function generateSquad(fixtureId: string) {
  const available = players.filter((p) => isAvailable(fixtureId, p.id));

  const gk = available.filter((p) => p.position === "GK");
  const def = available.filter((p) => p.position === "DEF");
  const mid = available.filter((p) => p.position === "MID");
  const fwd = available.filter((p) => p.position === "FWD");

  const starters: Player[] = [
    ...gk.slice(0, 1),
    ...def.slice(0, 2),
    ...mid.slice(0, 2),
    ...fwd.slice(0, 2),
  ];

  const starterIds = new Set(starters.map((p) => p.id));

  const remaining = available.filter((p) => !starterIds.has(p.id));

  while (starters.length < 7 && remaining.length > 0) {
    const next = remaining.shift();
    if (next) starters.push(next);
  }

  const finalStarterIds = new Set(starters.map((p) => p.id));
  const bench = available.filter((p) => !finalStarterIds.has(p.id));

  const q1 = starters;

  const q2 = [...starters];
  if (bench[0]) q2[5] = bench[0];
  if (bench[1]) q2[6] = bench[1];

  const q3 = [...starters];
  if (bench[2]) q3[4] = bench[2];
  if (bench[3]) q3[5] = bench[3];

  const q4 = starters;

  const quarters = [q1, q2, q3, q4];

  setGeneratedSquads({
    ...generatedSquads,
    [fixtureId]: { starters, bench, quarters },
  });
}

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

    setGeneratedSquads({
      ...generatedSquads,
      [fixtureId]: { starters, bench, quarters },
    });
  }

  return (
    <main style={{ padding: 20, maxWidth: 500, margin: "0 auto" }}>
      <h1>Sharks Team Manager</h1>

      <input
        placeholder="Player name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ width: "100%", padding: 10, marginBottom: 10 }}
      />

      <select
        value={position}
        onChange={(e) => setPosition(e.target.value)}
        style={{ width: "100%", padding: 10, marginBottom: 10 }}
      >
        <option value="GK">GK</option>
        <option value="DEF">DEF</option>
        <option value="MID">MID</option>
        <option value="FWD">FWD</option>
      </select>

      <button
        onClick={addPlayer}
        style={{ width: "100%", padding: 10, marginBottom: 30 }}
      >
        Add Player
      </button>

      <h2>Players</h2>

      {players.map((p) => (
        <div
          key={p.id}
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 6,
          }}
        >
          {p.name} • {p.position}
          <button onClick={() => deletePlayer(p.id)}>Delete</button>
        </div>
      ))}

      <h2 style={{ marginTop: 40 }}>Fixtures</h2>

      {fixtures.map((f) => (
        <div
          key={f.id}
          style={{
            border: "1px solid #ddd",
            borderRadius: 10,
            padding: 16,
            marginBottom: 20,
          }}
        >
          <h3>{f.opponent}</h3>
          <div>
            {f.match_date} • {f.venue}
          </div>

          <button
            onClick={() => generateSquad(f.id)}
            style={{
              marginTop: 10,
              padding: 10,
              background: "black",
              color: "white",
            }}
          >
            Generate Squad
          </button>

          {generatedSquads[f.id] && (
            <div
              style={{
                marginTop: 16,
                background: "#f3f3f3",
                padding: 12,
                borderRadius: 10,
              }}
            >
              <strong>Starting 7</strong>

              {generatedSquads[f.id].starters.map((p) => (
                <div key={p.id}>
                  {p.name} • {p.position}
                </div>
              ))}

              <div style={{ marginTop: 10 }}>
                <strong>Bench</strong>

                {generatedSquads[f.id].bench.length > 0 ? (
                  generatedSquads[f.id].bench.map((p) => (
                    <div key={p.id}>
                      {p.name} • {p.position}
                    </div>
                  ))
                ) : (
                  <div>None</div>
                )}
              </div>

              <div style={{ marginTop: 20 }}>
                <strong>Quarter Plan</strong>

                {generatedSquads[f.id].quarters.map((quarter, i) => (
                  <div key={i} style={{ marginTop: 10 }}>
                    <strong>Quarter {i + 1}</strong>

                    {quarter.map((p) => (
                      <div key={p.id}>
                        {p.name} • {p.position}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginTop: 16 }}>
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
      ))}
    </main>
  );
}
