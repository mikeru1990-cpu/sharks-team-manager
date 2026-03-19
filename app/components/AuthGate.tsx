"use client"

import { useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase } from "../lib/supabase"
import { TEAM, buttonPrimary, buttonSecondary, cardStyle } from "../lib/types"

const ADMIN_EMAILS = [
  "mikeru1990@hotmail.com",
]

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

    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return
      setUser(data.user ?? null)
      setLoading(false)
    })

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      mounted = false
      data.subscription.unsubscribe()
    }
  }, [])

  async function signIn() {
    setMessage("")
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) setMessage(error.message)
  }

  async function signUp() {
    setMessage("")
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) setMessage(error.message)
    else setMessage("Account created. Confirm email if your project requires it.")
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", padding: 24, background: "#f4f7fb" }}>
        <div style={{ ...cardStyle(), maxWidth: 420, margin: "40px auto" }}>Loading...</div>
      </main>
    )
  }

  if (!user) {
    return (
      <main
        style={{
          minHeight: "100vh",
          padding: 20,
          background: "linear-gradient(180deg, #f4f7fb 0%, #eaf0ff 100%)",
          boxSizing: "border-box",
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
            <div style={{ fontSize: 13, fontWeight: 800, opacity: 0.8 }}>SHARKS FOOTBALL</div>
            <div style={{ fontSize: 30, fontWeight: 900, marginTop: 8 }}>Team Manager Pro</div>
            <div style={{ marginTop: 8, opacity: 0.9 }}>Login to access squad, match and training data.</div>
          </div>

          <div style={cardStyle()}>
            <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>Login</div>

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: 14,
                borderRadius: 14,
                border: "1px solid #cbd5e1",
                marginBottom: 12,
                fontSize: 16,
              }}
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: 14,
                borderRadius: 14,
                border: "1px solid #cbd5e1",
                marginBottom: 12,
                fontSize: 16,
              }}
            />

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={signIn} style={{ ...buttonPrimary(), flex: 1 }}>
                Sign In
              </button>
              <button onClick={signUp} style={{ ...buttonSecondary(), flex: 1 }}>
                Sign Up
              </button>
            </div>

            {message ? <div style={{ marginTop: 12, color: "#475569" }}>{message}</div> : null}
          </div>
        </div>
      </main>
    )
  }

  const isAdmin = ADMIN_EMAILS.includes(user.email || "")
  return <>{children({ user, isAdmin, signOut })}</>
}
