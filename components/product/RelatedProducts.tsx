import ProductCard from "@/components/home/ProductCard";
import { Button } from "@/components/ui/button";
import rawProducts from "@/data/products.json";
import { Product } from "@/types/product";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const products = rawProducts as Product[];

interface RelatedProductsProps {
  product: Product;
}

export default function RelatedProducts({ product }: RelatedProductsProps) {
  // First match same category, then fallback to others
  const sameCategory = products.filter(
    (p) => p.id !== product.id && p.category === product.category
  );
  const otherItems = products.filter(
    (p) => p.id !== product.id && p.category !== product.category
  );
  const relatedList = [...sameCategory, ...otherItems].slice(0, 4);

  return (
    <section className="pt-8 sm:pt-12 border-t border-border/60">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            Related
          </h2>
        </div>
        <Button variant="ghost" size="sm" asChild className="text-xs gap-1 text-primary hover:text-primary/80">
          <Link href={`/shop?category=${encodeURIComponent(product.category || "All")}`}>
            <span>View All</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
        {relatedList.map((rel) => (
          <ProductCard key={rel.id} product={rel} />
        ))}
      </div>
    </section>
  );
}
