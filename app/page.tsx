import CategoryCarousel from "@/components/home/CategoryCarousel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import rawProducts from "@/data/products.json";
import { Product } from "@/types/product";
import {
  Clock,
  Compass,
  ExternalLink,
  Headphones,
  MapPin,
  ShieldCheck,
  Truck,
} from "lucide-react";
import Link from "next/link";

const products = rawProducts as Product[];

export default function Home() {
  const shoes = products.filter((p) => p.category === "Shoes");
  const tshirts = products.filter((p) => p.category === "T-Shirts");
  const hoodies = products.filter((p) => p.category === "Hoodies");
  const accessories = products.filter((p) => p.category === "Accessories");

  const categories = [
    { name: "All Collections", href: "/shop" },
    { name: "Shoes", href: "/shop?category=Shoes" },
    { name: "T-Shirts", href: "/shop?category=T-Shirts" },
    { name: "Hoodies", href: "/shop?category=Hoodies" },
    { name: "Accessories", href: "/shop?category=Accessories" },
  ];

  return (
    <div className="bg-background min-h-screen">
      {/* Redesigned Hero Section: Categories Tabs + Store Location Google Map */}
      <section className="border-b border-border/60 bg-gradient-to-b from-primary/5 via-background to-background py-6 sm:py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
          {/* Categories Tab Navigation Bar */}
          <div className="flex items-center justify-center">
            <nav
              className="inline-flex flex-wrap items-center justify-center gap-1.5 p-1.5 rounded-2xl bg-card/80 backdrop-blur-md border border-border shadow-xs max-w-full"
              aria-label="Categories Tabs"
            >
              {categories.map((cat, index) => (
                <Link key={cat.name} href={cat.href}>
                  <span
                    className={`inline-flex items-center px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                      index === 0
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {cat.name}
                  </span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Store Location Google Map Card */}
          <div className="max-w-4xl mx-auto">
            <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              {/* Location Bar Header */}
              <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border/60 bg-card">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
                      <MapPin className="h-4 w-4" />
                    </span>
                    <h3 className="font-bold text-sm sm:text-base text-foreground tracking-tight">
                      BloomShop Flagship Store
                    </h3>
                    <Badge variant="outline" className="text-[10px] font-medium py-0 px-1.5 text-emerald-600 border-emerald-500/30 bg-emerald-500/5">
                      Open Today
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 pl-0.5">
                    <span>123 Fashion Street, SoHo, New York, NY 10013</span>
                    <span className="hidden sm:inline">&bull;</span>
                    <span className="hidden sm:inline-flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      10:00 AM - 8:00 PM
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs gap-1.5 border-border hover:bg-muted w-full sm:w-auto"
                    asChild
                  >
                    <a
                      href="https://maps.google.com/?q=SoHo,New+York,NY"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Compass className="h-3.5 w-3.5 text-primary" />
                      <span>Get Directions</span>
                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    </a>
                  </Button>
                </div>
              </div>

              {/* Embedded Google Map */}
              <div className="relative w-full h-[220px] sm:h-[280px] bg-muted/40">
                <iframe
                  title="BloomShop Store Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3023.6306296797505!2d-73.9997424!3d40.7228831!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c2598c199589d9%3A0x6b194fb8e96bfeb0!2sSoHo%2C%20New%20York%2C%20NY!5e0!3m2!1sen!2sus!4v1710000000000!5m2!1sen!2sus"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full opacity-90 hover:opacity-100 transition-opacity"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog Carousels Container */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-10">
        {/* Shoes Category Carousel */}
        <CategoryCarousel
          title="Footwear & Sneakers"
          categoryKey="Shoes"
          products={shoes}
        />

        {/* T-Shirts Category Carousel */}
        <CategoryCarousel
          title="Heavyweight T-Shirts & Graphics"
          categoryKey="T-Shirts"
          products={tshirts}
        />

        {/* Hoodies Category Carousel */}
        <CategoryCarousel
          title="Hoodies & Outerwear"
          categoryKey="Hoodies"
          products={hoodies}
        />

        {/* Accessories Category Carousel */}
        <CategoryCarousel
          title="Everyday Bags & Accessories"
          categoryKey="Accessories"
          products={accessories}
        />

        {/* Trust & Guarantee Banner */}
        <section className="pt-6 pb-2">
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
