export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          active_match_event_id: string | null
          away_score: number
          away_team: string
          current_quarter: number
          formation: string
          home_score: number
          home_team: string
          id: string
          match_format: string
          period_length: number | null
          period_mode: string | null
          selected_date: string | null
          updated_at: string
        }
        Insert: {
          active_match_event_id?: string | null
          away_score?: number
          away_team?: string
          current_quarter?: number
          formation?: string
          home_score?: number
          home_team?: string
          id: string
          match_format?: string
          period_length?: number | null
          period_mode?: string | null
          selected_date?: string | null
          updated_at?: string
        }
        Update: {
          active_match_event_id?: string | null
          away_score?: number
          away_team?: string
          current_quarter?: number
          formation?: string
          home_score?: number
          home_team?: string
          id?: string
          match_format?: string
          period_length?: number | null
          period_mode?: string | null
          selected_date?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      availability: {
        Row: {
          available: boolean | null
          fixture_id: string | null
          id: string
          player_id: string | null
        }
        Insert: {
          available?: boolean | null
          fixture_id?: string | null
          id?: string
          player_id?: string | null
        }
        Update: {
          available?: boolean | null
          fixture_id?: string | null
          id?: string
          player_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "availability_fixture_id_fkey"
            columns: ["fixture_id"]
            isOneToOne: false
            referencedRelation: "legacy_fixtures_v1"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "availability_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "legacy_players_v1"
            referencedColumns: ["id"]
          },
        ]
      }
      club_memberships: {
        Row: {
          club_id: string
          invited_by: string | null
          joined_at: string
          role: Database["public"]["Enums"]["club_role"]
          user_id: string
        }
        Insert: {
          club_id: string
          invited_by?: string | null
          joined_at?: string
          role?: Database["public"]["Enums"]["club_role"]
          user_id: string
        }
        Update: {
          club_id?: string
          invited_by?: string | null
          joined_at?: string
          role?: Database["public"]["Enums"]["club_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "club_memberships_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      clubs: {
        Row: {
          badge_url: string | null
          created_at: string
          created_by: string | null
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          badge_url?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          badge_url?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      coach_availability: {
        Row: {
          coach_id: string
          created_at: string
          day: string
          id: string
          notes: string
          status: string
          updated_at: string
        }
        Insert: {
          coach_id: string
          created_at?: string
          day: string
          id?: string
          notes?: string
          status?: string
          updated_at?: string
        }
        Update: {
          coach_id?: string
          created_at?: string
          day?: string
          id?: string
          notes?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_availability_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_unavailability: {
        Row: {
          coach_id: string
          created_at: string
          end_date: string
          id: string
          reason: string
          start_date: string
          status: string
        }
        Insert: {
          coach_id: string
          created_at?: string
          end_date: string
          id?: string
          reason?: string
          start_date: string
          status?: string
        }
        Update: {
          coach_id?: string
          created_at?: string
          end_date?: string
          id?: string
          reason?: string
          start_date?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_unavailability_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
        ]
      }
      coaches: {
        Row: {
          active: boolean
          created_at: string
          email: string
          id: string
          name: string
          notes: string
          phone: string
          role: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          email?: string
          id?: string
          name: string
          notes?: string
          phone?: string
          role?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          email?: string
          id?: string
          name?: string
          notes?: string
          phone?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      event_attendance: {
        Row: {
          created_at: string
          event_id: string
          id: string
          player_id: string
          status: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          player_id: string
          status: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          player_id?: string
          status?: string
        }
        Relationships: []
      }
      event_coach_status: {
        Row: {
          coach_id: string
          created_at: string
          event_id: string
          id: string
          notes: string
          status: string
        }
        Insert: {
          coach_id: string
          created_at?: string
          event_id: string
          id?: string
          notes?: string
          status?: string
        }
        Update: {
          coach_id?: string
          created_at?: string
          event_id?: string
          id?: string
          notes?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_coach_status_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_coach_status_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_plans: {
        Row: {
          created_at: string
          custom_def: number
          custom_fwd: number
          custom_mid: number
          event_id: string
          formation_label: string
          game_type: string
          id: string
          quarters_json: string | null
          use_custom_formation: boolean
        }
        Insert: {
          created_at?: string
          custom_def?: number
          custom_fwd?: number
          custom_mid?: number
          event_id: string
          formation_label: string
          game_type: string
          id?: string
          quarters_json?: string | null
          use_custom_formation?: boolean
        }
        Update: {
          created_at?: string
          custom_def?: number
          custom_fwd?: number
          custom_mid?: number
          event_id?: string
          formation_label?: string
          game_type?: string
          id?: string
          quarters_json?: string | null
          use_custom_formation?: boolean
        }
        Relationships: []
      }
      event_responses: {
        Row: {
          event_id: string
          note: string | null
          player_id: string
          response: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          event_id: string
          note?: string | null
          player_id: string
          response?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          event_id?: string
          note?: string | null
          player_id?: string
          response?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_responses_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "team_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_responses_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          away: string | null
          away_score: number | null
          competition: string | null
          created_at: string
          date: string
          day: string
          home: string | null
          home_score: number | null
          id: string
          is_match: boolean | null
          location: string | null
          notes: string | null
          opponent: string | null
          played: boolean | null
          result_status: string | null
          season_id: string | null
          start_time: string | null
          title: string
          training_plan_id: string | null
          training_plan_name: string | null
          type: string
        }
        Insert: {
          away?: string | null
          away_score?: number | null
          competition?: string | null
          created_at?: string
          date: string
          day: string
          home?: string | null
          home_score?: number | null
          id: string
          is_match?: boolean | null
          location?: string | null
          notes?: string | null
          opponent?: string | null
          played?: boolean | null
          result_status?: string | null
          season_id?: string | null
          start_time?: string | null
          title: string
          training_plan_id?: string | null
          training_plan_name?: string | null
          type: string
        }
        Update: {
          away?: string | null
          away_score?: number | null
          competition?: string | null
          created_at?: string
          date?: string
          day?: string
          home?: string | null
          home_score?: number | null
          id?: string
          is_match?: boolean | null
          location?: string | null
          notes?: string | null
          opponent?: string | null
          played?: boolean | null
          result_status?: string | null
          season_id?: string | null
          start_time?: string | null
          title?: string
          training_plan_id?: string | null
          training_plan_name?: string | null
          type?: string
        }
        Relationships: []
      }
      fixtures: {
        Row: {
          competition: string | null
          created_at: string
          id: string
          opponent: string
          starts_at: string
          status: string
          team_id: string
          updated_at: string
          venue: string | null
        }
        Insert: {
          competition?: string | null
          created_at?: string
          id?: string
          opponent: string
          starts_at: string
          status?: string
          team_id: string
          updated_at?: string
          venue?: string | null
        }
        Update: {
          competition?: string | null
          created_at?: string
          id?: string
          opponent?: string
          starts_at?: string
          status?: string
          team_id?: string
          updated_at?: string
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fixtures_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      league_results: {
        Row: {
          away_score: number
          away_team: string
          competition: string
          created_at: string
          event_id: string | null
          home_score: number
          home_team: string
          id: string
          is_final: boolean | null
          opponent: string
          played_on: string
        }
        Insert: {
          away_score?: number
          away_team: string
          competition?: string
          created_at?: string
          event_id?: string | null
          home_score?: number
          home_team: string
          id?: string
          is_final?: boolean | null
          opponent?: string
          played_on: string
        }
        Update: {
          away_score?: number
          away_team?: string
          competition?: string
          created_at?: string
          event_id?: string | null
          home_score?: number
          home_team?: string
          id?: string
          is_final?: boolean | null
          opponent?: string
          played_on?: string
        }
        Relationships: []
      }
      league_table: {
        Row: {
          draws: number | null
          goals_against: number | null
          goals_for: number | null
          id: string
          losses: number | null
          played: number | null
          points: number | null
          team: string
          updated_at: string | null
          wins: number | null
        }
        Insert: {
          draws?: number | null
          goals_against?: number | null
          goals_for?: number | null
          id?: string
          losses?: number | null
          played?: number | null
          points?: number | null
          team: string
          updated_at?: string | null
          wins?: number | null
        }
        Update: {
          draws?: number | null
          goals_against?: number | null
          goals_for?: number | null
          id?: string
          losses?: number | null
          played?: number | null
          points?: number | null
          team?: string
          updated_at?: string | null
          wins?: number | null
        }
        Relationships: []
      }
      league_teams: {
        Row: {
          badge_url: string | null
          created_at: string | null
          id: string
          name: string
          short_name: string | null
        }
        Insert: {
          badge_url?: string | null
          created_at?: string | null
          id?: string
          name: string
          short_name?: string | null
        }
        Update: {
          badge_url?: string | null
          created_at?: string | null
          id?: string
          name?: string
          short_name?: string | null
        }
        Relationships: []
      }
      legacy_fixtures_v1: {
        Row: {
          id: string
          match_date: string | null
          opponent: string | null
          venue: string | null
        }
        Insert: {
          id?: string
          match_date?: string | null
          opponent?: string | null
          venue?: string | null
        }
        Update: {
          id?: string
          match_date?: string | null
          opponent?: string | null
          venue?: string | null
        }
        Relationships: []
      }
      legacy_players_v1: {
        Row: {
          backup_gk: boolean
          gk_cover: boolean | null
          id: string
          is_goalkeeper: boolean | null
          main_gk: boolean
          name: string
          positions_json: string
        }
        Insert: {
          backup_gk?: boolean
          gk_cover?: boolean | null
          id?: string
          is_goalkeeper?: boolean | null
          main_gk?: boolean
          name: string
          positions_json?: string
        }
        Update: {
          backup_gk?: boolean
          gk_cover?: boolean | null
          id?: string
          is_goalkeeper?: boolean | null
          main_gk?: boolean
          name?: string
          positions_json?: string
        }
        Relationships: []
      }
      match_events: {
        Row: {
          client_event_id: string
          created_at: string
          created_by: string | null
          event_type: string
          id: string
          match_id: string
          match_second: number
          payload: Json
          player_id: string | null
        }
        Insert: {
          client_event_id: string
          created_at?: string
          created_by?: string | null
          event_type: string
          id?: string
          match_id: string
          match_second?: number
          payload?: Json
          player_id?: string | null
        }
        Update: {
          client_event_id?: string
          created_at?: string
          created_by?: string | null
          event_type?: string
          id?: string
          match_id?: string
          match_second?: number
          payload?: Json
          player_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "match_events_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_events_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      match_lineups: {
        Row: {
          bench_json: string
          created_at: string
          event_id: string
          formation: string
          id: string
          lineup_json: string
          match_format: string
          name: string
          updated_at: string
        }
        Insert: {
          bench_json?: string
          created_at?: string
          event_id: string
          formation?: string
          id?: string
          lineup_json?: string
          match_format?: string
          name: string
          updated_at?: string
        }
        Update: {
          bench_json?: string
          created_at?: string
          event_id?: string
          formation?: string
          id?: string
          lineup_json?: string
          match_format?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_lineups_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      match_period_plans: {
        Row: {
          bench_json: string
          created_at: string
          event_id: string
          id: string
          lineup_json: string
          period_number: number
        }
        Insert: {
          bench_json?: string
          created_at?: string
          event_id: string
          id?: string
          lineup_json?: string
          period_number: number
        }
        Update: {
          bench_json?: string
          created_at?: string
          event_id?: string
          id?: string
          lineup_json?: string
          period_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "match_period_plans_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      match_quarter_plans: {
        Row: {
          created_at: string
          event_id: string
          id: string
          lineup_json: string
          quarter_number: number
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          lineup_json?: string
          quarter_number: number
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          lineup_json?: string
          quarter_number?: number
        }
        Relationships: []
      }
      match_reports: {
        Row: {
          coach_notes: string | null
          created_at: string | null
          event_id: string
          goals_summary_json: string
          id: string
          match_date: string
          opponent: string
          player_of_the_match: string
          report_text: string
          score_line: string
          title: string
          top_performers_json: string
        }
        Insert: {
          coach_notes?: string | null
          created_at?: string | null
          event_id: string
          goals_summary_json: string
          id: string
          match_date: string
          opponent: string
          player_of_the_match: string
          report_text: string
          score_line: string
          title: string
          top_performers_json: string
        }
        Update: {
          coach_notes?: string | null
          created_at?: string | null
          event_id?: string
          goals_summary_json?: string
          id?: string
          match_date?: string
          opponent?: string
          player_of_the_match?: string
          report_text?: string
          score_line?: string
          title?: string
          top_performers_json?: string
        }
        Relationships: []
      }
      match_saved_lineups: {
        Row: {
          bench_json: string
          created_at: string
          event_id: string
          formation: string
          id: string
          lineup_json: string
          match_format: string
          name: string
          updated_at: string
        }
        Insert: {
          bench_json?: string
          created_at?: string
          event_id: string
          formation?: string
          id?: string
          lineup_json?: string
          match_format?: string
          name: string
          updated_at?: string
        }
        Update: {
          bench_json?: string
          created_at?: string
          event_id?: string
          formation?: string
          id?: string
          lineup_json?: string
          match_format?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_saved_lineups_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      match_state: {
        Row: {
          away_score: number
          away_team: string
          created_at: string
          current_period: number
          event_id: string
          formation: string
          home_score: number
          home_team: string
          match_format: string
          period_length: number
          period_mode: string
          seconds: number
          updated_at: string
        }
        Insert: {
          away_score?: number
          away_team?: string
          created_at?: string
          current_period?: number
          event_id: string
          formation?: string
          home_score?: number
          home_team?: string
          match_format?: string
          period_length?: number
          period_mode?: string
          seconds?: number
          updated_at?: string
        }
        Update: {
          away_score?: number
          away_team?: string
          created_at?: string
          current_period?: number
          event_id?: string
          formation?: string
          home_score?: number
          home_team?: string
          match_format?: string
          period_length?: number
          period_mode?: string
          seconds?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_state_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: true
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      match_timeline: {
        Row: {
          created_at: string
          event_id: string
          id: string
          minute: number
          sort_order: number
          text: string
          type: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          minute?: number
          sort_order?: number
          text?: string
          type: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          minute?: number
          sort_order?: number
          text?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_timeline_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      match_timeline_events: {
        Row: {
          created_at: string
          event_id: string
          id: string
          minute: number
          sort_order: number
          text: string
          type: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          minute?: number
          sort_order?: number
          text?: string
          type: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          minute?: number
          sort_order?: number
          text?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_timeline_events_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          away_score: number
          created_at: string
          created_by: string | null
          ended_at: string | null
          fixture_id: string | null
          home_score: number
          id: string
          started_at: string | null
          status: string
          team_id: string
          updated_at: string
        }
        Insert: {
          away_score?: number
          created_at?: string
          created_by?: string | null
          ended_at?: string | null
          fixture_id?: string | null
          home_score?: number
          id?: string
          started_at?: string | null
          status?: string
          team_id: string
          updated_at?: string
        }
        Update: {
          away_score?: number
          created_at?: string
          created_by?: string | null
          ended_at?: string | null
          fixture_id?: string | null
          home_score?: number
          id?: string
          started_at?: string | null
          status?: string
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_fixture_id_fkey"
            columns: ["fixture_id"]
            isOneToOne: false
            referencedRelation: "fixtures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      player_guardians: {
        Row: {
          can_manage_availability: boolean
          created_at: string
          player_id: string
          relationship: string
          user_id: string
        }
        Insert: {
          can_manage_availability?: boolean
          created_at?: string
          player_id: string
          relationship?: string
          user_id: string
        }
        Update: {
          can_manage_availability?: boolean
          created_at?: string
          player_id?: string
          relationship?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_guardians_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      player_match_ratings: {
        Row: {
          created_at: string | null
          event_id: string
          id: string
          notes: string | null
          player_id: string
          rating: number
        }
        Insert: {
          created_at?: string | null
          event_id: string
          id: string
          notes?: string | null
          player_id: string
          rating: number
        }
        Update: {
          created_at?: string | null
          event_id?: string
          id?: string
          notes?: string | null
          player_id?: string
          rating?: number
        }
        Relationships: []
      }
      player_match_stats: {
        Row: {
          assists: number
          created_at: string
          event_id: string
          goals: number
          id: string
          minutes: number
          player_id: string
        }
        Insert: {
          assists?: number
          created_at?: string
          event_id: string
          goals?: number
          id?: string
          minutes?: number
          player_id: string
        }
        Update: {
          assists?: number
          created_at?: string
          event_id?: string
          goals?: number
          id?: string
          minutes?: number
          player_id?: string
        }
        Relationships: []
      }
      player_private_details: {
        Row: {
          development_notes: string
          medical_notes: string
          parent_contact: string
          player_id: string
          team_id: string
          updated_at: string
        }
        Insert: {
          development_notes?: string
          medical_notes?: string
          parent_contact?: string
          player_id: string
          team_id: string
          updated_at?: string
        }
        Update: {
          development_notes?: string
          medical_notes?: string
          parent_contact?: string
          player_id?: string
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_private_details_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: true
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_private_details_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          active: boolean
          availability: string
          created_at: string
          date_of_birth: string | null
          external_key: string
          first_name: string
          id: string
          known_as: string | null
          last_name: string
          preferred_foot: string | null
          primary_position: string | null
          responsibilities: string[]
          secondary_positions: string[]
          shirt_number: number | null
          team_id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          availability?: string
          created_at?: string
          date_of_birth?: string | null
          external_key: string
          first_name: string
          id?: string
          known_as?: string | null
          last_name: string
          preferred_foot?: string | null
          primary_position?: string | null
          responsibilities?: string[]
          secondary_positions?: string[]
          shirt_number?: number | null
          team_id: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          availability?: string
          created_at?: string
          date_of_birth?: string | null
          external_key?: string
          first_name?: string
          id?: string
          known_as?: string | null
          last_name?: string
          preferred_foot?: string | null
          primary_position?: string | null
          responsibilities?: string[]
          secondary_positions?: string[]
          shirt_number?: number | null
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "players_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      policy_acknowledgements: {
        Row: {
          acknowledged_at: string
          audience: string
          club_id: string | null
          id: string
          policy_id: string
          policy_version: string
          user_id: string
        }
        Insert: {
          acknowledged_at?: string
          audience: string
          club_id?: string | null
          id?: string
          policy_id: string
          policy_version: string
          user_id: string
        }
        Update: {
          acknowledged_at?: string
          audience?: string
          club_id?: string | null
          id?: string
          policy_id?: string
          policy_version?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "policy_acknowledgements_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      quarter_plans: {
        Row: {
          bench_json: string
          id: string
          lineup_json: string
          quarter_number: number
          updated_at: string
        }
        Insert: {
          bench_json?: string
          id: string
          lineup_json?: string
          quarter_number: number
          updated_at?: string
        }
        Update: {
          bench_json?: string
          id?: string
          lineup_json?: string
          quarter_number?: number
          updated_at?: string
        }
        Relationships: []
      }
      quarters: {
        Row: {
          fixture_id: string | null
          id: string
          player_id: string | null
          position: string | null
          quarter: number | null
        }
        Insert: {
          fixture_id?: string | null
          id?: string
          player_id?: string | null
          position?: string | null
          quarter?: number | null
        }
        Update: {
          fixture_id?: string | null
          id?: string
          player_id?: string | null
          position?: string | null
          quarter?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quarters_fixture_id_fkey"
            columns: ["fixture_id"]
            isOneToOne: false
            referencedRelation: "legacy_fixtures_v1"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quarters_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "legacy_players_v1"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_lineups: {
        Row: {
          bench_json: string
          formation: string
          id: string
          lineup_json: string
          match_format: string
          name: string
          updated_at: string
        }
        Insert: {
          bench_json?: string
          formation: string
          id: string
          lineup_json?: string
          match_format: string
          name: string
          updated_at?: string
        }
        Update: {
          bench_json?: string
          formation?: string
          id?: string
          lineup_json?: string
          match_format?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      saved_squads: {
        Row: {
          bench_json: string | null
          created_at: string
          fixture_id: string
          id: string
          quarters_json: string | null
          starters_json: string | null
        }
        Insert: {
          bench_json?: string | null
          created_at?: string
          fixture_id: string
          id?: string
          quarters_json?: string | null
          starters_json?: string | null
        }
        Update: {
          bench_json?: string | null
          created_at?: string
          fixture_id?: string
          id?: string
          quarters_json?: string | null
          starters_json?: string | null
        }
        Relationships: []
      }
      seasons: {
        Row: {
          active: boolean
          created_at: string
          end_date: string
          id: string
          name: string
          start_date: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          end_date: string
          id: string
          name: string
          start_date: string
        }
        Update: {
          active?: boolean
          created_at?: string
          end_date?: string
          id?: string
          name?: string
          start_date?: string
        }
        Relationships: []
      }
      squads: {
        Row: {
          fixture_id: string | null
          id: string
          player_id: string | null
          role: string | null
        }
        Insert: {
          fixture_id?: string | null
          id?: string
          player_id?: string | null
          role?: string | null
        }
        Update: {
          fixture_id?: string | null
          id?: string
          player_id?: string | null
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "squads_fixture_id_fkey"
            columns: ["fixture_id"]
            isOneToOne: false
            referencedRelation: "legacy_fixtures_v1"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "squads_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "legacy_players_v1"
            referencedColumns: ["id"]
          },
        ]
      }
      team_events: {
        Row: {
          created_at: string
          created_by: string | null
          ends_at: string | null
          event_type: string
          id: string
          location_name: string | null
          meet_at: string | null
          notes: string | null
          starts_at: string
          status: string
          team_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          ends_at?: string | null
          event_type?: string
          id?: string
          location_name?: string | null
          meet_at?: string | null
          notes?: string | null
          starts_at: string
          status?: string
          team_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          ends_at?: string | null
          event_type?: string
          id?: string
          location_name?: string | null
          meet_at?: string | null
          notes?: string | null
          starts_at?: string
          status?: string
          team_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_events_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_memberships: {
        Row: {
          created_at: string
          role: Database["public"]["Enums"]["team_role"]
          team_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          role?: Database["public"]["Enums"]["team_role"]
          team_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          role?: Database["public"]["Enums"]["team_role"]
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_memberships_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          age_group: string | null
          club_id: string
          created_at: string
          format: string | null
          id: string
          name: string
          season: string | null
          updated_at: string
        }
        Insert: {
          age_group?: string | null
          club_id: string
          created_at?: string
          format?: string | null
          id?: string
          name: string
          season?: string | null
          updated_at?: string
        }
        Update: {
          age_group?: string | null
          club_id?: string
          created_at?: string
          format?: string | null
          id?: string
          name?: string
          season?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      timeline_events: {
        Row: {
          id: string
          minute: number
          sort_order: number
          text: string
          type: string
          updated_at: string
        }
        Insert: {
          id: string
          minute?: number
          sort_order?: number
          text: string
          type: string
          updated_at?: string
        }
        Update: {
          id?: string
          minute?: number
          sort_order?: number
          text?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      training_plans: {
        Row: {
          created_at: string | null
          drill_1: string | null
          drill_2: string | null
          game: string | null
          id: string
          name: string
          notes: string | null
          warm_up: string | null
        }
        Insert: {
          created_at?: string | null
          drill_1?: string | null
          drill_2?: string | null
          game?: string | null
          id?: string
          name: string
          notes?: string | null
          warm_up?: string | null
        }
        Update: {
          created_at?: string | null
          drill_1?: string | null
          drill_2?: string | null
          game?: string | null
          id?: string
          name?: string
          notes?: string | null
          warm_up?: string | null
        }
        Relationships: []
      }
      training_session_history: {
        Row: {
          blocks_json: string
          created_at: string | null
          id: string
          notes: string | null
          plan_name: string
          session_date: string
        }
        Insert: {
          blocks_json: string
          created_at?: string | null
          id: string
          notes?: string | null
          plan_name: string
          session_date: string
        }
        Update: {
          blocks_json?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          plan_name?: string
          session_date?: string
        }
        Relationships: []
      }
    }
    Views: {
      league_standings: {
        Row: {
          draws: number | null
          goal_difference: number | null
          goals_against: number | null
          goals_for: number | null
          losses: number | null
          played: number | null
          points: number | null
          team: string | null
          wins: number | null
        }
        Relationships: []
      }
      team_head_to_head: {
        Row: {
          draws: number | null
          goals_against: number | null
          goals_for: number | null
          losses: number | null
          opponent: string | null
          played: number | null
          team: string | null
          wins: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      can_access_team: { Args: { target_team: string }; Returns: boolean }
      can_manage_club: { Args: { target_club: string }; Returns: boolean }
      can_manage_team: { Args: { target_team: string }; Returns: boolean }
      delete_my_account: { Args: never; Returns: undefined }
      is_club_member: { Args: { target_club: string }; Returns: boolean }
    }
    Enums: {
      club_role:
        | "owner"
        | "club_admin"
        | "coach"
        | "assistant_coach"
        | "parent"
        | "viewer"
      team_role: "manager" | "coach" | "assistant_coach" | "parent" | "viewer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      club_role: [
        "owner",
        "club_admin",
        "coach",
        "assistant_coach",
        "parent",
        "viewer",
      ],
      team_role: ["manager", "coach", "assistant_coach", "parent", "viewer"],
    },
  },
} as const
