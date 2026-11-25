import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import WhatsAppWidget from "@/components/layout/WhatsAppWidget";
import { CartProvider } from "@/context/CartContext";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "BloomShop — Premium Streetwear, Shoes, & Apparel",
  description:
    "Discover curated collections of sneakers, heavyweight t-shirts, fleece hoodies, and everyday accessories at BloomShop. Enjoy fast delivery and instant WhatsApp customer support.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} antialiased flex flex-col min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary`}
      >
        <CartProvider>
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
          <WhatsAppWidget phoneNumber="15551234567" />
        </CartProvider>
      </body>
    </html>
  );
}
