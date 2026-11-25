"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/context/CartContext";
import {
  ArrowLeft,
  Banknote,
  CheckCircle2,
  CreditCard,
  Lock,
  MessageCircle,
  PackageCheck,
  ShieldCheck,
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
  const [country, setCountry] = useState("United States");
  const [notes, setNotes] = useState("");

  const [shippingMethod, setShippingMethod] = useState<"standard" | "express">("standard");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cod" | "whatsapp">("card");

  // Card fields
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any>(null);

  // Cart calculations
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const standardShipping = subtotal > 50 ? 0 : 9.99;
  const shippingFee = shippingMethod === "express" ? 14.99 : standardShipping;
  const tax = subtotal * 0.08;
  const total = subtotal + shippingFee + tax;
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !firstName || !lastName || !address || !city) {
      alert("Please fill in all required shipping address fields.");
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 900));

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
        address: `${address}${apartment ? `, ${apartment}` : ""}, ${city}, ${postalCode}, ${country}`,
      },
      items: [...cart],
      shippingMethod,
      paymentMethod,
      subtotal,
      shippingFee,
      tax,
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
    const waText = `Hello BloomShop! I just placed order #${completedOrder.orderNumber} for a total of $${completedOrder.total.toFixed(2)}. Customer: ${completedOrder.customer.name}. Please confirm my shipment!`;
    const waUrl = `https://wa.me/15551234567?text=${encodeURIComponent(waText)}`;

    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 max-w-3xl">
        <div className="bg-card border border-border shadow-lg rounded-2xl p-6 sm:p-10 text-center animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-10 w-10" />
          </div>

          <Badge variant="outline" className="text-xs uppercase tracking-wider mb-2 font-semibold">
            Order Confirmed
          </Badge>

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
              <span className="text-xs text-muted-foreground block">Estimated Delivery:</span>
              <strong className="text-foreground">3 - 5 Business Days</strong>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Total Amount:</span>
              <strong className="text-foreground text-base">${completedOrder.total.toFixed(2)}</strong>
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
                  <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
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

            {/* 3. Shipping Method */}
            <div className="space-y-4">
              <h2 className="text-base font-bold text-foreground uppercase tracking-wide flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">3</span>
                <span>Shipping Method</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  className={`border rounded-xl p-3 flex items-start gap-3 cursor-pointer transition-all ${
                    shippingMethod === "standard"
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border hover:bg-muted/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="shipping"
                    checked={shippingMethod === "standard"}
                    onChange={() => setShippingMethod("standard")}
                    className="mt-1 accent-primary"
                  />
                  <div>
                    <span className="text-xs font-bold text-foreground block">Standard Delivery</span>
                    <span className="text-[11px] text-muted-foreground block">3-5 business days</span>
                    <span className="text-xs font-semibold text-primary mt-1 inline-block">
                      {subtotal > 50 ? "FREE" : "$9.99"}
                    </span>
                  </div>
                </label>

                <label
                  className={`border rounded-xl p-3 flex items-start gap-3 cursor-pointer transition-all ${
                    shippingMethod === "express"
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border hover:bg-muted/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="shipping"
                    checked={shippingMethod === "express"}
                    onChange={() => setShippingMethod("express")}
                    className="mt-1 accent-primary"
                  />
                  <div>
                    <span className="text-xs font-bold text-foreground block">Express Courier</span>
                    <span className="text-[11px] text-muted-foreground block">1-2 business days with tracking</span>
                    <span className="text-xs font-semibold text-foreground mt-1 inline-block">$14.99</span>
                  </div>
                </label>
              </div>
            </div>

            <Separator />

            {/* 4. Payment Method */}
            <div className="space-y-4">
              <h2 className="text-base font-bold text-foreground uppercase tracking-wide flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">4</span>
                <span>Payment Method</span>
              </h2>

              <div className="space-y-3">
                {/* Credit Card Option */}
                <label
                  className={`border rounded-xl p-3.5 block cursor-pointer transition-all ${
                    paymentMethod === "card"
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border hover:bg-muted/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === "card"}
                        onChange={() => setPaymentMethod("card")}
                        className="accent-primary"
                      />
                      <CreditCard className="h-4 w-4 text-foreground" />
                      <span className="text-xs font-bold text-foreground">Credit / Debit Card</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">Secure SSL</span>
                  </div>

                  {paymentMethod === "card" && (
                    <div className="mt-3 pt-3 border-t border-border/60 space-y-2.5">
                      <Input
                        placeholder="Card number (4000 1234 5678 9010)"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="h-8 text-xs font-mono"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          placeholder="MM / YY"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="h-8 text-xs font-mono"
                        />
                        <Input
                          placeholder="CVC"
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value)}
                          className="h-8 text-xs font-mono"
                        />
                      </div>
                    </div>
                  )}
                </label>

                {/* Cash on Delivery */}
                <label
                  className={`border rounded-xl p-3.5 block cursor-pointer transition-all ${
                    paymentMethod === "cod"
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border hover:bg-muted/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                      className="accent-primary"
                    />
                    <Banknote className="h-4 w-4 text-foreground" />
                    <div>
                      <span className="text-xs font-bold text-foreground block">Cash on Delivery (COD)</span>
                      <span className="text-[11px] text-muted-foreground block">Pay in cash upon physical package arrival.</span>
                    </div>
                  </div>
                </label>

                {/* WhatsApp Direct Order Confirmation */}
                <label
                  className={`border rounded-xl p-3.5 block cursor-pointer transition-all ${
                    paymentMethod === "whatsapp"
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border hover:bg-muted/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "whatsapp"}
                      onChange={() => setPaymentMethod("whatsapp")}
                      className="accent-primary"
                    />
                    <MessageCircle className="h-4 w-4 text-[#25D366]" />
                    <div>
                      <span className="text-xs font-bold text-foreground block">WhatsApp Direct Order</span>
                      <span className="text-[11px] text-muted-foreground block">
                        Confirm order and arrange mobile payment or bank transfer via official WhatsApp chat.
                      </span>
                    </div>
                  </div>
                </label>
              </div>
            </div>

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
                          Qty: {item.quantity} &times; ${item.price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <span className="font-bold text-foreground shrink-0">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Price Calculations */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="text-foreground font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping ({shippingMethod === "express" ? "Express" : "Standard"})</span>
                  <span className="text-foreground font-medium">
                    {shippingFee === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `$${shippingFee.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Estimated Tax (8%)</span>
                  <span className="text-foreground font-medium">${tax.toFixed(2)}</span>
                </div>

                <Separator className="my-2" />

                <div className="flex justify-between text-sm sm:text-base font-bold text-foreground">
                  <span>Total Due</span>
                  <span className="text-primary text-lg font-black">${total.toFixed(2)}</span>
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
                    <span>Place Order &bull; ${total.toFixed(2)}</span>
                  </span>
                )}
              </Button>

              <div className="pt-2 text-[11px] text-muted-foreground space-y-1.5 border-t border-border/50">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span>256-Bit SSL Encrypted & Secure Checkout</span>
                </div>
                <div className="flex items-center gap-2">
                  <PackageCheck className="h-3.5 w-3.5 text-primary" />
                  <span>Guaranteed 30-Day Free Returns & Exchanges</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
