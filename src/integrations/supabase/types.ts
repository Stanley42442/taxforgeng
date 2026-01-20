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
      analytics_events: {
        Row: {
          billing_cycle: string | null
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          ip_address: string | null
          session_id: string | null
          tier: string | null
          user_id: string | null
        }
        Insert: {
          billing_cycle?: string | null
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: string | null
          session_id?: string | null
          tier?: string | null
          user_id?: string | null
        }
        Update: {
          billing_cycle?: string | null
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: string | null
          session_id?: string | null
          tier?: string | null
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
      bonus_entries: {
        Row: {
          amount: number
          bonus_type: string
          created_at: string | null
          description: string | null
          employee_id: string
          id: string
          is_taxable: boolean | null
          pay_period: string
          payroll_entry_id: string | null
          tax_treatment: string | null
        }
        Insert: {
          amount: number
          bonus_type: string
          created_at?: string | null
          description?: string | null
          employee_id: string
          id?: string
          is_taxable?: boolean | null
          pay_period: string
          payroll_entry_id?: string | null
          tax_treatment?: string | null
        }
        Update: {
          amount?: number
          bonus_type?: string
          created_at?: string | null
          description?: string | null
          employee_id?: string
          id?: string
          is_taxable?: boolean | null
          pay_period?: string
          payroll_entry_id?: string | null
          tax_treatment?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bonus_entries_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bonus_entries_payroll_entry_id_fkey"
            columns: ["payroll_entry_id"]
            isOneToOne: false
            referencedRelation: "payroll_entries"
            referencedColumns: ["id"]
          },
        ]
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
      document_verifications: {
        Row: {
          business_name: string | null
          created_at: string | null
          document_hash: string
          document_id: string
          document_type: string
          generated_at: string | null
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          business_name?: string | null
          created_at?: string | null
          document_hash: string
          document_id: string
          document_type: string
          generated_at?: string | null
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          business_name?: string | null
          created_at?: string | null
          document_hash?: string
          document_id?: string
          document_type?: string
          generated_at?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      email_logs: {
        Row: {
          error_message: string | null
          id: string
          recipient_email: string
          report_title: string | null
          report_type: string
          sent_at: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          error_message?: string | null
          id?: string
          recipient_email: string
          report_title?: string | null
          report_type: string
          sent_at?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          error_message?: string | null
          id?: string
          recipient_email?: string
          report_title?: string | null
          report_type?: string
          sent_at?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      email_recipients: {
        Row: {
          created_at: string | null
          email: string
          id: string
          is_default: boolean | null
          name: string | null
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          is_default?: boolean | null
          name?: string | null
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          is_default?: boolean | null
          name?: string | null
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      employee_leave_balances: {
        Row: {
          adjustment_days: number | null
          carried_over_days: number | null
          created_at: string | null
          employee_id: string
          entitled_days: number
          id: string
          leave_type_id: string
          notes: string | null
          updated_at: string | null
          used_days: number | null
          year: number
        }
        Insert: {
          adjustment_days?: number | null
          carried_over_days?: number | null
          created_at?: string | null
          employee_id: string
          entitled_days: number
          id?: string
          leave_type_id: string
          notes?: string | null
          updated_at?: string | null
          used_days?: number | null
          year: number
        }
        Update: {
          adjustment_days?: number | null
          carried_over_days?: number | null
          created_at?: string | null
          employee_id?: string
          entitled_days?: number
          id?: string
          leave_type_id?: string
          notes?: string | null
          updated_at?: string | null
          used_days?: number | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "employee_leave_balances_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_leave_balances_leave_type_id_fkey"
            columns: ["leave_type_id"]
            isOneToOne: false
            referencedRelation: "leave_types"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_portal_sessions: {
        Row: {
          employee_id: string
          id: string
          ip_address: string | null
          logged_in_at: string | null
          user_agent: string | null
        }
        Insert: {
          employee_id: string
          id?: string
          ip_address?: string | null
          logged_in_at?: string | null
          user_agent?: string | null
        }
        Update: {
          employee_id?: string
          id?: string
          ip_address?: string | null
          logged_in_at?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_portal_sessions_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_salary_history: {
        Row: {
          approved_by: string | null
          change_reason: string | null
          created_at: string | null
          effective_date: string
          employee_id: string
          id: string
          new_salary: number
          notes: string | null
          previous_salary: number | null
        }
        Insert: {
          approved_by?: string | null
          change_reason?: string | null
          created_at?: string | null
          effective_date: string
          employee_id: string
          id?: string
          new_salary: number
          notes?: string | null
          previous_salary?: number | null
        }
        Update: {
          approved_by?: string | null
          change_reason?: string | null
          created_at?: string | null
          effective_date?: string
          employee_id?: string
          id?: string
          new_salary?: number
          notes?: string | null
          previous_salary?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_salary_history_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          bank_account_number: string | null
          bank_name: string | null
          business_id: string | null
          created_at: string | null
          current_gross_salary: number
          date_of_birth: string | null
          department: string | null
          email: string | null
          employee_id_number: string | null
          employment_type: string | null
          first_name: string
          hire_date: string | null
          id: string
          include_nhf: boolean | null
          last_name: string
          nhf_number: string | null
          notes: string | null
          pension_pin: string | null
          pfa_name: string | null
          phone: string | null
          position: string | null
          self_service_enabled: boolean | null
          self_service_invite_sent_at: string | null
          self_service_last_login: string | null
          self_service_user_id: string | null
          status: string | null
          tax_id: string | null
          termination_date: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          bank_account_number?: string | null
          bank_name?: string | null
          business_id?: string | null
          created_at?: string | null
          current_gross_salary: number
          date_of_birth?: string | null
          department?: string | null
          email?: string | null
          employee_id_number?: string | null
          employment_type?: string | null
          first_name: string
          hire_date?: string | null
          id?: string
          include_nhf?: boolean | null
          last_name: string
          nhf_number?: string | null
          notes?: string | null
          pension_pin?: string | null
          pfa_name?: string | null
          phone?: string | null
          position?: string | null
          self_service_enabled?: boolean | null
          self_service_invite_sent_at?: string | null
          self_service_last_login?: string | null
          self_service_user_id?: string | null
          status?: string | null
          tax_id?: string | null
          termination_date?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          bank_account_number?: string | null
          bank_name?: string | null
          business_id?: string | null
          created_at?: string | null
          current_gross_salary?: number
          date_of_birth?: string | null
          department?: string | null
          email?: string | null
          employee_id_number?: string | null
          employment_type?: string | null
          first_name?: string
          hire_date?: string | null
          id?: string
          include_nhf?: boolean | null
          last_name?: string
          nhf_number?: string | null
          notes?: string | null
          pension_pin?: string | null
          pfa_name?: string | null
          phone?: string | null
          position?: string | null
          self_service_enabled?: boolean | null
          self_service_invite_sent_at?: string | null
          self_service_last_login?: string | null
          self_service_user_id?: string | null
          status?: string | null
          tax_id?: string | null
          termination_date?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employees_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
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
      leave_requests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          employee_id: string
          end_date: string
          half_day_period: string | null
          id: string
          is_half_day: boolean | null
          leave_type_id: string
          reason: string | null
          rejection_reason: string | null
          start_date: string
          status: string | null
          total_days: number
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          employee_id: string
          end_date: string
          half_day_period?: string | null
          id?: string
          is_half_day?: boolean | null
          leave_type_id: string
          reason?: string | null
          rejection_reason?: string | null
          start_date: string
          status?: string | null
          total_days: number
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          employee_id?: string
          end_date?: string
          half_day_period?: string | null
          id?: string
          is_half_day?: boolean | null
          leave_type_id?: string
          reason?: string | null
          rejection_reason?: string | null
          start_date?: string
          status?: string | null
          total_days?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leave_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_requests_leave_type_id_fkey"
            columns: ["leave_type_id"]
            isOneToOne: false
            referencedRelation: "leave_types"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_types: {
        Row: {
          can_carry_over: boolean | null
          code: string
          color: string | null
          created_at: string | null
          default_days_per_year: number
          id: string
          is_active: boolean | null
          is_paid: boolean | null
          max_carry_over_days: number | null
          name: string
          requires_approval: boolean | null
          user_id: string
        }
        Insert: {
          can_carry_over?: boolean | null
          code: string
          color?: string | null
          created_at?: string | null
          default_days_per_year: number
          id?: string
          is_active?: boolean | null
          is_paid?: boolean | null
          max_carry_over_days?: number | null
          name: string
          requires_approval?: boolean | null
          user_id: string
        }
        Update: {
          can_carry_over?: boolean | null
          code?: string
          color?: string | null
          created_at?: string | null
          default_days_per_year?: number
          id?: string
          is_active?: boolean | null
          is_paid?: boolean | null
          max_carry_over_days?: number | null
          name?: string
          requires_approval?: boolean | null
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
      overtime_entries: {
        Row: {
          amount: number
          created_at: string | null
          date: string | null
          description: string | null
          employee_id: string
          hourly_rate: number
          hours: number
          id: string
          multiplier: number
          overtime_rate_id: string | null
          pay_period: string
          payroll_entry_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          date?: string | null
          description?: string | null
          employee_id: string
          hourly_rate: number
          hours: number
          id?: string
          multiplier: number
          overtime_rate_id?: string | null
          pay_period: string
          payroll_entry_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          date?: string | null
          description?: string | null
          employee_id?: string
          hourly_rate?: number
          hours?: number
          id?: string
          multiplier?: number
          overtime_rate_id?: string | null
          pay_period?: string
          payroll_entry_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "overtime_entries_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "overtime_entries_overtime_rate_id_fkey"
            columns: ["overtime_rate_id"]
            isOneToOne: false
            referencedRelation: "overtime_rates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "overtime_entries_payroll_entry_id_fkey"
            columns: ["payroll_entry_id"]
            isOneToOne: false
            referencedRelation: "payroll_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      overtime_rates: {
        Row: {
          created_at: string | null
          id: string
          is_default: boolean | null
          multiplier: number
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          multiplier: number
          name: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          multiplier?: number
          name?: string
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
      payment_reconciliation_logs: {
        Row: {
          created_at: string | null
          discrepancies: Json | null
          discrepancy_count: number
          end_date: string
          fixed_count: number | null
          fixes_applied: Json | null
          id: string
          matched_count: number
          run_at: string | null
          run_by: string | null
          start_date: string
          status: string | null
          total_db_transactions: number
          total_paystack_transactions: number
        }
        Insert: {
          created_at?: string | null
          discrepancies?: Json | null
          discrepancy_count: number
          end_date: string
          fixed_count?: number | null
          fixes_applied?: Json | null
          id?: string
          matched_count: number
          run_at?: string | null
          run_by?: string | null
          start_date: string
          status?: string | null
          total_db_transactions: number
          total_paystack_transactions: number
        }
        Update: {
          created_at?: string | null
          discrepancies?: Json | null
          discrepancy_count?: number
          end_date?: string
          fixed_count?: number | null
          fixes_applied?: Json | null
          id?: string
          matched_count?: number
          run_at?: string | null
          run_by?: string | null
          start_date?: string
          status?: string | null
          total_db_transactions?: number
          total_paystack_transactions?: number
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
      payment_verification_tokens: {
        Row: {
          attempts: number | null
          created_at: string | null
          delivery_method: string
          delivery_target: string
          expires_at: string
          id: string
          ip_address: string | null
          max_attempts: number | null
          operation_data: Json | null
          token_hash: string
          token_type: string
          user_agent: string | null
          user_id: string
          verified_at: string | null
        }
        Insert: {
          attempts?: number | null
          created_at?: string | null
          delivery_method?: string
          delivery_target: string
          expires_at: string
          id?: string
          ip_address?: string | null
          max_attempts?: number | null
          operation_data?: Json | null
          token_hash: string
          token_type: string
          user_agent?: string | null
          user_id: string
          verified_at?: string | null
        }
        Update: {
          attempts?: number | null
          created_at?: string | null
          delivery_method?: string
          delivery_target?: string
          expires_at?: string
          id?: string
          ip_address?: string | null
          max_attempts?: number | null
          operation_data?: Json | null
          token_hash?: string
          token_type?: string
          user_agent?: string | null
          user_id?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      payroll_entries: {
        Row: {
          basic_salary: number | null
          bonus_amount: number | null
          created_at: string | null
          employee_id: string | null
          employee_name: string
          gross_salary: number
          housing_allowance: number | null
          id: string
          include_nhf: boolean | null
          leave_deduction: number | null
          net_salary: number
          nhf: number | null
          other_allowances: number | null
          overtime_amount: number | null
          paye: number
          payroll_run_id: string
          pension_employee: number
          pension_employer: number
          taxable_income: number
          transport_allowance: number | null
        }
        Insert: {
          basic_salary?: number | null
          bonus_amount?: number | null
          created_at?: string | null
          employee_id?: string | null
          employee_name: string
          gross_salary: number
          housing_allowance?: number | null
          id?: string
          include_nhf?: boolean | null
          leave_deduction?: number | null
          net_salary: number
          nhf?: number | null
          other_allowances?: number | null
          overtime_amount?: number | null
          paye: number
          payroll_run_id: string
          pension_employee: number
          pension_employer: number
          taxable_income: number
          transport_allowance?: number | null
        }
        Update: {
          basic_salary?: number | null
          bonus_amount?: number | null
          created_at?: string | null
          employee_id?: string | null
          employee_name?: string
          gross_salary?: number
          housing_allowance?: number | null
          id?: string
          include_nhf?: boolean | null
          leave_deduction?: number | null
          net_salary?: number
          nhf?: number | null
          other_allowances?: number | null
          overtime_amount?: number | null
          paye?: number
          payroll_run_id?: string
          pension_employee?: number
          pension_employer?: number
          taxable_income?: number
          transport_allowance?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "payroll_entries_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_entries_payroll_run_id_fkey"
            columns: ["payroll_run_id"]
            isOneToOne: false
            referencedRelation: "payroll_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_runs: {
        Row: {
          business_id: string | null
          created_at: string | null
          id: string
          notes: string | null
          pay_date: string
          pay_period: string
          status: string | null
          total_bonuses: number | null
          total_employees: number | null
          total_gross_salaries: number | null
          total_leave_deductions: number | null
          total_net_salaries: number | null
          total_nhf: number | null
          total_overtime: number | null
          total_paye: number | null
          total_pension_employee: number | null
          total_pension_employer: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          business_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          pay_date: string
          pay_period: string
          status?: string | null
          total_bonuses?: number | null
          total_employees?: number | null
          total_gross_salaries?: number | null
          total_leave_deductions?: number | null
          total_net_salaries?: number | null
          total_nhf?: number | null
          total_overtime?: number | null
          total_paye?: number | null
          total_pension_employee?: number | null
          total_pension_employer?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          business_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          pay_date?: string
          pay_period?: string
          status?: string | null
          total_bonuses?: number | null
          total_employees?: number | null
          total_gross_salaries?: number | null
          total_leave_deductions?: number | null
          total_net_salaries?: number | null
          total_nhf?: number | null
          total_overtime?: number | null
          total_paye?: number | null
          total_pension_employee?: number | null
          total_pension_employer?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payroll_runs_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_template_entries: {
        Row: {
          created_at: string | null
          department: string | null
          employee_id: string | null
          employee_name: string
          gross_salary: number
          id: string
          include_nhf: boolean | null
          position: string | null
          sort_order: number | null
          template_id: string
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          employee_id?: string | null
          employee_name: string
          gross_salary: number
          id?: string
          include_nhf?: boolean | null
          position?: string | null
          sort_order?: number | null
          template_id: string
        }
        Update: {
          created_at?: string | null
          department?: string | null
          employee_id?: string | null
          employee_name?: string
          gross_salary?: number
          id?: string
          include_nhf?: boolean | null
          position?: string | null
          sort_order?: number | null
          template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payroll_template_entries_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_template_entries_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "payroll_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_templates: {
        Row: {
          business_id: string | null
          created_at: string | null
          description: string | null
          id: string
          is_default: boolean | null
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          business_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          business_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payroll_templates_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
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
          last_password_change: string | null
          session_invalidated_at: string | null
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
          last_password_change?: string | null
          session_invalidated_at?: string | null
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
          last_password_change?: string | null
          session_invalidated_at?: string | null
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
      public_holidays: {
        Row: {
          created_at: string | null
          date: string
          id: string
          is_recurring: boolean | null
          name: string
          user_id: string
          year: number
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          is_recurring?: boolean | null
          name: string
          user_id: string
          year: number
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          is_recurring?: boolean | null
          name?: string
          user_id?: string
          year?: number
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
      remittance_reminders: {
        Row: {
          business_id: string | null
          created_at: string | null
          id: string
          is_enabled: boolean | null
          last_sent_for_period: string | null
          reminder_days_before: number | null
          remittance_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          business_id?: string | null
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          last_sent_for_period?: string | null
          reminder_days_before?: number | null
          remittance_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          business_id?: string | null
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          last_sent_for_period?: string | null
          reminder_days_before?: number | null
          remittance_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "remittance_reminders_business_id_fkey"
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
      user_payment_methods: {
        Row: {
          authorization_code: string
          bank: string | null
          card_type: string
          country_code: string | null
          created_at: string | null
          exp_month: number
          exp_year: number
          id: string
          is_active: boolean | null
          is_default: boolean | null
          last_four: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          authorization_code: string
          bank?: string | null
          card_type: string
          country_code?: string | null
          created_at?: string | null
          exp_month: number
          exp_year: number
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          last_four: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          authorization_code?: string
          bank?: string | null
          card_type?: string
          country_code?: string | null
          created_at?: string | null
          exp_month?: number
          exp_year?: number
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          last_four?: string
          updated_at?: string | null
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
      user_sessions: {
        Row: {
          created_at: string | null
          device_fingerprint: string | null
          device_name: string | null
          expires_at: string | null
          id: string
          ip_address: string | null
          is_current: boolean | null
          last_active_at: string | null
          location: Json | null
          revoked_at: string | null
          revoked_reason: string | null
          session_token_hash: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_fingerprint?: string | null
          device_name?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: string | null
          is_current?: boolean | null
          last_active_at?: string | null
          location?: Json | null
          revoked_at?: string | null
          revoked_reason?: string | null
          session_token_hash: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_fingerprint?: string | null
          device_name?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: string | null
          is_current?: boolean | null
          last_active_at?: string | null
          location?: Json | null
          revoked_at?: string | null
          revoked_reason?: string | null
          session_token_hash?: string
          user_agent?: string | null
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
      cleanup_expired_payment_tokens: { Args: never; Returns: undefined }
      cleanup_expired_sessions: { Args: never; Returns: undefined }
      cleanup_old_backup_attempts: { Args: never; Returns: undefined }
      cleanup_old_login_attempts: { Args: never; Returns: undefined }
      cleanup_old_rate_limits: { Args: never; Returns: undefined }
      cleanup_security_data: { Args: never; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_promo_usage: { Args: { promo_id: string }; Returns: undefined }
      invalidate_user_sessions: {
        Args: { reason?: string; target_user_id: string }
        Returns: number
      }
      record_login_attempt: {
        Args: {
          attempt_email: string
          attempt_ip?: string
          attempt_success: boolean
        }
        Returns: undefined
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
