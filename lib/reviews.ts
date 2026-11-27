import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export interface Review {
  id: string;
  productId: number;
  author: string;
  rating: number; // 1–5
  comment: string;
  date: string; // ISO string
}

interface DbReviewRow {
  id: string;
  product_id: number;
  author: string;
  rating: number;
  comment: string;
  created_at: string;
}

// Seed reviews shown only when Supabase is not configured yet
const MOCK_REVIEWS: Omit<Review, "productId">[] = [
  {
    id: "mock-1",
    author: "Alex M.",
    rating: 5,
    comment:
      "Absolutely love this! Premium quality and delivery was faster than expected. Already ordered a second one.",
    date: "2026-11-20T10:00:00Z",
  },
  {
    id: "mock-2",
    author: "Jordan K.",
    rating: 4,
    comment:
      "Really solid product. Fits perfectly and looks exactly like the photos. Great value for the price.",
    date: "2026-11-15T14:30:00Z",
  },
];

function mapDbReview(row: DbReviewRow): Review {
  return {
    id: row.id,
    productId: row.product_id,
    author: row.author,
    rating: row.rating,
    comment: row.comment,
    date: row.created_at,
  };
}

export function getStoredReviews(productId: number): Review[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(`bloom_reviews_${productId}`);
    return raw ? (JSON.parse(raw) as Review[]) : [];
  } catch {
    return [];
  }
}

export function saveReview(review: Review): void {
  if (typeof window === "undefined") return;
  const existing = getStoredReviews(review.productId);
  localStorage.setItem(
    `bloom_reviews_${review.productId}`,
    JSON.stringify([review, ...existing])
  );
}

export function getAllReviews(productId: number): Review[] {
  const stored = getStoredReviews(productId);
  const mocks = MOCK_REVIEWS.map((r) => ({ ...r, productId }));
  return [...stored, ...mocks];
}

export async function fetchReviews(productId: number): Promise<Review[]> {
  if (!supabase || !isSupabaseConfigured) {
    return getAllReviews(productId);
  }

  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return getAllReviews(productId);
  }

  return (data as DbReviewRow[]).map(mapDbReview);
}

export async function createReviewInDb(input: {
  productId: number;
  author: string;
  rating: number;
  comment: string;
}): Promise<{ review: Review | null; error?: string }> {
  if (!supabase || !isSupabaseConfigured) {
    const localReview: Review = {
      id: `r-${Date.now()}`,
      productId: input.productId,
      author: input.author,
      rating: input.rating,
      comment: input.comment,
      date: new Date().toISOString(),
    };
    saveReview(localReview);
    return { review: localReview };
  }

  const { data, error } = await supabase
    .from("reviews")
    .insert({
      product_id: input.productId,
      author: input.author,
      rating: input.rating,
      comment: input.comment,
    })
    .select()
    .single();

  if (error || !data) {
    return {
      review: null,
      error: error?.message || "Failed to save review.",
    };
  }

  return { review: mapDbReview(data as DbReviewRow) };
}
