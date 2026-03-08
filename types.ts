export type Player = {
  id: string;
  name: string;
  is_goalkeeper: boolean;
  can_cover_goal: boolean;
  active: boolean;
  created_at?: string;
};

export type Fixture = {
  id: string;
  match_date: string;
  opponent: string;
  venue: string | null;
  notes: string | null;
  created_at?: string;
};

export type Availability = {
  id?: string;
  fixture_id: string;
  player_id: string;
  status: 'available' | 'unavailable' | 'unknown';
  note?: string | null;
};

export type MatchPlanRow = {
  fixture_id: string;
  player_name: string;
  selection_status: 'selected' | 'reserve' | 'not_available';
  q1: 'GK' | 'OUTFIELD' | 'BENCH' | null;
  q2: 'GK' | 'OUTFIELD' | 'BENCH' | null;
  q3: 'GK' | 'OUTFIELD' | 'BENCH' | null;
  q4: 'GK' | 'OUTFIELD' | 'BENCH' | null;
};
