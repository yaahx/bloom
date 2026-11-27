import HomeClient from "@/components/home/HomeClient";
import { fetchCategories, fetchProducts } from "@/lib/products";
import { getSiteUrl, SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: `${SITE_NAME} — Streetwear, Sneakers, T-Shirts & Hoodies in Thika, Kenya`,
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: `${SITE_NAME} — Streetwear, Sneakers & Apparel`,
    description: SITE_DESCRIPTION,
    url: siteUrl,
    type: "website",
  },
};

export default async function HomePage() {
  const [products, categories] = await Promise.all([
    fetchProducts(),
    fetchCategories(),
  ]);

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "BloomShop Featured Collections",
    numberOfItems: products.length,
    itemListElement: products.slice(0, 20).map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${siteUrl}/product/${product.id}`,
      name: product.name,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <HomeClient initialProducts={products} initialCategories={categories} />
    </>
  );
}
