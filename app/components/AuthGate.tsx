"use client"

import { useEffect, useMemo, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase } from "../lib/supabase"
import { TEAM, buttonPrimary, buttonSecondary, cardStyle } from "../lib/types"
import SupabaseSetupRequired from "./setup/SupabaseSetupRequired"

const FALLBACK_ADMIN_EMAILS = ["mikeru1990@hotmail.com"]

function normaliseEmail(value?: string | null) {
  return (value || "").trim().toLowerCase()
}

function getAdminEmails() {
  const envEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
    .split(",")
    .map(normaliseEmail)
    .filter(Boolean)

  return envEmails.length ? envEmails : FALLBACK_ADMIN_EMAILS.map(normaliseEmail)
}

type AuthGateProps = {
  children: (args: {
    user: User
    isAdmin: boolean
    signOut: () => Promise<void>
  }) => React.ReactNode
}

export default function AuthGate({ children }: AuthGateProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const adminEmails = useMemo(() => getAdminEmails(), [])

  useEffect(() => {
    let mounted = true

    async function init() {
      try {
        if (!supabase) {
          setLoading(false)
          return
        }

        const { data } = await supabase.auth.getUser()
        if (!mounted) return

        setUser(data.user ?? null)
        setLoading(false)

        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
          setUser(session?.user ?? null)
          setLoading(false)
        })

        return () => listener.subscription.unsubscribe()
      } catch {
        setMessage("Unable to check your session. Please try again.")
        setLoading(false)
      }
    }

    init()

    return () => {
      mounted = false
    }
  }, [])

  async function signIn() {
    if (!supabase) return setMessage("Secure sign-in is not available right now.")

    const cleanEmail = email.trim()
    if (!cleanEmail || !password) {
      setMessage("Enter your email and password.")
      return
    }

    setMessage("")
    const { error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    })

    if (error) setMessage(error.message || "Sign-in failed. Please try again.")
  }

  async function sendPasswordReset() {
    if (!supabase) return setMessage("Secure sign-in is not available right now.")
    const cleanEmail = email.trim()
    if (!cleanEmail) return setMessage("Enter your email first, then tap reset password.")

    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail)
    if (error) setMessage(error.message || "Unable to send password reset.")
    else setMessage("Password reset sent. Check your email inbox.")
  }

  async function signOut() {
    if (!supabase) return
    setPassword("")
    await supabase.auth.signOut()
  }

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", padding: 24 }}>
        <div style={{ ...cardStyle(), maxWidth: 420, margin: "40px auto" }}>Loading...</div>
      </main>
    )
  }

  if (!supabase) {
    return <SupabaseSetupRequired />
  }

  if (!user) {
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
            <div style={{ fontSize: 28, fontWeight: 900 }}>Team Manager</div>
            <div style={{ opacity: 0.82, marginTop: 6, fontWeight: 700 }}>Private club access only</div>
          </div>

          <div style={cardStyle()}>
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              style={{ width: "100%", padding: 12, marginBottom: 10 }}
            />

            <input
              type="password"
              autoComplete="current-password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") void signIn()
              }}
              style={{ width: "100%", padding: 12, marginBottom: 10 }}
            />

            <button onClick={signIn} style={buttonPrimary()}>
              Sign In
            </button>

            <button onClick={() => void sendPasswordReset()} style={{ ...buttonSecondary(), marginTop: 10 }}>
              Reset Password
            </button>

            {message ? <div style={{ marginTop: 10, color: "#92400e", fontWeight: 800 }}>{message}</div> : null}
          </div>
        </div>
      </main>
    )
  }

  const isAdmin = adminEmails.includes(normaliseEmail(user.email))

  return <>{children({ user, isAdmin, signOut })}</>
}
