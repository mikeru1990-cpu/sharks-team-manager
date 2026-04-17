"use client"

import { useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase } from "../lib/supabase"
import { TEAM, buttonPrimary, buttonSecondary, cardStyle } from "../lib/types"

const ADMIN_EMAILS = ["mikeru1990@hotmail.com"]

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

  useEffect(() => {
    let mounted = true

    async function init() {
      try {
        // 🔥 SAFE GUARD (this is the fix)
        if (!supabase) {
          console.error("Supabase is not configured")
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
      } catch (err) {
        console.error("Auth error:", err)
        setLoading(false)
      }
    }

    init()

    return () => {
      mounted = false
    }
  }, [])

  async function signIn() {
    if (!supabase) return setMessage("Supabase not configured")

    setMessage("")
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) setMessage(error.message)
  }

  async function signUp() {
    if (!supabase) return setMessage("Supabase not configured")

    setMessage("")
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) setMessage(error.message)
    else setMessage("Account created. Check your email.")
  }

  async function signOut() {
    if (!supabase) return
    await supabase.auth.signOut()
  }

  // 🔥 LOADING SCREEN
  if (loading) {
    return (
      <main style={{ minHeight: "100vh", padding: 24 }}>
        <div style={{ ...cardStyle(), maxWidth: 420, margin: "40px auto" }}>
          Loading...
        </div>
      </main>
    )
  }

  // 🔥 IF SUPABASE BROKEN → SHOW MESSAGE INSTEAD OF BLACK SCREEN
  if (!supabase) {
    return (
      <main style={{ minHeight: "100vh", padding: 24 }}>
        <div style={{ ...cardStyle(), maxWidth: 420, margin: "40px auto" }}>
          ❌ Supabase not configured
          <br />
          <br />
          Add these to Vercel:
          <br />
          NEXT_PUBLIC_SUPABASE_URL
          <br />
          NEXT_PUBLIC_SUPABASE_ANON_KEY
        </div>
      </main>
    )
  }

  // 🔥 LOGIN SCREEN
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
          </div>

          <div style={cardStyle()}>
            <input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: "100%", padding: 12, marginBottom: 10 }}
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: "100%", padding: 12, marginBottom: 10 }}
            />

            <button onClick={signIn} style={buttonPrimary()}>
              Sign In
            </button>

            {message && <div style={{ marginTop: 10 }}>{message}</div>}
          </div>
        </div>
      </main>
    )
  }

  const isAdmin = ADMIN_EMAILS.includes(user.email || "")

  return <>{children({ user, isAdmin, signOut })}</>
}
