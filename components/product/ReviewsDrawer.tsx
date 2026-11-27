"use client";

import { getAllReviews, saveReview } from "@/lib/reviews";
import type { Review } from "@/lib/reviews";
import { Send, Star, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// ─── Helpers ────────────────────────────────────────────────────────────────

function avatarColorClass(name: string): string {
  const palette = [
    "bg-amber-100 text-amber-700",
    "bg-rose-100 text-rose-700",
    "bg-sky-100 text-sky-700",
    "bg-emerald-100 text-emerald-700",
    "bg-violet-100 text-violet-700",
    "bg-orange-100 text-orange-700",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
}

function formatRelative(dateStr: string): string {
  const diff = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 1000
  );
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d`;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ReviewSkeleton() {
  return (
    <div className="flex gap-3 px-4 py-4 animate-pulse">
      <div className="w-9 h-9 rounded-full bg-muted shrink-0" />
      <div className="flex-1 space-y-2 pt-0.5">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-20 bg-muted rounded-full" />
          <div className="h-2.5 w-10 bg-muted rounded-full" />
        </div>
        <div className="h-2.5 w-16 bg-muted rounded-full" />
        <div className="space-y-1.5 pt-1">
          <div className="h-2.5 w-full bg-muted rounded-full" />
          <div className="h-2.5 w-5/6 bg-muted rounded-full" />
          <div className="h-2.5 w-3/5 bg-muted rounded-full" />
        </div>
      </div>
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const initials = review.author
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const colorClass = avatarColorClass(review.author);

  return (
    <div className="flex gap-3 px-4 py-4 border-b border-border/50 last:border-0">
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 select-none ${colorClass}`}
      >
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-foreground leading-none">
            {review.author}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatRelative(review.date)}
          </span>
        </div>
        <div className="flex items-center gap-0.5 mt-1 mb-1.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              className={`h-3 w-3 ${
                i <= review.rating
                  ? "fill-amber-400 text-amber-400"
                  : "fill-transparent text-muted-foreground/25"
              }`}
            />
          ))}
        </div>
        <p className="text-sm text-foreground/80 leading-relaxed">
          {review.comment}
        </p>
      </div>
    </div>
  );
}

function RatingSummary({
  total,
  avg,
  breakdown,
}: {
  total: number;
  avg: number;
  breakdown: Record<number, number>;
}) {
  return (
    <div className="px-4 py-5 flex gap-5 items-center border-b border-border/60">
      {/* Big number */}
      <div className="text-center shrink-0 w-20">
        <div className="text-5xl font-black text-foreground leading-none tracking-tight">
          {avg.toFixed(1)}
        </div>
        <div className="flex items-center gap-0.5 mt-2 justify-center">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              className={`h-3 w-3 ${
                i <= Math.round(avg)
                  ? "fill-amber-400 text-amber-400"
                  : "fill-transparent text-muted-foreground/25"
              }`}
            />
          ))}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {total} review{total !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Bar breakdown */}
      <div className="flex-1 space-y-1.5">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = breakdown[star] || 0;
          const pct = total > 0 ? (count / total) * 100 : 0;
          return (
            <div key={star} className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-3 shrink-0 text-right">
                {star}
              </span>
              <Star className="h-2.5 w-2.5 text-amber-400 fill-amber-400 shrink-0" />
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground w-4 text-right shrink-0">
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Drawer ─────────────────────────────────────────────────────────────

interface ReviewsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  productId: number;
  productName: string;
}

const RATING_LABELS = ["", "Poor", "Fair", "Good", "Great", "Excellent"];

export default function ReviewsDrawer({
  isOpen,
  onClose,
  productId,
}: ReviewsDrawerProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);

  // Input state
  const [authorName, setAuthorName] = useState("");
  const [comment, setComment] = useState("");
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [nameError, setNameError] = useState(false);

  const bodyRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Mount / unmount with animation
  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      requestAnimationFrame(() =>
        requestAnimationFrame(() => setVisible(true))
      );
    } else {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 320);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // Lock body scroll + signal WhatsApp widget to hide while open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.body.setAttribute("data-reviews-open", "true");
    } else {
      document.body.style.overflow = "";
      document.body.removeAttribute("data-reviews-open");
    }
    return () => {
      document.body.style.overflow = "";
      document.body.removeAttribute("data-reviews-open");
    };
  }, [isOpen]);

  // Simulate loading reviews when drawer opens
  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    const t = setTimeout(() => {
      setReviews(getAllReviews(productId));
      setLoading(false);
    }, 1100);
    return () => clearTimeout(t);
  }, [isOpen, productId]);

  // Computed values
  const avg =
    reviews.length > 0
      ? Math.round(
          (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10
        ) / 10
      : 0;
  const breakdown: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviews.forEach((r) => {
    breakdown[r.rating] = (breakdown[r.rating] || 0) + 1;
  });

  const canSubmit =
    authorName.trim().length > 0 &&
    comment.trim().length > 0 &&
    selectedRating > 0;

  const handleSubmit = async () => {
    if (!authorName.trim()) {
      setNameError(true);
      return;
    }
    if (!canSubmit) return;

    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 500));

    const newReview: Review = {
      id: `r-${Date.now()}`,
      productId,
      author: authorName.trim(),
      rating: selectedRating,
      comment: comment.trim(),
      date: new Date().toISOString(),
    };
    saveReview(newReview);
    setReviews(getAllReviews(productId));

    // Reset form
    setComment("");
    setSelectedRating(0);
    setHoverRating(0);
    setSubmitting(false);

    // Scroll reviews to top to show new review
    if (bodyRef.current) bodyRef.current.scrollTop = 0;

    // Reset textarea height
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  if (!mounted) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Product reviews"
        className={`fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-2xl bg-background rounded-t-2xl flex flex-col transition-transform duration-300 ease-out ${
          visible ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ maxHeight: "90dvh" }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-foreground/10" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 shrink-0 border-b border-border/60">
          <h2 className="text-base font-bold text-foreground">Reviews</h2>
          <button
            onClick={onClose}
            aria-label="Close reviews"
            className="w-8 h-8 rounded-full bg-muted hover:bg-muted/70 flex items-center justify-center transition-colors"
          >
            <X className="h-4 w-4 text-foreground" />
          </button>
        </div>

        {/* Scrollable body */}
        <div
          ref={bodyRef}
          className="flex-1 overflow-y-auto overscroll-contain"
        >
          {/* Rating summary */}
          {!loading && reviews.length > 0 && (
            <RatingSummary total={reviews.length} avg={avg} breakdown={breakdown} />
          )}

          {/* Reviews list */}
          {loading ? (
            <div>
              <ReviewSkeleton />
              <ReviewSkeleton />
              <ReviewSkeleton />
              <ReviewSkeleton />
            </div>
          ) : reviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="h-7 w-7 text-muted-foreground/20" />
                ))}
              </div>
              <p className="text-sm font-semibold text-foreground">
                No reviews yet
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Be the first to share your thoughts
              </p>
            </div>
          ) : (
            <div>
              {reviews.map((r) => (
                <ReviewCard key={r.id} review={r} />
              ))}
            </div>
          )}

          <div className="h-2" />
        </div>

        {/* ── Compose area ─────────────────────────────────────────────── */}
        <div className="shrink-0 border-t border-border/60 bg-background pt-3 pb-6">
          {/* Name field */}
          <div className="px-4 pb-2">
            <input
              type="text"
              placeholder="Your name"
              value={authorName}
              onChange={(e) => {
                setAuthorName(e.target.value);
                setNameError(false);
              }}
              className={`w-full text-sm bg-transparent outline-none border-b pb-2 placeholder:text-muted-foreground/40 text-foreground transition-colors ${
                nameError
                  ? "border-destructive placeholder:text-destructive/50"
                  : "border-border/50 focus:border-primary"
              }`}
            />
          </div>

          {/* Star picker */}
          <div className="px-4 pb-2.5 flex items-center gap-2">
            <span className="text-xs text-muted-foreground min-w-[52px]">
              {selectedRating === 0
                ? "Rate it"
                : RATING_LABELS[selectedRating]}
            </span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setSelectedRating(star)}
                  className="active:scale-125 transition-transform duration-100"
                  aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                >
                  <Star
                    className={`h-6 w-6 transition-colors duration-100 ${
                      star <= (hoverRating || selectedRating)
                        ? "fill-amber-400 text-amber-400"
                        : "fill-transparent text-muted-foreground/30"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comment row */}
          <div className="flex items-end gap-2 px-4">
            <textarea
              ref={textareaRef}
              placeholder="Share your thoughts…"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={1}
              onInput={(e) => {
                const el = e.target as HTMLTextAreaElement;
                el.style.height = "auto";
                el.style.height = Math.min(el.scrollHeight, 100) + "px";
              }}
              className="flex-1 text-sm resize-none overflow-hidden bg-muted/60 rounded-2xl px-4 py-2.5 outline-none placeholder:text-muted-foreground/40 text-foreground focus:bg-muted transition-colors leading-relaxed"
              style={{ minHeight: "40px" }}
            />
            <button
              onClick={handleSubmit}
              disabled={!canSubmit || submitting}
              aria-label="Post review"
              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 mb-0.5 ${
                canSubmit && !submitting
                  ? "bg-primary text-primary-foreground scale-100"
                  : "bg-muted text-muted-foreground/30 scale-95"
              }`}
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
