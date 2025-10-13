import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://evtvbxemblcsqkbptujd.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2dHZieGVtYmxjc3FrYnB0dWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwNDQ4ODEsImV4cCI6MjA3NTYyMDg4MX0.f2I2c7H2XCWfzQvzMnFwRJzY_uPZOUZMLHxNckvjnbk";

// Create Supabase client instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Type definitions for our database
export interface Profile {
  id: string;
  user_id: string;
  full_name?: string;
  avatar_url?: string;
  preferred_brainwave_type?: string;
  default_session_duration?: number;
  default_volume?: number;
  created_at: string;
  updated_at: string;
}

export interface BrainwaveSession {
  id: string;
  user_id?: string;
  session_name: string;
  brainwave_type: string;
  target_frequency: number;
  carrier_frequency: number;
  session_duration: number;
  volume: number;
  background_audio_type?: string;
  modulation_depth: number;
  is_public: boolean;
  play_count: number;
  created_at: string;
  updated_at: string;
}

export interface BackgroundAudioTrack {
  id: string;
  name: string;
  description?: string;
  audio_url: string;
  audio_type: string;
  duration?: number;
  file_size?: number;
  is_active: boolean;
  created_at: string;
}

export interface UserSessionHistory {
  id: string;
  user_id: string;
  session_id?: string;
  actual_duration: number;
  completed: boolean;
  notes?: string;
  created_at: string;
}