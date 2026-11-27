"use client";

import defaultProducts from "@/data/products.json";
import { fetchProducts, PRODUCTS_UPDATED_EVENT } from "@/lib/products";
import { Product } from "@/types/product";
import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>(
    defaultProducts as Product[]
  );

  useEffect(() => {
    let active = true;
    const load = async () => {
      const list = await fetchProducts();
      if (active) setProducts(list);
    };
    load();
    window.addEventListener(PRODUCTS_UPDATED_EVENT, load);
    window.addEventListener("storage", load);
    return () => {
      active = false;
      window.removeEventListener(PRODUCTS_UPDATED_EVENT, load);
      window.removeEventListener("storage", load);
    };
  }, []);

  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
      {products.length > 0 ? (
        products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))
      ) : (
        <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            No products found
          </h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your filters or search terms
          </p>
        </div>
      )}
    </div>
  );
}
