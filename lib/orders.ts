import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  notes: string;
  status: OrderStatus;
  createdAt: string;
}

interface DbOrderRow {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  items: OrderItem[];
  subtotal: number;
  shipping_fee: number;
  total: number;
  notes: string;
  status: OrderStatus;
  created_at: string;
}

const LOCAL_ORDERS_KEY = "bloom_orders";

function mapDbOrder(row: DbOrderRow): Order {
  return {
    id: row.id,
    orderNumber: row.order_number,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    shippingAddress: row.shipping_address,
    items: Array.isArray(row.items) ? row.items : [],
    subtotal: row.subtotal,
    shippingFee: row.shipping_fee,
    total: row.total,
    notes: row.notes || "",
    status: row.status || "pending",
    createdAt: row.created_at,
  };
}

export async function createOrderInDb(input: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  notes: string;
}): Promise<{ order: Order | null; error?: string }> {
  if (!supabase || !isSupabaseConfigured) {
    const localOrder: Order = {
      id: `ord-${Date.now()}`,
      ...input,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    if (typeof window !== "undefined") {
      try {
        const existing: Order[] = JSON.parse(
          localStorage.getItem(LOCAL_ORDERS_KEY) || "[]"
        );
        localStorage.setItem(
          LOCAL_ORDERS_KEY,
          JSON.stringify([localOrder, ...existing])
        );
      } catch {
        // ignore
      }
    }
    return { order: localOrder };
  }

  const { data, error } = await supabase
    .from("orders")
    .insert({
      order_number: input.orderNumber,
      customer_name: input.customerName,
      customer_email: input.customerEmail,
      customer_phone: input.customerPhone,
      shipping_address: input.shippingAddress,
      items: input.items,
      subtotal: input.subtotal,
      shipping_fee: input.shippingFee,
      total: input.total,
      notes: input.notes,
      status: "pending",
    })
    .select()
    .single();

  if (error || !data) {
    return {
      order: null,
      error: error?.message || "Could not save order.",
    };
  }

  return { order: mapDbOrder(data as DbOrderRow) };
}

export async function fetchOrders(): Promise<{
  orders: Order[];
  error?: string;
}> {
  if (!supabase || !isSupabaseConfigured) {
    if (typeof window === "undefined") return { orders: [] };
    try {
      const stored = localStorage.getItem(LOCAL_ORDERS_KEY);
      return { orders: stored ? (JSON.parse(stored) as Order[]) : [] };
    } catch {
      return { orders: [] };
    }
  }

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return { orders: [], error: error.message };
  }

  return { orders: (data as DbOrderRow[]).map(mapDbOrder) };
}

export async function updateOrderStatusInDb(
  id: string,
  status: OrderStatus
): Promise<{ error?: string }> {
  if (!supabase || !isSupabaseConfigured) {
    if (typeof window !== "undefined") {
      try {
        const existing: Order[] = JSON.parse(
          localStorage.getItem(LOCAL_ORDERS_KEY) || "[]"
        );
        const updated = existing.map((o) =>
          o.id === id ? { ...o, status } : o
        );
        localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
    }
    return {};
  }

  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id);

  if (error) return { error: error.message };
  return {};
}
