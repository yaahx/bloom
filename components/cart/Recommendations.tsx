import ProductCard from "@/components/home/ProductCard";
import { Button } from "@/components/ui/button";
import rawProducts from "@/data/products.json";
import { Product } from "@/types/product";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const products = rawProducts as Product[];

export default function Recommendations() {
  const trending = products.slice(0, 4);

  return (
    <div className="mt-16 pt-8 border-t border-border/70">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            You Might Also Like
          </h2>
        </div>
        <Button variant="ghost" size="sm" asChild className="text-xs gap-1 text-primary hover:text-primary/80">
          <Link href="/shop">
            <span>Explore All</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
        {trending.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
