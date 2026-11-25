"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Product } from "@/types/product";
import { Image as ImageIcon, PlusCircle, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductAdded: (newProduct: Product) => void;
}

export default function AddProductModal({
  isOpen,
  onClose,
  onProductAdded,
}: AddProductModalProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Shoes");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [image, setImage] = useState("");
  const [badge, setBadge] = useState("New");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !price || !category) {
      setError("Please fill in the required fields (Name, Price, Category).");
      return;
    }

    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      setError("Please enter a valid numeric price.");
      return;
    }

    const defaultImg =
      image.trim() ||
      (category === "Shoes"
        ? "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop"
        : category === "T-Shirts"
        ? "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop"
        : category === "Hoodies"
        ? "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=800&auto=format&fit=crop"
        : "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop");

    const newProduct: Product = {
      id: Date.now(),
      name,
      category,
      price: numericPrice,
      originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
      image: defaultImg,
      badge: badge === "None" ? undefined : badge,
      description: description || `Premium ${category.toLowerCase()} crafted for daily style and ultimate comfort.`,
      rating: 5.0,
      reviewsCount: 1,
    };

    // Save to local storage for persistence across client session
    try {
      const stored = localStorage.getItem("bloom_custom_products");
      const list: Product[] = stored ? JSON.parse(stored) : [];
      list.unshift(newProduct);
      localStorage.setItem("bloom_custom_products", JSON.stringify(list));
    } catch {
      // ignore
    }

    onProductAdded(newProduct);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div
        className="relative w-full max-w-lg bg-card border border-border shadow-2xl rounded-2xl p-6 sm:p-8 animate-in zoom-in-95 duration-200 my-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-product-title"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors"
          aria-label="Close modal"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <PlusCircle className="h-5 w-5" />
          </div>
          <div>
            <h2 id="add-product-title" className="text-xl font-bold text-foreground">
              Add New Product
            </h2>
            <p className="text-xs text-muted-foreground">
              Add a new product to your live store catalog.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Product Title *
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Vintage Heavyweight Crewneck"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="Shoes">Shoes</option>
                <option value="T-Shirts">T-Shirts</option>
                <option value="Hoodies">Hoodies</option>
                <option value="Accessories">Accessories</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Badge / Tag
              </label>
              <select
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="New">New</option>
                <option value="Trending">Trending</option>
                <option value="Sale">Sale</option>
                <option value="Popular">Popular</option>
                <option value="None">None</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Price (KES) *
              </label>
              <Input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="3500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Original Price (KES, optional)
              </label>
              <Input
                type="number"
                step="0.01"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                placeholder="4500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Image URL (Unsplash or direct link)
            </label>
            <Input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://images.unsplash.com/..."
            />
            <p className="text-[11px] text-muted-foreground">
              Leave blank to use a curated category placeholder image.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Description
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe materials, fit, sizing, and details..."
              rows={3}
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Add Product to Catalog
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
