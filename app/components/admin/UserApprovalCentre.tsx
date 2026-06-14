"use client"

export type AccessRole = "pending" | "parent" | "coach" | "admin"

export type AccessProfile = {
  id: string
  email: string
  display_name?: string | null
  role: AccessRole
  approved: boolean
  created_at?: string | null
}

type Props = {
  pendingUsers?: AccessProfile[]
  activeUsers?: AccessProfile[]
  onApprove?: (userId: string, role: AccessRole) => void | Promise<void>
  onReject?: (userId: string) => void | Promise<void>
  onChangeRole?: (userId: string, role: AccessRole) => void | Promise<void>
}

const roles: AccessRole[] = ["parent", "coach", "admin"]

function formatDate(value?: string | null) {
  if (!value) return "No date"
  try {
    return new Date(value).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  } catch {
    return value
  }
}

export default function UserApprovalCentre({
  pendingUsers = [],
  activeUsers = [],
  onApprove,
  onReject,
  onChangeRole,
}: Props) {
  return (
    <section style={{ display: "grid", gap: 18 }}>
      <div className="sharks-elite-panel sharks-card-shine" style={{ borderRadius: 28, padding: 18, display: "grid", gap: 8 }}>
        <div style={{ color: "#7dd3fc", fontSize: 11, fontWeight: 1000, letterSpacing: ".16em", textTransform: "uppercase" }}>
          Security Centre
        </div>
        <div style={{ color: "white", fontSize: 28, fontWeight: 1000, letterSpacing: "-0.04em" }}>
          User Access Approval
        </div>
        <div style={{ color: "#cbd5e1", fontWeight: 750, lineHeight: 1.5 }}>
          Review new access requests, approve parents or coaches, and keep admin access controlled.
        </div>
      </div>

      <div className="sharks-glass sharks-card-shine" style={{ borderRadius: 28, padding: 16, display: "grid", gap: 14, border: "1px solid rgba(250,204,21,0.28)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <div>
            <div style={{ color: "#facc15", fontSize: 11, fontWeight: 1000, letterSpacing: ".15em", textTransform: "uppercase" }}>Pending Requests</div>
            <div style={{ color: "white", fontSize: 22, fontWeight: 1000 }}>Approve New Users</div>
          </div>
          <div style={{ color: "#facc15", fontWeight: 1000 }}>{pendingUsers.length} waiting</div>
        </div>

        {pendingUsers.length === 0 ? (
          <div style={{ borderRadius: 18, padding: 14, background: "rgba(2,6,23,0.42)", color: "#cbd5e1", fontWeight: 800 }}>
            No pending access requests.
          </div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {pendingUsers.map((profile) => (
              <div key={profile.id} style={{ borderRadius: 20, padding: 12, background: "rgba(2,6,23,0.46)", border: "1px solid rgba(250,204,21,0.32)", display: "grid", gap: 10 }}>
                <div>
                  <div style={{ color: "white", fontWeight: 1000 }}>{profile.display_name || profile.email}</div>
                  <div style={{ color: "#94a3b8", fontSize: 12, fontWeight: 800 }}>{profile.email} • requested {formatDate(profile.created_at)}</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(96px, 1fr))", gap: 8 }}>
                  {roles.map((role) => (
                    <button key={role} onClick={() => void onApprove?.(profile.id, role)} style={{ border: "1px solid rgba(56,189,248,0.35)", background: "rgba(14,165,233,0.12)", color: "#bae6fd", borderRadius: 14, padding: "10px 8px", fontWeight: 1000, textTransform: "capitalize" }}>
                      Approve {role}
                    </button>
                  ))}
                  <button onClick={() => void onReject?.(profile.id)} style={{ border: "1px solid rgba(251,113,133,0.35)", background: "rgba(244,63,94,0.12)", color: "#fecdd3", borderRadius: 14, padding: "10px 8px", fontWeight: 1000 }}>
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="sharks-glass sharks-card-shine" style={{ borderRadius: 28, padding: 16, display: "grid", gap: 14, border: "1px solid rgba(125,211,252,0.22)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <div>
            <div style={{ color: "#7dd3fc", fontSize: 11, fontWeight: 1000, letterSpacing: ".15em", textTransform: "uppercase" }}>Active Users</div>
            <div style={{ color: "white", fontSize: 22, fontWeight: 1000 }}>Current Access</div>
          </div>
          <div style={{ color: "#94a3b8", fontWeight: 1000 }}>{activeUsers.length} active</div>
        </div>

        {activeUsers.length === 0 ? (
          <div style={{ borderRadius: 18, padding: 14, background: "rgba(2,6,23,0.42)", color: "#cbd5e1", fontWeight: 800 }}>
            No approved users found.
          </div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {activeUsers.map((profile) => (
              <div key={profile.id} style={{ borderRadius: 20, padding: 12, background: "rgba(2,6,23,0.46)", border: "1px solid rgba(125,211,252,0.20)", display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 10, alignItems: "center" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ color: "white", fontWeight: 1000, overflow: "hidden", textOverflow: "ellipsis" }}>{profile.display_name || profile.email}</div>
                  <div style={{ color: "#94a3b8", fontSize: 12, fontWeight: 800 }}>{profile.email}</div>
                </div>
                <select value={profile.role} onChange={(event) => void onChangeRole?.(profile.id, event.target.value as AccessRole)} style={{ borderRadius: 14, padding: "9px 10px", border: "1px solid rgba(125,211,252,0.30)", background: "rgba(15,23,42,0.9)", color: "white", fontWeight: 900 }}>
                  {roles.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
