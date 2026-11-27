"use client";

import ProductCard from "@/components/home/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import defaultProducts from "@/data/products.json";
import { getStoredProducts } from "@/lib/products";
import { formatKES } from "@/lib/utils";
import { Product } from "@/types/product";
import {
  ArrowUpDown,
  Check,
  Filter,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function ShopClient() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "All";
  const initialSearch = searchParams.get("search") || "";

  const [products, setProducts] = useState<Product[]>(defaultProducts as Product[]);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [maxPrice, setMaxPrice] = useState<number>(6000);
  const [sortBy, setSortBy] = useState<string>("featured");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState<boolean>(false);

  const [categories, setCategories] = useState<string[]>([
    "All",
    "Shoes",
    "T-Shirts",
    "Hoodies",
    "Accessories",
  ]);

  // Sync products and categories with local storage if admin added products or categories
  useEffect(() => {
    const loadData = () => {
      try {
        setProducts(getStoredProducts());

        const storedCats = localStorage.getItem("bloom_custom_categories");
        if (storedCats) {
          const customCats: string[] = JSON.parse(storedCats);
          setCategories([
            "All",
            ...Array.from(
              new Set(["Shoes", "T-Shirts", "Hoodies", "Accessories", ...customCats])
            ),
          ]);
        }
      } catch {
        // ignore
      }
    };
    loadData();

    window.addEventListener("storage", loadData);
    return () => window.removeEventListener("storage", loadData);
  }, []);

  // Update from URL params
  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) setSelectedCategory(cat);
    const q = searchParams.get("search");
    if (q) setSearchQuery(q);
  }, [searchParams]);

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Category filter
        if (selectedCategory !== "All" && p.category !== selectedCategory) {
          return false;
        }
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesName = p.name.toLowerCase().includes(q);
          const matchesDesc = p.description?.toLowerCase().includes(q);
          const matchesCat = p.category?.toLowerCase().includes(q);
          if (!matchesName && !matchesDesc && !matchesCat) return false;
        }
        // Price filter
        if (p.price > maxPrice) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
        return a.id - b.id; // featured / default
      });
  }, [products, selectedCategory, searchQuery, maxPrice, sortBy]);

  const resetFilters = () => {
    setSelectedCategory("All");
    setSearchQuery("");
    setMaxPrice(6000);
    setSortBy("featured");
  };

  const hasActiveFilters =
    selectedCategory !== "All" ||
    searchQuery !== "" ||
    maxPrice < 6000 ||
    sortBy !== "featured";

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Page Title & Breadcrumbs */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight">
          Shop All Collections
        </h1>
      </div>

      {/* Filter / Sort Control Bar for Mobile & Desktop */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-border">
        {/* Search bar inside shop */}
        <div className="relative flex-1 max-w-sm">
          <Input
            type="search"
            placeholder="Filter by title or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs sm:text-sm rounded-lg"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2.5">
          {/* Mobile filter toggle button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
            className="lg:hidden text-xs h-9 gap-1.5"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-primary" />
            )}
          </Button>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-9 rounded-lg border border-input bg-card px-3 py-1 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              <option value="featured">Featured Collection</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Layout: Sidebar + Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <aside
          className={`lg:block ${
            isMobileFiltersOpen ? "block" : "hidden"
          } space-y-6 lg:border-r lg:border-border/60 lg:pr-6`}
        >
          <div className="flex items-center justify-between pb-2 border-b border-border/40">
            <h2 className="font-semibold text-sm text-foreground uppercase tracking-wider flex items-center gap-2">
              <Filter className="h-4 w-4 text-primary" />
              <span>Filters</span>
            </h2>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Category
            </h3>
            <div className="space-y-1">
              {categories.map((cat) => {
                const count =
                  cat === "All"
                    ? products.length
                    : products.filter((p) => p.category === cat).length;
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full flex items-center justify-between py-1.5 px-2.5 rounded-lg text-xs font-medium transition-colors ${
                      isSelected
                        ? "bg-primary text-primary-foreground font-semibold"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <span>{cat}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Max Price Filter Slider */}
          <div className="space-y-2 pt-2 border-t border-border/40">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground uppercase tracking-wider">
                Max Price
              </span>
              <span className="font-bold text-primary">{formatKES(maxPrice)}</span>
            </div>
            <input
              type="range"
              min="500"
              max="6000"
              step="100"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer h-1.5 bg-muted rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>KES 500</span>
              <span>KES 6,000+</span>
            </div>
          </div>
        </aside>

        {/* Product Grid Area */}
        <div className="lg:col-span-3">
          {/* Active Filter Pills Bar */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mb-4 p-2.5 rounded-xl bg-muted/40 border border-border/50 text-xs">
              <span className="text-muted-foreground font-medium text-[11px]">Active:</span>
              {selectedCategory !== "All" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-card border border-border text-[11px]">
                  Category: {selectedCategory}
                  <X
                    className="h-3 w-3 cursor-pointer text-muted-foreground hover:text-foreground"
                    onClick={() => setSelectedCategory("All")}
                  />
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-card border border-border text-[11px]">
                  &quot;{searchQuery}&quot;
                  <X
                    className="h-3 w-3 cursor-pointer text-muted-foreground hover:text-foreground"
                    onClick={() => setSearchQuery("")}
                  />
                </span>
              )}
              {maxPrice < 6000 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-card border border-border text-[11px]">
                  Under {formatKES(maxPrice)}
                  <X
                    className="h-3 w-3 cursor-pointer text-muted-foreground hover:text-foreground"
                    onClick={() => setMaxPrice(6000)}
                  />
                </span>
              )}
              <button
                onClick={resetFilters}
                className="text-[11px] text-primary hover:underline font-semibold ml-auto"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Results Counter */}
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
            <span>
              Showing <strong className="text-foreground">{filteredProducts.length}</strong> {filteredProducts.length === 1 ? "product" : "products"}
            </span>
          </div>

          {/* Compact Product Cards Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-5">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-border rounded-2xl p-8">
              <div className="text-4xl mb-3">🔍</div>
              <h3 className="text-base font-bold text-foreground">
                No matching products found
              </h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mb-4">
                We couldn&apos;t find any items matching your current filters. Try relaxing your search terms or price filter.
              </p>
              <Button size="sm" variant="outline" onClick={resetFilters}>
                Reset All Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
