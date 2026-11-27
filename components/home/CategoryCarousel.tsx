"use client";

import { Button } from "@/components/ui/button";
import { Product } from "@/types/product";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import ProductCard from "./ProductCard";

interface CategoryCarouselProps {
  title: string;
  categoryKey: string;
  products: Product[];
}

export default function CategoryCarousel({
  title,
  categoryKey,
  products,
}: CategoryCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  useEffect(() => {
    if (products.length <= 1) return;
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [products]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const scrollAmount = Math.min(el.clientWidth * 0.75, 480);
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (!products || products.length === 0) return null;

  return (
    <section className="py-4 sm:py-6">
      {/* Category Header (Clean title with no count and no subtitle) */}
      <div className="flex items-center justify-between mb-3.5 sm:mb-5">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
          {title}
        </h2>

        <div className="flex items-center gap-2">
          {/* Scroll Nav Buttons (only show when there are 2 or more products) */}
          {products.length > 1 && (
            <div className="hidden sm:flex items-center gap-1.5 mr-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => scroll("left")}
                disabled={!canScrollLeft}
                className="h-8 w-8 rounded-full border-border/80 hover:bg-accent disabled:opacity-30 transition-all cursor-pointer"
                aria-label={`Scroll ${title} left`}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => scroll("right")}
                disabled={!canScrollRight}
                className="h-8 w-8 rounded-full border-border/80 hover:bg-accent disabled:opacity-30 transition-all cursor-pointer"
                aria-label={`Scroll ${title} right`}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-xs sm:text-sm font-medium text-primary hover:text-primary/80 hover:bg-primary/5 px-2.5 h-8"
          >
            <Link
              href={`/shop?category=${encodeURIComponent(categoryKey)}`}
              className="flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Product Content: Single static card on mobile/desktop without horizontal scrolling if 1 product; otherwise horizontal carousel */}
      {products.length === 1 ? (
        <div className="w-[190px] sm:w-[220px] md:w-[240px]">
          <ProductCard product={products[0]} />
        </div>
      ) : (
        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="flex gap-4 overflow-x-auto scroll-smooth pb-3 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory scrollbar-none"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="w-[190px] sm:w-[220px] md:w-[240px] shrink-0 snap-start"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
