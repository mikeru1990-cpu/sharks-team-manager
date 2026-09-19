export const previewMode = process.env.NEXT_PUBLIC_AUTH_REQUIRED === "false"

// Football OS fails closed: secure sign-in is the default unless a developer
// explicitly opts into the private visual preview.
export const authRequired = !previewMode

export const hasSupabasePublicConfig = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim(),
)
