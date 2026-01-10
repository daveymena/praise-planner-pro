// API Types for Praise Planner Pro

export interface Member {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: 'Director' | 'Vocalista' | 'Instrumentista' | 'Técnico' | 'Coordinador';
  instruments: string[];
  voice_type?: string;
  is_active: boolean;
  joined_date?: string;
  notes?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Song {
  id: string;
  name: string;
  type: 'Alabanza' | 'Adoración' | 'Ministración' | 'Congregacional';
  key: string;
  tempo: 'Rápido' | 'Moderado' | 'Lento';
  is_favorite: boolean;
  lyrics?: string;
  chords?: string;
  notes?: string;
  audio_url?: string;
  sheet_music_url?: string;
  youtube_url?: string;
  duration_minutes?: number;
  created_by?: string;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface Rehearsal {
  id: string;
  date: string;
  time: string;
  location: string;
  type: 'General' | 'Vocal' | 'Instrumental';
  notes?: string;
  is_completed: boolean;
  created_by?: string;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
  rehearsal_songs: RehearsalSong[];
  rehearsal_attendance: RehearsalAttendance[];
}

export interface RehearsalSong {
  id: string;
  rehearsal_id: string;
  song_id: string;
  order_position: number;
  leader_id?: string;
  notes?: string;
  song?: Song;
  leader?: Member;
}

export interface RehearsalAttendance {
  id: string;
  rehearsal_id: string;
  member_id: string;
  status: 'confirmed' | 'pending' | 'absent';
  notes?: string;
  member?: Member;
}

export interface Service {
  id: string;
  name: string;
  date: string;
  time: string;
  type: 'Domingo Mañana' | 'Domingo Noche' | 'Miércoles' | 'Especial' | 'Evento';
  location: string;
  theme?: string;
  notes?: string;
  is_completed: boolean;
  created_by?: string;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface MinistryRule {
  id: string;
  title: string;
  content: string;
  category?: string;
  order_position?: number;
  is_active: boolean;
  created_by?: string;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

// Form types
export interface CreateMemberData {
  name: string;
  email?: string;
  phone?: string;
  role: Member['role'];
  instruments: string[];
  voice_type?: string;
  notes?: string;
}

export interface CreateSongData {
  name: string;
  type: Song['type'];
  key: string;
  tempo: Song['tempo'];
  is_favorite?: boolean;
  lyrics?: string;
  chords?: string;
  notes?: string;
  youtube_url?: string;
  duration_minutes?: number;
  created_by?: string;
}

export interface CreateRehearsalData {
  date: string;
  time: string;
  location: string;
  type: Rehearsal['type'];
  notes?: string;
  created_by?: string;
}

export interface CreateServiceData {
  name: string;
  date: string;
  time: string;
  type: Service['type'];
  location: string;
  theme?: string;
  notes?: string;
  created_by?: string;
}

export interface CreateMinistryRuleData {
  title: string;
  content: string;
  category?: string;
  order_position?: number;
  created_by?: string;
}