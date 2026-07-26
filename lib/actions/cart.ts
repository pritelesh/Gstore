"use server";

import { createClient } from "@/lib/supabase/server";

interface CartJoinRow {
  product_id: number;
  quantity: number;
  product: { name: string; price: number; images: unknown }[] | null;
}

export interface CartItemData {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

const PLACEHOLDER = "https://placehold.co/400x300/2F3D9A/FAFFC4?text=Product";

function firstImage(images: unknown): string {
  if (Array.isArray(images) && images.length > 0) return images[0];
  return PLACEHOLDER;
}

async function fetchCartItems(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<CartItemData[]> {
  const { data } = await supabase
    .from("cart_items")
    .select(`
      product_id,
      quantity,
      product:products(name, price, images)
    `)
    .eq("customer_id", userId);

  return (data ?? []).map((row: CartJoinRow) => ({
    id: String(row.product_id),
    name: row.product?.[0]?.name ?? "Unknown",
    price: row.product?.[0]?.price ?? 0,
    image: firstImage(row.product?.[0]?.images),
    quantity: row.quantity,
  }));
}

export async function fetchCart(): Promise<
  { items: CartItemData[] } | { error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { items: [] };

  const items = await fetchCartItems(supabase, user.id);
  return { items };
}

export async function addToCart(
  productId: string,
  quantity: number = 1,
): Promise<{ items: CartItemData[] } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please log in to add items to your cart." };

  const numId = Number(productId);
  if (isNaN(numId)) return { error: "Invalid product." };

  const { data: existing } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("customer_id", user.id)
    .eq("product_id", numId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("cart_items")
      .update({ quantity: existing.quantity + quantity })
      .eq("id", existing.id);
  } else {
    await supabase.from("cart_items").insert({
      customer_id: user.id,
      product_id: numId,
      quantity,
    });
  }

  const items = await fetchCartItems(supabase, user.id);
  return { items };
}

export async function updateCartItem(
  productId: string,
  quantity: number,
): Promise<{ items: CartItemData[] } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const numId = Number(productId);
  if (isNaN(numId)) return { error: "Invalid product." };

  if (quantity <= 0) {
    await supabase
      .from("cart_items")
      .delete()
      .eq("customer_id", user.id)
      .eq("product_id", numId);
  } else {
    await supabase
      .from("cart_items")
      .update({ quantity })
      .eq("customer_id", user.id)
      .eq("product_id", numId);
  }

  const items = await fetchCartItems(supabase, user.id);
  return { items };
}

export async function removeFromCart(
  productId: string,
): Promise<{ items: CartItemData[] } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const numId = Number(productId);
  if (!isNaN(numId)) {
    await supabase
      .from("cart_items")
      .delete()
      .eq("customer_id", user.id)
      .eq("product_id", numId);
  }

  const items = await fetchCartItems(supabase, user.id);
  return { items };
}

export async function clearCartItems(): Promise<
  { success: true } | { error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  await supabase
    .from("cart_items")
    .delete()
    .eq("customer_id", user.id);

  return { success: true };
}
