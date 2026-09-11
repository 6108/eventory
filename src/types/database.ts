Need to install the following packages:
supabase@2.117.0
Ok to proceed? (y) 
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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      booth_artists: {
        Row: {
          artist_id: string
          artist_name: string | null
          booth_id: string
          created_at: string | null
        }
        Insert: {
          artist_id: string
          artist_name?: string | null
          booth_id: string
          created_at?: string | null
        }
        Update: {
          artist_id?: string
          artist_name?: string | null
          booth_id?: string
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booth_artists_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booth_artists_booth_id_fkey"
            columns: ["booth_id"]
            isOneToOne: false
            referencedRelation: "booths"
            referencedColumns: ["id"]
          },
        ]
      }
      booth_codes: {
        Row: {
          booth_id: string
          code: string
          created_at: string | null
        }
        Insert: {
          booth_id: string
          code: string
          created_at?: string | null
        }
        Update: {
          booth_id?: string
          code?: string
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booth_codes_booth_id_fkey"
            columns: ["booth_id"]
            isOneToOne: true
            referencedRelation: "booths"
            referencedColumns: ["id"]
          },
        ]
      }
      booth_follows: {
        Row: {
          booth_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          booth_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          booth_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "booth_follows_booth_id_fkey"
            columns: ["booth_id"]
            isOneToOne: false
            referencedRelation: "booths"
            referencedColumns: ["id"]
          },
        ]
      }
      booth_notices: {
        Row: {
          booth_id: string | null
          content: string | null
          created_at: string | null
          id: string
          title: string
        }
        Insert: {
          booth_id?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          title: string
        }
        Update: {
          booth_id?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "booth_notices_booth_id_fkey"
            columns: ["booth_id"]
            isOneToOne: false
            referencedRelation: "booths"
            referencedColumns: ["id"]
          },
        ]
      }
      booths: {
        Row: {
          artist_names: string[] | null
          booth_name: string
          booth_number: string
          category: Database["public"]["Enums"]["booth_category"]
          created_at: string | null
          description: string | null
          event_id: string
          id: string
        }
        Insert: {
          artist_names?: string[] | null
          booth_name: string
          booth_number: string
          category?: Database["public"]["Enums"]["booth_category"]
          created_at?: string | null
          description?: string | null
          event_id: string
          id?: string
        }
        Update: {
          artist_names?: string[] | null
          booth_name?: string
          booth_number?: string
          category?: Database["public"]["Enums"]["booth_category"]
          created_at?: string | null
          description?: string | null
          event_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "booths_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_items: {
        Row: {
          created_at: string | null
          id: string
          option_id: string | null
          option_key: string | null
          product_id: string
          purchased: boolean
          quantity: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          option_id?: string | null
          option_key?: string | null
          product_id: string
          purchased?: boolean
          quantity?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          option_id?: string | null
          option_key?: string | null
          product_id?: string
          purchased?: boolean
          quantity?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "product_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          cancelled_quantity: number
          id: string
          option_id: string | null
          option_name: string | null
          order_id: string | null
          product_id: string | null
          product_name: string
          quantity: number
          subtotal: number
          unit_price: number
        }
        Insert: {
          cancelled_quantity?: number
          id?: string
          option_id?: string | null
          option_name?: string | null
          order_id?: string | null
          product_id?: string | null
          product_name: string
          quantity: number
          subtotal: number
          unit_price: number
        }
        Update: {
          cancelled_quantity?: number
          id?: string
          option_id?: string | null
          option_name?: string | null
          order_id?: string | null
          product_id?: string | null
          product_name?: string
          quantity?: number
          subtotal?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "product_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_request_items: {
        Row: {
          id: string
          option_id: string | null
          option_name: string | null
          order_request_id: string
          product_id: string
          product_name: string
          quantity: number
        }
        Insert: {
          id?: string
          option_id?: string | null
          option_name?: string | null
          order_request_id: string
          product_id: string
          product_name: string
          quantity: number
        }
        Update: {
          id?: string
          option_id?: string | null
          option_name?: string | null
          order_request_id?: string
          product_id?: string
          product_name?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_request_items_order_request_id_fkey"
            columns: ["order_request_id"]
            isOneToOne: false
            referencedRelation: "order_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      order_requests: {
        Row: {
          booth_id: string
          created_at: string
          customer_id: string
          customer_nickname: string
          id: string
          order_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          booth_id: string
          created_at?: string
          customer_id: string
          customer_nickname: string
          id?: string
          order_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          booth_id?: string
          created_at?: string
          customer_id?: string
          customer_nickname?: string
          id?: string
          order_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_requests_booth_id_fkey"
            columns: ["booth_id"]
            isOneToOne: false
            referencedRelation: "booths"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_requests_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          booth_id: string
          cancelled_at: string | null
          client_transaction_id: string
          created_at: string
          id: string
          status: Database["public"]["Enums"]["order_status"]
          total_amount: number
          total_quantity: number
        }
        Insert: {
          booth_id: string
          cancelled_at?: string | null
          client_transaction_id: string
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["order_status"]
          total_amount: number
          total_quantity: number
        }
        Update: {
          booth_id?: string
          cancelled_at?: string | null
          client_transaction_id?: string
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["order_status"]
          total_amount?: number
          total_quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "orders_booth_id_fkey"
            columns: ["booth_id"]
            isOneToOne: false
            referencedRelation: "booths"
            referencedColumns: ["id"]
          },
        ]
      }
      prepaid: {
        Row: {
          booth_id: string
          checked: boolean
          created_at: string
          id: string
          row_data: Json
        }
        Insert: {
          booth_id: string
          checked?: boolean
          created_at?: string
          id?: string
          row_data: Json
        }
        Update: {
          booth_id?: string
          checked?: boolean
          created_at?: string
          id?: string
          row_data?: Json
        }
        Relationships: [
          {
            foreignKeyName: "prepaid_booth_id_fkey"
            columns: ["booth_id"]
            isOneToOne: false
            referencedRelation: "booths"
            referencedColumns: ["id"]
          },
        ]
      }
      product_likes: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_likes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      product_options: {
        Row: {
          created_at: string | null
          id: string
          initial_quantity: number | null
          name: string
          price: number | null
          product_id: string | null
          remaining_quantity: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          initial_quantity?: number | null
          name: string
          price?: number | null
          product_id?: string | null
          remaining_quantity?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          initial_quantity?: number | null
          name?: string
          price?: number | null
          product_id?: string | null
          remaining_quantity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_options_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          artist_ids: string[] | null
          artist_names: string[]
          booth_id: string
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          initial_quantity: number | null
          main_image: string | null
          name: string
          price: number
          purchase_limit: number | null
          remaining_quantity: number | null
          sample_images: string[] | null
          sub_category: string | null
          visible: boolean
        }
        Insert: {
          artist_ids?: string[] | null
          artist_names?: string[]
          booth_id: string
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          initial_quantity?: number | null
          main_image?: string | null
          name: string
          price: number
          purchase_limit?: number | null
          remaining_quantity?: number | null
          sample_images?: string[] | null
          sub_category?: string | null
          visible?: boolean
        }
        Update: {
          artist_ids?: string[] | null
          artist_names?: string[]
          booth_id?: string
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          initial_quantity?: number | null
          main_image?: string | null
          name?: string
          price?: number
          purchase_limit?: number | null
          remaining_quantity?: number | null
          sample_images?: string[] | null
          sub_category?: string | null
          visible?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "products_booth_id_fkey"
            columns: ["booth_id"]
            isOneToOne: false
            referencedRelation: "booths"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          last_notice_seen_at: string | null
          name: string | null
          profile_image: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: string
          last_notice_seen_at?: string | null
          name?: string | null
          profile_image?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          last_notice_seen_at?: string | null
          name?: string | null
          profile_image?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cancel_order: { Args: { p_order_id: string }; Returns: undefined }
      cancel_order_item: {
        Args: { p_cancel_quantity: number; p_order_item_id: string }
        Returns: Json
      }
      claim_booth: {
        Args: { p_booth_number: string; p_code: string }
        Returns: string
      }
      create_order: {
        Args: {
          p_booth_id: string
          p_client_transaction_id: string
          p_items: Json
          p_order_request_ids?: string[]
        }
        Returns: string
      }
      create_order_request: {
        Args: { p_booth_id: string; p_customer_nickname: string; p_items: Json }
        Returns: string
      }
      get_booth_code: { Args: { p_booth_id: string }; Returns: string }
      my_booth_ids: { Args: never; Returns: string[] }
      remove_booth_artist: {
        Args: { p_artist_id: string; p_booth_id: string }
        Returns: undefined
      }
      sync_artist_name: {
        Args: { p_new_name: string; p_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      booth_category: "ADULT" | "GENERAL"
      order_status: "completed" | "cancelled"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      booth_category: ["ADULT", "GENERAL"],
      order_status: ["completed", "cancelled"],
    },
  },
} as const
