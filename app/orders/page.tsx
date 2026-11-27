"use client";

import { Button } from "@/components/ui/button";
import { MessageCircle, Package } from "lucide-react";
import Link from "next/link";

export default function OrdersPage() {
  return (
    <div className="min-h-[calc(100vh-140px)] bg-background py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between pb-6 border-b border-border/70">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Orders
          </h1>
          <Button asChild size="sm" variant="outline" className="rounded-xl text-xs">
            <Link href="/shop">View Store</Link>
          </Button>
        </div>

        <div className="py-16 flex flex-col items-center justify-center text-center max-w-sm mx-auto space-y-4">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
            <Package className="h-6 w-6" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-base font-semibold text-foreground">
              No stored orders
            </h2>
            <p className="text-sm text-muted-foreground">
              Customer orders are confirmed directly via WhatsApp.
            </p>
          </div>
          <Button
            asChild
            size="sm"
            className="rounded-xl bg-[#25D366] hover:bg-[#25D366]/90 text-white gap-1.5"
          >
            <a
              href="https://wa.me/254716836551"
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Open WhatsApp</span>
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
