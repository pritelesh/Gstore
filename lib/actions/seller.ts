"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface CategoryNode {
  id: string;
  name: string;
  parent_id: string | null;
}

interface ProductQueryRow {
  id: string;
  name: string;
  price: number;
  stock: number;
  images: unknown;
  status: string;
  category_id: string | null;
  category: { name: string; slug: string | null; parent_id: string | null }[] | null;
}

interface OrderItemQueryRow {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  order: { order_status?: string; created_at?: string; customer_id?: string; customer_name?: string }[] | null;
  product: { name: string }[] | null;
}

interface CashoutQueryRow {
  id: string;
  amount: number;
  status: string;
  created_at: string;
}

interface SellerRow {
  id: string;
  user_id: string;
  store_name: string;
  store_description: string | null;
  status: string;
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
  order_id: string;
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
  order_id: string;
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

async function getSeller(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data } = await supabase
    .from("sellers")
    .select("id, user_id, store_name, store_description, status")
    .eq("user_id", userId)
    .maybeSingle();
  return data as SellerRow | null;
}

export async function getSellerStore(): Promise<
  | { found: true; store: { id: string; name: string; description: string | null; status: string } }
  | { found: false; error: string }
> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { found: false, error: "Not authenticated." };
  const seller = await getSeller(supabase, user.id);
  if (!seller) return { found: false, error: "No seller account found." };
  return {
    found: true,
    store: {
      id: seller.id,
      name: seller.store_name,
      description: seller.store_description,
      status: seller.status,
    },
  };
}

export async function getCategories(): Promise<
  { categories: CategoryNode[] } | { error: string }
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, parent_id")
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

  const seller = await getSeller(supabase, user.id);
  if (!seller) return { error: "No seller account found." };

  const { data, error } = await supabase
    .from("products")
    .select(`
      id, name, price, stock, images, status, category_id,
      category:categories(name, slug, parent_id)
    `)
    .eq("seller_id", seller.id)
    .order("created_at", { ascending: false });

  if (error) return { error: error.message };

  const products: SellerProductData[] = (data ?? []).map((p: ProductQueryRow) => {
    const images: string[] = Array.isArray(p.images) ? p.images : [];
    return {
      id: p.id,
      name: p.name,
      price: p.price,
      stock: p.stock,
      image: images.length > 0 ? images[0] : "https://placehold.co/400x300/2F3D9A/FAFFC4?text=Product",
      category: p.category?.[0]?.name ?? "Uncategorized",
      status: p.status,
      rejection_reason: null,
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
  sizes?: string[];
  colors?: string[];
}): Promise<{ product: SellerProductData } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const seller = await getSeller(supabase, user.id);
  if (!seller) return { error: "No seller account found." };

  // Resolve category_id from name
  let categoryName = data.categoryName;
  if (data.season) {
    const seasonMap: Record<string, string> = {
      rainy: "Rainy",
      summer: "Summer",
      winter: "Winter",
      Rainy: "Rainy",
      Summer: "Summer",
      Winter: "Winter",
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
      seller_id: seller.id,
      category_id: categoryId,
      name: data.name,
      description: data.description ?? null,
      price: data.price,
      stock: data.stock,
      images: data.images.length > 0 ? data.images : null,
      sizes: data.sizes && data.sizes.length > 0 ? data.sizes : null,
      colors: data.colors && data.colors.length > 0 ? data.colors : null,
      status: "pending_review",
    })
    .select("id, name, price, stock, images, status")
    .single();

  if (error) return { error: error.message };

  return {
    product: {
      id: product.id,
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
    sizes?: string[];
    colors?: string[];
  },
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const seller = await getSeller(supabase, user.id);
  if (!seller) return { error: "No seller account found." };

  const updates: Record<string, unknown> = {};
  if (data.name !== undefined) updates.name = data.name;
  if (data.description !== undefined) updates.description = data.description;
  if (data.price !== undefined) updates.price = data.price;
  if (data.stock !== undefined) updates.stock = data.stock;
  if (data.images !== undefined) updates.images = data.images;
  if (data.sizes !== undefined) updates.sizes = data.sizes;
  if (data.colors !== undefined) updates.colors = data.colors;

  if (data.categoryName) {
    let catName = data.categoryName;
    if (data.season) {
      const seasonMap: Record<string, string> = {
        rainy: "Rainy", summer: "Summer", winter: "Winter",
        Rainy: "Rainy", Summer: "Summer", Winter: "Winter",
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
    .eq("id", productId)
    .eq("seller_id", seller.id);

  if (error) return { error: error.message };
  return { success: true };
}

export async function deleteProduct(
  productId: string,
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const seller = await getSeller(supabase, user.id);
  if (!seller) return { error: "No seller account found." };

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId)
    .eq("seller_id", seller.id);

  if (error) return { error: error.message };
  return { success: true };
}

export async function getSellerOrders(): Promise<
  { orders: SellerOrderData[] } | { error: string }
> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const seller = await getSeller(supabase, user.id);
  if (!seller) return { error: "No seller account found." };

  const { data, error } = await supabase
    .from("order_items")
    .select(`
      id, order_id, product_id, quantity, unit_price,
      order:orders(order_status, created_at, customer_id, customer_name),
      product:products(name)
    `)
    .eq("seller_id", seller.id)
    .order("order_id", { ascending: false });

  if (error) return { error: error.message };

  const orders: SellerOrderData[] = (data ?? []).map((oi: OrderItemQueryRow) => ({
    id: oi.id,
    order_id: oi.order_id,
    product_name: oi.product?.[0]?.name ?? "Unknown",
    customer_name: oi.order?.[0]?.customer_name ?? "—",
    amount: Number(oi.unit_price) * oi.quantity,
    status: oi.order?.[0]?.order_status ?? "pending",
    courier_name: null,
    tracking_status: null,
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

  const seller = await getSeller(supabase, user.id);
  if (!seller) return { error: "No seller account found." };

  const { data, error } = await supabase
    .from("order_items")
    .select(`
      id, order_id, product_id, quantity, unit_price,
      order:orders(created_at, order_status),
      product:products(name)
    `)
    .eq("seller_id", seller.id)
    .order("order_id", { ascending: false });

  if (error) return { error: error.message };

  const earnings: EarningsRow[] = (data ?? []).map((oi: OrderItemQueryRow) => {
    const amount = Number(oi.unit_price) * oi.quantity;
    const commission = Math.round(amount * 0.1);
    return {
      id: oi.id,
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

  const seller = await getSeller(supabase, user.id);
  if (!seller) return { error: "No seller account found." };

  const { error } = await supabase.from("cashout_requests").insert({
    seller_id: seller.id,
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

  const seller = await getSeller(supabase, user.id);
  if (!seller) return { error: "No seller account found." };

  const { data, error } = await supabase
    .from("cashout_requests")
    .select("id, amount, status, created_at")
    .eq("seller_id", seller.id)
    .order("created_at", { ascending: false });

  if (error) return { error: error.message };

  const cashouts: CashoutRow[] = (data ?? []).map((cr: CashoutQueryRow) => ({
    id: cr.id,
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

  const seller = await getSeller(supabase, user.id);
  if (!seller) return { error: "No seller account found." };

  const { data: products } = await supabase
    .from("products")
    .select("status")
    .eq("seller_id", seller.id);

  const totalProducts = products?.length ?? 0;
  const pendingProducts = products?.filter(p => p.status === "pending_review").length ?? 0;

  return {
    storeName: seller.store_name,
    storeStatus: seller.status,
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
  const seller = await getSeller(supabase, user.id);
  if (!seller) return { error: "No seller account found." };
  const newStatus = publish ? (seller.status === "approved" ? "approved" : "pending_review") : "draft";
  const adminDb = createAdminClient();
  const { error } = await adminDb
    .from("products")
    .update({ status: newStatus })
    .eq("id", productId)
    .eq("seller_id", seller.id);
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
  const seller = await getSeller(supabase, user.id);
  if (!seller) return { error: "No seller account found." };
  const updates: Record<string, unknown> = {};
  if (data.name !== undefined) updates.store_name = data.name;
  if (data.description !== undefined) updates.store_description = data.description;
  const { error } = await supabase
    .from("sellers")
    .update(updates)
    .eq("id", seller.id);
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
  { orders: { id: string; product_name: string; amount: number; status: string; date: string }[] }
  | { error: string }
> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };
  const seller = await getSeller(supabase, user.id);
  if (!seller) return { error: "No seller account found." };
  const { data, error } = await supabase
    .from("order_items")
    .select(`
      id, order_id, product_id, quantity, unit_price,
      order:orders(created_at, order_status),
      product:products(name)
    `)
    .eq("seller_id", seller.id)
    .order("order_id", { ascending: false })
    .limit(5);
  if (error) return { error: error.message };
  const orders = (data ?? []).map((oi: OrderItemQueryRow) => ({
    id: oi.order_id,
    product_name: oi.product?.[0]?.name ?? "Unknown",
    amount: Number(oi.unit_price) * oi.quantity,
    status: oi.order?.[0]?.order_status ?? "pending",
    date: oi.order?.[0]?.created_at
      ? new Date(oi.order[0].created_at).toLocaleDateString("en-CA")
      : "—",
  }));
  return { orders };
}

export async function getOrderDetails(orderId: string): Promise<
  | {
      order: {
        id: string;
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
  const { data: orderData, error: orderError } = await supabase
    .from("orders")
    .select(`id, total, order_status, created_at, customer_id, customer_name, customer_phone, shipping_address, shipping_city, shipping_area, payment_method`)
    .eq("id", orderId)
    .single();
  if (orderError) return { error: orderError.message };
  const { data: items } = await supabase
    .from("order_items")
    .select(`quantity, unit_price, product_name`)
    .eq("order_id", orderId);
  return {
    order: {
      id: orderData.id,
      total: Number(orderData.total),
      status: orderData.order_status,
      customer_name: orderData.customer_name ?? "—",
      customer_phone: orderData.customer_phone ?? "—",
      shipping_address: [
        orderData.shipping_address,
        orderData.shipping_area,
        orderData.shipping_city,
      ].filter(Boolean).join(", ") || "—",
      payment_method: orderData.payment_method ?? "—",
      created_at: new Date(orderData.created_at).toLocaleDateString("en-CA"),
      items: (items ?? []).map((i: { quantity: number; unit_price: number; product_name: string }) => ({
        product_name: i.product_name ?? "Unknown",
        quantity: i.quantity,
        price: Number(i.unit_price),
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
  const allowed = ["pending", "processing", "shipped"];
  if (!allowed.includes(status)) return { error: "Cannot set this status." };
  const adminDb = createAdminClient();
  const { error } = await adminDb
    .from("orders")
    .update({ order_status: status })
    .eq("id", orderId);
  if (error) return { error: error.message };
  return { success: true };
}
