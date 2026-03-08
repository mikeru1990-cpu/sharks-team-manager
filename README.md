# Sharks Team Manager

Mobile-first Next.js app for your youth football squad.

## What it does
- Lists players from Supabase
- Creates fixtures
- Saves availability for each player per fixture
- Calls `generate_match_plan(fixture_id)` in Supabase
- Shows selected squad, reserves, and quarter plan

## 1. Environment variables
Create a `.env.local` file from `.env.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_publishable_key_here
```

## 2. Install and run
```bash
npm install
npm run dev
```

## 3. Deploy to Vercel
Add the same two environment variables in Project Settings → Environment Variables.

## 4. Required database SQL
Run the SQL schema/function in `supabase_setup.sql`.

## 5. RLS note
If you use the publishable key in the browser, you need policies. For a quick personal prototype, use `supabase_policies.sql`.
