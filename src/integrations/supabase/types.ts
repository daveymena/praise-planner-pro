export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      members: {
        Row: {
          id: string
          name: string
          email: string | null
          phone: string | null
          role: Database["public"]["Enums"]["member_role"]
          instruments: string[] | null
          voice_type: string | null
          is_active: boolean | null
          joined_date: string | null
          notes: string | null
          avatar_url: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          phone?: string | null
          role: Database["public"]["Enums"]["member_role"]
          instruments?: string[] | null
          voice_type?: string | null
          is_active?: boolean | null
          joined_date?: string | null
          notes?: string | null
          avatar_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["member_role"]
          instruments?: string[] | null
          voice_type?: string | null
          is_active?: boolean | null
          joined_date?: string | null
          notes?: string | null
          avatar_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      songs: {
        Row: {
          id: string
          name: string
          type: Database["public"]["Enums"]["song_type"]
          key: string
          tempo: Database["public"]["Enums"]["tempo_type"]
          is_favorite: boolean | null
          lyrics: string | null
          chords: string | null
          notes: string | null
          audio_url: string | null
          sheet_music_url: string | null
          youtube_url: string | null
          duration_minutes: number | null
          created_by: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          type: Database["public"]["Enums"]["song_type"]
          key: string
          tempo: Database["public"]["Enums"]["tempo_type"]
          is_favorite?: boolean | null
          lyrics?: string | null
          chords?: string | null
          notes?: string | null
          audio_url?: string | null
          sheet_music_url?: string | null
          youtube_url?: string | null
          duration_minutes?: number | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          type?: Database["public"]["Enums"]["song_type"]
          key?: string
          tempo?: Database["public"]["Enums"]["tempo_type"]
          is_favorite?: boolean | null
          lyrics?: string | null
          chords?: string | null
          notes?: string | null
          audio_url?: string | null
          sheet_music_url?: string | null
          youtube_url?: string | null
          duration_minutes?: number | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      rehearsals: {
        Row: {
          id: string
          date: string
          time: string
          location: string
          type: Database["public"]["Enums"]["rehearsal_type"]
          notes: string | null
          is_completed: boolean | null
          created_by: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          date: string
          time: string
          location: string
          type: Database["public"]["Enums"]["rehearsal_type"]
          notes?: string | null
          is_completed?: boolean | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          date?: string
          time?: string
          location?: string
          type?: Database["public"]["Enums"]["rehearsal_type"]
          notes?: string | null
          is_completed?: boolean | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      rehearsal_songs: {
        Row: {
          id: string
          rehearsal_id: string
          song_id: string
          order_position: number
          leader_id: string | null
          notes: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          rehearsal_id: string
          song_id: string
          order_position: number
          leader_id?: string | null
          notes?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          rehearsal_id?: string
          song_id?: string
          order_position?: number
          leader_id?: string | null
          notes?: string | null
          created_at?: string | null
        }
      }
      rehearsal_attendance: {
        Row: {
          id: string
          rehearsal_id: string
          member_id: string
          status: Database["public"]["Enums"]["attendance_status"] | null
          notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          rehearsal_id: string
          member_id: string
          status?: Database["public"]["Enums"]["attendance_status"] | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          rehearsal_id?: string
          member_id?: string
          status?: Database["public"]["Enums"]["attendance_status"] | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      services: {
        Row: {
          id: string
          name: string
          date: string
          time: string
          type: Database["public"]["Enums"]["service_type"]
          location: string
          theme: string | null
          notes: string | null
          is_completed: boolean | null
          created_by: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          date: string
          time: string
          type: Database["public"]["Enums"]["service_type"]
          location: string
          theme?: string | null
          notes?: string | null
          is_completed?: boolean | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          date?: string
          time?: string
          type?: Database["public"]["Enums"]["service_type"]
          location?: string
          theme?: string | null
          notes?: string | null
          is_completed?: boolean | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      service_songs: {
        Row: {
          id: string
          service_id: string
          song_id: string
          order_position: number
          leader_id: string | null
          notes: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          service_id: string
          song_id: string
          order_position: number
          leader_id?: string | null
          notes?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          service_id?: string
          song_id?: string
          order_position?: number
          leader_id?: string | null
          notes?: string | null
          created_at?: string | null
        }
      }
      service_assignments: {
        Row: {
          id: string
          service_id: string
          member_id: string
          role: string
          notes: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          service_id: string
          member_id: string
          role: string
          notes?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          service_id?: string
          member_id?: string
          role?: string
          notes?: string | null
          created_at?: string | null
        }
      }
      ministry_rules: {
        Row: {
          id: string
          title: string
          content: string
          category: string | null
          order_position: number | null
          is_active: boolean | null
          created_by: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          title: string
          content: string
          category?: string | null
          order_position?: number | null
          is_active?: boolean | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          content?: string
          category?: string | null
          order_position?: number | null
          is_active?: boolean | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      attendance_status: "confirmed" | "pending" | "absent"
      member_role: "Director" | "Vocalista" | "Instrumentista" | "Técnico" | "Coordinador"
      rehearsal_type: "General" | "Vocal" | "Instrumental"
      service_type: "Domingo Mañana" | "Domingo Noche" | "Miércoles" | "Especial" | "Evento"
      song_type: "Alabanza" | "Adoración" | "Ministración" | "Congregacional"
      tempo_type: "Rápido" | "Moderado" | "Lento"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
