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
      api_rate_limits: {
        Row: {
          created_at: string
          endpoint: string
          id: string
          identifier: string
          request_count: number
          window_start: string
        }
        Insert: {
          created_at?: string
          endpoint: string
          id?: string
          identifier: string
          request_count?: number
          window_start?: string
        }
        Update: {
          created_at?: string
          endpoint?: string
          id?: string
          identifier?: string
          request_count?: number
          window_start?: string
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
          location: Json | null
          metadata: Json | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          ip_address?: string | null
          location?: Json | null
          metadata?: Json | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          ip_address?: string | null
          location?: Json | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      backup_code_attempts: {
        Row: {
          attempted_at: string
          id: string
          ip_address: string | null
          user_id: string
        }
        Insert: {
          attempted_at?: string
          id?: string
          ip_address?: string | null
          user_id: string
        }
        Update: {
          attempted_at?: string
          id?: string
          ip_address?: string | null
          user_id?: string
        }
        Relationships: []
      }
      backup_codes: {
        Row: {
          code_hash: string
          created_at: string
          id: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          code_hash: string
          created_at?: string
          id?: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          code_hash?: string
          created_at?: string
          id?: string
          used_at?: string | null
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
      cancellation_feedback: {
        Row: {
          created_at: string | null
          id: string
          other_reason: string | null
          previous_tier: string | null
          reason: string
          reason_category: string | null
          subscription_id: string | null
          suggestions: string | null
          tenure_months: number | null
          user_id: string
          would_return: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          other_reason?: string | null
          previous_tier?: string | null
          reason: string
          reason_category?: string | null
          subscription_id?: string | null
          suggestions?: string | null
          tenure_months?: number | null
          user_id: string
          would_return?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          other_reason?: string | null
          previous_tier?: string | null
          reason?: string
          reason_category?: string | null
          subscription_id?: string | null
          suggestions?: string | null
          tenure_months?: number | null
          user_id?: string
          would_return?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cancellation_feedback_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "paystack_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          business_id: string | null
          client_type: string
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          business_id?: string | null
          client_type?: string
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          business_id?: string | null
          client_type?: string
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_items: {
        Row: {
          business_id: string | null
          completed_date: string | null
          created_at: string
          description: string | null
          due_date: string
          id: string
          item_type: string
          notes: string | null
          reminder_days: number | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          business_id?: string | null
          completed_date?: string | null
          created_at?: string
          description?: string | null
          due_date: string
          id?: string
          item_type: string
          notes?: string | null
          reminder_days?: number | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          business_id?: string | null
          completed_date?: string | null
          created_at?: string
          description?: string | null
          due_date?: string
          id?: string
          item_type?: string
          notes?: string | null
          reminder_days?: number | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "compliance_items_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
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
      invoice_items: {
        Row: {
          amount: number
          created_at: string
          description: string
          id: string
          invoice_id: string
          is_vatable: boolean
          quantity: number
          unit_price: number
        }
        Insert: {
          amount: number
          created_at?: string
          description: string
          id?: string
          invoice_id: string
          is_vatable?: boolean
          quantity?: number
          unit_price: number
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          invoice_id?: string
          is_vatable?: boolean
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          business_id: string | null
          client_address: string | null
          client_email: string | null
          client_id: string | null
          client_name: string
          created_at: string
          due_date: string
          id: string
          invoice_number: string
          issued_date: string
          notes: string | null
          paid_date: string | null
          status: string
          subtotal: number
          total: number
          updated_at: string
          user_id: string
          vat_amount: number
        }
        Insert: {
          business_id?: string | null
          client_address?: string | null
          client_email?: string | null
          client_id?: string | null
          client_name: string
          created_at?: string
          due_date: string
          id?: string
          invoice_number: string
          issued_date?: string
          notes?: string | null
          paid_date?: string | null
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
          user_id: string
          vat_amount?: number
        }
        Update: {
          business_id?: string | null
          client_address?: string | null
          client_email?: string | null
          client_id?: string | null
          client_name?: string
          created_at?: string
          due_date?: string
          id?: string
          invoice_number?: string
          issued_date?: string
          notes?: string | null
          paid_date?: string | null
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
          user_id?: string
          vat_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoices_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      ip_whitelist: {
        Row: {
          created_at: string
          description: string | null
          id: string
          ip_range: string
          is_active: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          ip_range: string
          is_active?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          ip_range?: string
          is_active?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      known_devices: {
        Row: {
          browser: string | null
          browser_version: string | null
          device_fingerprint: string
          device_model: string | null
          device_name: string | null
          device_type: string | null
          first_seen_at: string
          id: string
          is_blocked: boolean
          is_trusted: boolean
          language: string | null
          last_city: string | null
          last_country: string | null
          last_seen_at: string
          os: string | null
          os_version: string | null
          screen_resolution: string | null
          timezone: string | null
          user_id: string
        }
        Insert: {
          browser?: string | null
          browser_version?: string | null
          device_fingerprint: string
          device_model?: string | null
          device_name?: string | null
          device_type?: string | null
          first_seen_at?: string
          id?: string
          is_blocked?: boolean
          is_trusted?: boolean
          language?: string | null
          last_city?: string | null
          last_country?: string | null
          last_seen_at?: string
          os?: string | null
          os_version?: string | null
          screen_resolution?: string | null
          timezone?: string | null
          user_id: string
        }
        Update: {
          browser?: string | null
          browser_version?: string | null
          device_fingerprint?: string
          device_model?: string | null
          device_name?: string | null
          device_type?: string | null
          first_seen_at?: string
          id?: string
          is_blocked?: boolean
          is_trusted?: boolean
          language?: string | null
          last_city?: string | null
          last_country?: string | null
          last_seen_at?: string
          os?: string | null
          os_version?: string | null
          screen_resolution?: string | null
          timezone?: string | null
          user_id?: string
        }
        Relationships: []
      }
      login_attempts: {
        Row: {
          attempted_at: string
          email: string
          id: string
          ip_address: string | null
          success: boolean
        }
        Insert: {
          attempted_at?: string
          email: string
          id?: string
          ip_address?: string | null
          success?: boolean
        }
        Update: {
          attempted_at?: string
          email?: string
          id?: string
          ip_address?: string | null
          success?: boolean
        }
        Relationships: []
      }
      loyalty_points_transactions: {
        Row: {
          action_reference: string | null
          action_type: string
          created_at: string | null
          description: string | null
          id: string
          metadata: Json | null
          points: number
          user_id: string
        }
        Insert: {
          action_reference?: string | null
          action_type: string
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          points: number
          user_id: string
        }
        Update: {
          action_reference?: string | null
          action_type?: string
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          points?: number
          user_id?: string
        }
        Relationships: []
      }
      loyalty_redemptions: {
        Row: {
          created_at: string | null
          discount_code: string
          discount_percentage: number
          expires_at: string
          id: string
          is_used: boolean | null
          points_spent: number
          transaction_reference: string | null
          used_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          discount_code: string
          discount_percentage: number
          expires_at: string
          id?: string
          is_used?: boolean | null
          points_spent: number
          transaction_reference?: string | null
          used_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          discount_code?: string
          discount_percentage?: number
          expires_at?: string
          id?: string
          is_used?: boolean | null
          points_spent?: number
          transaction_reference?: string | null
          used_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notification_deliveries: {
        Row: {
          alert_type: string
          created_at: string
          delivery_method: string
          error_message: string | null
          id: string
          message_preview: string | null
          recipient: string
          status: string
          user_id: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          delivery_method: string
          error_message?: string | null
          id?: string
          message_preview?: string | null
          recipient: string
          status?: string
          user_id: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          delivery_method?: string
          error_message?: string | null
          id?: string
          message_preview?: string | null
          recipient?: string
          status?: string
          user_id?: string
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
      password_history: {
        Row: {
          created_at: string
          id: string
          password_hash: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          password_hash: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          password_hash?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_audit_log: {
        Row: {
          action: string
          created_at: string | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      payment_transactions: {
        Row: {
          amount: number
          billing_cycle: string | null
          created_at: string | null
          discount_amount: number | null
          discount_code: string | null
          discount_type: string | null
          id: string
          ip_address: string | null
          original_amount: number | null
          paystack_response: Json | null
          receipt_number: string | null
          reference: string
          status: string | null
          tier: string
          updated_at: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          amount: number
          billing_cycle?: string | null
          created_at?: string | null
          discount_amount?: number | null
          discount_code?: string | null
          discount_type?: string | null
          id?: string
          ip_address?: string | null
          original_amount?: number | null
          paystack_response?: Json | null
          receipt_number?: string | null
          reference: string
          status?: string | null
          tier: string
          updated_at?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          billing_cycle?: string | null
          created_at?: string | null
          discount_amount?: number | null
          discount_code?: string | null
          discount_type?: string | null
          id?: string
          ip_address?: string | null
          original_amount?: number | null
          paystack_response?: Json | null
          receipt_number?: string | null
          reference?: string
          status?: string | null
          tier?: string
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      paystack_plans: {
        Row: {
          amount: number
          billing_cycle: string
          created_at: string | null
          currency: string | null
          id: string
          interval: string
          is_active: boolean | null
          plan_code: string
          tier: string
        }
        Insert: {
          amount: number
          billing_cycle: string
          created_at?: string | null
          currency?: string | null
          id?: string
          interval: string
          is_active?: boolean | null
          plan_code?: string
          tier: string
        }
        Update: {
          amount?: number
          billing_cycle?: string
          created_at?: string | null
          currency?: string | null
          id?: string
          interval?: string
          is_active?: boolean | null
          plan_code?: string
          tier?: string
        }
        Relationships: []
      }
      paystack_subscriptions: {
        Row: {
          amount: number
          authorization_code: string | null
          billing_cycle: string
          cancel_at_period_end: boolean | null
          cancellation_reason: string | null
          cancelled_at: string | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          customer_code: string
          email_token: string | null
          failed_payments_count: number | null
          id: string
          next_payment_date: string | null
          plan_code: string
          status: string | null
          subscription_code: string
          tier: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          authorization_code?: string | null
          billing_cycle: string
          cancel_at_period_end?: boolean | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          customer_code: string
          email_token?: string | null
          failed_payments_count?: number | null
          id?: string
          next_payment_date?: string | null
          plan_code: string
          status?: string | null
          subscription_code: string
          tier: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          authorization_code?: string | null
          billing_cycle?: string
          cancel_at_period_end?: boolean | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          customer_code?: string
          email_token?: string | null
          failed_payments_count?: number | null
          id?: string
          next_payment_date?: string | null
          plan_code?: string
          status?: string | null
          subscription_code?: string
          tier?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      personal_expenses: {
        Row: {
          amount: number
          category: string
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          notes: string | null
          payment_interval: string
          start_date: string
          tax_year: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          payment_interval?: string
          start_date?: string
          tax_year?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          payment_interval?: string
          start_date?: string
          tax_year?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          allowed_days: number[] | null
          allowed_end_hour: number | null
          allowed_start_hour: number | null
          created_at: string
          email: string | null
          full_name: string | null
          has_selected_initial_tier: boolean
          id: string
          ip_whitelist_enabled: boolean
          language_preference: string | null
          subscription_tier: string
          time_restriction_timezone: string | null
          time_restrictions_enabled: boolean
          total_points: number
          trial_expires_at: string | null
          trial_started_at: string | null
          updated_at: string
          whatsapp_number: string | null
          whatsapp_verified: boolean | null
        }
        Insert: {
          allowed_days?: number[] | null
          allowed_end_hour?: number | null
          allowed_start_hour?: number | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          has_selected_initial_tier?: boolean
          id: string
          ip_whitelist_enabled?: boolean
          language_preference?: string | null
          subscription_tier?: string
          time_restriction_timezone?: string | null
          time_restrictions_enabled?: boolean
          total_points?: number
          trial_expires_at?: string | null
          trial_started_at?: string | null
          updated_at?: string
          whatsapp_number?: string | null
          whatsapp_verified?: boolean | null
        }
        Update: {
          allowed_days?: number[] | null
          allowed_end_hour?: number | null
          allowed_start_hour?: number | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          has_selected_initial_tier?: boolean
          id?: string
          ip_whitelist_enabled?: boolean
          language_preference?: string | null
          subscription_tier?: string
          time_restriction_timezone?: string | null
          time_restrictions_enabled?: boolean
          total_points?: number
          trial_expires_at?: string | null
          trial_started_at?: string | null
          updated_at?: string
          whatsapp_number?: string | null
          whatsapp_verified?: boolean | null
        }
        Relationships: []
      }
      promo_code_redemptions: {
        Row: {
          discount_amount: number
          final_amount: number
          id: string
          original_amount: number
          promo_code_id: string | null
          redeemed_at: string | null
          tier: string
          transaction_reference: string | null
          user_id: string
        }
        Insert: {
          discount_amount: number
          final_amount: number
          id?: string
          original_amount: number
          promo_code_id?: string | null
          redeemed_at?: string | null
          tier: string
          transaction_reference?: string | null
          user_id: string
        }
        Update: {
          discount_amount?: number
          final_amount?: number
          id?: string
          original_amount?: number
          promo_code_id?: string | null
          redeemed_at?: string | null
          tier?: string
          transaction_reference?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "promo_code_redemptions_promo_code_id_fkey"
            columns: ["promo_code_id"]
            isOneToOne: false
            referencedRelation: "promo_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      promo_codes: {
        Row: {
          applicable_billing_cycles: string[] | null
          applicable_tiers: string[] | null
          code: string
          created_at: string | null
          created_by: string | null
          current_uses: number | null
          description: string | null
          discount_type: string
          discount_value: number
          first_purchase_only: boolean | null
          id: string
          is_active: boolean | null
          max_discount_amount: number | null
          max_uses: number | null
          max_uses_per_user: number | null
          min_purchase_amount: number | null
          new_users_only: boolean | null
          updated_at: string | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          applicable_billing_cycles?: string[] | null
          applicable_tiers?: string[] | null
          code: string
          created_at?: string | null
          created_by?: string | null
          current_uses?: number | null
          description?: string | null
          discount_type: string
          discount_value: number
          first_purchase_only?: boolean | null
          id?: string
          is_active?: boolean | null
          max_discount_amount?: number | null
          max_uses?: number | null
          max_uses_per_user?: number | null
          min_purchase_amount?: number | null
          new_users_only?: boolean | null
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          applicable_billing_cycles?: string[] | null
          applicable_tiers?: string[] | null
          code?: string
          created_at?: string | null
          created_by?: string | null
          current_uses?: number | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          first_purchase_only?: boolean | null
          id?: string
          is_active?: boolean | null
          max_discount_amount?: number | null
          max_uses?: number | null
          max_uses_per_user?: number | null
          min_purchase_amount?: number | null
          new_users_only?: boolean | null
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      referral_discount_codes: {
        Row: {
          code: string
          created_at: string | null
          discount_percentage: number | null
          expires_at: string
          id: string
          is_used: boolean | null
          owner_type: string
          owner_user_id: string
          referral_id: string | null
          used_at: string | null
          used_for_transaction: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          discount_percentage?: number | null
          expires_at: string
          id?: string
          is_used?: boolean | null
          owner_type: string
          owner_user_id: string
          referral_id?: string | null
          used_at?: string | null
          used_for_transaction?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          discount_percentage?: number | null
          expires_at?: string
          id?: string
          is_used?: boolean | null
          owner_type?: string
          owner_user_id?: string
          referral_id?: string | null
          used_at?: string | null
          used_for_transaction?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referral_discount_codes_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_rewards: {
        Row: {
          applied_at: string | null
          created_at: string
          expires_at: string | null
          id: string
          quantity: number
          referral_id: string | null
          reward_type: string
          user_id: string
        }
        Insert: {
          applied_at?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          quantity?: number
          referral_id?: string | null
          reward_type?: string
          user_id: string
        }
        Update: {
          applied_at?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          quantity?: number
          referral_id?: string | null
          reward_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_rewards_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          invitee_discount_code_id: string | null
          referral_code: string
          referred_email: string
          referred_user_id: string | null
          referrer_discount_code_id: string | null
          referrer_id: string
          reward_claimed: boolean
          reward_months: number | null
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          invitee_discount_code_id?: string | null
          referral_code: string
          referred_email: string
          referred_user_id?: string | null
          referrer_discount_code_id?: string | null
          referrer_id: string
          reward_claimed?: boolean
          reward_months?: number | null
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          invitee_discount_code_id?: string | null
          referral_code?: string
          referred_email?: string
          referred_user_id?: string | null
          referrer_discount_code_id?: string | null
          referrer_id?: string
          reward_claimed?: boolean
          reward_months?: number | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_invitee_discount_code_id_fkey"
            columns: ["invitee_discount_code_id"]
            isOneToOne: false
            referencedRelation: "referral_discount_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_discount_code_id_fkey"
            columns: ["referrer_discount_code_id"]
            isOneToOne: false
            referencedRelation: "referral_discount_codes"
            referencedColumns: ["id"]
          },
        ]
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
      report_schedules: {
        Row: {
          created_at: string
          day_of_month: number | null
          day_of_week: number | null
          id: string
          is_enabled: boolean
          last_sent_at: string | null
          preferred_hour: number
          schedule_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          day_of_month?: number | null
          day_of_week?: number | null
          id?: string
          is_enabled?: boolean
          last_sent_at?: string | null
          preferred_hour?: number
          schedule_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          day_of_month?: number | null
          day_of_week?: number | null
          id?: string
          is_enabled?: boolean
          last_sent_at?: string | null
          preferred_hour?: number
          schedule_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      security_events: {
        Row: {
          created_at: string
          details: Json | null
          event_type: string
          id: string
          ip_address: string | null
          severity: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          details?: Json | null
          event_type: string
          id?: string
          ip_address?: string | null
          severity?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          details?: Json | null
          event_type?: string
          id?: string
          ip_address?: string | null
          severity?: string
          user_id?: string | null
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
      subscription_history: {
        Row: {
          change_type: string
          created_at: string
          id: string
          metadata: Json | null
          new_tier: string
          previous_tier: string | null
          reason: string | null
          user_id: string
        }
        Insert: {
          change_type?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          new_tier: string
          previous_tier?: string | null
          reason?: string | null
          user_id: string
        }
        Update: {
          change_type?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          new_tier?: string
          previous_tier?: string | null
          reason?: string | null
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
      tier_data_snapshots: {
        Row: {
          data_count: number
          data_type: string
          id: string
          is_active: boolean
          notes: string | null
          snapshot_date: string
          snapshot_tier: string
          user_id: string
        }
        Insert: {
          data_count?: number
          data_type: string
          id?: string
          is_active?: boolean
          notes?: string | null
          snapshot_date?: string
          snapshot_tier: string
          user_id: string
        }
        Update: {
          data_count?: number
          data_type?: string
          id?: string
          is_active?: boolean
          notes?: string | null
          snapshot_date?: string
          snapshot_tier?: string
          user_id?: string
        }
        Relationships: []
      }
      user_notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
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
      check_account_locked: {
        Args: { check_email: string }
        Returns: {
          failed_count: number
          is_locked: boolean
          unlock_at: string
        }[]
      }
      check_expired_trials: { Args: never; Returns: undefined }
      check_ip_whitelist: {
        Args: { check_ip: string; check_user_id: string }
        Returns: boolean
      }
      check_time_restrictions: {
        Args: { check_user_id: string }
        Returns: boolean
      }
      cleanup_old_backup_attempts: { Args: never; Returns: undefined }
      cleanup_old_login_attempts: { Args: never; Returns: undefined }
      cleanup_old_rate_limits: { Args: never; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_promo_usage: { Args: { promo_id: string }; Returns: undefined }
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
