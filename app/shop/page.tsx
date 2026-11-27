import ShopClient from "@/components/shop/ShopClient";
import { fetchCategories, fetchProducts } from "@/lib/products";
import { getSiteUrl, SITE_NAME } from "@/lib/seo";
import type { Metadata } from "next";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

type ShopSearchParams = Promise<{ category?: string; search?: string }>;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: ShopSearchParams;
}): Promise<Metadata> {
  const { category, search } = await searchParams;
  const siteUrl = getSiteUrl();

  if (search) {
    return {
      title: `Search: "${search}"`,
      description: `Search results for "${search}" at ${SITE_NAME} Kenya.`,
      robots: { index: false, follow: true },
    };
  }

  if (category && category !== "All") {
    const title = `${category} — Shop ${category} in Kenya`;
    const description = `Browse our ${category} collection at ${SITE_NAME}. Premium quality streetwear and fast delivery across Kenya.`;
    const canonical = `/shop?category=${encodeURIComponent(category)}`;

    return {
      title,
      description,
      alternates: { canonical },
      openGraph: {
        title: `${title} | ${SITE_NAME}`,
        description,
        url: `${siteUrl}${canonical}`,
        type: "website",
      },
    };
  }

  const defaultTitle = "Shop All Collections — Streetwear, Shoes, Hoodies & Tees";
  const defaultDesc = `Browse the complete ${SITE_NAME} catalog of sneakers, graphic tees, fleece hoodies, and everyday accessories. Fast delivery across Kenya.`;

  return {
    title: defaultTitle,
    description: defaultDesc,
    alternates: { canonical: "/shop" },
    openGraph: {
      title: `${defaultTitle} | ${SITE_NAME}`,
      description: defaultDesc,
      url: `${siteUrl}/shop`,
      type: "website",
    },
  };
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: ShopSearchParams;
}) {
  const [{ category }, products, categories] = await Promise.all([
    searchParams,
    fetchProducts(),
    fetchCategories(),
  ]);

  const siteUrl = getSiteUrl();
  const activeCategory = category && category !== "All" ? category : null;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${siteUrl}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Shop",
        item: `${siteUrl}/shop`,
      },
      ...(activeCategory
        ? [
            {
              "@type": "ListItem",
              position: 3,
              name: activeCategory,
              item: `${siteUrl}/shop?category=${encodeURIComponent(
                activeCategory
              )}`,
            },
          ]
        : []),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Suspense
        fallback={
          <div className="container mx-auto px-4 py-16 text-center text-sm text-muted-foreground">
            Loading catalog...
          </div>
        }
      >
        <ShopClient
          initialProducts={products}
          initialCategories={categories}
        />
      </Suspense>
    </>
  );
}
