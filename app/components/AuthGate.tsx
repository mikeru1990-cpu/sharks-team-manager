"use client"

import { useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { loadAuthContext, type AuthContext } from "../lib/auth"
import { supabase } from "../lib/supabase"
import { TEAM, buttonPrimary, cardStyle } from "../lib/types"

type AuthGateProps = {
  children: (args: {
    user: User
    isAdmin: boolean
    signOut: () => Promise<void>
  }) => React.ReactNode
}

export default function AuthGate({ children }: AuthGateProps) {
  const [authContext, setAuthContext] = useState<AuthContext | null>(null)
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

    if (error) setMessage(error.message)
    setSubmitting(false)
  }

  async function signOut() {
    if (!supabase) return
    await supabase.auth.signOut()
    setAuthContext(null)
  }

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", padding: 24 }}>
        <div style={{ ...cardStyle(), maxWidth: 420, margin: "40px auto" }}>
          Opening Football OS…
        </div>
      </main>
    )
  }

  if (!supabase) {
    return (
      <main style={{ minHeight: "100vh", padding: 24 }}>
        <div style={{ ...cardStyle(), maxWidth: 420, margin: "40px auto" }}>
          <strong>Football OS is not connected to Supabase.</strong>
          <p style={{ marginBottom: 0 }}>
            Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to the deployment environment.
          </p>
        </div>
      </main>
    )
  }

  if (!authContext) {
    return (
      <main
        style={{
          minHeight: "100vh",
          padding: 20,
          background: "linear-gradient(180deg, #f4f7fb 0%, #eaf0ff 100%)",
        }}
      >
        <div style={{ maxWidth: 420, margin: "40px auto" }}>
          <div
            style={{
              ...cardStyle(`linear-gradient(135deg, ${TEAM.primary} 0%, #0c235f 100%)`),
              color: "white",
              marginBottom: 16,
            }}
          >
            <div style={{ fontSize: 28, fontWeight: 900 }}>Football OS</div>
            <div style={{ marginTop: 8, opacity: 0.85 }}>Private club access</div>
          </div>

          <div style={cardStyle()}>
            <label style={{ display: "block", fontWeight: 800, marginBottom: 6 }}>
              Email address
            </label>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") void signIn()
              }}
              style={{ width: "100%", padding: 12, marginBottom: 12 }}
            />

            <label style={{ display: "block", fontWeight: 800, marginBottom: 6 }}>
              Password
            </label>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") void signIn()
              }}
              style={{ width: "100%", padding: 12, marginBottom: 12 }}
            />

            <button
              onClick={() => void signIn()}
              disabled={submitting}
              style={{ ...buttonPrimary(), opacity: submitting ? 0.65 : 1 }}
            >
              {submitting ? "Signing in…" : "Sign in"}
            </button>

            <p style={{ fontSize: 13, lineHeight: 1.5, opacity: 0.7, marginBottom: 0 }}>
              Football OS is currently invite-only. Your club administrator will create your access.
            </p>

            {message && (
              <div role="alert" style={{ marginTop: 12, fontWeight: 700 }}>
                {message}
              </div>
            )}
          </div>
        </div>
      </main>
    )
  }

  if (!authContext.activeMembership) {
    return (
      <main style={{ minHeight: "100vh", padding: 24 }}>
        <div style={{ ...cardStyle(), maxWidth: 520, margin: "40px auto" }}>
          <h1 style={{ marginTop: 0 }}>Your account is ready</h1>
          <p>
            This login has not yet been added to a Football OS club. Ask a club administrator to send an invitation.
          </p>
          <button onClick={() => void signOut()} style={buttonPrimary()}>
            Sign out
          </button>
        </div>
      </main>
    )
  }

  return (
    <>
      {children({
        user: authContext.user,
        isAdmin: authContext.isAdmin,
        signOut,
      })}
    </>
  )
}
