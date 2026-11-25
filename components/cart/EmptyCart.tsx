import { Button } from "@/components/ui/button";
import { Shield, ShoppingBag, Truck } from "lucide-react";
import Link from "next/link";

export default function EmptyCart() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
      <div className="max-w-md mx-auto text-center">
        <div className="mb-6">
          <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="h-10 w-10" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Your cart is empty
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-2">
            Looks like you haven&apos;t added any items to your cart yet. Explore our fresh drops and essential collections!
          </p>
        </div>

        <div className="space-y-6">
          <Button
            asChild
            size="lg"
            className="w-full sm:w-auto px-8 h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-sm rounded-xl shadow-md"
          >
            <Link href="/shop">Explore Collections</Link>
          </Button>

          <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground pt-4 border-t border-border/60">
            <div className="flex items-center gap-1.5">
              <Truck className="h-4 w-4 text-primary" />
              <span>Free shipping over $50</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-emerald-600" />
              <span>30-Day Guaranteed Returns</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
