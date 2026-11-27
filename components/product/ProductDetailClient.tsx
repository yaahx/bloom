"use client";

import ProductBreadcrumb from "@/components/product/ProductBreadcrumb";
import ProductNotFound from "@/components/product/ProductNotFound";
import RelatedProducts from "@/components/product/RelatedProducts";
import ReviewsDrawer from "@/components/product/ReviewsDrawer";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/context/CartContext";
import { fetchProductById, fetchProducts } from "@/lib/products";
import { fetchReviews, type Review } from "@/lib/reviews";
import { formatKES } from "@/lib/utils";
import { Product } from "@/types/product";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Minus,
  Plus,
  ShoppingBag,
  Star,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ProductDetailClientProps {
  productId: number;
  initialProduct: Product | null;
  initialProducts: Product[];
  initialReviews: Review[];
}

export default function ProductDetailClient({
  productId,
  initialProduct,
  initialProducts,
  initialReviews,
}: ProductDetailClientProps) {
  const { addToCart } = useCart();
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(initialProduct);
  const [allProducts, setAllProducts] = useState<Product[]>(initialProducts);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Reviews drawer
  const [reviewsOpen, setReviewsOpen] = useState(false);
  const [liveRating, setLiveRating] = useState<{ avg: number; count: number } | null>(
    () => {
      if (initialReviews.length === 0) return null;
      const avg =
        Math.round(
          (initialReviews.reduce((s, r) => s + r.rating, 0) /
            initialReviews.length) *
            10
        ) / 10;
      return { avg, count: initialReviews.length };
    }
  );

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [productId]);

  // Fallback client load only if server didn't have localStorage products
  useEffect(() => {
    if (!initialProduct) {
      fetchProductById(productId).then((p) => {
        if (p) setProduct(p);
      });
    }
    if (initialProducts.length === 0) {
      fetchProducts().then(setAllProducts);
    }
  }, [productId, initialProduct, initialProducts.length]);

  // Re-compute live rating after reviews drawer closes
  useEffect(() => {
    if (!product || reviewsOpen) return;
    fetchReviews(product.id).then((reviews) => {
      if (reviews.length === 0) return;
      const avg =
        Math.round(
          (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10
        ) / 10;
      setLiveRating({ avg, count: reviews.length });
    });
  }, [product, reviewsOpen]);

  if (!product) {
    return <ProductNotFound />;
  }

  const productImages =
    product.images && product.images.length > 0
      ? product.images
      : [product.image];

  const displayRating = liveRating?.avg ?? product.rating ?? 4.8;
  const displayCount = liveRating?.count ?? product.reviewsCount ?? 0;

  const fullStars = Math.round(displayRating);

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? productImages.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === productImages.length - 1 ? 0 : prev + 1
    );
  };

  const handleAddToCart = async () => {
    setIsAdding(true);
    await new Promise((resolve) => setTimeout(resolve, 250));
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity,
    });
    setIsAdding(false);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity,
    });
    router.push("/checkout");
  };

  const handleQuantityChange = (type: "increment" | "decrement") => {
    if (type === "increment") setQuantity((prev) => prev + 1);
    else if (type === "decrement" && quantity > 1)
      setQuantity((prev) => prev - 1);
  };

  const whatsappInquiryUrl = `https://wa.me/254716836551?text=${encodeURIComponent(
    `Hello BloomShop! I am interested in ordering "${product.name}" (${formatKES(
      product.price
    )}). Do you have it in stock?`
  )}`;

  return (
    <>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <ProductBreadcrumb />

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-14 mb-14">
          {/* ── Product Media ──────────────────────────────────────────── */}
          <div className="space-y-4">
            <div className="w-full max-w-lg mx-auto">
              <div className="group/carousel relative aspect-square sm:aspect-[4/5] rounded-2xl overflow-hidden bg-muted/40 border border-border shadow-md">
                <Image
                  src={productImages[currentImageIndex] || product.image}
                  alt={`${product.name} — ${product.category} (${currentImageIndex + 1}) | BloomShop`}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 550px"
                  className="object-cover transition-opacity duration-300"
                />

                {productImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrevImage}
                      aria-label="Previous image"
                      className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-background/85 backdrop-blur-md text-foreground flex items-center justify-center border border-border shadow-md hover:bg-background hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>

                    <button
                      type="button"
                      onClick={handleNextImage}
                      aria-label="Next image"
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-background/85 backdrop-blur-md text-foreground flex items-center justify-center border border-border shadow-md hover:bg-background hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>

                    {/* Dot indicators */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/80 backdrop-blur-md border border-border/60">
                      {productImages.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setCurrentImageIndex(idx)}
                          aria-label={`Go to image ${idx + 1}`}
                          className={`transition-all rounded-full cursor-pointer ${
                            currentImageIndex === idx
                              ? "w-4 h-1.5 bg-primary"
                              : "w-1.5 h-1.5 bg-muted-foreground/40 hover:bg-foreground/60"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnail strip */}
              {productImages.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pt-2 pb-1">
                  {productImages.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                        currentImageIndex === idx
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-border hover:border-muted-foreground/40 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`${product.name} thumbnail ${idx + 1}`}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Product Info ───────────────────────────────────────────── */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs uppercase tracking-wider font-semibold text-primary">
                  {product.category}
                </span>
                <span>&bull;</span>
                <span
                  className={`text-xs font-medium ${
                    product.isSoldOut
                      ? "text-destructive"
                      : "text-muted-foreground"
                  }`}
                >
                  {product.isSoldOut ? "Out of Stock" : "In Stock"}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight">
                {product.name}
              </h1>

              {/* ── Rating row — click to open reviews drawer ── */}
              <button
                type="button"
                onClick={() => setReviewsOpen(true)}
                className="flex items-center gap-2 mt-2.5 group cursor-pointer"
                aria-label={`See all ${displayCount} reviews`}
              >
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i <= fullStars
                          ? "fill-amber-400 text-amber-400"
                          : "fill-transparent text-muted-foreground/25"
                      }`}
                    />
                  ))}
                </div>

                <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">
                  <span className="font-semibold text-foreground">
                    {displayRating}
                  </span>{" "}
                  &bull;{" "}
                  <span className="underline underline-offset-2 decoration-dotted">
                    {displayCount} reviews
                  </span>
                </span>
              </button>
            </div>

            {/* Pricing */}
            <div className="flex items-baseline gap-3">
              <span className="text-2xl sm:text-4xl font-black text-foreground">
                {formatKES(product.price)}
              </span>
              {product.originalPrice &&
                product.originalPrice > product.price && (
                  <span className="text-base sm:text-lg text-muted-foreground line-through">
                    {formatKES(product.originalPrice)}
                  </span>
                )}
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground leading-relaxed">
              {product.description}
            </p>

            <Separator />

            {/* Quantity */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
                Quantity
              </label>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-border rounded-xl bg-card">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleQuantityChange("decrement")}
                    disabled={quantity <= 1}
                    className="h-9 w-9 rounded-r-none"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </Button>
                  <span className="px-4 py-1.5 min-w-[48px] text-center font-bold text-sm">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleQuantityChange("increment")}
                    className="h-9 w-9 rounded-l-none"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <span className="text-xs text-muted-foreground">
                  Subtotal:{" "}
                  <strong className="text-foreground">
                    {formatKES(product.price * quantity)}
                  </strong>
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={isAdding || Boolean(product.isSoldOut)}
                  className="h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-sm rounded-xl gap-2 shadow-xs disabled:opacity-50"
                >
                  {product.isSoldOut ? (
                    <span>Out of Stock</span>
                  ) : isAdding ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : justAdded ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Added to Cart!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="h-4 w-4" />
                      <span>Add to Cart</span>
                    </>
                  )}
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleBuyNow}
                  disabled={Boolean(product.isSoldOut)}
                  className="h-11 border-foreground/30 hover:bg-foreground hover:text-background font-bold text-sm rounded-xl disabled:opacity-50"
                >
                  Fast Checkout Now
                </Button>
              </div>

              <a
                href={whatsappInquiryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] font-semibold text-xs sm:text-sm border border-[#25D366]/30 transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Inquire / Order Instantly via WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        <RelatedProducts product={product} initialProducts={allProducts} />
      </div>

      {/* Reviews drawer — rendered outside container for full-width */}
      <ReviewsDrawer
        isOpen={reviewsOpen}
        onClose={() => setReviewsOpen(false)}
        productId={product.id}
        productName={product.name}
      />
    </>
  );
}
