"use client";

import CategoryCarousel from "@/components/home/CategoryCarousel";
import {
  BASE_CATEGORIES,
  fetchCategories,
  fetchProducts,
  PRODUCTS_UPDATED_EVENT,
} from "@/lib/products";
import { Product } from "@/types/product";
import { Clock } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

interface HomeClientProps {
  initialProducts: Product[];
  initialCategories: string[];
}

export default function HomeClient({
  initialProducts,
  initialCategories,
}: HomeClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categories, setCategories] = useState<string[]>(initialCategories);

  useEffect(() => {
    let active = true;
    const loadData = async () => {
      try {
        const [prodList, catList] = await Promise.all([
          fetchProducts(),
          fetchCategories(),
        ]);
        if (!active) return;
        setProducts(prodList);
        setCategories(catList);
      } catch {
        // ignore
      }
    };

    window.addEventListener(PRODUCTS_UPDATED_EVENT, loadData);
    window.addEventListener("storage", loadData);
    return () => {
      active = false;
      window.removeEventListener(PRODUCTS_UPDATED_EVENT, loadData);
      window.removeEventListener("storage", loadData);
    };
  }, []);

  // Compute active categories: only categories that have at least 1 product
  const activeCategories = useMemo(() => {
    const seen = new Set<string>();
    const uniqueCatNames: string[] = [];

    const candidateList = [
      ...BASE_CATEGORIES,
      ...categories,
      ...products.map((p) => p.category).filter(Boolean),
    ];

    for (const cat of candidateList) {
      const lower = cat.toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        uniqueCatNames.push(cat);
      }
    }

    return uniqueCatNames
      .map((catName) => {
        const catProducts = products.filter(
          (p) => p.category?.toLowerCase() === catName.toLowerCase()
        );
        return {
          name: catName,
          products: catProducts,
        };
      })
      .filter((c) => c.products.length > 0);
  }, [products, categories]);

  const pillCategories = useMemo(() => {
    return [
      { name: "All", href: "/shop" },
      ...activeCategories.map((c) => ({
        name: c.name,
        href: `/shop?category=${encodeURIComponent(c.name)}`,
      })),
    ];
  }, [activeCategories]);

  return (
    <div className="bg-background min-h-screen">
      {/* Categories Navigation Pills: Horizontal Scrollable (YouTube Style) */}
      <nav
        aria-label="Product categories"
        className="border-b border-border/50 bg-background/95 sticky top-[57px] z-30 backdrop-blur-md"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="flex items-center gap-2 overflow-x-auto py-3 scroll-smooth scrollbar-none"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {pillCategories.map((cat, index) => (
              <Link key={cat.name} href={cat.href} className="shrink-0">
                <span
                  className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer ${
                    index === 0
                      ? "bg-foreground text-background font-semibold shadow-xs"
                      : "bg-muted/70 text-foreground hover:bg-muted border border-border/50"
                  }`}
                >
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Store Location Google Map */}
      <section className="py-6 sm:py-8 border-b border-border/60 bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="p-4 sm:p-5 border-b border-border/60 bg-card">
                <h1 className="font-bold text-base sm:text-lg text-foreground tracking-tight">
                  Bloom shop
                </h1>
                <p className="text-muted-foreground flex flex-wrap items-center gap-x-1.5 gap-y-0.5 mt-1">
                  <span className="text-xs">Uhuru Street, Thika Town, Kenya</span>
                  <span className="text-xs">&bull;</span>
                  <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs">
                    <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
                    10:00 AM - 8:00 PM
                  </span>
                </p>
              </div>

              <div className="relative w-full h-[220px] sm:h-[280px] bg-muted/40">
                <iframe
                  title="Bloom shop Thika Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.1554562217684!2d37.0693343!3d-1.0332801!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f4e8574d53cb1%3A0x6e9f196be1492ba2!2sThika%2C%20Kenya!5e0!3m2!1sen!2ske!4v1710000000000!5m2!1sen!2ske"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full opacity-90 hover:opacity-100 transition-opacity"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog Carousels Container */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-10">
        {activeCategories.map((cat) => (
          <CategoryCarousel
            key={cat.name}
            title={cat.name}
            categoryKey={cat.name}
            products={cat.products}
          />
        ))}
      </div>
    </div>
  );
}
