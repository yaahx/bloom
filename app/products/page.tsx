"use client";

import { Button } from "@/components/ui/button";
import defaultProducts from "@/data/products.json";
import { formatKES } from "@/lib/utils";
import { Product } from "@/types/product";
import { ExternalLink, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export default function ProductsPage() {
  const [customProducts, setCustomProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    const loadCustom = () => {
      try {
        const stored = localStorage.getItem("bloom_custom_products");
        if (stored) {
          setCustomProducts(JSON.parse(stored));
        } else {
          setCustomProducts([]);
        }
      } catch {
        setCustomProducts([]);
      }
    };
    loadCustom();
    window.addEventListener("storage", loadCustom);
    return () => window.removeEventListener("storage", loadCustom);
  }, []);

  const allProducts = useMemo(() => {
    const customIds = new Set(customProducts.map((p) => p.id));
    const defaults = (defaultProducts as Product[]).filter(
      (p) => !customIds.has(p.id)
    );
    return [...customProducts, ...defaults];
  }, [customProducts]);

  const categories = useMemo(() => {
    const cats = new Set<string>(["All"]);
    allProducts.forEach((p) => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats);
  }, [allProducts]);

  const filteredProducts = useMemo(() => {
    return allProducts.filter((p) => {
      if (selectedCategory !== "All" && p.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allProducts, selectedCategory, searchQuery]);

  const customIds = useMemo(
    () => new Set(customProducts.map((p) => p.id)),
    [customProducts]
  );

  const handleDeleteCustom = (id: number) => {
    const updated = customProducts.filter((p) => p.id !== id);
    setCustomProducts(updated);
    try {
      localStorage.setItem("bloom_custom_products", JSON.stringify(updated));
      window.dispatchEvent(new Event("storage"));
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border/70">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Products
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {allProducts.length} total items
            </p>
          </div>
          <Button
            asChild
            size="sm"
            className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 self-start sm:self-auto"
          >
            <Link href="/admin">
              <Plus className="h-4 w-4" />
              <span>Add Product</span>
            </Link>
          </Button>
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-transparent border-b border-border focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products List */}
        {filteredProducts.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            No matching products found.
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {filteredProducts.map((product) => {
              const isCustom = customIds.has(product.id);
              return (
                <div
                  key={product.id}
                  className="py-3.5 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-12 h-14 rounded-lg overflow-hidden bg-muted shrink-0">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {product.category} &bull; {formatKES(product.price)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/product/${product.id}`}
                      className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      aria-label={`View ${product.name}`}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                    {isCustom && (
                      <button
                        type="button"
                        onClick={() => handleDeleteCustom(product.id)}
                        className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        aria-label={`Delete ${product.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
