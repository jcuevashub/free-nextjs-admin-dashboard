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
      accounts: {
        Row: {
          account_name: string | null
          account_number: string
          account_type: Database["public"]["Enums"]["account_type"] | null
          available_balance: number
          balance: number
          closed_at: string | null
          company_id: string
          created_at: string | null
          currency: Database["public"]["Enums"]["currency_code"] | null
          daily_transfer_limit: number | null
          id: string
          is_primary: boolean | null
          metadata: Json | null
          monthly_transfer_limit: number | null
          pending_balance: number
          status: Database["public"]["Enums"]["account_status"] | null
          updated_at: string | null
        }
        Insert: {
          account_name?: string | null
          account_number: string
          account_type?: Database["public"]["Enums"]["account_type"] | null
          available_balance?: number
          balance?: number
          closed_at?: string | null
          company_id: string
          created_at?: string | null
          currency?: Database["public"]["Enums"]["currency_code"] | null
          daily_transfer_limit?: number | null
          id?: string
          is_primary?: boolean | null
          metadata?: Json | null
          monthly_transfer_limit?: number | null
          pending_balance?: number
          status?: Database["public"]["Enums"]["account_status"] | null
          updated_at?: string | null
        }
        Update: {
          account_name?: string | null
          account_number?: string
          account_type?: Database["public"]["Enums"]["account_type"] | null
          available_balance?: number
          balance?: number
          closed_at?: string | null
          company_id?: string
          created_at?: string | null
          currency?: Database["public"]["Enums"]["currency_code"] | null
          daily_transfer_limit?: number | null
          id?: string
          is_primary?: boolean | null
          metadata?: Json | null
          monthly_transfer_limit?: number | null
          pending_balance?: number
          status?: Database["public"]["Enums"]["account_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accounts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          changes: Json | null
          company_id: string | null
          created_at: string | null
          id: string
          ip_address: unknown
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          changes?: Json | null
          company_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          changes?: Json | null
          company_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      card_transactions: {
        Row: {
          amount: number
          card_id: string
          category: string | null
          created_at: string | null
          currency: Database["public"]["Enums"]["currency_code"]
          id: string
          location: string | null
          mcc_code: string | null
          merchant_name: string | null
          metadata: Json | null
          status: Database["public"]["Enums"]["transaction_status"] | null
          transaction_date: string | null
        }
        Insert: {
          amount: number
          card_id: string
          category?: string | null
          created_at?: string | null
          currency: Database["public"]["Enums"]["currency_code"]
          id?: string
          location?: string | null
          mcc_code?: string | null
          merchant_name?: string | null
          metadata?: Json | null
          status?: Database["public"]["Enums"]["transaction_status"] | null
          transaction_date?: string | null
        }
        Update: {
          amount?: number
          card_id?: string
          category?: string | null
          created_at?: string | null
          currency?: Database["public"]["Enums"]["currency_code"]
          id?: string
          location?: string | null
          mcc_code?: string | null
          merchant_name?: string | null
          metadata?: Json | null
          status?: Database["public"]["Enums"]["transaction_status"] | null
          transaction_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "card_transactions_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
        ]
      }
      cards: {
        Row: {
          account_id: string
          activated_at: string | null
          blocked_categories: string[] | null
          cancelled_at: string | null
          card_holder_id: string
          card_name: string | null
          card_number_encrypted: string
          card_type: Database["public"]["Enums"]["card_type"] | null
          created_at: string | null
          cvv_encrypted: string
          daily_limit: number | null
          expiry_date: string
          id: string
          is_physical: boolean | null
          last_used_at: string | null
          metadata: Json | null
          monthly_limit: number | null
          per_transaction_limit: number | null
          shipping_address: string | null
          status: Database["public"]["Enums"]["card_status"] | null
          updated_at: string | null
        }
        Insert: {
          account_id: string
          activated_at?: string | null
          blocked_categories?: string[] | null
          cancelled_at?: string | null
          card_holder_id: string
          card_name?: string | null
          card_number_encrypted: string
          card_type?: Database["public"]["Enums"]["card_type"] | null
          created_at?: string | null
          cvv_encrypted: string
          daily_limit?: number | null
          expiry_date: string
          id?: string
          is_physical?: boolean | null
          last_used_at?: string | null
          metadata?: Json | null
          monthly_limit?: number | null
          per_transaction_limit?: number | null
          shipping_address?: string | null
          status?: Database["public"]["Enums"]["card_status"] | null
          updated_at?: string | null
        }
        Update: {
          account_id?: string
          activated_at?: string | null
          blocked_categories?: string[] | null
          cancelled_at?: string | null
          card_holder_id?: string
          card_name?: string | null
          card_number_encrypted?: string
          card_type?: Database["public"]["Enums"]["card_type"] | null
          created_at?: string | null
          cvv_encrypted?: string
          daily_limit?: number | null
          expiry_date?: string
          id?: string
          is_physical?: boolean | null
          last_used_at?: string | null
          metadata?: Json | null
          monthly_limit?: number | null
          per_transaction_limit?: number | null
          shipping_address?: string | null
          status?: Database["public"]["Enums"]["card_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cards_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cards_card_holder_id_fkey"
            columns: ["card_holder_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address: string | null
          city: string | null
          company_email: string
          company_name: string
          company_phone: string | null
          country: string | null
          created_at: string | null
          deleted_at: string | null
          id: string
          industry: string | null
          is_verified: boolean | null
          kyc_status: Database["public"]["Enums"]["kyc_status"] | null
          legal_name: string
          logo_url: string | null
          metadata: Json | null
          rnc: string
          settings: Json | null
          status: Database["public"]["Enums"]["account_status"] | null
          updated_at: string | null
          verified_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          company_email: string
          company_name: string
          company_phone?: string | null
          country?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          industry?: string | null
          is_verified?: boolean | null
          kyc_status?: Database["public"]["Enums"]["kyc_status"] | null
          legal_name: string
          logo_url?: string | null
          metadata?: Json | null
          rnc: string
          settings?: Json | null
          status?: Database["public"]["Enums"]["account_status"] | null
          updated_at?: string | null
          verified_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          company_email?: string
          company_name?: string
          company_phone?: string | null
          country?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          industry?: string | null
          is_verified?: boolean | null
          kyc_status?: Database["public"]["Enums"]["kyc_status"] | null
          legal_name?: string
          logo_url?: string | null
          metadata?: Json | null
          rnc?: string
          settings?: Json | null
          status?: Database["public"]["Enums"]["account_status"] | null
          updated_at?: string | null
          verified_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      company_documents: {
        Row: {
          company_id: string
          created_at: string | null
          document_type: string
          file_name: string
          file_size: number | null
          file_url: string
          id: string
          is_verified: boolean | null
          mime_type: string | null
          uploaded_by: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          document_type: string
          file_name: string
          file_size?: number | null
          file_url: string
          id?: string
          is_verified?: boolean | null
          mime_type?: string | null
          uploaded_by?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          document_type?: string
          file_name?: string
          file_size?: number | null
          file_url?: string
          id?: string
          is_verified?: boolean | null
          mime_type?: string | null
          uploaded_by?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_documents_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_documents_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          city: string | null
          company_id: string
          country: string | null
          created_at: string | null
          customer_name: string
          email: string | null
          id: string
          metadata: Json | null
          notes: string | null
          payment_terms: number | null
          phone: string | null
          rnc_cedula: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          company_id: string
          country?: string | null
          created_at?: string | null
          customer_name: string
          email?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          payment_terms?: number | null
          phone?: string | null
          rnc_cedula?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          company_id?: string
          country?: string | null
          created_at?: string | null
          customer_name?: string
          email?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          payment_terms?: number | null
          phone?: string | null
          rnc_cedula?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          created_at: string | null
          description: string
          id: string
          invoice_id: string
          itbis_amount: number | null
          itbis_rate: number | null
          product_id: string | null
          quantity: number
          total: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          invoice_id: string
          itbis_amount?: number | null
          itbis_rate?: number | null
          product_id?: string | null
          quantity: number
          total: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          invoice_id?: string
          itbis_amount?: number | null
          itbis_rate?: number | null
          product_id?: string | null
          quantity?: number
          total?: number
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
          {
            foreignKeyName: "invoice_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          company_id: string
          created_at: string | null
          created_by: string | null
          currency: Database["public"]["Enums"]["currency_code"] | null
          customer_id: string
          due_date: string | null
          id: string
          invoice_number: string
          issue_date: string | null
          itbis: number | null
          metadata: Json | null
          ncf: string | null
          ncf_type: Database["public"]["Enums"]["ncf_type"] | null
          notes: string | null
          paid_at: string | null
          payment_date: string | null
          payment_method: string | null
          status: Database["public"]["Enums"]["invoice_status"] | null
          terms: string | null
          total: number
          updated_at: string | null
        }
        Insert: {
          amount: number
          company_id: string
          created_at?: string | null
          created_by?: string | null
          currency?: Database["public"]["Enums"]["currency_code"] | null
          customer_id: string
          due_date?: string | null
          id?: string
          invoice_number: string
          issue_date?: string | null
          itbis?: number | null
          metadata?: Json | null
          ncf?: string | null
          ncf_type?: Database["public"]["Enums"]["ncf_type"] | null
          notes?: string | null
          paid_at?: string | null
          payment_date?: string | null
          payment_method?: string | null
          status?: Database["public"]["Enums"]["invoice_status"] | null
          terms?: string | null
          total: number
          updated_at?: string | null
        }
        Update: {
          amount?: number
          company_id?: string
          created_at?: string | null
          created_by?: string | null
          currency?: Database["public"]["Enums"]["currency_code"] | null
          customer_id?: string
          due_date?: string | null
          id?: string
          invoice_number?: string
          issue_date?: string | null
          itbis?: number | null
          metadata?: Json | null
          ncf?: string | null
          ncf_type?: Database["public"]["Enums"]["ncf_type"] | null
          notes?: string | null
          paid_at?: string | null
          payment_date?: string | null
          payment_method?: string | null
          status?: Database["public"]["Enums"]["invoice_status"] | null
          terms?: string | null
          total?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      itbis_declarations: {
        Row: {
          company_id: string
          created_at: string | null
          file_url: string | null
          filed_at: string | null
          id: string
          itbis_purchases: number | null
          itbis_sales: number | null
          itbis_to_pay: number | null
          itbis_withheld: number | null
          payment_date: string | null
          payment_reference: string | null
          payment_status: string | null
          period_month: number
          period_year: number
          total_purchases: number | null
          total_sales: number | null
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          file_url?: string | null
          filed_at?: string | null
          id?: string
          itbis_purchases?: number | null
          itbis_sales?: number | null
          itbis_to_pay?: number | null
          itbis_withheld?: number | null
          payment_date?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          period_month: number
          period_year: number
          total_purchases?: number | null
          total_sales?: number | null
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          file_url?: string | null
          filed_at?: string | null
          id?: string
          itbis_purchases?: number | null
          itbis_sales?: number | null
          itbis_to_pay?: number | null
          itbis_withheld?: number | null
          payment_date?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          period_month?: number
          period_year?: number
          total_purchases?: number | null
          total_sales?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "itbis_declarations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      kyc_verifications: {
        Row: {
          company_id: string
          created_at: string | null
          documents_verified: boolean | null
          id: string
          legal_rep_verified: boolean | null
          notes: string | null
          provider: string | null
          provider_response: Json | null
          reviewed_at: string | null
          reviewed_by: string | null
          risk_score: number | null
          rnc_validated: boolean | null
          updated_at: string | null
          verification_status: Database["public"]["Enums"]["kyc_status"] | null
          verification_type: string
        }
        Insert: {
          company_id: string
          created_at?: string | null
          documents_verified?: boolean | null
          id?: string
          legal_rep_verified?: boolean | null
          notes?: string | null
          provider?: string | null
          provider_response?: Json | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          risk_score?: number | null
          rnc_validated?: boolean | null
          updated_at?: string | null
          verification_status?: Database["public"]["Enums"]["kyc_status"] | null
          verification_type: string
        }
        Update: {
          company_id?: string
          created_at?: string | null
          documents_verified?: boolean | null
          id?: string
          legal_rep_verified?: boolean | null
          notes?: string | null
          provider?: string | null
          provider_response?: Json | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          risk_score?: number | null
          rnc_validated?: boolean | null
          updated_at?: string | null
          verification_status?: Database["public"]["Enums"]["kyc_status"] | null
          verification_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "kyc_verifications_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kyc_verifications_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      login_logs: {
        Row: {
          failure_reason: string | null
          id: string
          ip_address: unknown
          login_at: string | null
          success: boolean
          two_fa_verified: boolean | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          failure_reason?: string | null
          id?: string
          ip_address?: unknown
          login_at?: string | null
          success: boolean
          two_fa_verified?: boolean | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          failure_reason?: string | null
          id?: string
          ip_address?: unknown
          login_at?: string | null
          success?: boolean
          two_fa_verified?: boolean | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "login_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ncf_records: {
        Row: {
          amount: number
          company_id: string
          created_at: string | null
          id: string
          is_validated: boolean | null
          itbis: number | null
          metadata: Json | null
          ncf: string
          ncf_type: Database["public"]["Enums"]["ncf_type"]
          rnc_supplier: string | null
          supplier_name: string | null
          total: number
          transaction_date: string
          validated_at: string | null
        }
        Insert: {
          amount: number
          company_id: string
          created_at?: string | null
          id?: string
          is_validated?: boolean | null
          itbis?: number | null
          metadata?: Json | null
          ncf: string
          ncf_type: Database["public"]["Enums"]["ncf_type"]
          rnc_supplier?: string | null
          supplier_name?: string | null
          total: number
          transaction_date: string
          validated_at?: string | null
        }
        Update: {
          amount?: number
          company_id?: string
          created_at?: string | null
          id?: string
          is_validated?: boolean | null
          itbis?: number | null
          metadata?: Json | null
          ncf?: string
          ncf_type?: Database["public"]["Enums"]["ncf_type"]
          rnc_supplier?: string | null
          supplier_name?: string | null
          total?: number
          transaction_date?: string
          validated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ncf_records_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          channel: Database["public"]["Enums"]["notification_channel"]
          created_at: string | null
          enabled: boolean | null
          event_type: string
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          channel: Database["public"]["Enums"]["notification_channel"]
          created_at?: string | null
          enabled?: boolean | null
          event_type: string
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          channel?: Database["public"]["Enums"]["notification_channel"]
          created_at?: string | null
          enabled?: boolean | null
          event_type?: string
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          channel: Database["public"]["Enums"]["notification_channel"] | null
          created_at: string | null
          data: Json | null
          id: string
          is_read: boolean | null
          message: string
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          channel?: Database["public"]["Enums"]["notification_channel"] | null
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message: string
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          channel?: Database["public"]["Enums"]["notification_channel"] | null
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string | null
          company_id: string
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          itbis_rate: number | null
          metadata: Json | null
          product_name: string
          sku: string | null
          unit_price: number
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          company_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          itbis_rate?: number | null
          metadata?: Json | null
          product_name: string
          sku?: string | null
          unit_price: number
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          company_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          itbis_rate?: number | null
          metadata?: Json | null
          product_name?: string
          sku?: string | null
          unit_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      recipients: {
        Row: {
          account_number: string
          account_type: string | null
          bank_name: string
          company_id: string
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          is_favorite: boolean | null
          is_verified: boolean | null
          last_used_at: string | null
          metadata: Json | null
          notes: string | null
          phone: string | null
          recipient_name: string
          recipient_type: string | null
          rnc_cedula: string | null
          swift_code: string | null
          updated_at: string | null
          verification_method: string | null
          verified_at: string | null
        }
        Insert: {
          account_number: string
          account_type?: string | null
          bank_name: string
          company_id: string
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_favorite?: boolean | null
          is_verified?: boolean | null
          last_used_at?: string | null
          metadata?: Json | null
          notes?: string | null
          phone?: string | null
          recipient_name: string
          recipient_type?: string | null
          rnc_cedula?: string | null
          swift_code?: string | null
          updated_at?: string | null
          verification_method?: string | null
          verified_at?: string | null
        }
        Update: {
          account_number?: string
          account_type?: string | null
          bank_name?: string
          company_id?: string
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_favorite?: boolean | null
          is_verified?: boolean | null
          last_used_at?: string | null
          metadata?: Json | null
          notes?: string | null
          phone?: string | null
          recipient_name?: string
          recipient_type?: string | null
          rnc_cedula?: string | null
          swift_code?: string | null
          updated_at?: string | null
          verification_method?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recipients_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          account_id: string
          amount: number
          balance_after: number
          category: string | null
          counterparty_account: string | null
          counterparty_bank: string | null
          counterparty_name: string | null
          created_at: string | null
          currency: Database["public"]["Enums"]["currency_code"]
          description: string | null
          external_id: string | null
          id: string
          is_tax_deductible: boolean | null
          itbis_amount: number | null
          itbis_rate: number | null
          metadata: Json | null
          ncf: string | null
          posted_date: string | null
          reference_number: string | null
          status: Database["public"]["Enums"]["transaction_status"] | null
          tags: string[] | null
          transaction_date: string | null
          transaction_type: Database["public"]["Enums"]["transaction_type"]
        }
        Insert: {
          account_id: string
          amount: number
          balance_after: number
          category?: string | null
          counterparty_account?: string | null
          counterparty_bank?: string | null
          counterparty_name?: string | null
          created_at?: string | null
          currency: Database["public"]["Enums"]["currency_code"]
          description?: string | null
          external_id?: string | null
          id?: string
          is_tax_deductible?: boolean | null
          itbis_amount?: number | null
          itbis_rate?: number | null
          metadata?: Json | null
          ncf?: string | null
          posted_date?: string | null
          reference_number?: string | null
          status?: Database["public"]["Enums"]["transaction_status"] | null
          tags?: string[] | null
          transaction_date?: string | null
          transaction_type: Database["public"]["Enums"]["transaction_type"]
        }
        Update: {
          account_id?: string
          amount?: number
          balance_after?: number
          category?: string | null
          counterparty_account?: string | null
          counterparty_bank?: string | null
          counterparty_name?: string | null
          created_at?: string | null
          currency?: Database["public"]["Enums"]["currency_code"]
          description?: string | null
          external_id?: string | null
          id?: string
          is_tax_deductible?: boolean | null
          itbis_amount?: number | null
          itbis_rate?: number | null
          metadata?: Json | null
          ncf?: string | null
          posted_date?: string | null
          reference_number?: string | null
          status?: Database["public"]["Enums"]["transaction_status"] | null
          tags?: string[] | null
          transaction_date?: string | null
          transaction_type?: Database["public"]["Enums"]["transaction_type"]
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      transfers: {
        Row: {
          amount: number
          approved_at: string | null
          approved_by: string | null
          completed_at: string | null
          confirmation_number: string | null
          created_at: string | null
          currency: Database["public"]["Enums"]["currency_code"]
          description: string | null
          exchange_rate: number | null
          executed_at: string | null
          external_reference: string | null
          fee_amount: number | null
          from_account_id: string
          id: string
          initiated_by: string
          is_recurring: boolean | null
          is_scheduled: boolean | null
          metadata: Json | null
          recipient_account: string
          recipient_bank: string | null
          recipient_name: string
          recipient_rnc_cedula: string | null
          recurrence_rule: Json | null
          reference: string | null
          requires_approval: boolean | null
          scheduled_date: string | null
          status: Database["public"]["Enums"]["transaction_status"] | null
          to_account_id: string | null
          transfer_type: Database["public"]["Enums"]["transfer_type"]
        }
        Insert: {
          amount: number
          approved_at?: string | null
          approved_by?: string | null
          completed_at?: string | null
          confirmation_number?: string | null
          created_at?: string | null
          currency: Database["public"]["Enums"]["currency_code"]
          description?: string | null
          exchange_rate?: number | null
          executed_at?: string | null
          external_reference?: string | null
          fee_amount?: number | null
          from_account_id: string
          id?: string
          initiated_by: string
          is_recurring?: boolean | null
          is_scheduled?: boolean | null
          metadata?: Json | null
          recipient_account: string
          recipient_bank?: string | null
          recipient_name: string
          recipient_rnc_cedula?: string | null
          recurrence_rule?: Json | null
          reference?: string | null
          requires_approval?: boolean | null
          scheduled_date?: string | null
          status?: Database["public"]["Enums"]["transaction_status"] | null
          to_account_id?: string | null
          transfer_type: Database["public"]["Enums"]["transfer_type"]
        }
        Update: {
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          completed_at?: string | null
          confirmation_number?: string | null
          created_at?: string | null
          currency?: Database["public"]["Enums"]["currency_code"]
          description?: string | null
          exchange_rate?: number | null
          executed_at?: string | null
          external_reference?: string | null
          fee_amount?: number | null
          from_account_id?: string
          id?: string
          initiated_by?: string
          is_recurring?: boolean | null
          is_scheduled?: boolean | null
          metadata?: Json | null
          recipient_account?: string
          recipient_bank?: string | null
          recipient_name?: string
          recipient_rnc_cedula?: string | null
          recurrence_rule?: Json | null
          reference?: string | null
          requires_approval?: boolean | null
          scheduled_date?: string | null
          status?: Database["public"]["Enums"]["transaction_status"] | null
          to_account_id?: string | null
          transfer_type?: Database["public"]["Enums"]["transfer_type"]
        }
        Relationships: [
          {
            foreignKeyName: "transfers_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfers_from_account_id_fkey"
            columns: ["from_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfers_initiated_by_fkey"
            columns: ["initiated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfers_to_account_id_fkey"
            columns: ["to_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          backup_codes: string[] | null
          cedula: string | null
          company_id: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          is_active: boolean | null
          last_login_at: string | null
          last_login_ip: unknown
          metadata: Json | null
          permissions: Json | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          two_factor_enabled: boolean | null
          two_factor_secret: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          backup_codes?: string[] | null
          cedula?: string | null
          company_id?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id: string
          is_active?: boolean | null
          last_login_at?: string | null
          last_login_ip?: unknown
          metadata?: Json | null
          permissions?: Json | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          two_factor_enabled?: boolean | null
          two_factor_secret?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          backup_codes?: string[] | null
          cedula?: string | null
          company_id?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          last_login_ip?: unknown
          metadata?: Json | null
          permissions?: Json | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          two_factor_enabled?: boolean | null
          two_factor_secret?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_itbis: {
        Args: { amount: number; rate?: number }
        Returns: number
      }
      generate_account_number: { Args: never; Returns: string }
    }
    Enums: {
      account_status: "active" | "suspended" | "closed" | "pending_verification"
      account_type: "checking" | "savings"
      card_status: "active" | "frozen" | "cancelled" | "pending"
      card_type: "virtual" | "physical"
      currency_code: "DOP" | "USD"
      invoice_status: "draft" | "pending" | "paid" | "overdue" | "cancelled"
      kyc_status:
        | "pending"
        | "in_review"
        | "approved"
        | "rejected"
        | "requires_update"
      ncf_type: "B01" | "B02" | "B14" | "B15" | "B16"
      notification_channel: "email" | "sms" | "push" | "in_app"
      transaction_status: "pending" | "completed" | "failed" | "reversed"
      transaction_type: "credit" | "debit" | "transfer" | "fee" | "adjustment"
      transfer_type: "internal" | "tef" | "ach" | "international"
      user_role: "owner" | "admin" | "accountant" | "employee" | "viewer"
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
      account_status: ["active", "suspended", "closed", "pending_verification"],
      account_type: ["checking", "savings"],
      card_status: ["active", "frozen", "cancelled", "pending"],
      card_type: ["virtual", "physical"],
      currency_code: ["DOP", "USD"],
      invoice_status: ["draft", "pending", "paid", "overdue", "cancelled"],
      kyc_status: [
        "pending",
        "in_review",
        "approved",
        "rejected",
        "requires_update",
      ],
      ncf_type: ["B01", "B02", "B14", "B15", "B16"],
      notification_channel: ["email", "sms", "push", "in_app"],
      transaction_status: ["pending", "completed", "failed", "reversed"],
      transaction_type: ["credit", "debit", "transfer", "fee", "adjustment"],
      transfer_type: ["internal", "tef", "ach", "international"],
      user_role: ["owner", "admin", "accountant", "employee", "viewer"],
    },
  },
} as const
