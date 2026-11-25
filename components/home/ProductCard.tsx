"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils";
import { Product } from "@/types/product";
import { Check, Heart, ShoppingBag, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export default function ProductCard({ product, className }: ProductCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const { addToCart } = useCart();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

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

  const handleToggleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  return (
    <Card
      className={cn(
        "group relative overflow-hidden bg-card border-border/70 hover:border-primary/40 hover:shadow-md transition-all duration-300 rounded-xl flex flex-col h-full",
        className
      )}
    >
      {/* Top Media Area */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted/40">
        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 pointer-events-none">
          {product.badge && (
            <Badge
              variant="default"
              className={cn(
                "text-[10px] px-2 py-0.5 font-medium uppercase tracking-wider rounded-md shadow-xs",
                product.badge.toLowerCase() === "sale"
                  ? "bg-red-500 text-white hover:bg-red-500"
                  : product.badge.toLowerCase() === "new"
                  ? "bg-emerald-600 text-white hover:bg-emerald-600"
                  : "bg-primary text-primary-foreground hover:bg-primary"
              )}
            >
              {product.badge}
            </Badge>
          )}
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-[10px] px-1.5 py-0.5 font-bold bg-foreground/80 text-background rounded-md backdrop-blur-xs">
              -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={handleToggleLike}
          aria-label={isLiked ? "Remove from wishlist" : "Add to wishlist"}
          className={cn(
            "absolute top-2.5 right-2.5 z-10 p-1.5 rounded-full transition-all duration-200 bg-background/85 backdrop-blur-md shadow-xs hover:bg-background hover:scale-110",
            isLiked ? "text-destructive" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Heart className={cn("h-4 w-4", isLiked && "fill-current text-red-500")} />
        </button>

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
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
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

        {/* Pricing & Add to Cart Action */}
        <div className="flex items-center justify-between pt-1 border-t border-border/40 mt-auto">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold text-foreground">
              ${product.price.toFixed(2)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-muted-foreground line-through">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          <Button
            size="sm"
            onClick={handleAddToCart}
            disabled={isAdding}
            aria-label={`Add ${product.name} to cart`}
            className={cn(
              "h-8 px-2.5 rounded-lg text-xs font-medium transition-all duration-200",
              justAdded
                ? "bg-emerald-600 text-white hover:bg-emerald-600"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
          >
            {isAdding ? (
              <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : justAdded ? (
              <span className="flex items-center gap-1">
                <Check className="h-3.5 w-3.5" />
                <span>Added</span>
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <ShoppingBag className="h-3.5 w-3.5" />
                <span>Add</span>
              </span>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
