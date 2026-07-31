"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

interface CategoryLookup {
  id: number;
  name: string;
  type: string;
  season: string | null;
}

interface ProductQueryRow {
  id: number;
  name: string;
  price: number;
  stock: number;
  images: unknown;
  status: string;
  category_id: number;
  category: { name: string; type: string; season: string | null }[] | null;
}

interface OrderItemQueryRow {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  order: { status: string; created_at: string; customer_id: string; courier_name: string | null; tracking_status: string | null }[] | null;
  product: { name: string }[] | null;
}

interface EarningsQueryRow {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  order: { created_at: string; status: string }[] | null;
  product: { name: string }[] | null;
}

interface CashoutQueryRow {
  id: number;
  amount: number;
  status: string;
  created_at: string;
}

export interface SellerProductData {
  id: string;
  name: string;
  price: number;
  stock: number;
  image: string;
  category: string;
  season?: string;
  status: string;
  rejection_reason?: string | null;
}

export interface SellerOrderData {
  id: string;
  order_id: number;
  product_name: string;
  customer_name: string;
  amount: number;
  status: string;
  courier_name: string | null;
  tracking_status: string | null;
  date: string;
}

export interface EarningsRow {
  id: string;
  order_id: number;
  product_name: string;
  amount: number;
  commission: number;
  net: number;
  date: string;
}

export interface CashoutRow {
  id: string;
  amount: number;
  method: string;
  status: string;
  date: string;
}

async function getStoreId(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data } = await supabase
    .from("stores")
    .select("id, name, status")
    .eq("seller_id", userId)
    .maybeSingle();
  return data;
}

export async function getSellerStore(): Promise<
  | { found: true; store: { id: number; name: string; description: string | null; status: string } }
  | { found: false; error: string }
> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { found: false, error: "Not authenticated." };
  const { data: store } = await supabase
    .from("stores")
    .select("id, name, description, status")
    .eq("seller_id", user.id)
    .maybeSingle();
  if (!store) return { found: false, error: "No store found." };
  return { found: true, store };
}

export async function getCategories(): Promise<
  { categories: CategoryLookup[] } | { error: string }
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, type, season")
    .order("name");
  if (error) return { error: error.message };
  return { categories: data ?? [] };
}

export async function getSellerProducts(): Promise<
  { products: SellerProductData[] } | { error: string }
> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const store = await getStoreId(supabase, user.id);
  if (!store) return { error: "No store found." };

  const { data, error } = await supabase
    .from("products")
    .select(`
      id, name, price, stock, images, status, category_id, rejection_reason,
      category:categories(name, type, season)
    `)
    .eq("store_id", store.id)
    .order("created_at", { ascending: false });

  if (error) return { error: error.message };

  const products: SellerProductData[] = (data ?? []).map((p: ProductQueryRow & { rejection_reason?: string | null }) => {
    const images: string[] = Array.isArray(p.images) ? p.images : [];
    return {
      id: String(p.id),
      name: p.name,
      price: p.price,
      stock: p.stock,
      image: images.length > 0 ? images[0] : "https://placehold.co/400x300/2F3D9A/FAFFC4?text=Product",
      category: p.category?.[0]?.name ?? "Uncategorized",
      season: p.category?.[0]?.season ?? undefined,
      status: p.status,
      rejection_reason: p.rejection_reason ?? null,
    };
  });

  return { products };
}

export async function createProduct(data: {
  name: string;
  description?: string;
  price: number;
  stock: number;
  images: string[];
  categoryName: string;
  season?: string;
}): Promise<{ product: SellerProductData } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const store = await getStoreId(supabase, user.id);
  if (!store) return { error: "No store found." };

  // Resolve category_id from name
  let categoryName = data.categoryName;
  if (data.season) {
    const seasonMap: Record<string, string> = {
      rainy: "Rainy Season",
      summer: "Summer Season",
      winter: "Winter Season",
      Rainy: "Rainy Season",
      Summer: "Summer Season",
      Winter: "Winter Season",
    };
    if (data.categoryName === "Seasonal" && data.season) {
      categoryName = seasonMap[data.season] ?? data.categoryName;
    }
  }

  const { data: cat } = await supabase
    .from("categories")
    .select("id, name")
    .eq("name", categoryName)
    .maybeSingle();

  const categoryId = cat?.id ?? null;

  const { data: product, error } = await supabase
    .from("products")
    .insert({
      store_id: store.id,
      category_id: categoryId,
      name: data.name,
      description: data.description ?? null,
      price: data.price,
      stock: data.stock,
      images: data.images.length > 0 ? data.images : null,
      status: "pending",
    })
    .select("id, name, price, stock, images, status")
    .single();

  if (error) return { error: error.message };

  return {
    product: {
      id: String(product.id),
      name: product.name,
      price: product.price,
      stock: product.stock,
      image: Array.isArray(product.images) && product.images.length > 0
        ? product.images[0]
        : "https://placehold.co/400x300/2F3D9A/FAFFC4?text=Product",
      category: categoryName,
      season: data.season,
      status: product.status,
    },
  };
}

export async function updateProduct(
  productId: string,
  data: {
    name?: string;
    description?: string;
    price?: number;
    stock?: number;
    images?: string[];
    categoryName?: string;
    season?: string;
  },
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const store = await getStoreId(supabase, user.id);
  if (!store) return { error: "No store found." };

  const numId = Number(productId);
  if (isNaN(numId)) return { error: "Invalid product ID." };

  const updates: Record<string, unknown> = {};
  if (data.name !== undefined) updates.name = data.name;
  if (data.description !== undefined) updates.description = data.description;
  if (data.price !== undefined) updates.price = data.price;
  if (data.stock !== undefined) updates.stock = data.stock;
  if (data.images !== undefined) updates.images = data.images;

  if (data.categoryName) {
    let catName = data.categoryName;
    if (data.season) {
      const seasonMap: Record<string, string> = {
        rainy: "Rainy Season", summer: "Summer Season", winter: "Winter Season",
        Rainy: "Rainy Season", Summer: "Summer Season", Winter: "Winter Season",
      };
      if (data.categoryName === "Seasonal" && data.season) {
        catName = seasonMap[data.season] ?? data.categoryName;
      }
    }
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("name", catName)
      .maybeSingle();
    if (cat) updates.category_id = cat.id;
  }

  const { error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", numId)
    .eq("store_id", store.id);

  if (error) return { error: error.message };
  return { success: true };
}

export async function deleteProduct(
  productId: string,
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const store = await getStoreId(supabase, user.id);
  if (!store) return { error: "No store found." };

  const numId = Number(productId);
  if (isNaN(numId)) return { error: "Invalid product ID." };

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", numId)
    .eq("store_id", store.id);

  if (error) return { error: error.message };
  return { success: true };
}

export async function getSellerOrders(): Promise<
  { orders: SellerOrderData[] } | { error: string }
> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const store = await getStoreId(supabase, user.id);
  if (!store) return { error: "No store found." };

  const { data, error } = await supabase
    .from("order_items")
    .select(`
      id, order_id, product_id, quantity, price,
      order:orders(status, created_at, customer_id, courier_name, tracking_status),
      product:products(name)
    `)
    .in("product_id", (await supabase
      .from("products")
      .select("id")
      .eq("store_id", store.id)
    ).data?.map(p => p.id) ?? [])
    .order("order_id", { ascending: false });

  if (error) return { error: error.message };

  const orders: SellerOrderData[] = (data ?? []).map((oi: OrderItemQueryRow) => ({
    id: String(oi.id),
    order_id: oi.order_id,
    product_name: oi.product?.[0]?.name ?? "Unknown",
    customer_name: "—",
    amount: Number(oi.price) * oi.quantity,
    status: oi.order?.[0]?.status ?? "pending",
    courier_name: oi.order?.[0]?.courier_name ?? null,
    tracking_status: oi.order?.[0]?.tracking_status ?? null,
    date: oi.order?.[0]?.created_at
      ? new Date(oi.order[0].created_at).toLocaleDateString("en-CA")
      : "—",
  }));

  return { orders };
}

export async function getSellerEarnings(): Promise<
  | { stats: { totalSales: number; totalOrders: number; availableBalance: number }; earnings: EarningsRow[] }
  | { error: string }
> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const store = await getStoreId(supabase, user.id);
  if (!store) return { error: "No store found." };

  const { data: productIds } = await supabase
    .from("products")
    .select("id")
    .eq("store_id", store.id);
  const ids = (productIds ?? []).map(p => p.id);
  if (ids.length === 0) {
    return { stats: { totalSales: 0, totalOrders: 0, availableBalance: 0 }, earnings: [] };
  }

  const { data, error } = await supabase
    .from("order_items")
    .select(`
      id, order_id, product_id, quantity, price,
      order:orders(created_at, status),
      product:products(name)
    `)
    .in("product_id", ids)
    .order("order_id", { ascending: false });

  if (error) return { error: error.message };

  const earnings: EarningsRow[] = (data ?? []).map((oi: EarningsQueryRow) => {
    const amount = Number(oi.price) * oi.quantity;
    const commission = Math.round(amount * 0.1);
    return {
      id: String(oi.id),
      order_id: oi.order_id,
      product_name: oi.product?.[0]?.name ?? "Unknown",
      amount,
      commission,
      net: amount - commission,
      date: oi.order?.[0]?.created_at
        ? new Date(oi.order[0].created_at).toLocaleDateString("en-CA")
        : "—",
    };
  });

  const totalSales = earnings.reduce((s, e) => s + e.amount, 0);
  const totalOrders = new Set(earnings.map(e => e.order_id)).size;
  const availableBalance = earnings.reduce((s, e) => s + e.net, 0);

  return { stats: { totalSales, totalOrders, availableBalance }, earnings };
}

export async function createCashoutRequest(
  amount: number,
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  if (amount <= 0) return { error: "Amount must be positive." };

  const { error } = await supabase.from("cashout_requests").insert({
    seller_id: user.id,
    amount,
    status: "pending",
  });

  if (error) return { error: error.message };
  return { success: true };
}

export async function getCashoutRequests(): Promise<
  { cashouts: CashoutRow[] } | { error: string }
> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const { data, error } = await supabase
    .from("cashout_requests")
    .select("id, amount, status, created_at")
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return { error: error.message };

  const cashouts: CashoutRow[] = (data ?? []).map((cr: CashoutQueryRow) => ({
    id: String(cr.id),
    amount: Number(cr.amount),
    method: "bKash",
    status: cr.status,
    date: new Date(cr.created_at).toLocaleDateString("en-CA"),
  }));

  return { cashouts };
}

export async function getSellerDashboardData(): Promise<
  | {
      storeName: string;
      storeStatus: string;
      totalProducts: number;
      pendingProducts: number;
      totalSales: number;
    }
  | { error: string }
> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const store = await getStoreId(supabase, user.id);
  if (!store) return { error: "No store found." };

  const { data: products } = await supabase
    .from("products")
    .select("status")
    .eq("store_id", store.id);

  const totalProducts = products?.length ?? 0;
  const pendingProducts = products?.filter(p => p.status === "pending").length ?? 0;

  return {
    storeName: store.name,
    storeStatus: store.status,
    totalProducts,
    pendingProducts,
    totalSales: 0,
  };
}

export async function toggleProductPublish(
  productId: string,
  publish: boolean,
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };
  const store = await getStoreId(supabase, user.id);
  if (!store) return { error: "No store found." };
  const numId = Number(productId);
  if (isNaN(numId)) return { error: "Invalid product ID." };
  const newStatus = publish ? (store.status === "approved" ? "approved" : "pending") : "draft";
  const adminDb = createAdminClient();
  const { error } = await adminDb
    .from("products")
    .update({ status: newStatus })
    .eq("id", numId)
    .eq("store_id", store.id);
  if (error) return { error: error.message };
  return { success: true };
}

export async function updateStore(data: {
  name?: string;
  description?: string | null;
}): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };
  const updates: Record<string, unknown> = {};
  if (data.name !== undefined) updates.name = data.name;
  if (data.description !== undefined) updates.description = data.description;
  const { error } = await supabase
    .from("stores")
    .update(updates)
    .eq("seller_id", user.id);
  if (error) return { error: error.message };
  return { success: true };
}

export async function getCurrentProfile(): Promise<
  | { profile: { full_name: string; email: string; phone: string | null } }
  | { error: string }
> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };
  const { data, error } = await supabase
    .from("profiles")
    .select("full_name, email, phone")
    .eq("id", user.id)
    .single();
  if (error) return { error: error.message };
  return { profile: { full_name: data.full_name, email: data.email, phone: data.phone } };
}

export async function updateProfile(data: {
  full_name?: string;
  phone?: string | null;
}): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };
  const updates: Record<string, unknown> = {};
  if (data.full_name !== undefined) updates.full_name = data.full_name;
  if (data.phone !== undefined) updates.phone = data.phone;
  const { error } = await supabase.from("profiles").update(updates).eq("id", user.id);
  if (error) return { error: error.message };
  return { success: true };
}

export async function getRecentActivity(): Promise<
  { orders: { id: number; product_name: string; amount: number; status: string; date: string }[] }
  | { error: string }
> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };
  const store = await getStoreId(supabase, user.id);
  if (!store) return { error: "No store found." };
  const { data: productIds } = await supabase
    .from("products")
    .select("id")
    .eq("store_id", store.id);
  const ids = (productIds ?? []).map(p => p.id);
  if (ids.length === 0) return { orders: [] };
  const { data, error } = await supabase
    .from("order_items")
    .select(`
      id, order_id, product_id, quantity, price,
      order:orders(created_at, status),
      product:products(name)
    `)
    .in("product_id", ids)
    .order("order_id", { ascending: false })
    .limit(5);
  if (error) return { error: error.message };
  const orders = (data ?? []).map((oi: EarningsQueryRow) => ({
    id: oi.order_id,
    product_name: oi.product?.[0]?.name ?? "Unknown",
    amount: Number(oi.price) * oi.quantity,
    status: oi.order?.[0]?.status ?? "pending",
    date: oi.order?.[0]?.created_at
      ? new Date(oi.order[0].created_at).toLocaleDateString("en-CA")
      : "—",
  }));
  return { orders };
}

export async function getOrderDetails(orderId: string): Promise<
  | {
      order: {
        id: number;
        total: number;
        status: string;
        customer_name: string;
        customer_phone: string;
        shipping_address: string;
        payment_method: string;
        created_at: string;
        items: { product_name: string; quantity: number; price: number }[];
      }
    }
  | { error: string }
> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };
  const numId = Number(orderId);
  if (isNaN(numId)) return { error: "Invalid order ID." };
  const { data: orderData, error: orderError } = await supabase
    .from("orders")
    .select(`id, total, status, created_at, customer_id, courier_name`)
    .eq("id", numId)
    .single();
  if (orderError) return { error: orderError.message };
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone")
    .eq("id", orderData.customer_id)
    .single();
  const { data: items } = await supabase
    .from("order_items")
    .select(`quantity, price, product:products(name)`)
    .eq("order_id", numId);
  return {
    order: {
      id: orderData.id,
      total: Number(orderData.total),
      status: orderData.status,
      customer_name: profile?.full_name ?? "—",
      customer_phone: profile?.phone ?? "—",
      shipping_address: "—",
      payment_method: "—",
      created_at: new Date(orderData.created_at).toLocaleDateString("en-CA"),
      items: (items ?? []).map((i: { quantity: number; price: number; product: { name: string }[] | null }) => ({
        product_name: i.product?.[0]?.name ?? "Unknown",
        quantity: i.quantity,
        price: Number(i.price),
      })),
    },
  };
}

export async function updateOrderStatus(
  orderId: string,
  status: string,
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };
  const numId = Number(orderId);
  if (isNaN(numId)) return { error: "Invalid order ID." };
  const allowed = ["pending", "processing", "shipped"];
  if (!allowed.includes(status)) return { error: "Cannot set this status." };
  const adminDb = createAdminClient();
  const { error } = await adminDb
    .from("orders")
    .update({ status })
    .eq("id", numId);
  if (error) return { error: error.message };
  return { success: true };
}
