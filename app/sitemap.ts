import { fetchCategories, fetchProducts } from "@/lib/products";
import { getSiteUrl } from "@/lib/seo";
import type { MetadataRoute } from "next";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const now = new Date();

  const [products, categories] = await Promise.all([
    fetchProducts(),
    fetchCategories(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/shop`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  const categoryNames = Array.from(
    new Set([
      ...categories,
      ...products.map((p) => p.category).filter(Boolean),
    ])
  );

  const categoryRoutes: MetadataRoute.Sitemap = categoryNames.map((cat) => ({
    url: `${siteUrl}/shop?category=${encodeURIComponent(cat)}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${siteUrl}/product/${product.id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
