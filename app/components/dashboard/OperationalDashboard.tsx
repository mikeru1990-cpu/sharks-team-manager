"use client"

export default function OperationalDashboard() {
  return (
    <div style={{ padding: 16, display: "grid", gap: 16 }}>
      <section>
        <h2>Next Fixture</h2>
        <p>Opponent • Kickoff • Venue • Availability</p>
      </section>

      <section>
        <h2>Squad Readiness</h2>
        <p>Available Players • Fatigue • Missing Players • GK Status</p>
      </section>

      <section>
        <h2>Quick Actions</h2>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button>Start Match</button>
          <button>Attendance</button>
          <button>Create Lineup</button>
          <button>Add Training</button>
        </div>
      </section>

      <section>
        <h2>Recent Form</h2>
        <p>Last 5 Results • Goals Scored • Goals Conceded</p>
      </section>

      <section>
        <h2>Operational Alerts</h2>
        <ul>
          <li>No goalkeeper selected</li>
          <li>Missing attendance</li>
          <li>Ratings incomplete</li>
        </ul>
      </section>
    </div>
  )
}
