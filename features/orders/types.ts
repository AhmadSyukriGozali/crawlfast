export type OrderItem = {
  id: string;
  product_name: string;
  size: string;
  unit_price: number;
  quantity: number;
  line_total: number;
};

export type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address?: string;
  shipping_city: string;
  shipping_province: string;
  shipping_postal_code?: string;
  customer_notes?: string | null;
  subtotal: number;
  shipping_cost: number;
  total_amount: number;
  currency: string;
  order_status: string;
  payment_status: string;
  payment_gateway: string;
  created_at: string;
  paid_at: string | null;
  order_items: OrderItem[];
};


export type AdminOrdersResponse = {
  orders?: Order[];
  pagination?: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
  error?: string;
};


export type AdminMeResponse = {
  email?: string;
  error?: string;
};