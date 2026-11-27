"use client";

import CategorySelector from "@/components/admin/CategorySelector";
import { Button } from "@/components/ui/button";
import {
  deleteStoredProduct,
  getStoredProducts,
  saveProductUpdate,
} from "@/lib/products";
import { formatKES } from "@/lib/utils";
import { Product } from "@/types/product";
import {
  ExternalLink,
  Loader2,
  PackageCheck,
  PackageX,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

const BASE_CATEGORIES = ["Shoes", "T-Shirts", "Hoodies", "Accessories"];

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

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(BASE_CATEGORIES);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  // Edit modal state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editOriginalPrice, setEditOriginalPrice] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editImages, setEditImages] = useState<string[]>([]);
  const [editIsSoldOut, setEditIsSoldOut] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [isProcessingImages, setIsProcessingImages] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadData = () => {
      setProducts(getStoredProducts());
      try {
        const storedCats = localStorage.getItem("bloom_custom_categories");
        if (storedCats) {
          const custom: string[] = JSON.parse(storedCats);
          setCategories(Array.from(new Set([...BASE_CATEGORIES, ...custom])));
        }
      } catch {
        // ignore
      }
    };
    loadData();
    window.addEventListener("storage", loadData);
    return () => window.removeEventListener("storage", loadData);
  }, []);

  const filterCategories = useMemo(() => {
    const cats = new Set<string>(["All"]);
    products.forEach((p) => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats);
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
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
  }, [products, selectedCategory, searchQuery]);

  const handleToggleOutOfStock = (product: Product) => {
    const updated: Product = {
      ...product,
      isSoldOut: !product.isSoldOut,
    };
    saveProductUpdate(updated);
    setProducts(getStoredProducts());
  };

  const handleDelete = (id: number) => {
    deleteStoredProduct(id);
    setConfirmDeleteId(null);
    setProducts(getStoredProducts());
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setEditTitle(product.name);
    setEditCategory(product.category);
    setEditPrice(String(product.price));
    setEditOriginalPrice(
      product.originalPrice ? String(product.originalPrice) : ""
    );
    setEditDescription(product.description || "");
    setEditImages(
      product.images && product.images.length > 0
        ? product.images
        : product.image
        ? [product.image]
        : []
    );
    setEditIsSoldOut(Boolean(product.isSoldOut));
    setEditError(null);
  };

  const handleCreateCategory = (newCatName: string) => {
    const trimmed = newCatName.trim();
    if (!trimmed) return;
    if (categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      return;
    }
    const updated = [...categories, trimmed];
    setCategories(updated);
    setEditCategory(trimmed);
    try {
      const storedCustom: string[] = JSON.parse(
        localStorage.getItem("bloom_custom_categories") || "[]"
      );
      storedCustom.push(trimmed);
      localStorage.setItem(
        "bloom_custom_categories",
        JSON.stringify(storedCustom)
      );
      window.dispatchEvent(new Event("storage"));
    } catch {
      // ignore
    }
  };

  const handleEditImageAdd = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessingImages(true);
    setEditError(null);
    try {
      const processed = await Promise.all(
        Array.from(files).map((file) => processImageFile(file))
      );
      setEditImages((prev) => [...prev, ...processed]);
    } catch {
      setEditError("Could not load selected images.");
    } finally {
      setIsProcessingImages(false);
      if (editFileInputRef.current) {
        editFileInputRef.current.value = "";
      }
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setEditError(null);

    if (editImages.length === 0) {
      setEditError("At least one product image is required.");
      return;
    }
    if (!editTitle.trim()) {
      setEditError("Enter a product title.");
      return;
    }
    const numPrice = parseFloat(editPrice);
    if (isNaN(numPrice) || numPrice <= 0) {
      setEditError("Enter a valid selling price.");
      return;
    }

    let numOriginalPrice: number | undefined;
    if (editOriginalPrice.trim()) {
      const parsed = parseFloat(editOriginalPrice);
      if (isNaN(parsed) || parsed <= 0) {
        setEditError("Original price must be a valid amount.");
        return;
      }
      numOriginalPrice = Math.round(parsed);
    }

    setIsSavingEdit(true);
    const updated: Product = {
      ...editingProduct,
      name: editTitle.trim(),
      category: editCategory.trim() || editingProduct.category,
      price: Math.round(numPrice),
      originalPrice: numOriginalPrice,
      image: editImages[0],
      images: editImages,
      description: editDescription.trim(),
      isSoldOut: editIsSoldOut,
    };

    try {
      saveProductUpdate(updated);
      setProducts(getStoredProducts());
      setEditingProduct(null);
    } catch {
      setEditError("Storage limit reached. Try fewer or smaller images.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] bg-background py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Search, Filter & Add Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-6 pr-3 py-2 text-sm bg-transparent border-b border-border focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <Button
            asChild
            size="sm"
            className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 self-start sm:self-auto shadow-none"
          >
            <Link href="/admin">
              <Plus className="h-4 w-4" />
              <span>Add Product</span>
            </Link>
          </Button>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {filterCategories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            No matching products found.
          </div>
        ) : (
          <>
            {/* Desktop Products Table */}
            <div className="hidden md:block border border-border rounded-xl overflow-hidden bg-background">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-xs font-medium text-muted-foreground">
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Stock</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/70 text-sm">
                  {filteredProducts.map((product) => {
                    const isOut = Boolean(product.isSoldOut);
                    const isConfirmingDelete = confirmDeleteId === product.id;

                    return (
                      <tr
                        key={product.id}
                        className="hover:bg-muted/20 transition-colors"
                      >
                        {/* Product */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-11 h-12 rounded-lg overflow-hidden bg-muted shrink-0">
                              <img
                                src={product.image}
                                alt={product.name}
                                className={`w-full h-full object-cover ${
                                  isOut ? "grayscale opacity-60" : ""
                                }`}
                              />
                            </div>
                            <div className="min-w-0">
                              <Link
                                href={`/product/${product.id}`}
                                className="font-medium text-foreground hover:text-primary transition-colors line-clamp-1 inline-flex items-center gap-1"
                              >
                                <span className="truncate">{product.name}</span>
                                <ExternalLink className="h-3 w-3 shrink-0 opacity-50" />
                              </Link>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-4 text-xs text-muted-foreground whitespace-nowrap">
                          {product.category}
                        </td>

                        {/* Price */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-semibold text-foreground">
                              {formatKES(product.price)}
                            </span>
                            {product.originalPrice &&
                              product.originalPrice > product.price && (
                                <span className="text-xs text-muted-foreground line-through">
                                  {formatKES(product.originalPrice)}
                                </span>
                              )}
                          </div>
                        </td>

                        {/* Stock Status */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              isOut
                                ? "bg-destructive/10 text-destructive"
                                : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                            }`}
                          >
                            {isOut ? "Out of Stock" : "In Stock"}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleToggleOutOfStock(product)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                isOut
                                  ? "bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-400"
                                  : "bg-muted text-foreground hover:bg-muted/80"
                              }`}
                              title={
                                isOut ? "Mark In Stock" : "Mark Out of Stock"
                              }
                            >
                              {isOut ? (
                                <>
                                  <PackageCheck className="h-3.5 w-3.5" />
                                  <span>In Stock</span>
                                </>
                              ) : (
                                <>
                                  <PackageX className="h-3.5 w-3.5" />
                                  <span>Out of Stock</span>
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => openEditModal(product)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                              aria-label={`Edit ${product.name}`}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              <span>Edit</span>
                            </button>

                            {isConfirmingDelete ? (
                              <div className="inline-flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleDelete(product.id)}
                                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
                                >
                                  Confirm
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteId(null)}
                                  className="p-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground"
                                  aria-label="Cancel delete"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(product.id)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                aria-label={`Delete ${product.name}`}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span>Delete</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Products List */}
            <div className="md:hidden divide-y divide-border/70 border border-border rounded-xl overflow-hidden bg-background">
              {filteredProducts.map((product) => {
                const isOut = Boolean(product.isSoldOut);
                const isConfirmingDelete = confirmDeleteId === product.id;

                return (
                  <div key={product.id} className="p-3.5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-14 rounded-lg overflow-hidden bg-muted shrink-0">
                          <img
                            src={product.image}
                            alt={product.name}
                            className={`w-full h-full object-cover ${
                              isOut ? "grayscale opacity-60" : ""
                            }`}
                          />
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/product/${product.id}`}
                            className="text-sm font-medium text-foreground truncate block"
                          >
                            {product.name}
                          </Link>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {product.category} &bull; {formatKES(product.price)}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium shrink-0 ${
                          isOut
                            ? "bg-destructive/10 text-destructive"
                            : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                        }`}
                      >
                        {isOut ? "Out of Stock" : "In Stock"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleToggleOutOfStock(product)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          isOut
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                            : "bg-muted text-foreground"
                        }`}
                      >
                        {isOut ? (
                          <>
                            <PackageCheck className="h-3.5 w-3.5" />
                            <span>Mark In Stock</span>
                          </>
                        ) : (
                          <>
                            <PackageX className="h-3.5 w-3.5" />
                            <span>Out of Stock</span>
                          </>
                        )}
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(product)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          <span>Edit</span>
                        </button>

                        {isConfirmingDelete ? (
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleDelete(product.id)}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-destructive text-destructive-foreground"
                            >
                              Confirm
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="p-1.5 text-muted-foreground"
                              aria-label="Cancel delete"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(product.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Delete</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Edit Product Modal */}
      {editingProduct && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setEditingProduct(null)}
        >
          <div
            className="bg-background w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl border border-border max-h-[90vh] overflow-y-auto p-5 sm:p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-border/70">
              <h2 className="text-base font-bold text-foreground">
                Edit Product
              </h2>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
                aria-label="Close edit modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-5">
              {/* Hidden File Input */}
              <input
                ref={editFileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleEditImageAdd}
                className="hidden"
              />

              {/* Images */}
              <div className="space-y-2">
                <span className="block text-xs font-medium text-muted-foreground">
                  Images
                </span>
                <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                  {editImages.map((imgSrc, idx) => (
                    <div
                      key={idx}
                      className="relative w-16 aspect-[4/5] rounded-lg overflow-hidden shrink-0 bg-muted"
                    >
                      <img
                        src={imgSrc}
                        alt={`Product ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setEditImages((prev) =>
                            prev.filter((_, i) => i !== idx)
                          )
                        }
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-background/90 text-foreground flex items-center justify-center"
                        aria-label="Remove image"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => editFileInputRef.current?.click()}
                    disabled={isProcessingImages}
                    className="w-16 aspect-[4/5] rounded-lg border-2 border-dashed border-border hover:border-primary/60 flex items-center justify-center shrink-0 text-muted-foreground"
                    aria-label="Add image"
                  >
                    {isProcessingImages ? (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Product Title
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full py-2 px-0 bg-transparent border-b border-border text-sm text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              {/* Category */}
              <div>
                <span className="block text-xs font-medium text-muted-foreground mb-1">
                  Category
                </span>
                <CategorySelector
                  categories={categories}
                  value={editCategory}
                  onChange={setEditCategory}
                  onCreateCategory={handleCreateCategory}
                />
              </div>

              {/* Price & Original Price */}
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Selling Price (KES)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="w-full py-2 px-0 bg-transparent border-b border-border text-sm text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Original Price (optional)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editOriginalPrice}
                    onChange={(e) => setEditOriginalPrice(e.target.value)}
                    className="w-full py-2 px-0 bg-transparent border-b border-border text-sm text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full py-2 px-0 bg-transparent border-b border-border text-sm text-foreground focus:outline-none focus:border-primary resize-none"
                />
              </div>

              {/* Out of Stock Toggle */}
              <label className="flex items-center justify-between py-2 cursor-pointer">
                <span className="text-sm font-medium text-foreground">
                  Mark as Out of Stock
                </span>
                <input
                  type="checkbox"
                  checked={editIsSoldOut}
                  onChange={(e) => setEditIsSoldOut(e.target.checked)}
                  className="h-4 w-4 accent-primary rounded"
                />
              </label>

              {editError && (
                <p className="text-xs font-medium text-destructive">
                  {editError}
                </p>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setEditingProduct(null)}
                  className="rounded-xl text-sm"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSavingEdit || isProcessingImages}
                  className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-semibold shadow-none"
                >
                  {isSavingEdit ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
