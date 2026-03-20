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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_notifications: {
        Row: {
          company_id: string
          created_at: string
          employee_name: string
          employee_user_id: string
          id: string
          is_read: boolean
          max_score: number
          module_id: string
          module_title: string
          score: number
          time_spent_minutes: number
          xp_earned: number
        }
        Insert: {
          company_id: string
          created_at?: string
          employee_name: string
          employee_user_id: string
          id?: string
          is_read?: boolean
          max_score?: number
          module_id: string
          module_title: string
          score?: number
          time_spent_minutes?: number
          xp_earned?: number
        }
        Update: {
          company_id?: string
          created_at?: string
          employee_name?: string
          employee_user_id?: string
          id?: string
          is_read?: boolean
          max_score?: number
          module_id?: string
          module_title?: string
          score?: number
          time_spent_minutes?: number
          xp_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "admin_notifications_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      boss_test_results: {
        Row: {
          answers: Json
          attempt_number: number
          created_at: string
          id: string
          max_score: number
          module_id: string
          passed: boolean
          score: number
          time_taken_seconds: number
          user_id: string
        }
        Insert: {
          answers?: Json
          attempt_number?: number
          created_at?: string
          id?: string
          max_score: number
          module_id: string
          passed?: boolean
          score: number
          time_taken_seconds?: number
          user_id: string
        }
        Update: {
          answers?: Json
          attempt_number?: number
          created_at?: string
          id?: string
          max_score?: number
          module_id?: string
          passed?: boolean
          score?: number
          time_taken_seconds?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "boss_test_results_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "training_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      certificates: {
        Row: {
          certificate_code: string
          completions: number
          id: string
          issued_at: string
          scenario: string
          score: number
          user_id: string
          verification_hash: string
        }
        Insert: {
          certificate_code: string
          completions: number
          id?: string
          issued_at?: string
          scenario: string
          score: number
          user_id: string
          verification_hash: string
        }
        Update: {
          certificate_code?: string
          completions?: number
          id?: string
          issued_at?: string
          scenario?: string
          score?: number
          user_id?: string
          verification_hash?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          address: string | null
          certificate_font: string | null
          certificate_logo_position: string | null
          certificate_template: string | null
          certificate_text_layout: string | null
          certificate_theme_color: string | null
          city: string | null
          created_at: string
          employees_count: number | null
          id: string
          logo_url: string | null
          name: string
          province: string | null
          sector: string | null
          updated_at: string
          vat_number: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          certificate_font?: string | null
          certificate_logo_position?: string | null
          certificate_template?: string | null
          certificate_text_layout?: string | null
          certificate_theme_color?: string | null
          city?: string | null
          created_at?: string
          employees_count?: number | null
          id?: string
          logo_url?: string | null
          name: string
          province?: string | null
          sector?: string | null
          updated_at?: string
          vat_number?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          certificate_font?: string | null
          certificate_logo_position?: string | null
          certificate_template?: string | null
          certificate_text_layout?: string | null
          certificate_theme_color?: string | null
          city?: string | null
          created_at?: string
          employees_count?: number | null
          id?: string
          logo_url?: string | null
          name?: string
          province?: string | null
          sector?: string | null
          updated_at?: string
          vat_number?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      company_mandatory_modules: {
        Row: {
          company_id: string
          created_at: string
          deadline_date: string | null
          grace_period_days: number | null
          id: string
          is_mandatory: boolean
          module_id: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          deadline_date?: string | null
          grace_period_days?: number | null
          id?: string
          is_mandatory?: boolean
          module_id: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          deadline_date?: string | null
          grace_period_days?: number | null
          id?: string
          is_mandatory?: boolean
          module_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_mandatory_modules_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_users: {
        Row: {
          company_id: string
          created_at: string
          id: string
          is_admin: boolean | null
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          is_admin?: boolean | null
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          is_admin?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_users_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      demo_sessions: {
        Row: {
          company_name: string | null
          completed: boolean | null
          completion_time: number | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          max_score: number
          risks_identified: number | null
          risks_missed: number | null
          scenario: Database["public"]["Enums"]["demo_scenario"]
          score: number
          user_id: string | null
        }
        Insert: {
          company_name?: string | null
          completed?: boolean | null
          completion_time?: number | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          max_score: number
          risks_identified?: number | null
          risks_missed?: number | null
          scenario: Database["public"]["Enums"]["demo_scenario"]
          score?: number
          user_id?: string | null
        }
        Update: {
          company_name?: string | null
          completed?: boolean | null
          completion_time?: number | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          max_score?: number
          risks_identified?: number | null
          risks_missed?: number | null
          scenario?: Database["public"]["Enums"]["demo_scenario"]
          score?: number
          user_id?: string | null
        }
        Relationships: []
      }
      employee_notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          metadata: Json | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          metadata?: Json | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          metadata?: Json | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      game_replays: {
        Row: {
          achievements_unlocked: string[] | null
          collisions: number
          created_at: string
          id: string
          is_personal_record: boolean
          scenario_id: string
          score: number
          time_elapsed: number
          user_id: string
          video_url: string
        }
        Insert: {
          achievements_unlocked?: string[] | null
          collisions?: number
          created_at?: string
          id?: string
          is_personal_record?: boolean
          scenario_id: string
          score?: number
          time_elapsed: number
          user_id: string
          video_url: string
        }
        Update: {
          achievements_unlocked?: string[] | null
          collisions?: number
          created_at?: string
          id?: string
          is_personal_record?: boolean
          scenario_id?: string
          score?: number
          time_elapsed?: number
          user_id?: string
          video_url?: string
        }
        Relationships: []
      }
      point_click_progress: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          found_hazards: string[]
          id: string
          level_id: string
          score: number
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          found_hazards?: string[]
          id?: string
          level_id: string
          score?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          found_hazards?: string[]
          id?: string
          level_id?: string
          score?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          company_name: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          company_name?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      quote_requests: {
        Row: {
          company_name: string
          created_at: string
          email: string
          employees_count: string | null
          full_name: string
          id: string
          message: string | null
          modules: string[] | null
          phone: string | null
          status: string | null
          training_type: string | null
          updated_at: string
        }
        Insert: {
          company_name: string
          created_at?: string
          email: string
          employees_count?: string | null
          full_name: string
          id?: string
          message?: string | null
          modules?: string[] | null
          phone?: string | null
          status?: string | null
          training_type?: string | null
          updated_at?: string
        }
        Update: {
          company_name?: string
          created_at?: string
          email?: string
          employees_count?: string | null
          full_name?: string
          id?: string
          message?: string | null
          modules?: string[] | null
          phone?: string | null
          status?: string | null
          training_type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      scenario_stats: {
        Row: {
          best_score: number
          best_time: number | null
          created_at: string
          id: string
          max_exploration_percentage: number | null
          min_collisions: number | null
          scenario_id: string
          total_plays: number
          updated_at: string
          user_id: string
        }
        Insert: {
          best_score?: number
          best_time?: number | null
          created_at?: string
          id?: string
          max_exploration_percentage?: number | null
          min_collisions?: number | null
          scenario_id: string
          total_plays?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          best_score?: number
          best_time?: number | null
          created_at?: string
          id?: string
          max_exploration_percentage?: number | null
          min_collisions?: number | null
          scenario_id?: string
          total_plays?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      training_badges: {
        Row: {
          created_at: string
          criteria_type: string
          description: string
          icon_name: string
          id: string
          name: string
          xp_reward: number
        }
        Insert: {
          created_at?: string
          criteria_type: string
          description: string
          icon_name: string
          id: string
          name: string
          xp_reward?: number
        }
        Update: {
          created_at?: string
          criteria_type?: string
          description?: string
          icon_name?: string
          id?: string
          name?: string
          xp_reward?: number
        }
        Relationships: []
      }
      training_challenges: {
        Row: {
          challenged_id: string
          challenged_score: number | null
          challenger_id: string
          challenger_score: number | null
          completed_at: string | null
          created_at: string
          expires_at: string
          id: string
          module_id: string
          status: string
        }
        Insert: {
          challenged_id: string
          challenged_score?: number | null
          challenger_id: string
          challenger_score?: number | null
          completed_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          module_id: string
          status?: string
        }
        Update: {
          challenged_id?: string
          challenged_score?: number | null
          challenger_id?: string
          challenger_score?: number | null
          completed_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          module_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_challenges_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "training_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      training_modules: {
        Row: {
          created_at: string
          description: string | null
          icon_name: string | null
          id: string
          min_duration_minutes: number
          module_order: number
          passing_score: number
          sector: Database["public"]["Enums"]["risk_sector"] | null
          style: string
          subtitle: string | null
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon_name?: string | null
          id: string
          min_duration_minutes?: number
          module_order: number
          passing_score?: number
          sector?: Database["public"]["Enums"]["risk_sector"] | null
          style?: string
          subtitle?: string | null
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon_name?: string | null
          id?: string
          min_duration_minutes?: number
          module_order?: number
          passing_score?: number
          sector?: Database["public"]["Enums"]["risk_sector"] | null
          style?: string
          subtitle?: string | null
          title?: string
        }
        Relationships: []
      }
      training_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          current_section: number
          id: string
          max_score: number
          module_id: string
          score: number
          started_at: string | null
          status: string
          time_spent_seconds: number
          total_sections: number
          updated_at: string
          user_id: string
          xp_earned: number
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          current_section?: number
          id?: string
          max_score?: number
          module_id: string
          score?: number
          started_at?: string | null
          status?: string
          time_spent_seconds?: number
          total_sections?: number
          updated_at?: string
          user_id: string
          xp_earned?: number
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          current_section?: number
          id?: string
          max_score?: number
          module_id?: string
          score?: number
          started_at?: string | null
          status?: string
          time_spent_seconds?: number
          total_sections?: number
          updated_at?: string
          user_id?: string
          xp_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "training_progress_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "training_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      training_reminder_config: {
        Row: {
          created_at: string
          enabled: boolean
          frequency: string
          id: string
          last_run_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          frequency?: string
          id?: string
          last_run_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          frequency?: string
          id?: string
          last_run_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      training_time_config: {
        Row: {
          created_at: string
          id: string
          min_time_seconds: number
          module_id: string
          section_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          min_time_seconds?: number
          module_id: string
          section_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          min_time_seconds?: number
          module_id?: string
          section_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      training_timer_logs: {
        Row: {
          active_seconds: number
          created_at: string
          id: string
          is_valid: boolean
          module_id: string
          session_end: string | null
          session_start: string
          user_id: string
        }
        Insert: {
          active_seconds?: number
          created_at?: string
          id?: string
          is_valid?: boolean
          module_id: string
          session_end?: string | null
          session_start?: string
          user_id: string
        }
        Update: {
          active_seconds?: number
          created_at?: string
          id?: string
          is_valid?: boolean
          module_id?: string
          session_end?: string | null
          session_start?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_timer_logs_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "training_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string
          id: string
          scenario_id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          id?: string
          scenario_id: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          id?: string
          scenario_id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_risk_sectors: {
        Row: {
          assigned_by: string | null
          created_at: string
          id: string
          is_self_assigned: boolean
          sector: Database["public"]["Enums"]["risk_sector"]
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_by?: string | null
          created_at?: string
          id?: string
          is_self_assigned?: boolean
          sector: Database["public"]["Enums"]["risk_sector"]
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_by?: string | null
          created_at?: string
          id?: string
          is_self_assigned?: boolean
          sector?: Database["public"]["Enums"]["risk_sector"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_training_badges: {
        Row: {
          badge_id: string
          earned_at: string
          id: string
          module_id: string | null
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          id?: string
          module_id?: string | null
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          id?: string
          module_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_training_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "training_badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_training_badges_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "training_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      user_xp: {
        Row: {
          created_at: string
          id: string
          level: number
          total_xp: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          level?: number
          total_xp?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          level?: number
          total_xp?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_company_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      demo_scenario: "office" | "warehouse" | "general"
      risk_sector: "basso" | "medio" | "alto"
      user_role: "admin" | "company_client" | "employee"
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
    Enums: {
      demo_scenario: ["office", "warehouse", "general"],
      risk_sector: ["basso", "medio", "alto"],
      user_role: ["admin", "company_client", "employee"],
    },
  },
} as const
