import defaultProducts from "@/data/products.json";
import { Product } from "@/types/product";

const CUSTOM_PRODUCTS_KEY = "bloom_custom_products";
const DELETED_PRODUCTS_KEY = "bloom_deleted_products";

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

  // Newly created custom products (not in defaultProducts)
  const createdProducts = customList.filter(
    (p) => !defaultIds.has(p.id) && !deletedSet.has(p.id)
  );

  // Default products with any edits applied and deleted ones removed
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
  window.dispatchEvent(new Event("storage"));
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

  window.dispatchEvent(new Event("storage"));
}
