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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      admin_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
        }
        Relationships: []
      }
      courts: {
        Row: {
          address: string | null
          created_at: string
          id: string
          name: string
          province_id: string | null
          updated_at: string
          ward_id: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          name: string
          province_id?: string | null
          updated_at?: string
          ward_id?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          name?: string
          province_id?: string | null
          updated_at?: string
          ward_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "courts_province_id_fkey"
            columns: ["province_id"]
            isOneToOne: false
            referencedRelation: "provinces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courts_ward_id_fkey"
            columns: ["ward_id"]
            isOneToOne: false
            referencedRelation: "wards"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          admin_notes: string | null
          confirmation_deadline: string | null
          court_id: string | null
          created_at: string
          creator_id: string
          creator_rank_after: number | null
          creator_rank_before: number | null
          creator_score: Json | null
          id: string
          match_date: string | null
          match_type: Database["public"]["Enums"]["match_type"]
          min_point_difference: number
          opponent_id: string | null
          opponent_rank_after: number | null
          opponent_rank_before: number | null
          opponent_score: Json | null
          points_gained_creator: number | null
          points_gained_opponent: number | null
          points_to_win: number
          status: Database["public"]["Enums"]["match_status"]
          suggested_handicap: number | null
          total_sets: number
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          confirmation_deadline?: string | null
          court_id?: string | null
          created_at?: string
          creator_id: string
          creator_rank_after?: number | null
          creator_rank_before?: number | null
          creator_score?: Json | null
          id?: string
          match_date?: string | null
          match_type: Database["public"]["Enums"]["match_type"]
          min_point_difference?: number
          opponent_id?: string | null
          opponent_rank_after?: number | null
          opponent_rank_before?: number | null
          opponent_score?: Json | null
          points_gained_creator?: number | null
          points_gained_opponent?: number | null
          points_to_win?: number
          status?: Database["public"]["Enums"]["match_status"]
          suggested_handicap?: number | null
          total_sets?: number
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          confirmation_deadline?: string | null
          court_id?: string | null
          created_at?: string
          creator_id?: string
          creator_rank_after?: number | null
          creator_rank_before?: number | null
          creator_score?: Json | null
          id?: string
          match_date?: string | null
          match_type?: Database["public"]["Enums"]["match_type"]
          min_point_difference?: number
          opponent_id?: string | null
          opponent_rank_after?: number | null
          opponent_rank_before?: number | null
          opponent_score?: Json | null
          points_gained_creator?: number | null
          points_gained_opponent?: number | null
          points_to_win?: number
          status?: Database["public"]["Enums"]["match_status"]
          suggested_handicap?: number | null
          total_sets?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_court_id_fkey"
            columns: ["court_id"]
            isOneToOne: false
            referencedRelation: "courts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_opponent_id_fkey"
            columns: ["opponent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_opponent_id_fkey"
            columns: ["opponent_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      news_categories: {
        Row: {
          id: string
          name: string
          slug: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      news_posts: {
        Row: {
          author_profile_id: string | null
          category_id: string | null
          content: string | null
          cover_image_url: string | null
          created_at: string
          highlight: boolean | null
          id: string
          published_at: string | null
          slug: string
          status: Database["public"]["Enums"]["post_status"] | null
          summary: string | null
          title: string
          updated_at: string
        }
        Insert: {
          author_profile_id?: string | null
          category_id?: string | null
          content?: string | null
          cover_image_url?: string | null
          created_at?: string
          highlight?: boolean | null
          id?: string
          published_at?: string | null
          slug: string
          status?: Database["public"]["Enums"]["post_status"] | null
          summary?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          author_profile_id?: string | null
          category_id?: string | null
          content?: string | null
          cover_image_url?: string | null
          created_at?: string
          highlight?: boolean | null
          id?: string
          published_at?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["post_status"] | null
          summary?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_posts_author_profile_id_fkey"
            columns: ["author_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_posts_author_profile_id_fkey"
            columns: ["author_profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "news_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_code: string
          address: string | null
          avatar_url: string | null
          birthday: string | null
          created_at: string
          current_rank: number | null
          email: string | null
          full_name: string
          gender: Database["public"]["Enums"]["gender_type"]
          id: string
          losses: number | null
          phone: string | null
          province_id: string | null
          total_matches: number | null
          updated_at: string
          user_id: string
          ward_id: string | null
          wins: number | null
        }
        Insert: {
          account_code: string
          address?: string | null
          avatar_url?: string | null
          birthday?: string | null
          created_at?: string
          current_rank?: number | null
          email?: string | null
          full_name: string
          gender: Database["public"]["Enums"]["gender_type"]
          id?: string
          losses?: number | null
          phone?: string | null
          province_id?: string | null
          total_matches?: number | null
          updated_at?: string
          user_id: string
          ward_id?: string | null
          wins?: number | null
        }
        Update: {
          account_code?: string
          address?: string | null
          avatar_url?: string | null
          birthday?: string | null
          created_at?: string
          current_rank?: number | null
          email?: string | null
          full_name?: string
          gender?: Database["public"]["Enums"]["gender_type"]
          id?: string
          losses?: number | null
          phone?: string | null
          province_id?: string | null
          total_matches?: number | null
          updated_at?: string
          user_id?: string
          ward_id?: string | null
          wins?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_province_id_fkey"
            columns: ["province_id"]
            isOneToOne: false
            referencedRelation: "provinces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_ward_id_fkey"
            columns: ["ward_id"]
            isOneToOne: false
            referencedRelation: "wards"
            referencedColumns: ["id"]
          },
        ]
      }
      provinces: {
        Row: {
          code: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      rank_events: {
        Row: {
          created_at: string
          delta: number
          id: string
          match_id: string | null
          new_score: number | null
          old_score: number | null
          profile_id: string
          reason: string | null
        }
        Insert: {
          created_at?: string
          delta: number
          id?: string
          match_id?: string | null
          new_score?: number | null
          old_score?: number | null
          profile_id: string
          reason?: string | null
        }
        Update: {
          created_at?: string
          delta?: number
          id?: string
          match_id?: string | null
          new_score?: number | null
          old_score?: number | null
          profile_id?: string
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rank_events_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rank_events_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rank_events_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      wards: {
        Row: {
          code: string
          created_at: string
          id: string
          name: string
          province_id: string | null
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          name: string
          province_id?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          name?: string
          province_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wards_province_id_fkey"
            columns: ["province_id"]
            isOneToOne: false
            referencedRelation: "provinces"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      public_profiles: {
        Row: {
          account_code: string | null
          avatar_url: string | null
          created_at: string | null
          current_rank: number | null
          full_name: string | null
          gender: Database["public"]["Enums"]["gender_type"] | null
          id: string | null
          losses: number | null
          province_id: string | null
          total_matches: number | null
          updated_at: string | null
          ward_id: string | null
          wins: number | null
        }
        Insert: {
          account_code?: string | null
          avatar_url?: string | null
          created_at?: string | null
          current_rank?: number | null
          full_name?: string | null
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id?: string | null
          losses?: number | null
          province_id?: string | null
          total_matches?: number | null
          updated_at?: string | null
          ward_id?: string | null
          wins?: number | null
        }
        Update: {
          account_code?: string | null
          avatar_url?: string | null
          created_at?: string | null
          current_rank?: number | null
          full_name?: string | null
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id?: string | null
          losses?: number | null
          province_id?: string | null
          total_matches?: number | null
          updated_at?: string | null
          ward_id?: string | null
          wins?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_province_id_fkey"
            columns: ["province_id"]
            isOneToOne: false
            referencedRelation: "provinces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_ward_id_fkey"
            columns: ["ward_id"]
            isOneToOne: false
            referencedRelation: "wards"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      apply_match_result: {
        Args: { p_match_id: string }
        Returns: undefined
      }
      expire_stale_matches: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_account_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_public_profile: {
        Args: { profile_id: string }
        Returns: {
          account_code: string
          avatar_url: string
          created_at: string
          current_rank: number
          full_name: string
          gender: Database["public"]["Enums"]["gender_type"]
          id: string
          losses: number
          province_id: string
          total_matches: number
          updated_at: string
          ward_id: string
          wins: number
        }[]
      }
      get_public_profile_data: {
        Args: { profile_id: string }
        Returns: {
          account_code: string
          avatar_url: string
          current_rank: number
          full_name: string
          gender: Database["public"]["Enums"]["gender_type"]
          id: string
          losses: number
          total_matches: number
          wins: number
        }[]
      }
      get_setting_int: {
        Args: { p_default: number; p_key: string }
        Returns: number
      }
      get_setting_numeric: {
        Args: { p_default: number; p_key: string }
        Returns: number
      }
    }
    Enums: {
      gender_type: "male" | "female" | "other"
      match_status: "pending" | "confirmed" | "completed" | "expired"
      match_type: "singles" | "doubles"
      post_status: "draft" | "published"
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
      gender_type: ["male", "female", "other"],
      match_status: ["pending", "confirmed", "completed", "expired"],
      match_type: ["singles", "doubles"],
      post_status: ["draft", "published"],
    },
  },
} as const
