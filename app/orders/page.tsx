"use client";

import { Button } from "@/components/ui/button";
import { MessageCircle, Package } from "lucide-react";
import Link from "next/link";

export default function OrdersPage() {
  return (
    <div className="min-h-[calc(100vh-140px)] bg-background py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-sm text-center space-y-5">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mx-auto">
          <Package className="h-6 w-6" />
        </div>
        <div className="space-y-1.5">
          <h1 className="text-base font-semibold text-foreground">
            No stored orders
          </h1>
          <p className="text-sm text-muted-foreground">
            Customer orders are confirmed directly via WhatsApp.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1">
          <Button
            asChild
            size="sm"
            className="w-full sm:w-auto rounded-xl bg-[#25D366] hover:bg-[#25D366]/90 text-white gap-1.5 shadow-none"
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
          <Button
            asChild
            size="sm"
            variant="outline"
            className="w-full sm:w-auto rounded-xl shadow-none"
          >
            <Link href="/shop">View Store</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
