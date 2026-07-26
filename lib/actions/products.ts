"use server";

import { createClient } from "@/lib/supabase/server";

interface ProductQueryRow {
  id: number;
  name: string;
  price: number;
  images: unknown;
  description?: string | null;
  stock?: number;
  category_id?: number;
  category?: { name: string; type: string; season: string | null }[] | null;
  store?: { name: string }[] | null;
}

export interface ProductListItem {
  id: string;
  name: string;
  price: number;
  image: string;
}

export interface ProductDetail {
  id: string;
  name: string;
  price: number;
  description: string;
  fullDescription: string;
  images: string[];
  category: string;
  storeName: string;
  stock: number;
  category_id: number;
}

export interface CategoryInfo {
  name: string;
  type: string;
  season: string | null;
}

export interface ProductFilters {
  search?: string;
  category?: string[];
  season?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResult {
  products: ProductListItem[];
  total: number;
  page: number;
  totalPages: number;
}

const PLACEHOLDER = "https://placehold.co/400x300/2F3D9A/FAFFC4?text=Product";

function firstImage(images: unknown): string {
  if (Array.isArray(images) && images.length > 0) return images[0];
  return PLACEHOLDER;
}

function extractImages(images: unknown): string[] {
  if (Array.isArray(images)) return images;
  return [];
}

export async function getCategories(): Promise<CategoryInfo[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("name, type, season")
    .order("name");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getProducts(
  filters: ProductFilters = {},
): Promise<PaginatedResult> {
  const supabase = await createClient();
  const page = Math.max(1, filters.page || 1);
  const limit = Math.min(50, Math.max(1, filters.limit || 9));

  const categoryNameFilters: string[] = [];
  if (filters.season) {
    const seasonMap: Record<string, string> = {
      rainy: "Rainy Season",
      summer: "Summer Season",
      winter: "Winter Season",
    };
    categoryNameFilters.push(seasonMap[filters.season]);
  }
  if (filters.category && filters.category.length > 0) {
    categoryNameFilters.push(...filters.category);
  }

  let categoryIds: number[] | undefined;
  if (categoryNameFilters.length > 0) {
    const { data: cats } = await supabase
      .from("categories")
      .select("id")
      .in("name", categoryNameFilters);
    categoryIds = (cats ?? []).map((c) => c.id);
    if (categoryIds.length === 0)
      return { products: [], total: 0, page, totalPages: 0 };
  }

  let query = supabase
    .from("products")
    .select(
      `
      id, name, price, images, description, stock, category_id,
      category:categories(name, type, season),
      store:stores(name)
    `,
      { count: "exact" },
    )
    .eq("status", "active");

  if (categoryIds && categoryIds.length > 0) {
    query = query.in("category_id", categoryIds);
  }

  if (filters.search) {
    query = query.ilike("name", `%${filters.search}%`);
  }
  if (filters.minPrice !== undefined) {
    query = query.gte("price", filters.minPrice);
  }
  if (filters.maxPrice !== undefined) {
    query = query.lte("price", filters.maxPrice);
  }

  if (filters.sort === "price-asc") {
    query = query.order("price", { ascending: true });
  } else if (filters.sort === "price-desc") {
    query = query.order("price", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const from = (page - 1) * limit;
  query = query.range(from, from + limit - 1);

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);

  const products: ProductListItem[] = (data ?? []).map(
    (p: ProductQueryRow) => ({
      id: String(p.id),
      name: p.name,
      price: p.price,
      image: firstImage(p.images),
    }),
  );

  return {
    products,
    total: count ?? 0,
    page,
    totalPages: Math.ceil((count ?? 0) / limit),
  };
}

export async function getProductById(
  id: string,
): Promise<ProductDetail | null> {
  const supabase = await createClient();
  const numId = Number(id);
  if (isNaN(numId)) return null;

  const { data, error } = await supabase
    .from("products")
    .select(
      `
      id, name, price, description, images, stock, category_id,
      category:categories(name, type, season),
      store:stores(name)
    `,
    )
    .eq("id", numId)
    .eq("status", "active")
    .single();

  if (error || !data) return null;

  const p = data as ProductQueryRow;
  const images = extractImages(p.images);

  return {
    id: String(p.id),
    name: p.name,
    price: p.price,
    description: p.description ?? "",
    fullDescription: p.description ?? "",
    images: images.length > 0 ? images : [PLACEHOLDER],
    category: p.category?.[0]?.name ?? "Uncategorized",
    storeName: p.store?.[0]?.name ?? "Unknown Store",
    stock: p.stock ?? 0,
    category_id: p.category_id ?? 0,
  };
}

export async function getProductsBySeason(
  season: string,
): Promise<ProductListItem[]> {
  const supabase = await createClient();
  const seasonMap: Record<string, string> = {
    rainy: "Rainy Season",
    summer: "Summer Season",
    winter: "Winter Season",
  };
  const categoryName = seasonMap[season];
  if (!categoryName) return [];

  const { data: cat } = await supabase
    .from("categories")
    .select("id")
    .eq("name", categoryName)
    .single();
  if (!cat) return [];

  const { data, error } = await supabase
    .from("products")
    .select("id, name, price, images")
    .eq("category_id", cat.id)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((p: ProductQueryRow) => ({
    id: String(p.id),
    name: p.name,
    price: p.price,
    image: firstImage(p.images),
  }));
}
