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
      achievements: {
        Row: {
          badge_id: string
          badge_name: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          badge_name: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          badge_name?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_queries: {
        Row: {
          categories: string[] | null
          created_at: string | null
          feedback: number | null
          id: string
          question: string
          response: string
          response_time_ms: number | null
          sector: string | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          categories?: string[] | null
          created_at?: string | null
          feedback?: number | null
          id?: string
          question: string
          response: string
          response_time_ms?: number | null
          sector?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          categories?: string[] | null
          created_at?: string | null
          feedback?: number | null
          id?: string
          question?: string
          response?: string
          response_time_ms?: number | null
          sector?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          business_id: string | null
          created_at: string
          details: Json | null
          id: string
          user_id: string
        }
        Insert: {
          action: string
          business_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          user_id: string
        }
        Update: {
          action?: string
          business_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      auth_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          ip_address: string | null
          metadata: Json | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      businesses: {
        Row: {
          cac_verified: boolean
          created_at: string
          entity_type: string
          id: string
          name: string
          sector: string | null
          sub_sector: string | null
          turnover: number
          updated_at: string
          user_id: string
        }
        Insert: {
          cac_verified?: boolean
          created_at?: string
          entity_type: string
          id?: string
          name: string
          sector?: string | null
          sub_sector?: string | null
          turnover?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          cac_verified?: boolean
          created_at?: string
          entity_type?: string
          id?: string
          name?: string
          sector?: string | null
          sub_sector?: string | null
          turnover?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      digital_vat_registrations: {
        Row: {
          annual_digital_revenue: number
          business_name: string
          country_of_origin: string
          created_at: string | null
          id: string
          registration_status: string | null
          sep_threshold_met: boolean | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          annual_digital_revenue?: number
          business_name: string
          country_of_origin: string
          created_at?: string | null
          id?: string
          registration_status?: string | null
          sep_threshold_met?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          annual_digital_revenue?: number
          business_name?: string
          country_of_origin?: string
          created_at?: string | null
          id?: string
          registration_status?: string | null
          sep_threshold_met?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          business_id: string | null
          category: string
          created_at: string
          date: string
          description: string | null
          id: string
          is_deductible: boolean
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          business_id?: string | null
          category: string
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          is_deductible?: boolean
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          business_id?: string | null
          category?: string
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          is_deductible?: boolean
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          category: string
          created_at: string
          id: string
          message: string | null
          rating: number
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          message?: string | null
          rating: number
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          message?: string | null
          rating?: number
          user_id?: string
        }
        Relationships: []
      }
      individual_calculations: {
        Row: {
          calculation_type: string
          created_at: string | null
          id: string
          inputs: Json
          result: Json
          user_id: string | null
        }
        Insert: {
          calculation_type: string
          created_at?: string | null
          id?: string
          inputs: Json
          result: Json
          user_id?: string | null
        }
        Update: {
          calculation_type?: string
          created_at?: string | null
          id?: string
          inputs?: Json
          result?: Json
          user_id?: string | null
        }
        Relationships: []
      }
      partner_api_logs: {
        Row: {
          created_at: string
          endpoint: string
          id: string
          method: string
          partner_id: string
          request_body: Json | null
          response_time_ms: number | null
          status_code: number
        }
        Insert: {
          created_at?: string
          endpoint: string
          id?: string
          method: string
          partner_id: string
          request_body?: Json | null
          response_time_ms?: number | null
          status_code: number
        }
        Update: {
          created_at?: string
          endpoint?: string
          id?: string
          method?: string
          partner_id?: string
          request_body?: Json | null
          response_time_ms?: number | null
          status_code?: number
        }
        Relationships: [
          {
            foreignKeyName: "partner_api_logs_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partners: {
        Row: {
          accent_color: string | null
          allowed_origins: string[] | null
          api_key: string
          api_secret_hash: string
          background_color: string | null
          border_radius: string | null
          brand_name: string | null
          created_at: string
          custom_css: string | null
          embed_allowed_domains: string[] | null
          font_family: string | null
          id: string
          is_active: boolean
          last_request_at: string | null
          logo_url: string | null
          name: string
          primary_color: string | null
          rate_limit_daily: number
          requests_today: number
          requests_total: number
          secondary_color: string | null
          show_powered_by: boolean | null
          text_color: string | null
          tier: string
          updated_at: string
          user_id: string
          webhook_url: string | null
        }
        Insert: {
          accent_color?: string | null
          allowed_origins?: string[] | null
          api_key: string
          api_secret_hash: string
          background_color?: string | null
          border_radius?: string | null
          brand_name?: string | null
          created_at?: string
          custom_css?: string | null
          embed_allowed_domains?: string[] | null
          font_family?: string | null
          id?: string
          is_active?: boolean
          last_request_at?: string | null
          logo_url?: string | null
          name: string
          primary_color?: string | null
          rate_limit_daily?: number
          requests_today?: number
          requests_total?: number
          secondary_color?: string | null
          show_powered_by?: boolean | null
          text_color?: string | null
          tier?: string
          updated_at?: string
          user_id: string
          webhook_url?: string | null
        }
        Update: {
          accent_color?: string | null
          allowed_origins?: string[] | null
          api_key?: string
          api_secret_hash?: string
          background_color?: string | null
          border_radius?: string | null
          brand_name?: string | null
          created_at?: string
          custom_css?: string | null
          embed_allowed_domains?: string[] | null
          font_family?: string | null
          id?: string
          is_active?: boolean
          last_request_at?: string | null
          logo_url?: string | null
          name?: string
          primary_color?: string | null
          rate_limit_daily?: number
          requests_today?: number
          requests_total?: number
          secondary_color?: string | null
          show_powered_by?: boolean | null
          text_color?: string | null
          tier?: string
          updated_at?: string
          user_id?: string
          webhook_url?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          subscription_tier: string
          total_points: number
          updated_at: string
          whatsapp_number: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          subscription_tier?: string
          total_points?: number
          updated_at?: string
          whatsapp_number?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          subscription_tier?: string
          total_points?: number
          updated_at?: string
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      reminders: {
        Row: {
          business_id: string | null
          created_at: string
          description: string | null
          due_date: string
          id: string
          is_completed: boolean
          last_notified_at: string | null
          notify_email: boolean
          notify_whatsapp: boolean
          reminder_type: string
          title: string
          user_id: string
        }
        Insert: {
          business_id?: string | null
          created_at?: string
          description?: string | null
          due_date: string
          id?: string
          is_completed?: boolean
          last_notified_at?: string | null
          notify_email?: boolean
          notify_whatsapp?: boolean
          reminder_type: string
          title: string
          user_id: string
        }
        Update: {
          business_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string
          id?: string
          is_completed?: boolean
          last_notified_at?: string | null
          notify_email?: boolean
          notify_whatsapp?: boolean
          reminder_type?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminders_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      sector_presets: {
        Row: {
          benefits: string[] | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          myths: Json | null
          name: string
          sector_id: string
          tax_rules: Json
          updated_at: string | null
        }
        Insert: {
          benefits?: string[] | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          myths?: Json | null
          name: string
          sector_id: string
          tax_rules?: Json
          updated_at?: string | null
        }
        Update: {
          benefits?: string[] | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          myths?: Json | null
          name?: string
          sector_id?: string
          tax_rules?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      subscription_addons: {
        Row: {
          addon_type: string
          expires_at: string | null
          id: string
          purchased_at: string | null
          quantity: number | null
          remaining: number | null
          user_id: string
        }
        Insert: {
          addon_type: string
          expires_at?: string | null
          id?: string
          purchased_at?: string | null
          quantity?: number | null
          remaining?: number | null
          user_id: string
        }
        Update: {
          addon_type?: string
          expires_at?: string | null
          id?: string
          purchased_at?: string | null
          quantity?: number | null
          remaining?: number | null
          user_id?: string
        }
        Relationships: []
      }
      tax_calculations: {
        Row: {
          business_id: string | null
          created_at: string
          id: string
          inputs: Json
          result: Json
          user_id: string
        }
        Insert: {
          business_id?: string | null
          created_at?: string
          id?: string
          inputs: Json
          result: Json
          user_id: string
        }
        Update: {
          business_id?: string | null
          created_at?: string
          id?: string
          inputs?: Json
          result?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tax_calculations_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          accepted_at: string | null
          id: string
          invited_at: string
          member_email: string
          member_user_id: string | null
          owner_id: string
          role: string
          status: string
        }
        Insert: {
          accepted_at?: string | null
          id?: string
          invited_at?: string
          member_email: string
          member_user_id?: string | null
          owner_id: string
          role?: string
          status?: string
        }
        Update: {
          accepted_at?: string | null
          id?: string
          invited_at?: string
          member_email?: string
          member_user_id?: string | null
          owner_id?: string
          role?: string
          status?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      waitlist: {
        Row: {
          created_at: string
          email: string
          feature_interest: string | null
          id: string
          name: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          feature_interest?: string | null
          id?: string
          name?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          feature_interest?: string | null
          id?: string
          name?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
