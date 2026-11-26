"use client";

import CategorySelector from "@/components/admin/CategorySelector";
import { Button } from "@/components/ui/button";
import { formatKES } from "@/lib/utils";
import { Product } from "@/types/product";
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ImagePlus,
  Loader2,
  Plus,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const BASE_CATEGORIES = ["Shoes", "T-Shirts", "Hoodies", "Accessories"];

// Compress device images to lightweight Base64 for localStorage persistence
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

export default function AdminNewProductPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mobileGalleryRef = useRef<HTMLDivElement>(null);

  // Mobile 2-step state (Step 1: Images, Step 2: Details)
  const [mobileStep, setMobileStep] = useState<1 | 2>(1);
  const [mobileSlideIndex, setMobileSlideIndex] = useState(0);

  // Desktop gallery active slide index (0..selectedImages.length, where last index is '+' slide)
  const [desktopSlideIndex, setDesktopSlideIndex] = useState(0);

  // Categories
  const [categories, setCategories] = useState<string[]>(BASE_CATEGORIES);

  // Form state (preserved seamlessly across mobile steps and viewport changes)
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Shoes");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [description, setDescription] = useState("");

  // UI states
  const [isProcessingImages, setIsProcessingImages] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [publishedProduct, setPublishedProduct] = useState<Product | null>(null);

  // Load saved custom categories
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

  // Prevent accidental loss of unsaved product details
  useEffect(() => {
    const hasUnsavedWork =
      selectedImages.length > 0 ||
      title.trim().length > 0 ||
      price.trim().length > 0 ||
      originalPrice.trim().length > 0 ||
      description.trim().length > 0;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedWork && !publishedProduct) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [selectedImages, title, price, originalPrice, description, publishedProduct]);

  const handleCreateCategory = (newCatName: string) => {
    const trimmed = newCatName.trim();
    if (!trimmed) return;
    if (categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      return;
    }

    const updated = [...categories, trimmed];
    setCategories(updated);
    setCategory(trimmed);

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
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessingImages(true);
    setError(null);

    try {
      const processed = await Promise.all(
        Array.from(files).map((file) => processImageFile(file))
      );
      setSelectedImages((prev) => {
        const next = [...prev, ...processed];
        // Focus the newly added first image on desktop if we were on the '+' slide
        if (desktopSlideIndex >= prev.length) {
          setDesktopSlideIndex(prev.length);
        }
        return next;
      });
    } catch {
      setError("Could not load selected images. Please try again.");
    } finally {
      setIsProcessingImages(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setSelectedImages((prev) => {
      const next = prev.filter((_, idx) => idx !== indexToRemove);
      if (desktopSlideIndex >= next.length && next.length > 0) {
        setDesktopSlideIndex(next.length - 1);
      } else if (next.length === 0) {
        setDesktopSlideIndex(0);
        setMobileStep(1);
      }
      if (mobileSlideIndex >= next.length && next.length > 0) {
        setMobileSlideIndex(next.length - 1);
      }
      return next;
    });
  };

  const handleMobileGalleryScroll = () => {
    const el = mobileGalleryRef.current;
    if (!el || el.clientWidth === 0) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    setMobileSlideIndex(index);
  };

  const scrollToMobileSlide = (index: number) => {
    const el = mobileGalleryRef.current;
    if (!el) return;
    el.scrollTo({ left: index * el.clientWidth, behavior: "smooth" });
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (selectedImages.length === 0) {
      setError("Add at least one product image.");
      return;
    }

    if (!title.trim()) {
      setError("Enter a product title.");
      return;
    }

    if (!category.trim()) {
      setError("Select a category.");
      return;
    }

    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      setError("Enter a valid selling price.");
      return;
    }

    let numOriginalPrice: number | undefined;
    if (originalPrice.trim()) {
      const parsedOrig = parseFloat(originalPrice);
      if (isNaN(parsedOrig) || parsedOrig <= 0) {
        setError("Original price must be a valid amount.");
        return;
      }
      numOriginalPrice = Math.round(parsedOrig);
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 350));

    const newProduct: Product = {
      id: Date.now(),
      name: title.trim(),
      category: category.trim(),
      price: Math.round(numPrice),
      originalPrice: numOriginalPrice,
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
      list.unshift(newProduct);
      localStorage.setItem("bloom_custom_products", JSON.stringify(list));
      window.dispatchEvent(new Event("storage"));
    } catch {
      setIsSubmitting(false);
      setError("Storage limit reached. Try using fewer or smaller images.");
      return;
    }

    setIsSubmitting(false);
    setPublishedProduct(newProduct);

    // Reset form
    setTitle("");
    setPrice("");
    setOriginalPrice("");
    setDescription("");
    setSelectedImages([]);
    setDesktopSlideIndex(0);
    setMobileSlideIndex(0);
    setMobileStep(1);
  };

  const handleStartAnother = () => {
    setPublishedProduct(null);
    setError(null);
  };

  // Shared product detail inputs (flat, minimal, no cards/boxes)
  const renderProductFields = () => (
    <div className="space-y-6">
      {/* Product Title */}
      <div>
        <label
          htmlFor="product-title"
          className="block text-xs font-medium text-muted-foreground mb-1"
        >
          Product Title
        </label>
        <input
          id="product-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Air Retro Low"
          className="w-full py-2.5 px-0 bg-transparent border-b border-border text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      {/* Category */}
      <div>
        <span className="block text-xs font-medium text-muted-foreground mb-1">
          Category
        </span>
        <CategorySelector
          categories={categories}
          value={category}
          onChange={setCategory}
          onCreateCategory={handleCreateCategory}
        />
      </div>

      {/* Selling Price & Original Price */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="selling-price"
            className="block text-xs font-medium text-muted-foreground mb-1"
          >
            Selling Price (KES)
          </label>
          <input
            id="selling-price"
            type="number"
            min="1"
            step="1"
            inputMode="numeric"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0"
            className="w-full py-2.5 px-0 bg-transparent border-b border-border text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <div>
          <label
            htmlFor="original-price"
            className="block text-xs font-medium text-muted-foreground mb-1"
          >
            Original Price (optional)
          </label>
          <input
            id="original-price"
            type="number"
            min="1"
            step="1"
            inputMode="numeric"
            value={originalPrice}
            onChange={(e) => setOriginalPrice(e.target.value)}
            placeholder="0"
            className="w-full py-2.5 px-0 bg-transparent border-b border-border text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="product-description"
          className="block text-xs font-medium text-muted-foreground mb-1"
        >
          Description
        </label>
        <textarea
          id="product-description"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Write a product description..."
          className="w-full py-2.5 px-0 bg-transparent border-b border-border text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-colors resize-none"
        />
      </div>

      {/* Validation / Error Message */}
      {error && (
        <p className="text-xs font-medium text-destructive">{error}</p>
      )}

      {/* Publish Button */}
      <div className="pt-2">
        <Button
          type="submit"
          disabled={isSubmitting || isProcessingImages}
          className="w-full h-11 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-sm shadow-none"
        >
          {isSubmitting ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Publishing...
            </span>
          ) : (
            "Publish Product"
          )}
        </Button>
      </div>
    </div>
  );

  // Success State View
  if (publishedProduct) {
    return (
      <div className="min-h-[calc(100vh-60px)] bg-background flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm text-center space-y-6">
          <div className="w-12 h-12 rounded-full bg-primary/15 text-primary flex items-center justify-center mx-auto">
            <Check className="h-6 w-6" />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-lg font-bold text-foreground">
              {publishedProduct.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {publishedProduct.category} &bull; {formatKES(publishedProduct.price)}
            </p>
          </div>

          <div className="flex flex-col gap-2.5 pt-2">
            <Button
              asChild
              className="w-full h-11 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-sm shadow-none"
            >
              <Link href={`/product/${publishedProduct.id}`}>
                <span className="inline-flex items-center gap-1.5">
                  View Product
                  <ExternalLink className="h-3.5 w-3.5" />
                </span>
              </Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleStartAnother}
              className="w-full h-11 rounded-xl text-sm font-medium shadow-none"
            >
              Add Another Product
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const desktopTotalSlides = selectedImages.length + 1; // images + trailing '+' upload slide
  const mobileTotalSlides = selectedImages.length + 1;

  return (
    <div className="min-h-[calc(100vh-60px)] bg-background">
      {/* Shared Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageFileChange}
        className="hidden"
      />

      {/* ================= MOBILE LAYOUT (< md) ================= */}
      <div className="md:hidden px-4 py-5 pb-10 max-w-md mx-auto">
        {mobileStep === 1 ? (
          /* STEP 1: IMAGE SELECTION */
          <div className="space-y-5">
            {selectedImages.length === 0 ? (
              <button
                type="button"
                onClick={openFilePicker}
                disabled={isProcessingImages}
                className="w-full aspect-[4/5] rounded-xl border-2 border-dashed border-border hover:border-primary/60 transition-colors flex flex-col items-center justify-center gap-3 text-muted-foreground bg-transparent"
              >
                {isProcessingImages ? (
                  <Loader2 className="h-7 w-7 animate-spin text-primary" />
                ) : (
                  <ImagePlus className="h-7 w-7 stroke-[1.5]" />
                )}
                <span className="text-sm font-medium text-foreground">
                  {isProcessingImages ? "Loading..." : "Add product image"}
                </span>
              </button>
            ) : (
              <div className="space-y-3">
                {/* Swipeable Vertical Gallery */}
                <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-muted/30">
                  <div
                    ref={mobileGalleryRef}
                    onScroll={handleMobileGalleryScroll}
                    className="w-full h-full flex overflow-x-auto snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                  >
                    {selectedImages.map((imgSrc, idx) => (
                      <div
                        key={idx}
                        className="w-full h-full shrink-0 snap-center relative"
                      >
                        <img
                          src={imgSrc}
                          alt={`Product ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/85 text-foreground flex items-center justify-center hover:bg-background transition-colors"
                          aria-label="Remove image"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}

                    {/* Trailing '+' Upload Slide */}
                    <div className="w-full h-full shrink-0 snap-center p-0.5">
                      <button
                        type="button"
                        onClick={openFilePicker}
                        disabled={isProcessingImages}
                        className="w-full h-full rounded-xl border-2 border-dashed border-border hover:border-primary/60 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground"
                        aria-label="Add more images"
                      >
                        {isProcessingImages ? (
                          <Loader2 className="h-7 w-7 animate-spin text-primary" />
                        ) : (
                          <Plus className="h-8 w-8 stroke-[1.5] text-foreground" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Subtle Position Indicators */}
                <div className="flex items-center justify-center gap-1.5 pt-1">
                  {Array.from({ length: mobileTotalSlides }).map((_, idx) => {
                    const isActive = idx === mobileSlideIndex;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => scrollToMobileSlide(idx)}
                        aria-label={
                          idx === selectedImages.length
                            ? "Add more images"
                            : `Image ${idx + 1}`
                        }
                        className={`h-1.5 rounded-full transition-all ${
                          isActive
                            ? "w-4 bg-primary"
                            : "w-1.5 bg-border"
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {error && (
              <p className="text-xs font-medium text-destructive text-center">
                {error}
              </p>
            )}

            {/* Next Button shown once at least one image is selected */}
            {selectedImages.length > 0 && (
              <Button
                type="button"
                onClick={() => {
                  setError(null);
                  setMobileStep(2);
                }}
                className="w-full h-11 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-sm shadow-none"
              >
                Next
              </Button>
            )}
          </div>
        ) : (
          /* STEP 2: PRODUCT DETAILS */
          <form onSubmit={handlePublish} className="space-y-6">
            {/* Back to image selection */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setMobileStep(1);
                }}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Images</span>
              </button>
              <span className="text-xs text-muted-foreground">
                {selectedImages.length}{" "}
                {selectedImages.length === 1 ? "photo" : "photos"}
              </span>
            </div>

            {/* Gallery visible at the top */}
            <div className="flex gap-2.5 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {selectedImages.map((imgSrc, idx) => (
                <div
                  key={idx}
                  className="relative w-24 aspect-[4/5] rounded-lg overflow-hidden shrink-0 bg-muted/30"
                >
                  <img
                    src={imgSrc}
                    alt={`Selected ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={openFilePicker}
                disabled={isProcessingImages}
                className="w-24 aspect-[4/5] rounded-lg border-2 border-dashed border-border hover:border-primary/60 transition-colors flex items-center justify-center shrink-0 text-muted-foreground"
                aria-label="Add more images"
              >
                {isProcessingImages ? (
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                ) : (
                  <Plus className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Product Input Fields */}
            {renderProductFields()}
          </form>
        )}
      </div>

      {/* ================= DESKTOP LAYOUT (>= md) ================= */}
      <div className="hidden md:block max-w-4xl mx-auto px-6 py-10">
        <form
          onSubmit={handlePublish}
          className="grid grid-cols-12 gap-10 lg:gap-12 items-start"
        >
          {/* Left Column: Image Upload & Preview */}
          <div className="col-span-5 space-y-3">
            {selectedImages.length === 0 ? (
              <button
                type="button"
                onClick={openFilePicker}
                disabled={isProcessingImages}
                className="w-full aspect-[4/5] rounded-xl border-2 border-dashed border-border hover:border-primary/60 transition-colors flex flex-col items-center justify-center gap-3 text-muted-foreground bg-transparent"
              >
                {isProcessingImages ? (
                  <Loader2 className="h-7 w-7 animate-spin text-primary" />
                ) : (
                  <ImagePlus className="h-7 w-7 stroke-[1.5]" />
                )}
                <span className="text-sm font-medium text-foreground">
                  {isProcessingImages ? "Loading..." : "Add product image"}
                </span>
              </button>
            ) : (
              <>
                <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-muted/30">
                  {desktopSlideIndex < selectedImages.length ? (
                    <>
                      <img
                        src={selectedImages[desktopSlideIndex]}
                        alt={`Product ${desktopSlideIndex + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(desktopSlideIndex)}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/85 text-foreground flex items-center justify-center hover:bg-background transition-colors"
                        aria-label="Remove image"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={openFilePicker}
                      disabled={isProcessingImages}
                      className="w-full h-full rounded-xl border-2 border-dashed border-border hover:border-primary/60 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground bg-background"
                      aria-label="Add more images"
                    >
                      {isProcessingImages ? (
                        <Loader2 className="h-7 w-7 animate-spin text-primary" />
                      ) : (
                        <Plus className="h-8 w-8 stroke-[1.5] text-foreground" />
                      )}
                    </button>
                  )}

                  {/* Left / Right Navigation Arrows */}
                  {desktopSlideIndex > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        setDesktopSlideIndex((prev) => Math.max(0, prev - 1))
                      }
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/85 text-foreground flex items-center justify-center hover:bg-background transition-colors"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                  )}
                  {desktopSlideIndex < desktopTotalSlides - 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setDesktopSlideIndex((prev) =>
                          Math.min(desktopTotalSlides - 1, prev + 1)
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/85 text-foreground flex items-center justify-center hover:bg-background transition-colors"
                      aria-label="Next image"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Position Dots & Add More Action */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: desktopTotalSlides }).map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setDesktopSlideIndex(idx)}
                        aria-label={
                          idx === selectedImages.length
                            ? "Add more images"
                            : `Image ${idx + 1}`
                        }
                        className={`h-1.5 rounded-full transition-all ${
                          idx === desktopSlideIndex
                            ? "w-4 bg-primary"
                            : "w-1.5 bg-border hover:bg-muted-foreground/50"
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={openFilePicker}
                    disabled={isProcessingImages}
                    className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add more</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Right Column: Product Details */}
          <div className="col-span-7">{renderProductFields()}</div>
        </form>
      </div>
    </div>
  );
}
