"use client"

import { useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { ShieldCheck } from "lucide-react"
import { loadAuthContext, type AuthContext, type TeamAccess } from "../lib/auth"
import { supabase } from "../lib/supabase"
import { scrubSensitiveSquadCache } from "../lib/squadStore"
import Button from "./ui/Button"
import Card from "./ui/Card"
import Field from "./ui/Field"
import ConnectionStatus from "./system/ConnectionStatus"

type AuthGateProps = {
  children: (args: {
    user: User
    isAdmin: boolean
    teams: TeamAccess[]
    activeTeam: TeamAccess
    setActiveTeamId: (teamId: string) => void
    signOut: () => Promise<void>
  }) => React.ReactNode
}

const ACTIVE_TEAM_KEY = "football-os:active-team-id"

export default function AuthGate({ children }: AuthGateProps) {
  const [authContext, setAuthContext] = useState<AuthContext | null>(null)
  const [activeTeamId, setActiveTeamIdState] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    let mounted = true

    async function applyUser(user: User | null) {
      if (!mounted) return

      if (!user) {
        setAuthContext(null)
        setLoading(false)
        return
      }

      try {
        const context = await loadAuthContext(user)
        if (!mounted) return
        setAuthContext(context)
        const savedTeamId = window.localStorage.getItem(ACTIVE_TEAM_KEY)
        const nextTeamId = context.teams.some((team) => team.teamId === savedTeamId)
          ? savedTeamId
          : context.teams[0]?.teamId ?? null
        setActiveTeamIdState(nextTeamId)
        if (nextTeamId) window.localStorage.setItem(ACTIVE_TEAM_KEY, nextTeamId)
        setMessage("")
      } catch (error) {
        if (!mounted) return
        setAuthContext(null)
        setMessage(error instanceof Error ? error.message : "Unable to load your club access.")
      } finally {
        if (mounted) setLoading(false)
      }
    }

    void supabase.auth.getUser().then(({ data }) => applyUser(data.user ?? null))

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoading(true)
      void applyUser(session?.user ?? null)
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  async function signIn() {
    if (!supabase) return

    const cleanEmail = email.trim().toLowerCase()
    if (!cleanEmail || !password) {
      setMessage("Enter your email address and password.")
      return
    }

    setSubmitting(true)
    setMessage("")

    const { error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    })

    if (error) setMessage("We could not sign you in. Check your details and try again.")
    setSubmitting(false)
  }

  function setActiveTeamId(teamId: string) {
    if (!authContext?.teams.some((team) => team.teamId === teamId)) return
    scrubSensitiveSquadCache()
    setActiveTeamIdState(teamId)
    window.localStorage.setItem(ACTIVE_TEAM_KEY, teamId)
  }

  async function signOut() {
    if (!supabase) return
    scrubSensitiveSquadCache()
    window.localStorage.removeItem(ACTIVE_TEAM_KEY)
    await supabase.auth.signOut()
    setActiveTeamIdState(null)
    setAuthContext(null)
  }

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", padding: 20, display: "grid", placeItems: "center" }}>
        <Card elevated style={{ width: "100%", maxWidth: 420, textAlign: "center" }}>
          <strong>Starting Football OS…</strong>
          <p style={{ color: "var(--fos-text-muted)", marginBottom: 0 }}>Connecting securely to your club.</p>
        </Card>
      </main>
    )
  }

  if (!supabase) {
    return (
      <main style={{ minHeight: "100vh", padding: 20, display: "grid", placeItems: "center" }}>
        <Card elevated style={{ width: "100%", maxWidth: 460 }}>
          <h1 style={{ marginTop: 0 }}>Cloud setup required</h1>
          <p style={{ color: "var(--fos-text-muted)", lineHeight: 1.6 }}>
            Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to the deployment environment.
          </p>
        </Card>
      </main>
    )
  }

  if (!authContext) {
    return (
      <main style={{ minHeight: "100vh", padding: 20, display: "grid", placeItems: "center" }}>
        <div style={{ width: "100%", maxWidth: 430 }}>
          <Card elevated style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: 24, background: "linear-gradient(135deg, var(--fos-blue-700), var(--fos-navy-950))", color: "white" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 900, letterSpacing: ".12em", opacity: .78 }}>FOOTBALL OS</div>
                  <h1 style={{ fontSize: 30, margin: "8px 0 6px" }}>Welcome back</h1>
                  <p style={{ margin: 0, opacity: .82 }}>Your team. Your matchday. One place.</p>
                </div>
                <ShieldCheck size={34} aria-hidden="true" />
              </div>
            </div>

            <div style={{ padding: 24, display: "grid", gap: 16 }}>
              <ConnectionStatus />
              <Field
                label="Email address"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <Field
                label="Password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") void signIn()
                }}
              />
              <Button fullWidth size="lg" disabled={submitting} onClick={() => void signIn()}>
                {submitting ? "Signing in…" : "Sign in"}
              </Button>
              {message && <div role="alert" style={{ color: "var(--fos-danger)", fontWeight: 700 }}>{message}</div>}
              <p style={{ margin: 0, color: "var(--fos-text-muted)", fontSize: 13, lineHeight: 1.5 }}>
                Football OS is currently invite-only. Your club administrator will create your access.
              </p>
            </div>
          </Card>
        </div>
      </main>
    )
  }

  if (!authContext.memberships.length && !authContext.teams.length) {
    return (
      <main style={{ minHeight: "100vh", padding: 20, display: "grid", placeItems: "center" }}>
        <Card elevated style={{ width: "100%", maxWidth: 460 }}>
          <div style={{ fontSize: 12, fontWeight: 950, letterSpacing: ".1em", color: "var(--fos-blue-400)" }}>ACCESS PENDING</div>
          <h1 style={{ margin: "8px 0" }}>Your Football OS account is ready</h1>
          <p style={{ color: "var(--fos-text-muted)", lineHeight: 1.6 }}>
            Your account is secure, but it has not been linked to a club or team yet. Ask the club administrator to complete your invitation.
          </p>
          <Button variant="secondary" onClick={() => void signOut()}>Sign out</Button>
        </Card>
      </main>
    )
  }

  if (!authContext.teams.length) {
    return (
      <main style={{ minHeight: "100vh", padding: 20, display: "grid", placeItems: "center" }}>
        <Card elevated style={{ width: "100%", maxWidth: 460 }}>
          <div style={{ fontSize: 12, fontWeight: 950, letterSpacing: ".1em", color: "var(--fos-blue-400)" }}>TEAM ASSIGNMENT</div>
          <h1 style={{ margin: "8px 0" }}>Club access confirmed</h1>
          <p style={{ color: "var(--fos-text-muted)", lineHeight: 1.6 }}>
            You are linked to {authContext.activeMembership?.clubName ?? "your club"}, but no team has been assigned to your account yet.
          </p>
          <Button variant="secondary" onClick={() => void signOut()}>Sign out</Button>
        </Card>
      </main>
    )
  }

  const activeTeam = authContext.teams.find((team) => team.teamId === activeTeamId) ?? authContext.teams[0]

  return <>{children({
    user: authContext.user,
    isAdmin: authContext.isAdmin,
    teams: authContext.teams,
    activeTeam,
    setActiveTeamId,
    signOut,
  })}</>
}
