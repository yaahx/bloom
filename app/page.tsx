import CategoryCarousel from "@/components/home/CategoryCarousel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import rawProducts from "@/data/products.json";
import { Product } from "@/types/product";
import { ArrowRight, Flame, Headphones, ShieldCheck, Sparkles, Truck } from "lucide-react";
import Link from "next/link";

const products = rawProducts as Product[];

export default function Home() {
  const shoes = products.filter((p) => p.category === "Shoes");
  const tshirts = products.filter((p) => p.category === "T-Shirts");
  const hoodies = products.filter((p) => p.category === "Hoodies");
  const accessories = products.filter((p) => p.category === "Accessories");

  const categories = [
    { name: "All Products", count: products.length, href: "/shop" },
    { name: "Shoes", count: shoes.length, href: "/shop?category=Shoes" },
    { name: "T-Shirts", count: tshirts.length, href: "/shop?category=T-Shirts" },
    { name: "Hoodies", count: hoodies.length, href: "/shop?category=Hoodies" },
    { name: "Accessories", count: accessories.length, href: "/shop?category=Accessories" },
  ];

  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background border-b border-border/50 py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" />
              <span>New Season Collection 2026</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-foreground tracking-tight leading-tight">
              Curated Style, <br />
              <span className="text-primary">Crafted for Everyday.</span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore premium footwear, heavyweight t-shirts, cozy streetwear hoodies, and everyday carry accessories tailored for style and comfort.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium px-6 h-11" asChild>
                <Link href="/shop" className="flex items-center gap-2">
                  <span>Explore Full Catalog</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-11 px-6 border-border/80" asChild>
                <Link href="/contact">Contact & Inquiries</Link>
              </Button>
            </div>

            {/* Category Quick Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-6">
              {categories.map((cat) => (
                <Link key={cat.name} href={cat.href}>
                  <Badge
                    variant="secondary"
                    className="px-3.5 py-1.5 text-xs font-medium cursor-pointer transition-all duration-200 hover:bg-primary hover:text-primary-foreground border border-border/70"
                  >
                    {cat.name}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog Carousels Container */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 sm:space-y-12">
        {/* Shoes Category Carousel */}
        <CategoryCarousel
          title="Footwear & Sneakers"
          subtitle="Engineered for comfort, dynamic cushioning, and clean silhouettes."
          categoryKey="Shoes"
          products={shoes}
        />

        {/* T-Shirts Category Carousel */}
        <CategoryCarousel
          title="Heavyweight T-Shirts & Graphics"
          subtitle="240+ GSM combed organic cotton tees cut with effortless drape."
          categoryKey="T-Shirts"
          products={tshirts}
        />

        {/* Hoodies Category Carousel */}
        <CategoryCarousel
          title="Hoodies & Outerwear"
          subtitle="Heavy fleece pullovers and tailored zip-ups for season-round layering."
          categoryKey="Hoodies"
          products={hoodies}
        />

        {/* Accessories Category Carousel */}
        <CategoryCarousel
          title="Everyday Bags & Accessories"
          subtitle="Minimalist slings, heavyweight totes, caps, and merino beanies."
          categoryKey="Accessories"
          products={accessories}
        />

        {/* Trust & Guarantee Banner */}
        <section className="pt-8 pb-4">
          <div className="rounded-2xl border border-border/70 bg-card/60 p-6 sm:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0">
                  <Truck className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground text-sm">Free Express Shipping</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Complimentary delivery on all orders over $50.</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 shrink-0">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground text-sm">Authentic & Guaranteed</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">100% verified materials with 30-day returns.</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600 shrink-0">
                  <Headphones className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground text-sm">Instant WhatsApp Support</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Chat directly with our team for orders & sizing.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
