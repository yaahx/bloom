"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/context/CartContext";
import { cn, formatKES } from "@/lib/utils";
import { Product } from "@/types/product";
import { Check, ShoppingBag, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export default function ProductCard({ product, className }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const { addToCart } = useCart();
  const isSoldOut = Boolean(product.isSoldOut);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isSoldOut) return;

    setIsAdding(true);
    await new Promise((resolve) => setTimeout(resolve, 250));

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
    });

    setIsAdding(false);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  };

  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) * 100
        )
      : null;

  return (
    <Card
      className={cn(
        "group relative overflow-hidden bg-card border-border/70 hover:border-primary/40 hover:shadow-md transition-all duration-300 rounded-xl flex flex-col h-full",
        isSoldOut && "opacity-90",
        className
      )}
    >
      {/* Top Media Area */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted/40">
        {/* Sold Out Indication Badge */}
        {isSoldOut && (
          <div className="absolute top-2.5 left-2.5 z-10">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-neutral-900/90 text-white dark:bg-white/95 dark:text-neutral-950 shadow-sm backdrop-blur-xs">
              Sold Out
            </span>
          </div>
        )}

        {/* Top-Right Quick Add-to-Bag Icon Button (Replaces Heart Button) */}
        {!isSoldOut && (
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isAdding}
            aria-label={`Add ${product.name} to cart`}
            className={cn(
              "absolute top-2.5 right-2.5 z-10 p-2 rounded-full transition-all duration-200 shadow-xs hover:scale-110 active:scale-95",
              justAdded
                ? "bg-emerald-600 text-white"
                : "bg-background/85 backdrop-blur-md text-foreground hover:bg-primary hover:text-primary-foreground"
            )}
          >
            {isAdding ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : justAdded ? (
              <Check className="h-4 w-4" />
            ) : (
              <ShoppingBag className="h-4 w-4" />
            )}
          </button>
        )}

        {/* Clickable Image Link */}
        <Link
          href={`/product/${product.id}`}
          className="block w-full h-full"
          tabIndex={-1}
        >
          {!imageError ? (
            <Image
              src={product.image}
              alt={product.name}
              width={350}
              height={430}
              sizes="(max-width: 640px) 180px, (max-width: 1024px) 240px, 280px"
              className={cn(
                "w-full h-full object-cover transition-transform duration-500 group-hover:scale-105",
                isSoldOut && "grayscale-[40%] opacity-80"
              )}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
              No image
            </div>
          )}
        </Link>
      </div>

      {/* Product Content Details */}
      <CardContent className="p-3.5 flex flex-col flex-1 justify-between gap-2.5">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
            <span className="uppercase tracking-wider font-medium text-primary">
              {product.category || "Item"}
            </span>
            {product.rating && (
              <span className="flex items-center gap-1 text-foreground/80 font-medium">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                {product.rating}
              </span>
            )}
          </div>

          {/* Product Title */}
          <Link href={`/product/${product.id}`} className="block">
            <h3 className="font-medium text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Pricing Area: Current Price on Left, Strikethrough Discount on Right */}
        <div className="flex items-center justify-between pt-1 border-t border-border/40 mt-auto">
          <div className="flex items-baseline gap-1">
            <span className="text-sm sm:text-base font-bold text-foreground">
              {formatKES(product.price)}
            </span>
          </div>

          {/* Where the Add to Cart button was: shows discounted amount or sold out */}
          <div className="flex items-center gap-1.5 text-right">
            {isSoldOut ? (
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Out of Stock
              </span>
            ) : product.originalPrice && product.originalPrice > product.price ? (
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground line-through">
                  {formatKES(product.originalPrice)}
                </span>
                {discountPercent && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-destructive/10 text-destructive">
                    -{discountPercent}%
                  </span>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
