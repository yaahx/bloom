import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ProductBreadcrumb() {
  return (
    <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
      <Button
        variant="ghost"
        size="sm"
        asChild
        className="text-muted-foreground hover:text-foreground h-8 px-2 gap-1.5"
      >
        <Link href="/shop" className="flex items-center gap-1.5">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Catalog</span>
        </Link>
      </Button>
      <span>/</span>
      <Link href="/" className="hover:text-primary transition-colors">
        Home
      </Link>
      <span>/</span>
      <Link href="/shop" className="hover:text-primary transition-colors">
        Shop
      </Link>
    </nav>
  );
}
