import ShopClient from "@/components/shop/ShopClient";
import { Suspense } from "react";

export const metadata = {
  title: "Shop All Products & Collections — BloomShop",
  description:
    "Browse our complete catalog of streetwear shoes, graphic tees, fleece hoodies, and accessories. Filter by category, price, and popular tags.",
};

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-16 text-center text-sm text-muted-foreground">
          Loading catalog...
        </div>
      }
    >
      <ShopClient />
    </Suspense>
  );
}
