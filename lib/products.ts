import defaultProducts from "@/data/products.json";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { Product } from "@/types/product";

export const BASE_CATEGORIES = ["Shoes", "T-Shirts", "Hoodies", "Accessories"];
const CUSTOM_PRODUCTS_KEY = "bloom_custom_products";
const DELETED_PRODUCTS_KEY = "bloom_deleted_products";
const CUSTOM_CATEGORIES_KEY = "bloom_custom_categories";
export const PRODUCTS_UPDATED_EVENT = "bloom:products-updated";

interface DbProductRow {
  id: number;
  name: string;
  price: number;
  original_price: number | null;
  category: string;
  image: string;
  images: string[] | null;
  description: string;
  badge: string | null;
  rating: number | string | null;
  reviews_count: number | null;
  is_sold_out: boolean;
}

function mapDbRowToProduct(row: DbProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    price: row.price,
    originalPrice: row.original_price ?? undefined,
    category: row.category,
    image: row.image,
    images: row.images && row.images.length > 0 ? row.images : [row.image],
    description: row.description,
    badge: row.badge ?? undefined,
    rating: row.rating !== null ? Number(row.rating) : 5.0,
    reviewsCount: row.reviews_count ?? 0,
    isSoldOut: row.is_sold_out,
  };
}

export function notifyProductsUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(PRODUCTS_UPDATED_EVENT));
    window.dispatchEvent(new Event("storage"));
  }
}

// ─── LocalStorage fallback helpers ──────────────────────────────────────────

export function getCustomProducts(): Product[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(CUSTOM_PRODUCTS_KEY);
    return stored ? (JSON.parse(stored) as Product[]) : [];
  } catch {
    return [];
  }
}

export function getDeletedProductIds(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(DELETED_PRODUCTS_KEY);
    return stored ? (JSON.parse(stored) as number[]) : [];
  } catch {
    return [];
  }
}

export function getStoredProducts(): Product[] {
  const defaults = defaultProducts as Product[];
  if (typeof window === "undefined") return defaults;

  const customList = getCustomProducts();
  const deletedSet = new Set(getDeletedProductIds());

  const customById = new Map<number, Product>();
  customList.forEach((p) => customById.set(p.id, p));

  const defaultIds = new Set(defaults.map((p) => p.id));

  const createdProducts = customList.filter(
    (p) => !defaultIds.has(p.id) && !deletedSet.has(p.id)
  );

  const mergedDefaults = defaults
    .filter((p) => !deletedSet.has(p.id))
    .map((p) => customById.get(p.id) ?? p);

  return [...createdProducts, ...mergedDefaults];
}

export function saveProductUpdate(updated: Product): void {
  if (typeof window === "undefined") return;
  const customList = getCustomProducts();
  const existingIndex = customList.findIndex((p) => p.id === updated.id);

  if (existingIndex >= 0) {
    customList[existingIndex] = updated;
  } else {
    customList.unshift(updated);
  }

  localStorage.setItem(CUSTOM_PRODUCTS_KEY, JSON.stringify(customList));
  notifyProductsUpdated();
}

export function deleteStoredProduct(id: number): void {
  if (typeof window === "undefined") return;

  const customList = getCustomProducts().filter((p) => p.id !== id);
  localStorage.setItem(CUSTOM_PRODUCTS_KEY, JSON.stringify(customList));

  const defaults = defaultProducts as Product[];
  if (defaults.some((p) => p.id === id)) {
    const deleted = new Set(getDeletedProductIds());
    deleted.add(id);
    localStorage.setItem(
      DELETED_PRODUCTS_KEY,
      JSON.stringify(Array.from(deleted))
    );
  }

  notifyProductsUpdated();
}

// ─── Supabase Storage Upload ────────────────────────────────────────────────

export async function uploadProductImage(dataUrlOrUrl: string): Promise<string> {
  if (!dataUrlOrUrl.startsWith("data:") || !supabase || !isSupabaseConfigured) {
    return dataUrlOrUrl;
  }

  try {
    const res = await fetch(dataUrlOrUrl);
    const blob = await res.blob();
    const ext = blob.type.split("/")[1] || "jpg";
    const fileName = `product-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}.${ext}`;

    const { error } = await supabase.storage
      .from("product-images")
      .upload(fileName, blob, {
        contentType: blob.type || "image/jpeg",
        upsert: false,
      });

    if (error) {
      return dataUrlOrUrl;
    }

    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(fileName);

    return data.publicUrl || dataUrlOrUrl;
  } catch {
    return dataUrlOrUrl;
  }
}

// ─── Supabase Products CRUD ─────────────────────────────────────────────────

export async function fetchProducts(): Promise<Product[]> {
  if (!supabase || !isSupabaseConfigured) {
    return getStoredProducts();
  }

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) {
    return getStoredProducts();
  }

  return (data as DbProductRow[]).map(mapDbRowToProduct);
}

export async function fetchProductById(id: number): Promise<Product | null> {
  if (!Number.isFinite(id)) return null;

  if (!supabase || !isSupabaseConfigured) {
    return getStoredProducts().find((p) => p.id === id) ?? null;
  }

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return getStoredProducts().find((p) => p.id === id) ?? null;
  }

  if (!data) return null;
  return mapDbRowToProduct(data as DbProductRow);
}

export async function createProductInDb(
  input: Omit<Product, "id">
): Promise<{ product: Product | null; error?: string }> {
  if (!supabase || !isSupabaseConfigured) {
    const created: Product = { ...input, id: Date.now() };
    saveProductUpdate(created);
    return { product: created };
  }

  const uploadedImages = await Promise.all(
    (input.images && input.images.length > 0 ? input.images : [input.image]).map(
      (img) => uploadProductImage(img)
    )
  );

  const { data, error } = await supabase
    .from("products")
    .insert({
      name: input.name,
      price: input.price,
      original_price: input.originalPrice ?? null,
      category: input.category,
      image: uploadedImages[0],
      images: uploadedImages,
      description: input.description,
      badge: input.badge ?? null,
      rating: input.rating ?? 5.0,
      reviews_count: input.reviewsCount ?? 0,
      is_sold_out: Boolean(input.isSoldOut),
    })
    .select()
    .single();

  if (error || !data) {
    return {
      product: null,
      error: error?.message || "Failed to save product to database.",
    };
  }

  const created = mapDbRowToProduct(data as DbProductRow);
  notifyProductsUpdated();
  return { product: created };
}

export async function updateProductInDb(
  updated: Product
): Promise<{ product: Product | null; error?: string }> {
  if (!supabase || !isSupabaseConfigured) {
    saveProductUpdate(updated);
    return { product: updated };
  }

  const uploadedImages = await Promise.all(
    (updated.images && updated.images.length > 0
      ? updated.images
      : [updated.image]
    ).map((img) => uploadProductImage(img))
  );

  const { data, error } = await supabase
    .from("products")
    .update({
      name: updated.name,
      price: updated.price,
      original_price: updated.originalPrice ?? null,
      category: updated.category,
      image: uploadedImages[0],
      images: uploadedImages,
      description: updated.description,
      badge: updated.badge ?? null,
      is_sold_out: Boolean(updated.isSoldOut),
    })
    .eq("id", updated.id)
    .select()
    .single();

  if (error || !data) {
    return {
      product: null,
      error: error?.message || "Failed to update product in database.",
    };
  }

  const mapped = mapDbRowToProduct(data as DbProductRow);
  notifyProductsUpdated();
  return { product: mapped };
}

export async function deleteProductInDb(
  id: number
): Promise<{ error?: string }> {
  if (!supabase || !isSupabaseConfigured) {
    deleteStoredProduct(id);
    return {};
  }

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) {
    return { error: error.message };
  }

  notifyProductsUpdated();
  return {};
}

// ─── Supabase Categories ────────────────────────────────────────────────────

export function getLocalCategories(): string[] {
  if (typeof window === "undefined") return BASE_CATEGORIES;
  try {
    const storedCats = localStorage.getItem(CUSTOM_CATEGORIES_KEY);
    if (!storedCats) return BASE_CATEGORIES;
    const custom: string[] = JSON.parse(storedCats);
    return Array.from(new Set([...BASE_CATEGORIES, ...custom]));
  } catch {
    return BASE_CATEGORIES;
  }
}

export async function fetchCategories(): Promise<string[]> {
  if (!supabase || !isSupabaseConfigured) {
    return getLocalCategories();
  }

  const { data, error } = await supabase
    .from("categories")
    .select("name")
    .order("name", { ascending: true });

  if (error || !data || data.length === 0) {
    return getLocalCategories();
  }

  const names = (data as { name: string }[]).map((r) => r.name);
  return Array.from(new Set([...BASE_CATEGORIES, ...names]));
}

export async function createCategoryInDb(
  name: string
): Promise<{ error?: string }> {
  const trimmed = name.trim();
  if (!trimmed) return {};

  if (typeof window !== "undefined") {
    try {
      const storedCustom: string[] = JSON.parse(
        localStorage.getItem(CUSTOM_CATEGORIES_KEY) || "[]"
      );
      if (!storedCustom.includes(trimmed)) {
        storedCustom.push(trimmed);
        localStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(storedCustom));
      }
    } catch {
      // ignore
    }
  }

  if (!supabase || !isSupabaseConfigured) {
    notifyProductsUpdated();
    return {};
  }

  const { error } = await supabase
    .from("categories")
    .insert({ name: trimmed });

  if (error && !error.message.toLowerCase().includes("duplicate")) {
    return { error: error.message };
  }

  notifyProductsUpdated();
  return {};
}
