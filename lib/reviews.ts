export interface Review {
  id: string;
  productId: number;
  author: string;
  rating: number; // 1–5
  comment: string;
  date: string; // ISO string
}

// Seed reviews shown before real DB is connected
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
  {
    id: "mock-3",
    author: "Sam O.",
    rating: 5,
    comment:
      "Worth every shilling. The quality is outstanding — you can tell a lot of care went into this. Highly recommend.",
    date: "2026-11-10T09:00:00Z",
  },
  {
    id: "mock-4",
    author: "Chris W.",
    rating: 3,
    comment:
      "Good product overall, delivery took a little longer than expected but the item itself is solid quality.",
    date: "2026-11-05T16:00:00Z",
  },
];

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

export function getAverageRating(productId: number): number {
  const reviews = getAllReviews(productId);
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}

export function getRatingBreakdown(productId: number): Record<number, number> {
  const reviews = getAllReviews(productId);
  const breakdown: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviews.forEach((r) => {
    breakdown[r.rating] = (breakdown[r.rating] || 0) + 1;
  });
  return breakdown;
}
