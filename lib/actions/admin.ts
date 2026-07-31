"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/* ---------- TYPES ---------- */

export interface DashboardStats {
  totalSellers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingSellerApprovals: number;
  pendingProductApprovals: number;
  pendingCashouts: number;
}

export interface PendingSeller {
  id: string;
  name: string;
  owner: string;
  email: string;
  applied: string;
}

export interface PendingProduct {
  id: string;
  name: string;
  seller: string;
  price: number;
  status: string;
}

export interface ActivityEvent {
  id: string;
  type: "seller" | "product" | "order" | "cashout";
  title: string;
  detail: string;
  date: string;
}

export interface AdminSeller {
  id: string;
  store: string;
  description: string | null;
  owner: string;
  email: string;
  phone: string | null;
  status: string;
  applied: string;
  products: number;
}

export interface NameChangeRequest {
  id: string;
  seller_id: string;
  current_name: string;
  requested_name: string;
  created_at: string;
}

export interface AdminProduct {
  id: string;
  name: string;
  seller: string;
  seller_id: string;
  category: string;
  price: number;
  stock: number;
  status: string;
  image: string;
}

export interface AdminOrder {
  id: string;
  order_number: string;
  customer_name: string;
  total: number;
  payment_status: string;
  order_status: string;
  created_at: string;
  items: AdminOrderItem[];
}

export interface AdminOrderItem {
  product_name: string;
  seller_name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

export interface CashoutRequest {
  id: string;
  seller_id: string;
  seller_name: string;
  amount: number;
  payout_method: string;
  account_details: string;
  status: string;
  created_at: string;
  processed_at: string | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  role: string;
  created_at: string;
}

/* ---------- HELPERS ---------- */

async function getClient() {
  return await createClient();
}

function fmt(n: number | null | undefined): string {
  if (n == null) return "—";
  return "৳" + Number(n).toLocaleString("en-IN");
}

function localDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-CA");
}

/* ---------- DASHBOARD ---------- */

export async function getAdminDashboard(): Promise<
  {
    stats: DashboardStats;
    pendingSellers: PendingSeller[];
    pendingProducts: PendingProduct[];
    recentActivity: ActivityEvent[];
    adminName: string;
  }
  | { error: string }
> {
  try {
    const supabase = await getClient();

    const { data: { user } } = await supabase.auth.getUser();
    let adminName = "Admin";
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();
      if (profile?.full_name) adminName = profile.full_name;
    }

    const [r1, r2, r3, r4, r5, r6, r7] = await Promise.all([
      supabase.from("stores").select("*", { count: "exact", head: true }),
      supabase.from("products").select("*", { count: "exact", head: true }),
      supabase.from("orders").select("*", { count: "exact", head: true }),
      supabase.from("orders").select("total").eq("order_status", "delivered"),
      supabase.from("stores").select("id").eq("status", "pending"),
      supabase.from("products").select("id").eq("status", "pending_review"),
      supabase.from("cashout_requests").select("id").eq("status", "pending"),
    ]);

    const stats: DashboardStats = {
      totalSellers: r1.count ?? 0,
      totalProducts: r2.count ?? 0,
      totalOrders: r3.count ?? 0,
      totalRevenue: (r4.data ?? []).reduce((s: number, o: { total: number }) => s + Number(o.total), 0),
      pendingSellerApprovals: r5.count ?? 0,
      pendingProductApprovals: r6.count ?? 0,
      pendingCashouts: r7.count ?? 0,
    };

    const [pendingSellersRes, pendingProductsRes, recentSellers, recentOrders, recentCashouts, recentProducts] =
      await Promise.all([
        supabase
          .from("stores")
          .select("id, name, seller_id, created_at, profile:profiles!inner(full_name, email)")
          .eq("status", "pending")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("products")
          .select("id, name, seller_id, price, status")
          .eq("status", "pending_review")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("stores")
          .select("name, created_at")
          .order("created_at", { ascending: false })
          .limit(3),
        supabase
          .from("orders")
          .select("order_number, created_at")
          .order("created_at", { ascending: false })
          .limit(4),
        supabase
          .from("cashout_requests")
          .select("amount, created_at")
          .order("created_at", { ascending: false })
          .limit(3),
        supabase
          .from("products")
          .select("name, status, created_at")
          .order("created_at", { ascending: false })
          .limit(3),
      ]);

    const pendingSellers: PendingSeller[] = (pendingSellersRes.data ?? []).map((s) => ({
      id: String(s.id),
      name: s.name,
      owner: s.profile?.[0]?.full_name ?? "Unknown",
      email: s.profile?.[0]?.email ?? "—",
      applied: localDate(s.created_at),
    }));

    const pendingProducts: PendingProduct[] = (pendingProductsRes.data ?? []).map((p) => ({
      id: String(p.id),
      name: p.name,
      seller: "—",
      price: Number(p.price),
      status: p.status,
    }));

    const activity: ActivityEvent[] = [];
    for (const s of recentSellers.data ?? []) {
      activity.push({ id: `seller-${s.name}-${s.created_at}`, type: "seller", title: `New seller "${s.name}" registered`, detail: "Store application submitted", date: localDate(s.created_at) });
    }
    for (const p of recentProducts.data ?? []) {
      activity.push({ id: `product-${p.name}-${p.created_at}`, type: "product", title: `Product "${p.name}" submitted`, detail: p.status === "pending_review" ? "Awaiting review" : `Status: ${p.status}`, date: localDate(p.created_at) });
    }
    for (const o of recentOrders.data ?? []) {
      activity.push({ id: `order-${o.order_number}-${o.created_at}`, type: "order", title: `Order ${o.order_number} placed`, detail: "New customer order", date: localDate(o.created_at) });
    }
    for (const c of recentCashouts.data ?? []) {
      activity.push({ id: `cashout-${c.amount}-${c.created_at}`, type: "cashout", title: `Cashout of ${fmt(c.amount)} requested`, detail: "Payout awaiting approval", date: localDate(c.created_at) });
    }
    activity.sort((a, b) => b.date.localeCompare(a.date));

    return { stats, pendingSellers, pendingProducts, recentActivity: activity.slice(0, 10), adminName };
  } catch (err) {
    console.error("[admin] getAdminDashboard error:", err);
    return { error: "Unable to load dashboard — schema issue" };
  }
}

/* ---------- SELLER / STORE ACTIONS ---------- */

export interface AdminStoreData {
  id: string;
  name: string;
  seller: string;
  products: number;
  status: string;
  joined: string;
}

export async function getAdminStores(): Promise<
  { stores: AdminStoreData[] } | { error: string }
> {
  try {
    const supabase = await getClient();
    const { data, error } = await supabase
      .from("stores")
      .select("id, name, description, status, created_at, seller_id, profile:profiles!inner(full_name)")
      .order("created_at", { ascending: false });

    if (error) return { error: error.message };

    const stores: AdminStoreData[] = (data ?? []).map((s) => ({
      id: String(s.id),
      name: s.name,
      seller: (s.profile as { full_name?: string }[] | null)?.[0]?.full_name ?? "Unknown",
      products: 0,
      status: s.status,
      joined: new Date(s.created_at).toLocaleDateString("en-CA"),
    }));

    return { stores };
  } catch (err) {
    console.error("[admin] getAdminStores error:", err);
    return { error: "Unable to load stores — schema issue" };
  }
}

export async function toggleStoreStatus(storeId: string) {
  try {
    const supabase = await getClient();
    const numId = Number(storeId);
    if (isNaN(numId)) return { error: "Invalid store ID." };
    const { data: store } = await supabase
      .from("stores")
      .select("status")
      .eq("id", numId)
      .single();
    if (!store) return { error: "Store not found." };
    const newStatus = store.status === "approved" ? "rejected" : "approved";
    const { error } = await supabase.from("stores").update({ status: newStatus }).eq("id", numId);
    if (error) return { error: error.message };
    return { success: true };
  } catch (err) {
    console.error("[admin] toggleStoreStatus error:", err);
    return { error: "Unable to toggle store status" };
  }
}

export async function getAdminSellers(): Promise<
  { sellers: AdminSeller[] } | { error: string }
> {
  try {
    const supabase = await getClient();
    const { data, error } = await supabase
      .from("stores")
      .select("id, name, description, status, created_at, seller_id, profile:profiles!inner(full_name, email, phone)")
      .order("created_at", { ascending: false });

    if (error) return { error: error.message };

    const sellers: AdminSeller[] = (data ?? []).map((s) => ({
      id: String(s.id),
      store: s.name,
      description: s.description,
      owner: s.profile?.[0]?.full_name ?? "Unknown",
      email: s.profile?.[0]?.email ?? "—",
      phone: s.profile?.[0]?.phone ?? null,
      status: s.status,
      applied: localDate(s.created_at),
      products: 0,
    }));

    return { sellers };
  } catch (err) {
    console.error("[admin] getAdminSellers error:", err);
    return { error: "Unable to load sellers — schema issue" };
  }
}

export async function approveStore(storeId: string) {
  try {
    const supabase = await getClient();
    const numId = Number(storeId);
    if (isNaN(numId)) return { error: "Invalid store ID." };
    const { error } = await supabase.from("stores").update({ status: "approved" }).eq("id", numId);
    if (error) return { error: error.message };
    return { success: true };
  } catch (err) {
    console.error("[admin] approveStore error:", err);
    return { error: "Unable to approve store" };
  }
}

export async function rejectStore(storeId: string) {
  try {
    const supabase = await getClient();
    const numId = Number(storeId);
    if (isNaN(numId)) return { error: "Invalid store ID." };
    const { error } = await supabase.from("stores").update({ status: "rejected" }).eq("id", numId);
    if (error) return { error: error.message };
    return { success: true };
  } catch (err) {
    console.error("[admin] rejectStore error:", err);
    return { error: "Unable to reject store" };
  }
}

export async function suspendStore(storeId: string) {
  try {
    const supabase = await getClient();
    const numId = Number(storeId);
    if (isNaN(numId)) return { error: "Invalid store ID." };
    const { error } = await supabase.from("stores").update({ status: "rejected" }).eq("id", numId);
    if (error) return { error: error.message };
    return { success: true };
  } catch (err) {
    console.error("[admin] suspendStore error:", err);
    return { error: "Unable to suspend store" };
  }
}

export async function deleteStore(storeId: string) {
  try {
    const supabase = await getClient();
    const numId = Number(storeId);
    if (isNaN(numId)) return { error: "Invalid store ID." };
    const { error } = await supabase.from("stores").delete().eq("id", numId);
    if (error) return { error: error.message };
    return { success: true };
  } catch (err) {
    console.error("[admin] deleteStore error:", err);
    return { error: "Unable to delete store" };
  }
}

/* ---------- NAME CHANGE REQUESTS ---------- */

export async function getNameChangeRequests(): Promise<
  { requests: NameChangeRequest[] } | { error: string }
> {
  try {
    const supabase = await getClient();
    const { data, error } = await supabase
      .from("seller_name_change_requests")
      .select("id, seller_id, requested_name, created_at, seller:sellers(store_name)")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) return { error: error.message };

    const requests: NameChangeRequest[] = (data ?? []).map((r) => ({
      id: r.id,
      seller_id: r.seller_id,
      current_name: (r.seller as { store_name?: string }[] | null)?.[0]?.store_name ?? "Unknown",
      requested_name: r.requested_name,
      created_at: localDate(r.created_at),
    }));

    return { requests };
  } catch (err) {
    console.error("[admin] getNameChangeRequests error:", err);
    return { error: "Unable to load name change requests — schema issue" };
  }
}

export async function approveNameChange(requestId: string) {
  try {
    const supabase = await getClient();
    const { data: req } = await supabase
      .from("seller_name_change_requests")
      .select("seller_id, requested_name")
      .eq("id", requestId)
      .single();
    if (!req) return { error: "Request not found." };

    const { error: updateSellerError } = await supabase
      .from("sellers")
      .update({ store_name: req.requested_name })
      .eq("id", req.seller_id);
    if (updateSellerError) return { error: updateSellerError.message };

    const { error: updateReqError } = await supabase
      .from("seller_name_change_requests")
      .update({ status: "approved", reviewed_at: new Date().toISOString() })
      .eq("id", requestId);
    if (updateReqError) return { error: updateReqError.message };

    return { success: true };
  } catch (err) {
    console.error("[admin] approveNameChange error:", err);
    return { error: "Unable to approve name change" };
  }
}

export async function rejectNameChange(requestId: string) {
  try {
    const supabase = await getClient();
    const { error } = await supabase
      .from("seller_name_change_requests")
      .update({ status: "rejected", reviewed_at: new Date().toISOString() })
      .eq("id", requestId);
    if (error) return { error: error.message };
    return { success: true };
  } catch (err) {
    console.error("[admin] rejectNameChange error:", err);
    return { error: "Unable to reject name change" };
  }
}

/* ---------- PRODUCTS ---------- */

export async function getAdminProducts(): Promise<
  { products: AdminProduct[] } | { error: string }
> {
  try {
    const supabase = await getClient();
    const { data, error } = await supabase
      .from("products")
      .select("id, name, price, stock, status, images, seller_id, category_id, category:categories(name)")
      .order("created_at", { ascending: false });

    if (error) return { error: error.message };

    const products: AdminProduct[] = (data ?? []).map((p) => ({
      id: String(p.id),
      name: p.name,
      seller: "—",
      seller_id: p.seller_id,
      category: (p.category as { name?: string }[] | null)?.[0]?.name ?? "Uncategorized",
      price: Number(p.price),
      stock: p.stock,
      status: p.status,
      image: Array.isArray(p.images) && p.images.length > 0
        ? String(p.images[0])
        : "https://placehold.co/400x300/2F3D9A/FAFFC4?text=Product",
    }));

    return { products };
  } catch (err) {
    console.error("[admin] getAdminProducts error:", err);
    return { error: "Unable to load products — schema issue" };
  }
}

export async function approveProduct(productId: string) {
  try {
    const supabase = await getClient();
    const { error } = await supabase.from("products").update({ status: "approved" }).eq("id", productId);
    if (error) return { error: error.message };
    return { success: true };
  } catch (err) {
    console.error("[admin] approveProduct error:", err);
    return { error: "Unable to approve product" };
  }
}

export async function rejectProduct(productId: string) {
  try {
    const supabase = await getClient();
    const { error } = await supabase.from("products").update({ status: "rejected" }).eq("id", productId);
    if (error) return { error: error.message };
    return { success: true };
  } catch (err) {
    console.error("[admin] rejectProduct error:", err);
    return { error: "Unable to reject product" };
  }
}

export async function unpublishProduct(productId: string) {
  try {
    const supabase = await getClient();
    const { error } = await supabase.from("products").update({ status: "draft" }).eq("id", productId);
    if (error) return { error: error.message };
    return { success: true };
  } catch (err) {
    console.error("[admin] unpublishProduct error:", err);
    return { error: "Unable to unpublish product" };
  }
}

export async function deleteAdminProduct(productId: string) {
  try {
    const supabase = await getClient();
    const { error } = await supabase.from("products").delete().eq("id", productId);
    if (error) return { error: error.message };
    return { success: true };
  } catch (err) {
    console.error("[admin] deleteAdminProduct error:", err);
    return { error: "Unable to delete product" };
  }
}

/* ---------- ORDERS ---------- */

export async function getAdminOrders(): Promise<
  { orders: AdminOrder[] } | { error: string }
> {
  try {
    const supabase = await getClient();
    const { data, error } = await supabase
      .from("orders")
      .select("id, order_number, customer_name, total, payment_status, order_status, created_at, customer_id")
      .order("created_at", { ascending: false });

    if (error) return { error: error.message };

    const orders: AdminOrder[] = (data ?? []).map((o) => ({
      id: String(o.id),
      order_number: o.order_number,
      customer_name: o.customer_name,
      total: Number(o.total),
      payment_status: o.payment_status,
      order_status: o.order_status,
      created_at: localDate(o.created_at),
      items: [],
    }));

    return { orders };
  } catch (err) {
    console.error("[admin] getAdminOrders error:", err);
    return { error: "Unable to load orders — schema issue" };
  }
}

export async function getOrderDetail(orderId: string): Promise<
  { order: AdminOrder & { shipping: string; payment_method: string; notes: string | null } } | { error: string }
> {
  try {
    const supabase = await getClient();
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError) return { error: orderError.message };

    const { data: items } = await supabase
      .from("order_items")
      .select("product_name, seller_id, quantity, unit_price, line_total")
      .eq("order_id", orderId);

    const itemRows: AdminOrderItem[] = (items ?? []).map((i) => ({
      product_name: i.product_name,
      seller_name: "—",
      quantity: i.quantity,
      unit_price: Number(i.unit_price),
      line_total: Number(i.line_total),
    }));

    const shipping = [
      order.shipping_address,
      order.shipping_city,
      order.shipping_area,
      order.postal_code,
    ].filter(Boolean).join(", ");

    return {
      order: {
        id: String(order.id),
        order_number: order.order_number,
        customer_name: order.customer_name,
        total: Number(order.total),
        payment_status: order.payment_status,
        order_status: order.order_status,
        created_at: localDate(order.created_at),
        items: itemRows,
        shipping,
        payment_method: order.payment_method,
        notes: order.notes,
      },
    };
  } catch (err) {
    console.error("[admin] getOrderDetail error:", err);
    return { error: "Unable to load order details — schema issue" };
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: string,
): Promise<{ success: true } | { error: string }> {
  try {
    const supabase = await getClient();
    const { error } = await supabase
      .from("orders")
      .update({ order_status: status })
      .eq("id", orderId);
    if (error) return { error: error.message };
    return { success: true };
  } catch (err) {
    console.error("[admin] updateOrderStatus error:", err);
    return { error: "Unable to update order status" };
  }
}

/* ---------- CASHOUT REQUESTS ---------- */

export async function getCashoutRequests(): Promise<
  { cashouts: CashoutRequest[] } | { error: string }
> {
  try {
    const supabase = await getClient();
    const { data, error } = await supabase
      .from("cashout_requests")
      .select("id, seller_id, amount, payout_method, account_details, status, created_at, processed_at")
      .order("created_at", { ascending: false });

    if (error) return { error: error.message };

    const cashouts: CashoutRequest[] = (data ?? []).map((c) => ({
      id: String(c.id),
      seller_id: c.seller_id,
      seller_name: "—",
      amount: Number(c.amount),
      payout_method: c.payout_method,
      account_details: c.account_details,
      status: c.status,
      created_at: localDate(c.created_at),
      processed_at: c.processed_at,
    }));

    return { cashouts };
  } catch (err) {
    console.error("[admin] getCashoutRequests error:", err);
    return { error: "Unable to load cashout requests — schema issue" };
  }
}

export async function approveCashout(requestId: string) {
  try {
    const supabase = await getClient();
    const { error } = await supabase
      .from("cashout_requests")
      .update({ status: "approved", processed_at: new Date().toISOString() })
      .eq("id", requestId);
    if (error) return { error: error.message };
    return { success: true };
  } catch (err) {
    console.error("[admin] approveCashout error:", err);
    return { error: "Unable to approve cashout" };
  }
}

export async function rejectCashout(requestId: string) {
  try {
    const supabase = await getClient();
    const { error } = await supabase
      .from("cashout_requests")
      .update({ status: "rejected" })
      .eq("id", requestId);
    if (error) return { error: error.message };
    return { success: true };
  } catch (err) {
    console.error("[admin] rejectCashout error:", err);
    return { error: "Unable to reject cashout" };
  }
}

/* ---------- CATEGORIES ---------- */

export async function getCategories(): Promise<
  { categories: Category[] } | { error: string }
> {
  try {
    const supabase = await getClient();
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, slug")
      .order("name");

    if (error) return { error: error.message };
    return { categories: data ?? [] };
  } catch (err) {
    console.error("[admin] getCategories error:", err);
    return { error: "Unable to load categories — schema issue" };
  }
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function createCategory(name: string) {
  try {
    const supabase = await getClient();
    const slug = slugify(name);
    const { error } = await supabase.from("categories").insert({ name, slug });
    if (error) return { error: error.message };
    return { success: true };
  } catch (err) {
    console.error("[admin] createCategory error:", err);
    return { error: "Unable to create category" };
  }
}

export async function updateCategory(id: string, name: string) {
  try {
    const supabase = await getClient();
    const slug = slugify(name);
    const { error } = await supabase.from("categories").update({ name, slug }).eq("id", id);
    if (error) return { error: error.message };
    return { success: true };
  } catch (err) {
    console.error("[admin] updateCategory error:", err);
    return { error: "Unable to update category" };
  }
}

export async function deleteCategory(id: string) {
  try {
    const supabase = await getClient();
    const { count } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("category_id", id);

    if (count && count > 0) {
      return { error: `Cannot delete: ${count} product(s) still assigned to this category.` };
    }

    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) return { error: error.message };
    return { success: true };
  } catch (err) {
    console.error("[admin] deleteCategory error:", err);
    return { error: "Unable to delete category" };
  }
}

/* ---------- USERS ---------- */

export async function getUsers(): Promise<
  { users: UserProfile[] } | { error: string }
> {
  try {
    const supabase = await getClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, full_name, phone, role, created_at")
      .order("created_at", { ascending: false });

    if (error) return { error: error.message };
    return { users: data ?? [] };
  } catch (err) {
    console.error("[admin] getUsers error:", err);
    return { error: "Unable to load users — schema issue" };
  }
}

export async function updateUserRole(
  userId: string,
  newRole: string,
): Promise<{ success: true } | { error: string }> {
  try {
    const adminDb = createAdminClient();
    const { error: profileError } = await adminDb
      .from("profiles")
      .update({ role: newRole })
      .eq("id", userId);
    if (profileError) return { error: profileError.message };

    const { error: metaError } = await adminDb.auth.admin.updateUserById(
      userId,
      { app_metadata: { role: newRole } },
    );
    if (metaError) return { error: metaError.message };

    return { success: true };
  } catch (err) {
    console.error("[admin] updateUserRole error:", err);
    return { error: "Unable to update user role" };
  }
}

/* ---------- NAV BADGE COUNTS ---------- */

export async function getNavBadgeCounts(): Promise<
  { pendingSellers: number; pendingProducts: number; pendingCashouts: number }
> {
  try {
    const supabase = await getClient();
    const [sellers, products, cashouts] = await Promise.all([
      supabase.from("stores").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("products").select("*", { count: "exact", head: true }).eq("status", "pending_review"),
      supabase.from("cashout_requests").select("*", { count: "exact", head: true }).eq("status", "pending"),
    ]);
    return {
      pendingSellers: sellers.count ?? 0,
      pendingProducts: products.count ?? 0,
      pendingCashouts: cashouts.count ?? 0,
    };
  } catch {
    return { pendingSellers: 0, pendingProducts: 0, pendingCashouts: 0 };
  }
}

/* ---------- PERMISSION DIAGNOSTICS ---------- */

export interface PermissionHealth {
  is_admin_function: boolean;
  stores_rls: boolean;
  stores_admin_policy: boolean;
  sellers_missing_stores: number;
  role_constraint_ok: boolean;
}

export async function getPermissionHealth(): Promise<
  { health: PermissionHealth } | { error: string }
> {
  try {
    const supabase = await getClient();
    const { data, error } = await supabase.rpc("get_permission_health");
    if (error) return { error: error.message };
    const h = data as PermissionHealth;
    return { health: {
      is_admin_function: !!h.is_admin_function,
      stores_rls: !!h.stores_rls,
      stores_admin_policy: !!h.stores_admin_policy,
      sellers_missing_stores: Number(h.sellers_missing_stores ?? 0),
      role_constraint_ok: !!h.role_constraint_ok,
    } };
  } catch (err) {
    console.error("[admin] getPermissionHealth error:", err);
    return { error: "Unable to run permission diagnostics" };
  }
}

export async function backfillMissingStores(): Promise<
  { fixed: number } | { error: string }
> {
  try {
    const supabase = await getClient();
    const { data, error } = await supabase.rpc("backfill_missing_stores");
    if (error) return { error: error.message };
    return { fixed: Number(data ?? 0) };
  } catch (err) {
    console.error("[admin] backfillMissingStores error:", err);
    return { error: "Unable to backfill store records" };
  }
}

export async function syncRolesToAuthMetadata(): Promise<
  { synced: number } | { error: string }
> {
  try {
    const adminDb = createAdminClient();
    const { data: profiles, error: profileError } = await adminDb
      .from("profiles")
      .select("id, role");
    if (profileError) return { error: profileError.message };

    let synced = 0;
    for (const p of profiles ?? []) {
      const { error: metaError } = await adminDb.auth.admin.updateUserById(
        p.id,
        { app_metadata: { role: p.role } },
      );
      if (metaError) continue;
      synced++;
    }
    return { synced };
  } catch (err) {
    console.error("[admin] syncRolesToAuthMetadata error:", err);
    return { error: "Unable to sync roles to auth metadata" };
  }
}
