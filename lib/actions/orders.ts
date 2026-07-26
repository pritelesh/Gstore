"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

interface CartOrderItemRow {
  product_id: number;
  quantity: number;
  product: { name: string; price: number; images: unknown }[] | null;
}

interface OrderJoinRow {
  id: number;
  total: number;
  status: string;
  courier_name: string | null;
  tracking_status: string | null;
  created_at: string;
  items: OrderItemJoinRow[] | null;
}

interface OrderItemJoinRow {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
  product: { name: string; images: unknown }[] | null;
}

export interface OrderResult {
  id: number;
  total: number;
  status: string;
  courier_name: string | null;
  tracking_status: string | null;
  created_at: string;
  items: {
    id: number;
    product_id: number;
    product_name: string;
    product_image: string | null;
    quantity: number;
    price: number;
  }[];
}

export async function placeOrder(): Promise<{ orderId: number } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please log in to place an order." };

  const { data: cartItems, error: cartError } = await supabase
    .from("cart_items")
    .select(`
      product_id,
      quantity,
      product:products(name, price, images)
    `)
    .eq("customer_id", user.id);

  if (cartError) return { error: cartError.message };
  if (!cartItems || cartItems.length === 0)
    return { error: "Your cart is empty." };

  const items = (cartItems as CartOrderItemRow[]).map((row) => ({
    product_id: row.product_id,
    quantity: row.quantity,
    price: row.product?.[0]?.price ?? 0,
  }));

  const total = items.reduce(
    (sum, i) => sum + Number(i.price) * i.quantity,
    0,
  );

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_id: user.id,
      total,
      status: "pending",
      courier_name: null,
      tracking_status: null,
    })
    .select("id")
    .single();

  if (orderError) return { error: orderError.message };

  const orderItems = items.map((i) => ({
    order_id: order.id,
    product_id: i.product_id,
    quantity: i.quantity,
    price: i.price,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (itemsError) return { error: itemsError.message };

  await supabase
    .from("cart_items")
    .delete()
    .eq("customer_id", user.id);

  return { orderId: order.id };
}

export async function getMyOrders(): Promise<
  { orders: OrderResult[] } | { error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const { data: orders, error } = await supabase
    .from("orders")
    .select(`
      id, total, status, courier_name, tracking_status, created_at,
      items:order_items(
        id, product_id, quantity, price,
        product:products(name, images)
      )
    `)
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return { error: error.message };

  const formatted = ((orders ?? []) as OrderJoinRow[]).map((o) => ({
    id: o.id,
    total: o.total,
    status: o.status,
    courier_name: o.courier_name,
    tracking_status: o.tracking_status,
    created_at: o.created_at,
    items: (o.items ?? []).map((oi: OrderItemJoinRow) => ({
      id: oi.id,
      product_id: oi.product_id,
      product_name: oi.product?.[0]?.name ?? "Unknown",
      product_image:
        Array.isArray(oi.product?.[0]?.images) &&
        oi.product[0].images.length > 0
          ? oi.product[0].images[0]
          : null,
      quantity: oi.quantity,
      price: oi.price,
    })),
  }));

  return { orders: formatted };
}

export async function updateOrderTracking(
  orderId: string,
  data: {
    courier_name?: string | null;
    tracking_status?: string | null;
    status?: string;
  },
): Promise<{ success: true } | { error: string }> {
  const supabase = createAdminClient();
  const numId = Number(orderId);
  if (isNaN(numId)) return { error: "Invalid order ID." };

  const updates: Record<string, unknown> = {};
  if (data.courier_name !== undefined) updates.courier_name = data.courier_name;
  if (data.tracking_status !== undefined) updates.tracking_status = data.tracking_status;
  if (data.status !== undefined) updates.status = data.status;

  if (Object.keys(updates).length === 0) {
    return { error: "No fields to update." };
  }

  const { error } = await supabase
    .from("orders")
    .update(updates)
    .eq("id", numId);

  if (error) return { error: error.message };
  return { success: true };
}

export async function trackOrder(
  orderId: string,
): Promise<{ order: OrderResult } | { error: string }> {
  const supabase = await createClient();
  const numId = Number(orderId);
  if (isNaN(numId)) return { error: "Invalid order ID." };

  const { data: order, error } = await supabase
    .from("orders")
    .select(`
      id, total, status, courier_name, tracking_status, created_at,
      items:order_items(
        id, product_id, quantity, price,
        product:products(name, images)
      )
    `)
    .eq("id", numId)
    .single();

  if (error || !order) return { error: "Order not found." };

  const o = order as OrderJoinRow;
  return {
    order: {
      id: o.id,
      total: o.total,
      status: o.status,
      courier_name: o.courier_name,
      tracking_status: o.tracking_status,
      created_at: o.created_at,
      items: (o.items ?? []).map((oi: OrderItemJoinRow) => ({
        id: oi.id,
        product_id: oi.product_id,
        product_name: oi.product?.[0]?.name ?? "Unknown",
        product_image:
          Array.isArray(oi.product?.[0]?.images) &&
          oi.product[0].images.length > 0
            ? oi.product[0].images[0]
            : null,
        quantity: oi.quantity,
        price: oi.price,
      })),
    },
  };
}
