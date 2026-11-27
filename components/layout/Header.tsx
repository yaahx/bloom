"use client";

import AdminAuthModal from "@/components/admin/AdminAuthModal";
import { useCart } from "@/context/CartContext";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { Product } from "@/types/product";
import {
  LogOut,
  Menu,
  Plus,
  Search,
  ShoppingCart,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

export default function Header() {
  const { cart } = useCart();
  const cartCount =
    cart?.reduce((total, item) => total + item.quantity, 0) || 0;
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Admin Portal state
  const [isAdminAuthOpen, setIsAdminAuthOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");

  const pathname = usePathname();
  const router = useRouter();
  const isNewProductPage = pathname === "/admin" || pathname?.startsWith("/admin/");
  const isProductsPage =
    pathname === "/products" || pathname?.startsWith("/products/");
  const isOrdersPage =
    pathname === "/orders" || pathname?.startsWith("/orders/");
  const isAdminSubPage = isNewProductPage || isProductsPage || isOrdersPage;
  const adminPageTitle = isNewProductPage
    ? "New Product"
    : isProductsPage
    ? "Products"
    : isOrdersPage
    ? "Orders"
    : null;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
    setIsSearchOpen(false);
  }, [pathname]);

  // Check stored admin session (Supabase Auth or local fallback)
  useEffect(() => {
    if (supabase && isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data }) => {
        if (data.session?.user) {
          setIsAdminLoggedIn(true);
          setAdminEmail(data.session.user.email || "Admin");
        } else {
          setIsAdminLoggedIn(false);
          setAdminEmail("");
        }
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setIsAdminLoggedIn(true);
          setAdminEmail(session.user.email || "Admin");
        } else {
          setIsAdminLoggedIn(false);
          setAdminEmail("");
        }
      });

      return () => subscription.unsubscribe();
    }

    try {
      const session = localStorage.getItem("bloom_admin_session");
      if (session) {
        const parsed = JSON.parse(session);
        setIsAdminLoggedIn(true);
        setAdminEmail(parsed.email || "Admin");
      }
    } catch {
      // ignore
    }
  }, []);

  const handleAdminLogin = (email: string) => {
    setIsAdminLoggedIn(true);
    setAdminEmail(email);
    if (!isSupabaseConfigured) {
      try {
        localStorage.setItem(
          "bloom_admin_session",
          JSON.stringify({ email, timestamp: Date.now() })
        );
      } catch {
        // ignore
      }
    }
  };

  const handleAdminLogout = async () => {
    setIsAdminLoggedIn(false);
    setAdminEmail("");
    if (supabase && isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    try {
      localStorage.removeItem("bloom_admin_session");
    } catch {
      // ignore
    }
  };

  // Keep search input in sync when on shop page
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (pathname === "/shop") {
        const q = new URLSearchParams(window.location.search).get("search");
        setSearchQuery(q || "");
      } else {
        setSearchQuery("");
      }
    }
  }, [pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed) {
      router.push(`/shop?search=${encodeURIComponent(trimmed)}`);
    } else {
      router.push("/shop");
    }
    setIsSearchOpen(false);
  };

  const toggleMobileMenu = useCallback(() => {
    setIsMobileOpen((prev) => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileOpen(false);
  }, []);

  const isActivePath = (path: string) => {
    if (path === "/" && pathname !== "/") return false;
    return pathname.startsWith(path);
  };

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/shop", label: "Shop" },
    { href: "/contact", label: "Contact" },
    ...(isAdminLoggedIn
      ? [
          { href: "/orders", label: "Orders" },
          { href: "/products", label: "Products" },
        ]
      : []),
  ];

  return (
    <>
      {/* Top Admin Status Bar when Logged In */}
      {isAdminLoggedIn && !isAdminSubPage && (
        <div className="bg-foreground text-background text-xs py-1.5 px-4">
          <div className="container mx-auto flex items-center justify-between">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Product</span>
            </Link>

            <button
              type="button"
              onClick={handleAdminLogout}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-red-400 hover:text-red-300 hover:bg-white/10 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}

      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? "bg-background/95 backdrop-blur-xl border-b border-border shadow-xs"
            : "bg-background/85 backdrop-blur-md border-b border-border/60 shadow-none"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 py-3.5">
          <div className="flex items-center justify-between">
            {/* Logo & Navigation */}
            <div className="flex items-center space-x-6 lg:space-x-10">
              {adminPageTitle ? (
                <span className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                  {adminPageTitle}
                </span>
              ) : (
                <Link
                  className="text-xl sm:text-2xl font-black tracking-tight text-foreground hover:opacity-90 transition-opacity"
                  href="/"
                  aria-label="BloomShop Home"
                >
                  BLOOM<span className="text-primary">SHOP</span>
                </Link>
              )}

              <nav
                className="hidden md:flex items-center space-x-1"
                role="navigation"
                aria-label="Main navigation"
              >
                {navItems.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className={`py-1.5 px-3.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActivePath(href)
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                    aria-current={isActivePath(href) ? "page" : undefined}
                  >
                    {label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Desktop Search */}
            {!isAdminSubPage && (
              <div className="hidden lg:flex flex-1 max-w-md mx-8">
                <form onSubmit={handleSearchSubmit} className="relative w-full">
                  <input
                    type="text"
                    enterKeyHint="search"
                    placeholder="Search shoes, t-shirts, hoodies, bags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-8 py-1.5 text-xs sm:text-sm bg-muted/60 border border-border/80 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent transition-all"
                    aria-label="Search products"
                  />
                  <button
                    type="submit"
                    aria-label="Search"
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    <Search className="h-4 w-4" />
                  </button>
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      aria-label="Clear search"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </form>
              </div>
            )}

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Mobile Search Toggle */}
              {!isAdminSubPage && (
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="lg:hidden p-2 rounded-full hover:bg-muted transition-colors text-foreground"
                  aria-label="Toggle search"
                >
                  <Search className="h-5 w-5" />
                </button>
              )}

              {/* Shopping Cart Button */}
              {!isAdminSubPage && (
                <Link
                  href="/cart"
                  className="relative p-2 rounded-full hover:bg-muted transition-all duration-200 group text-foreground"
                  aria-label={`Shopping cart with ${cartCount} items`}
                >
                  <ShoppingCart className="h-5 w-5 group-hover:scale-105 transition-transform" />
                  {cartCount > 0 && (
                    <span
                      className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1"
                      aria-label={`${cartCount} items in cart`}
                    >
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                </Link>
              )}

              {/* Sign In (Admin Access) Button */}
              {!isAdminSubPage && (
                <div className="hidden sm:flex items-center">
                  {isAdminLoggedIn ? (
                    <Link href="/admin">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-8 border-primary/40 text-primary hover:bg-primary/10 gap-1.5 font-medium"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add Product</span>
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsAdminAuthOpen(true)}
                      className="text-xs h-8 text-muted-foreground hover:text-foreground font-medium"
                    >
                      <span>Sign In</span>
                    </Button>
                  )}
                </div>
              )}

              {/* Mobile Menu Hamburger */}
              <button
                type="button"
                onClick={toggleMobileMenu}
                className="md:hidden p-2 rounded-full hover:bg-muted transition-colors text-foreground"
                aria-label="Toggle navigation menu"
                aria-expanded={isMobileOpen}
              >
                {isMobileOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Expandable Mobile Search Bar */}
          {!isAdminSubPage && isSearchOpen && (
            <div className="lg:hidden mt-3 pt-3 border-t border-border/60 animate-in slide-in-from-top duration-200">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    enterKeyHint="search"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 text-sm bg-muted/60 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40"
                    aria-label="Search products"
                    autoFocus
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      aria-label="Clear search"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <Button
                  type="submit"
                  size="sm"
                  className="h-9 px-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shrink-0"
                >
                  Search
                </Button>
              </form>
            </div>
          )}

          {/* Mobile Drawer Menu */}
          {isMobileOpen && (
            <nav
              className="md:hidden mt-3 animate-in slide-in-from-top duration-200 border-t border-border/60 pt-3"
              role="navigation"
              aria-label="Mobile navigation"
            >
              <div className="flex flex-col space-y-1 pb-3">
                {navItems.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={closeMobileMenu}
                    className={`text-sm font-medium py-2 px-3 rounded-lg transition-all ${
                      isActivePath(href)
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {label}
                  </Link>
                ))}
              </div>

              <div className="pt-3 border-t border-border/60 flex flex-col gap-2">
                {isAdminLoggedIn ? (
                  <>
                    <Link href="/admin" onClick={closeMobileMenu} className="w-full">
                      <Button
                        size="sm"
                        className="w-full bg-primary text-primary-foreground text-xs"
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        Add New Product
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        handleAdminLogout();
                        closeMobileMenu();
                      }}
                      className="w-full text-red-500 hover:text-red-600 text-xs"
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      closeMobileMenu();
                      setIsAdminAuthOpen(true);
                    }}
                    className="w-full text-xs"
                  >
                    <span>Sign In</span>
                  </Button>
                )}
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Admin Auth Modal */}
      <AdminAuthModal
        isOpen={isAdminAuthOpen}
        onClose={() => setIsAdminAuthOpen(false)}
        onLoginSuccess={handleAdminLogin}
      />
    </>
  );
}
