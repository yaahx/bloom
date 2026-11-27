import ProductDetailClient from "@/components/product/ProductDetailClient";
import { fetchProductById, fetchProducts } from "@/lib/products";
import { fetchReviews } from "@/lib/reviews";
import { getSiteUrl, SITE_NAME } from "@/lib/seo";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type ProductParams = Promise<{ productId: string }>;

export async function generateMetadata({
  params,
}: {
  params: ProductParams;
}): Promise<Metadata> {
  const { productId } = await params;
  const id = parseInt(productId, 10);
  const product = await fetchProductById(id);
  const siteUrl = getSiteUrl();

  if (!product) {
    return {
      title: "Product Not Found",
      robots: { index: false, follow: false },
    };
  }

  const title = `${product.name} — ${product.category}`;
  const rawDesc =
    product.description?.trim() ||
    `Shop ${product.name} (${product.category}) at ${SITE_NAME}.`;
  const description = `${rawDesc.slice(0, 145)} — KES ${product.price.toLocaleString()}. Order now at ${SITE_NAME} Kenya.`;
  const images =
    product.images && product.images.length > 0
      ? product.images
      : [product.image];
  const url = `${siteUrl}/product/${product.id}`;

  return {
    title,
    description,
    alternates: {
      canonical: `/product/${product.id}`,
    },
    openGraph: {
      title: `${product.name} | ${SITE_NAME}`,
      description,
      url,
      type: "website",
      images: images.map((img) => ({
        url: img,
        alt: `${product.name} — ${product.category}`,
      })),
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | ${SITE_NAME}`,
      description,
      images: [images[0]],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: ProductParams;
}) {
  const { productId } = await params;
  const id = parseInt(productId, 10);

  const [product, allProducts, reviews] = await Promise.all([
    fetchProductById(id),
    fetchProducts(),
    Number.isFinite(id) ? fetchReviews(id) : Promise.resolve([]),
  ]);

  const siteUrl = getSiteUrl();

  const productImages = product
    ? product.images && product.images.length > 0
      ? product.images
      : [product.image]
    : [];

  const reviewCount = reviews.length || product?.reviewsCount || 0;
  const avgRating =
    reviews.length > 0
      ? Math.round(
          (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10
        ) / 10
      : product?.rating || 5.0;

  const productJsonLd = product
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: product.description,
        image: productImages,
        sku: `BLM-${product.id}`,
        category: product.category,
        brand: {
          "@type": "Brand",
          name: SITE_NAME,
        },
        offers: {
          "@type": "Offer",
          url: `${siteUrl}/product/${product.id}`,
          priceCurrency: "KES",
          price: product.price,
          availability: product.isSoldOut
            ? "https://schema.org/OutOfStock"
            : "https://schema.org/InStock",
          itemCondition: "https://schema.org/NewCondition",
          seller: {
            "@type": "Organization",
            name: SITE_NAME,
          },
        },
        ...(reviewCount > 0
          ? {
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: avgRating,
                reviewCount,
                bestRating: 5,
                worstRating: 1,
              },
            }
          : {}),
        ...(reviews.length > 0
          ? {
              review: reviews.slice(0, 5).map((r) => ({
                "@type": "Review",
                author: {
                  "@type": "Person",
                  name: r.author,
                },
                datePublished: r.date,
                reviewBody: r.comment,
                reviewRating: {
                  "@type": "Rating",
                  ratingValue: r.rating,
                  bestRating: 5,
                  worstRating: 1,
                },
              })),
            }
          : {}),
      }
    : null;

  const breadcrumbJsonLd = product
    ? {
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
          {
            "@type": "ListItem",
            position: 3,
            name: product.category,
            item: `${siteUrl}/shop?category=${encodeURIComponent(
              product.category
            )}`,
          },
          {
            "@type": "ListItem",
            position: 4,
            name: product.name,
            item: `${siteUrl}/product/${product.id}`,
          },
        ],
      }
    : null;

  return (
    <>
      {productJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        />
      )}
      {breadcrumbJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
      )}
      <ProductDetailClient
        productId={id}
        initialProduct={product}
        initialProducts={allProducts}
        initialReviews={reviews}
      />
    </>
  );
}
