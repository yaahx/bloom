"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/context/CartContext";
import { formatKES } from "@/lib/utils";
import {
  ArrowLeft,
  Lock,
  MessageCircle,
  Truck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();

  // Form states
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [apartment, setApartment] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("Kenya");
  const [notes, setNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any>(null);

  // Cart calculations: Free shipping and no tax
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal;
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !firstName || !lastName || !address || !city) {
      alert("Please fill in all required shipping address fields.");
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    const orderNumber = `BLM-${Math.floor(100000 + Math.random() * 900000)}`;
    const orderData = {
      orderNumber,
      date: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      customer: {
        name: `${firstName} ${lastName}`,
        email,
        phone,
        address: `${address}${apartment ? `, ${apartment}` : ""}, ${city}${postalCode ? `, ${postalCode}` : ""}, ${country}`,
      },
      items: [...cart],
      subtotal,
      shippingFee: 0,
      total,
      notes,
    };

    setCompletedOrder(orderData);
    clearCart();
    setIsSubmitting(false);
    setIsCompleted(true);
  };

  // Order Confirmation Screen
  if (isCompleted && completedOrder) {
    const waItemsList = completedOrder.items
      .map(
        (item: any) =>
          `• ${item.name} (x${item.quantity}) - ${formatKES(
            item.price * item.quantity
          )}`
      )
      .join("\n");

    const waText = `Hello BloomShop! I just placed order #${completedOrder.orderNumber} for a total of ${formatKES(completedOrder.total)}.\n\nCustomer: ${completedOrder.customer.name}\nPhone: ${completedOrder.customer.phone}\nDelivery Address: ${completedOrder.customer.address}${completedOrder.notes ? `\nOrder Notes: ${completedOrder.notes}` : ""}\n\nOrdered Items:\n${waItemsList}\n\nPlease confirm my order and send payment details!`;
    const waUrl = `https://wa.me/254716836551?text=${encodeURIComponent(waText)}`;

    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 max-w-3xl">
        <div className="bg-card border border-border shadow-lg rounded-2xl p-6 sm:p-10 text-center animate-in zoom-in-95 duration-300">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Thank you, {completedOrder.customer.name.split(" ")[0]}!
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
            Your order has been received and is now being prepared for fulfillment.
          </p>

          <div className="my-6 p-4 rounded-xl bg-muted/50 border border-border/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
            <div>
              <span className="text-xs text-muted-foreground block">Order Identifier:</span>
              <strong className="text-primary font-mono text-base">{completedOrder.orderNumber}</strong>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Shipping:</span>
              <strong className="text-emerald-600 font-bold">FREE Delivery</strong>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Total Amount:</span>
              <strong className="text-foreground text-base">{formatKES(completedOrder.total)}</strong>
            </div>
          </div>

          {/* Items Summary in Confirmation */}
          <div className="text-left mb-6 border border-border rounded-xl p-4 bg-card/60">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Ordered Items ({completedOrder.items.length})
            </h3>
            <div className="divide-y divide-border/60">
              {completedOrder.items.map((item: any) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-muted overflow-hidden relative shrink-0">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                    <div>
                      <span className="font-semibold text-foreground line-clamp-1">{item.name}</span>
                      <span className="text-muted-foreground">Qty: {item.quantity}</span>
                    </div>
                  </div>
                  <span className="font-semibold">{formatKES(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* WhatsApp Direct Confirmation Button */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white font-semibold text-sm px-6 h-11 rounded-xl shadow-md transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Confirm & Track on WhatsApp</span>
            </a>

            <Button asChild variant="outline" className="w-full sm:w-auto h-11 px-6">
              <Link href="/shop">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Empty Cart Checkout Guard
  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-md">
        <div className="p-8 border border-border rounded-2xl bg-card shadow-xs">
          <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-60" />
          <h2 className="text-xl font-bold text-foreground">Your cart is empty</h2>
          <p className="text-xs text-muted-foreground mt-1 mb-6">
            Add items to your cart before proceeding to checkout.
          </p>
          <Button asChild className="bg-primary text-primary-foreground">
            <Link href="/shop">Browse Collections</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Back to Cart navigation */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="text-xs gap-1.5 text-muted-foreground hover:text-foreground">
          <Link href="/cart">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Shopping Cart</span>
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Form: Contact, Shipping, Payment */}
        <div className="lg:col-span-7 space-y-8">
          <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-8">
            {/* 1. Contact Information */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-foreground uppercase tracking-wide flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">1</span>
                  <span>Contact Information</span>
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Email Address *</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@example.com"
                    required
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Phone Number *</label>
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    required
                    className="h-9 text-xs"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* 2. Shipping Address */}
            <div className="space-y-4">
              <h2 className="text-base font-bold text-foreground uppercase tracking-wide flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">2</span>
                <span>Shipping Address</span>
              </h2>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">First Name *</label>
                  <Input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Alex"
                    required
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Last Name *</label>
                  <Input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Smith"
                    required
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Street Address *</label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Fashion Blvd"
                  required
                  className="h-9 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Apt, Suite (optional)</label>
                  <Input
                    value={apartment}
                    onChange={(e) => setApartment(e.target.value)}
                    placeholder="Suite 4B"
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">City *</label>
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="New York"
                    required
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Postal / ZIP Code</label>
                  <Input
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="10001"
                    className="h-9 text-xs"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Optional Order Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Order Notes / Instructions (optional)</label>
              <Textarea
                placeholder="Gate codes, delivery preferences, or size notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="text-xs"
              />
            </div>
          </form>
        </div>

        {/* Right Sticky Column: Order Summary */}
        <div className="lg:col-span-5">
          <Card className="sticky top-20 border-border/80 shadow-md">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center justify-between">
                <span>Order Summary</span>
                <span className="text-xs text-muted-foreground lowercase font-normal">
                  {itemCount} {itemCount === 1 ? "item" : "items"}
                </span>
              </CardTitle>
            </CardHeader>

            <CardContent className="pt-4 space-y-4">
              {/* Items List in checkout */}
              <div className="max-h-60 overflow-y-auto space-y-3 pr-1 divide-y divide-border/40">
                {cart.map((item) => (
                  <div key={item.id} className="pt-2.5 first:pt-0 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden relative shrink-0 border border-border">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground line-clamp-1">{item.name}</h4>
                        <span className="text-muted-foreground text-[11px]">
                          Qty: {item.quantity} &times; {formatKES(item.price)}
                        </span>
                      </div>
                    </div>
                    <span className="font-bold text-foreground shrink-0">
                      {formatKES(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Price Calculations */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="text-foreground font-medium">{formatKES(subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span className="text-emerald-600 font-bold">FREE</span>
                </div>

                <Separator className="my-2" />

                <div className="flex justify-between text-sm sm:text-base font-bold text-foreground">
                  <span>Total Due</span>
                  <span className="text-primary text-lg font-black">{formatKES(total)}</span>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                form="checkout-form"
                disabled={isSubmitting}
                className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-sm rounded-xl shadow-md transition-all"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Processing Order...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    <span>Place Order &bull; {formatKES(total)}</span>
                  </span>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
