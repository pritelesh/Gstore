"use server";

import { createAdminClient } from "@/lib/supabase/admin";

interface StoreQueryRow {
  id: number;
  seller_id: string;
  name: string;
  description: string | null;
  status: string;
  created_at: string;
  profile: { full_name: string; email: string; phone: string | null }[] | null;
}

interface ProductQueryRow {
  id: number;
  store_id: number;
  category_id: number;
  name: string;
  price: number;
  stock: number;
  images: unknown;
  status: string;
  created_at: string;
  store: { name: string }[] | null;
  category: { name: string }[] | null;
}

interface AdminSellerData {
  id: string;
  seller_id: string;
  store: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  applied: string;
}

interface AdminStoreData {
  id: string;
  name: string;
  seller: string;
  products: number;
  status: string;
  joined: string;
}

interface AdminProductData {
  id: string;
  name: string;
  image: string;
  store: string;
  price: number;
  status: string;
  category: string;
  rejection_reason?: string | null;
}

interface AdminOrderData {
  id: string;
  rawId: number;
  customer: string;
  store: string;
  total: number;
  status: string;
  payment: string;
  paymentType: string;
  date: string;
  courier_name: string | null;
  tracking_status: string | null;
}

interface OrderQueryRow {
  id: number;
  customer_id: string;
  total: number;
  status: string;
  courier_name: string | null;
  tracking_status: string | null;
  created_at: string;
  profile: { full_name: string }[] | null;
}

export async function getAdminDashboard(): Promise<{
  stats: {
    totalStores: number;
    totalProducts: number;
    totalOrders: number;
    pendingApprovals: number;
  };
}> {
  const supabase = createAdminClient();

  const { count: storeCount } = await supabase
    .from("stores")
    .select("*", { count: "exact", head: true });

  const { count: productCount } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true });

  const { count: orderCount } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true });

  const { count: pendingStores } = await supabase
    .from("stores")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  return {
    stats: {
      totalStores: storeCount ?? 0,
      totalProducts: productCount ?? 0,
      totalOrders: orderCount ?? 0,
      pendingApprovals: pendingStores ?? 0,
    },
  };
}

export async function getAdminSellers(): Promise<
  { sellers: AdminSellerData[] } | { error: string }
> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("stores")
    .select(`
      id, seller_id, name, description, status, created_at,
      profile:profiles!inner(full_name, email, phone)
    `)
    .order("created_at", { ascending: false });

  if (error) return { error: error.message };

  const sellers = (data ?? []).map((s: StoreQueryRow) => ({
    id: String(s.id),
    seller_id: s.seller_id,
    store: s.name,
    name: s.profile?.[0]?.full_name ?? "Unknown",
    email: s.profile?.[0]?.email ?? "—",
    phone: s.profile?.[0]?.phone ?? "—",
    status: s.status,
    applied: new Date(s.created_at).toLocaleDateString("en-CA"),
  }));

  return { sellers };
}

export async function approveStore(storeId: string) {
  const supabase = createAdminClient();
  const numId = Number(storeId);
  if (isNaN(numId)) return { error: "Invalid store ID." };

  const { error } = await supabase
    .from("stores")
    .update({ status: "approved" })
    .eq("id", numId);

  if (error) return { error: error.message };
  return { success: true };
}

export async function rejectStore(storeId: string) {
  const supabase = createAdminClient();
  const numId = Number(storeId);
  if (isNaN(numId)) return { error: "Invalid store ID." };

  const { error } = await supabase
    .from("stores")
    .update({ status: "rejected" })
    .eq("id", numId);

  if (error) return { error: error.message };
  return { success: true };
}

export async function getAdminStores(): Promise<
  { stores: AdminStoreData[] } | { error: string }
> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("stores")
    .select(`
      id, seller_id, name, description, status, created_at,
      profile:profiles!inner(full_name, email),
      products:products(count)
    `)
    .order("created_at", { ascending: false });

  if (error) return { error: error.message };

  const stores = (data ?? []).map((s: Record<string, unknown>) => ({
    id: String(s.id),
    name: s.name as string,
    seller: ((s.profile as Record<string, unknown>[] | null)?.[0]?.full_name as string) ?? "Unknown",
    products: ((s.products as Record<string, unknown>[] | null)?.[0]?.count as number) ?? 0,
    status: s.status as string,
    joined: new Date(s.created_at as string).toLocaleDateString("en-CA"),
  }));

  return { stores };
}

export async function toggleStoreStatus(storeId: string) {
  const supabase = createAdminClient();
  const numId = Number(storeId);
  if (isNaN(numId)) return { error: "Invalid store ID." };

  const { data: store } = await supabase
    .from("stores")
    .select("status")
    .eq("id", numId)
    .single();

  if (!store) return { error: "Store not found." };

  const newStatus = store.status === "approved" ? "rejected" : "approved";

  const { error } = await supabase
    .from("stores")
    .update({ status: newStatus })
    .eq("id", numId);

  if (error) return { error: error.message };
  return { success: true };
}

export async function deleteStore(storeId: string) {
  const supabase = createAdminClient();
  const numId = Number(storeId);
  if (isNaN(numId)) return { error: "Invalid store ID." };

  const { error } = await supabase
    .from("stores")
    .delete()
    .eq("id", numId);

  if (error) return { error: error.message };
  return { success: true };
}

export async function getAdminProducts(): Promise<
  { products: AdminProductData[] } | { error: string }
> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("products")
    .select(`
      id, store_id, category_id, name, price, stock, images, status, created_at, rejection_reason,
      store:stores(name),
      category:categories(name)
    `)
    .order("created_at", { ascending: false });

  if (error) return { error: error.message };

  const products = (data ?? []).map((p: ProductQueryRow & { rejection_reason?: string | null }) => ({
    id: String(p.id),
    name: p.name,
    image: Array.isArray(p.images) && p.images.length > 0
      ? String(p.images[0])
      : "https://placehold.co/400x300/2F3D9A/FAFFC4?text=Product",
    store: p.store?.[0]?.name ?? "Unknown",
    price: Number(p.price),
    status: p.status,
    category: p.category?.[0]?.name ?? "Uncategorized",
    rejection_reason: p.rejection_reason ?? null,
  }));

  return { products };
}

export async function approveProduct(productId: string) {
  const supabase = createAdminClient();
  const numId = Number(productId);
  if (isNaN(numId)) return { error: "Invalid product ID." };

  const { error } = await supabase
    .from("products")
    .update({ status: "active" })
    .eq("id", numId);

  if (error) return { error: error.message };
  return { success: true };
}

export async function rejectProduct(productId: string, reason?: string) {
  const supabase = createAdminClient();
  const numId = Number(productId);
  if (isNaN(numId)) return { error: "Invalid product ID." };

  const updates: Record<string, string> = { status: "rejected" };
  if (reason) updates.rejection_reason = reason;

  const { error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", numId);

  if (error) return { error: error.message };
  return { success: true };
}

export async function deleteAdminProduct(productId: string) {
  const supabase = createAdminClient();
  const numId = Number(productId);
  if (isNaN(numId)) return { error: "Invalid product ID." };

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", numId);

  if (error) return { error: error.message };
  return { success: true };
}

export async function getAdminOrders(): Promise<
  { orders: AdminOrderData[] } | { error: string }
> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("orders")
    .select(`
      id, customer_id, total, status, courier_name, tracking_status, created_at,
      profile:profiles!inner(full_name)
    `)
    .order("created_at", { ascending: false });

  if (error) return { error: error.message };

  const statusMap: Record<string, string> = {
    pending: "Pending",
    confirmed: "Processing",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };

  const paymentMap: Record<string, { label: string; type: string }> = {
    pending: { label: "Pending", type: "accent" },
    confirmed: { label: "Paid", type: "paid" },
    shipped: { label: "Paid", type: "paid" },
    delivered: { label: "Paid", type: "paid" },
    cancelled: { label: "Failed", type: "failed" },
  };

  const orders = (data ?? []).map((o: OrderQueryRow) => {
    const pmt = paymentMap[o.status] ?? { label: "Pending", type: "pending" };
    return {
      id: `#ORD-${o.id}`,
      rawId: o.id,
      customer: o.profile?.[0]?.full_name ?? "Unknown",
      store: "—",
      total: Number(o.total),
      status: statusMap[o.status] ?? o.status,
      payment: pmt.label,
      paymentType: pmt.type,
      date: new Date(o.created_at).toLocaleDateString("en-CA"),
      courier_name: o.courier_name,
      tracking_status: o.tracking_status,
    };
  });

  return { orders };
}
