import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import WhatsAppWidget from "@/components/layout/WhatsAppWidget";
import { CartProvider } from "@/context/CartContext";
import {
  getSiteUrl,
  SITE_DESCRIPTION,
  SITE_NAME,
  STORE_EMAIL,
  STORE_PHONE,
} from "@/lib/seo";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = getSiteUrl();

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${SITE_NAME} — Premium Streetwear, Sneakers & Apparel in Kenya`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "BloomShop",
    "streetwear Kenya",
    "sneakers Thika",
    "shoes Kenya",
    "hoodies Kenya",
    "graphic t-shirts Kenya",
    "online clothing store Kenya",
  ],
  authors: [{ name: SITE_NAME, url: siteUrl }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  openGraph: {
    type: "website",
    locale: "en_KE",
    url: siteUrl,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Premium Streetwear, Sneakers & Apparel in Kenya`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Premium Streetwear, Sneakers & Apparel in Kenya`,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Organization", "ClothingStore"],
        "@id": `${siteUrl}/#organization`,
        name: SITE_NAME,
        url: siteUrl,
        telephone: STORE_PHONE,
        email: STORE_EMAIL,
        address: {
          "@type": "PostalAddress",
          streetAddress: "Uhuru Street",
          addressLocality: "Thika Town",
          addressRegion: "Kiambu County",
          addressCountry: "KE",
        },
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
            ],
            opens: "10:00",
            closes: "20:00",
          },
        ],
        sameAs: [
          "https://instagram.com",
          "https://facebook.com",
          "https://twitter.com",
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: SITE_NAME,
        publisher: { "@id": `${siteUrl}/#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${siteUrl}/shop?search={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <html lang="en">
      <body
        className={`${inter.className} antialiased flex flex-col min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
        <CartProvider>
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
          <WhatsAppWidget phoneNumber="+254716836551" />
        </CartProvider>
      </body>
    </html>
  );
}
