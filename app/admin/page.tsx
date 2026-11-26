"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import defaultProducts from "@/data/products.json";
import { formatKES } from "@/lib/utils";
import { Product } from "@/types/product";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ExternalLink,
  FolderPlus,
  Image as ImageIcon,
  Layers,
  Package,
  Plus,
  ShoppingBag,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const BASE_CATEGORIES = ["Shoes", "T-Shirts", "Hoodies", "Accessories"];

// Helper to compress device images to lightweight Web/localStorage friendly Base64
const processImageFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 1200;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = () => resolve(event.target?.result as string);
    };
    reader.onerror = (err) => reject(err);
  });
};

export default function AdminPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Categories state
  const [categories, setCategories] = useState<string[]>(BASE_CATEGORIES);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categorySuccess, setCategorySuccess] = useState<string | null>(null);

  // Product form state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Shoes");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [description, setDescription] = useState("");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isProcessingImages, setIsProcessingImages] = useState(false);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdProduct, setCreatedProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Active view tab
  const [activeTab, setActiveTab] = useState<"product" | "categories">("product");

  // Load custom categories and ensure current selection is valid
  useEffect(() => {
    try {
      const storedCats = localStorage.getItem("bloom_custom_categories");
      if (storedCats) {
        const custom: string[] = JSON.parse(storedCats);
        const merged = Array.from(new Set([...BASE_CATEGORIES, ...custom]));
        setCategories(merged);
        if (merged.length > 0 && !merged.includes(category)) {
          setCategory(merged[0]);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Handle Category Creation
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;

    if (categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      alert("A category with this name already exists.");
      return;
    }

    const updated = [...categories, trimmed];
    setCategories(updated);
    setCategory(trimmed);
    setNewCategoryName("");

    try {
      const storedCustom: string[] = JSON.parse(
        localStorage.getItem("bloom_custom_categories") || "[]"
      );
      storedCustom.push(trimmed);
      localStorage.setItem("bloom_custom_categories", JSON.stringify(storedCustom));
      window.dispatchEvent(new Event("storage"));
    } catch {
      // ignore
    }

    setCategorySuccess(`Category "${trimmed}" added successfully!`);
    setTimeout(() => setCategorySuccess(null), 3000);
  };

  // Handle Custom Category Deletion
  const handleDeleteCategory = (catToDelete: string) => {
    if (BASE_CATEGORIES.includes(catToDelete)) {
      alert("Base categories cannot be deleted.");
      return;
    }
    const updated = categories.filter((c) => c !== catToDelete);
    setCategories(updated);
    if (category === catToDelete) {
      setCategory(updated[0] || "Shoes");
    }
    try {
      const storedCustom: string[] = JSON.parse(
        localStorage.getItem("bloom_custom_categories") || "[]"
      );
      const filtered = storedCustom.filter((c) => c !== catToDelete);
      localStorage.setItem("bloom_custom_categories", JSON.stringify(filtered));
      window.dispatchEvent(new Event("storage"));
    } catch {
      // ignore
    }
  };

  // Handle image files selection from user device
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessingImages(true);
    setError(null);

    try {
      const processedPromises = Array.from(files).map((file) => processImageFile(file));
      const processedResults = await Promise.all(processedPromises);
      setSelectedImages((prev) => [...prev, ...processedResults]);
    } catch {
      setError("Failed to load some images. Please try selecting again.");
    } finally {
      setIsProcessingImages(false);
      // reset input value so re-selecting same file works
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setSelectedImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Handle Product Submission
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Please provide a product title.");
      return;
    }

    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      setError("Please enter a valid price in KES.");
      return;
    }

    if (selectedImages.length === 0) {
      setError("Please select at least one image from your device.");
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 400));

    const newProd: Product = {
      id: Date.now(),
      name: title.trim(),
      category,
      price: Math.round(numPrice),
      originalPrice: originalPrice ? Math.round(parseFloat(originalPrice)) : undefined,
      image: selectedImages[0],
      images: selectedImages,
      description:
        description.trim() ||
        `Premium ${category.toLowerCase()} designed for daily comfort and timeless style.`,
      rating: 5.0,
      reviewsCount: 1,
    };

    try {
      const stored = localStorage.getItem("bloom_custom_products");
      const list: Product[] = stored ? JSON.parse(stored) : [];
      list.unshift(newProd);
      localStorage.setItem("bloom_custom_products", JSON.stringify(list));
      window.dispatchEvent(new Event("storage"));
    } catch (err) {
      console.error("Storage error:", err);
    }

    setIsSubmitting(false);
    setCreatedProduct(newProd);

    // Reset fields for subsequent addition
    setTitle("");
    setPrice("");
    setOriginalPrice("");
    setDescription("");
    setSelectedImages([]);
  };

  return (
    <div className="bg-background min-h-screen py-8 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        {/* Top Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-border/80">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-xs text-muted-foreground hover:text-foreground -ml-2 h-7 gap-1"
              >
                <Link href="/shop">
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back to Store</span>
                </Link>
              </Button>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Product & Category Management
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Add new products with device images and create custom categories for your catalog.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={activeTab === "product" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("product")}
              className="text-xs gap-1.5 h-9 rounded-xl"
            >
              <Package className="h-3.5 w-3.5" />
              <span>Add Product</span>
            </Button>
            <Button
              variant={activeTab === "categories" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("categories")}
              className="text-xs gap-1.5 h-9 rounded-xl"
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Categories ({categories.length})</span>
            </Button>
          </div>
        </div>

        {/* Success Banner after Product Creation */}
        {createdProduct && (
          <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-foreground animate-in slide-in-from-top-3 duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                <Check className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">
                  &quot;{createdProduct.name}&quot; successfully published!
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Category: <strong>{createdProduct.category}</strong> &bull; Price:{" "}
                  <strong>{formatKES(createdProduct.price)}</strong> &bull; {createdProduct.images?.length || 1} image(s)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <Button size="sm" asChild variant="outline" className="text-xs h-8 rounded-lg gap-1.5">
                <Link href={`/product/${createdProduct.id}`} target="_blank">
                  <span>View Product</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setCreatedProduct(null)}
                className="text-xs h-8 rounded-lg"
              >
                Dismiss
              </Button>
            </div>
          </div>
        )}

        {/* TAB 1: ADD PRODUCT */}
        {activeTab === "product" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Form Column */}
            <div className="lg:col-span-8">
              <Card className="border-border/80 shadow-sm rounded-2xl">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Plus className="h-5 w-5 text-primary" />
                    <span>Create New Product</span>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Fill in the details below. Images are uploaded directly from your phone or computer.
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  {error && (
                    <div className="mb-5 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleCreateProduct} className="space-y-5">
                    {/* Product Title */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                        Product Title *
                      </label>
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Classic Heavyweight Oversized Tee"
                        required
                        className="h-10 text-sm rounded-xl"
                      />
                    </div>

                    {/* Category Selection */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                          Category *
                        </label>
                        <button
                          type="button"
                          onClick={() => setActiveTab("categories")}
                          className="text-[11px] text-primary hover:underline font-medium"
                        >
                          + Create New Category
                        </button>
                      </div>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full h-10 rounded-xl border border-input bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Pricing Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                          Price (KES) *
                        </label>
                        <Input
                          type="number"
                          step="1"
                          min="1"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          placeholder="3500"
                          required
                          className="h-10 text-sm rounded-xl font-mono"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                          Original Price (KES, optional)
                        </label>
                        <Input
                          type="number"
                          step="1"
                          min="1"
                          value={originalPrice}
                          onChange={(e) => setOriginalPrice(e.target.value)}
                          placeholder="4500"
                          className="h-10 text-sm rounded-xl font-mono"
                        />
                        <p className="text-[11px] text-muted-foreground">
                          Leave blank if this item is not discounted.
                        </p>
                      </div>
                    </div>

                    {/* Image Files Upload Area */}
                    <div className="space-y-2 pt-2 border-t border-border/60">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                          Product Images (from your device) *
                        </label>
                        {selectedImages.length > 0 && (
                          <span className="text-xs text-muted-foreground">
                            {selectedImages.length} image{selectedImages.length > 1 ? "s" : ""} selected
                          </span>
                        )}
                      </div>

                      {/* Hidden File Input */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageFileChange}
                        className="hidden"
                        id="product-image-upload"
                      />

                      {/* Dropzone Trigger */}
                      <label
                        htmlFor="product-image-upload"
                        className="border-2 border-dashed border-border/80 hover:border-primary/60 hover:bg-primary/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200"
                      >
                        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
                          {isProcessingImages ? (
                            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Upload className="h-6 w-6" />
                          )}
                        </div>
                        <p className="text-sm font-semibold text-foreground">
                          {isProcessingImages
                            ? "Processing selected files..."
                            : "Click to select image files from your device"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                          Select one or multiple photos (JPG, PNG, WEBP). Photos are optimized automatically.
                        </p>
                      </label>

                      {/* Thumbnails Preview Grid */}
                      {selectedImages.length > 0 && (
                        <div className="pt-3">
                          <p className="text-[11px] text-muted-foreground mb-2">
                            First image is the cover photo. You can remove or add more files anytime.
                          </p>
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                            {selectedImages.map((imgSrc, idx) => (
                              <div
                                key={idx}
                                className="relative aspect-square rounded-xl overflow-hidden border border-border bg-muted/30 group"
                              >
                                <Image
                                  src={imgSrc}
                                  alt={`Upload preview ${idx + 1}`}
                                  fill
                                  className="object-cover"
                                />
                                {idx === 0 && (
                                  <span className="absolute top-1.5 left-1.5 bg-neutral-900/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                                    Cover
                                  </span>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveImage(idx)}
                                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 hover:bg-destructive text-white flex items-center justify-center transition-colors"
                                  aria-label="Remove image"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5 pt-2 border-t border-border/60">
                      <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                        Description
                      </label>
                      <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Detail materials, fit, care instructions, sizing recommendations..."
                        rows={3}
                        className="text-sm rounded-xl"
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push("/shop")}
                        className="rounded-xl h-10 px-5 text-xs"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting || isProcessingImages}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-10 px-6 font-bold text-xs shadow-md gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            <span>Publishing Product...</span>
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4" />
                            <span>Add Product to Store</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Quick Tips & Category Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              <Card className="border-border/80 shadow-sm rounded-2xl bg-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Layers className="h-4 w-4 text-primary" />
                    <span>Store Categories</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Products will appear in their assigned category carousel on the homepage and under shop filters.
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {categories.map((c) => (
                      <Badge
                        key={c}
                        variant={category === c ? "default" : "secondary"}
                        onClick={() => setCategory(c)}
                        className="cursor-pointer text-xs py-1 px-2.5 rounded-lg"
                      >
                        {c}
                      </Badge>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab("categories")}
                    className="w-full text-xs mt-2 rounded-xl"
                  >
                    Manage Categories &rarr;
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-border/80 shadow-sm rounded-2xl bg-muted/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    <span>Quick Tip</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground space-y-2">
                  <p>
                    &bull; <strong>Multiple images:</strong> The first image selected will be shown on cards, and all images will be scrollable via arrows on the product details page.
                  </p>
                  <p>
                    &bull; <strong>Currency:</strong> All prices are in Kenyan Shillings (KES).
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 2: MANAGE CATEGORIES */}
        {activeTab === "categories" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-6">
              <Card className="border-border/80 shadow-sm rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                    <FolderPlus className="h-5 w-5 text-primary" />
                    <span>Add New Category</span>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Create a new product category (e.g. &quot;Caps&quot;, &quot;Jackets&quot;, &quot;Watches&quot;).
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  {categorySuccess && (
                    <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span>{categorySuccess}</span>
                    </div>
                  )}

                  <form onSubmit={handleAddCategory} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                        Category Name *
                      </label>
                      <Input
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="e.g. Jackets & Outerwear"
                        required
                        className="h-10 text-sm rounded-xl"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-10 font-bold text-xs shadow-md gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Create Category</span>
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-6">
              <Card className="border-border/80 shadow-sm rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-foreground">
                    Current Categories ({categories.length})
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Categories available for product assignment and shop browsing.
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="divide-y divide-border/60">
                    {categories.map((cat) => {
                      const isBase = BASE_CATEGORIES.includes(cat);
                      return (
                        <div
                          key={cat}
                          className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3 text-sm"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-2 h-2 rounded-full bg-primary" />
                            <span className="font-semibold text-foreground">{cat}</span>
                            {isBase && (
                              <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                                Default
                              </span>
                            )}
                          </div>

                          {!isBase && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteCategory(cat)}
                              className="text-muted-foreground hover:text-destructive h-8 px-2 text-xs gap-1"
                              aria-label={`Delete category ${cat}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Remove</span>
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-5 mt-4 border-t border-border">
                    <Button
                      onClick={() => setActiveTab("product")}
                      className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-xl h-10 font-medium text-xs"
                    >
                      &larr; Return to Add Product Form
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
