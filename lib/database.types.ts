export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      family_photos: {
        Row: {
          id: string
          url: string
          caption: string | null
          date: string
          event_type: 'holiday' | 'birthday' | 'dinner' | 'other'
          created_by: string
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          url: string
          caption?: string | null
          date: string
          event_type: 'holiday' | 'birthday' | 'dinner' | 'other'
          created_by: string
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          url?: string
          caption?: string | null
          date?: string
          event_type?: 'holiday' | 'birthday' | 'dinner' | 'other'
          created_by?: string
          created_at?: string
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
      [_ in never]: never
    }
  }
} 