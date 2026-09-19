import { createClient } from "@supabase/supabase-js"

// These are public client connection values, not privileged secrets.
// Keeping a production-safe fallback prevents preview/native deployments from
// booting into a broken "cloud setup required" screen when Vercel variables
// have not yet been copied across. Row Level Security remains the security
// boundary; the service-role key is never shipped to the client.
const fallbackSupabaseUrl = "https://tziyuqvhrtjyctdjazwg.supabase.co"
const fallbackSupabasePublishableKey = "sb_publishable_dgCV2ZvwoDyUwpeK6zfqLg_kTuHgJss"

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || fallbackSupabaseUrl
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || fallbackSupabasePublishableKey

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
