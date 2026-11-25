"use client";

import {
  Facebook,
  Instagram,
  MessageCircle,
  Twitter,
} from "lucide-react";
import Link from "next/link";

export default function Footer() {

  const footerSections = [
    {
      title: "Shop Categories",
      links: [
        { href: "/shop", label: "All Collections" },
        { href: "/shop?category=Shoes", label: "Footwear & Shoes" },
        { href: "/shop?category=T-Shirts", label: "T-Shirts & Graphics" },
        { href: "/shop?category=Hoodies", label: "Hoodies & Fleece" },
        { href: "/shop?category=Accessories", label: "Bags & Accessories" },
      ],
    },
    {
      title: "Customer Service",
      links: [
        { href: "/contact", label: "Contact Us" },
      ],
    },
  ];

  const socialLinks = [
    { href: "https://instagram.com", icon: Instagram, label: "Instagram" },
    { href: "https://facebook.com", icon: Facebook, label: "Facebook" },
    { href: "https://twitter.com", icon: Twitter, label: "Twitter" },
  ];

  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">

        {/* Links Grid */}
        <div className="py-10 sm:py-12 grid grid-cols-2 md:grid-cols-3 gap-8">
          {/* Brand info */}
          <div className="col-span-2 md:col-span-1 space-y-3">
            <Link
              href="/"
              className="text-xl font-black tracking-tight text-foreground"
            >
              BLOOM<span className="text-primary">SHOP</span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Curated everyday streetwear, footwear, and lifestyle goods designed with premium comfort in mind.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <a
                href="https://wa.me/15551234567"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors text-xs font-semibold"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span>WhatsApp: +1 (555) 123-4567</span>
              </a>
            </div>
          </div>

          {/* Section columns */}
          {footerSections.map((section) => (
            <div key={section.title} className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} BloomShop. All rights reserved.</p>

          <div className="flex items-center space-x-3">
            {socialLinks.map(({ href, icon: Icon, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                aria-label={label}
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
