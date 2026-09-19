const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
]

if (process.env.NEXT_PUBLIC_AUTH_REQUIRED !== "true") {
  console.error("Release builds must set NEXT_PUBLIC_AUTH_REQUIRED=true.")
  process.exit(1)
}

const missing = required.filter((name) => !process.env[name]?.trim())
if (missing.length) {
  console.error(`Missing release public configuration: ${missing.join(", ")}`)
  process.exit(1)
}

let url
try {
  url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL)
} catch {
  console.error("NEXT_PUBLIC_SUPABASE_URL must be a valid URL.")
  process.exit(1)
}

if (url.protocol !== "https:") {
  console.error("Release Supabase connections must use HTTPS.")
  process.exit(1)
}

if ((process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim().length < 12) {
  console.error("NEXT_PUBLIC_SUPABASE_ANON_KEY does not look configured.")
  process.exit(1)
}

console.log("✓ Secure release authentication configuration is enabled")
console.log(`✓ Supabase endpoint: ${url.origin}`)
