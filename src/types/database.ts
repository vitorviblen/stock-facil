export type UserRole = "admin" | "operator" | "cliente";
export type MovementType = "in" | "out" | "adjustment";
export type OrderStatus = "pending" | "approved" | "shipped" | "delivered" | "cancelled";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  active: boolean;
  created_at: string;
}

export type Product = {
  id: string;
  code: string;
  name: string;
  cost_price: number;
  sale_price: number;
  quantity: number;
  min_stock: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export type StockMovement = {
  id: string;
  product_id: string;
  type: MovementType;
  quantity: number;
  user_id: string;
  reference_id: string | null;
  notes: string | null;
  created_at: string;
}

export type Sale = {
  id: string;
  user_id: string;
  total: number;
  created_at: string;
}

export type SaleItem = {
  id: string;
  sale_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export type Order = {
  id: string;
  code: string;
  customer_id: string;
  operator_id: string | null;
  status: OrderStatus;
  total: number;
  shipping_address: string | null;
  shipping_method: string | null;
  tracking_code: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "12.2.3";
  };
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          full_name: string;
          email: string;
          role?: UserRole;
          active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          role?: UserRole;
          active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: Product;
        Insert: {
          id?: string;
          code?: string;
          name: string;
          cost_price?: number;
          sale_price?: number;
          quantity?: number;
          min_stock?: number;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          cost_price?: number;
          sale_price?: number;
          quantity?: number;
          min_stock?: number;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      stock_movements: {
        Row: StockMovement;
        Insert: {
          id?: string;
          product_id: string;
          type: MovementType;
          quantity: number;
          user_id: string;
          reference_id?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          type?: MovementType;
          quantity?: number;
          user_id?: string;
          reference_id?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      sales: {
        Row: Sale;
        Insert: {
          id?: string;
          user_id: string;
          total?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          total?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      sale_items: {
        Row: SaleItem;
        Insert: {
          id?: string;
          sale_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          subtotal: number;
        };
        Update: {
          id?: string;
          sale_id?: string;
          product_id?: string;
          quantity?: number;
          unit_price?: number;
          subtotal?: number;
        };
        Relationships: [];
      };
      orders: {
        Row: Order;
        Insert: {
          id?: string;
          code?: string;
          customer_id: string;
          operator_id?: string | null;
          status?: OrderStatus;
          total?: number;
          shipping_address?: string | null;
          shipping_method?: string | null;
          tracking_code?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          customer_id?: string;
          operator_id?: string | null;
          status?: OrderStatus;
          total?: number;
          shipping_address?: string | null;
          shipping_method?: string | null;
          tracking_code?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      order_items: {
        Row: OrderItem;
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          subtotal: number;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          quantity?: number;
          unit_price?: number;
          subtotal?: number;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      register_sale: {
        Args: {
          p_user_id: string;
          p_items: Json;
        };
        Returns: string;
      };
      add_stock: {
        Args: {
          p_product_id: string;
          p_quantity: number;
          p_user_id: string;
          p_notes?: string;
        };
        Returns: undefined;
      };
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      create_order: {
        Args: {
          p_customer_id: string;
          p_items: Json;
          p_shipping_address: string;
          p_shipping_method?: string;
        };
        Returns: string;
      };
      update_order_status: {
        Args: {
          p_order_id: string;
          p_status: OrderStatus;
          p_operator_id: string;
          p_tracking_code?: string;
        };
        Returns: undefined;
      };
    };
    Enums: {
      user_role: UserRole;
      movement_type: MovementType;
      order_status: OrderStatus;
    };
    CompositeTypes: { [_ in never]: never };
  };
};
