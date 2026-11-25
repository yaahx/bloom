"use client";

import AddProductModal from "@/components/admin/AddProductModal";
import AdminAuthModal from "@/components/admin/AdminAuthModal";
import { useCart } from "@/context/CartContext";
import { Product } from "@/types/product";
import {
  Lock,
  LogOut,
  Menu,
  Plus,
  Search,
  ShieldCheck,
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
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");

  const pathname = usePathname();
  const router = useRouter();

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

  // Check stored admin session
  useEffect(() => {
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
    try {
      localStorage.setItem(
        "bloom_admin_session",
        JSON.stringify({ email, timestamp: Date.now() })
      );
    } catch {
      // ignore
    }
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    setAdminEmail("");
    try {
      localStorage.removeItem("bloom_admin_session");
    } catch {
      // ignore
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
    }
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
  ];

  return (
    <>
      {/* Top Admin Status Bar when Logged In */}
      {isAdminLoggedIn && (
        <div className="bg-foreground text-background text-xs py-1.5 px-4">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span className="font-medium">
                Admin Mode Active: <span className="opacity-80">{adminEmail}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAddProductOpen(true)}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
              >
                <Plus className="h-3 w-3" />
                <span>Add Product</span>
              </button>
              <button
                type="button"
                onClick={handleAdminLogout}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-red-400 hover:text-red-300 hover:bg-white/10 transition-colors"
              >
                <LogOut className="h-3 w-3" />
                <span>Logout</span>
              </button>
            </div>
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
              <Link
                className="text-xl sm:text-2xl font-black tracking-tight text-foreground hover:opacity-90 transition-opacity"
                href="/"
                aria-label="BloomShop Home"
              >
                BLOOM<span className="text-primary">SHOP</span>
              </Link>

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
            <div className="hidden lg:flex flex-1 max-w-md mx-8">
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <input
                  type="search"
                  placeholder="Search shoes, t-shirts, hoodies, bags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 text-xs sm:text-sm bg-muted/60 border border-border/80 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent transition-all"
                  aria-label="Search products"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </form>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Mobile Search Toggle */}
              <button
                type="button"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="lg:hidden p-2 rounded-full hover:bg-muted transition-colors text-foreground"
                aria-label="Toggle search"
              >
                <Search className="h-5 w-5" />
              </button>

              {/* Shopping Cart Button */}
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

              {/* Sign In (Admin Access) Button */}
              <div className="hidden sm:flex items-center">
                {isAdminLoggedIn ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsAddProductOpen(true)}
                    className="text-xs h-8 border-primary/40 text-primary hover:bg-primary/10 gap-1.5 font-medium"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Product</span>
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsAdminAuthOpen(true)}
                    className="text-xs h-8 text-muted-foreground hover:text-foreground gap-1.5 font-medium"
                  >
                    <Lock className="h-3.5 w-3.5" />
                    <span>Sign In</span>
                  </Button>
                )}
              </div>

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
          {isSearchOpen && (
            <div className="lg:hidden mt-3 pt-3 border-t border-border/60 animate-in slide-in-from-top duration-200">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="search"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm bg-muted/60 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
                  aria-label="Search products"
                  autoFocus
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                    <Button
                      size="sm"
                      onClick={() => {
                        closeMobileMenu();
                        setIsAddProductOpen(true);
                      }}
                      className="w-full bg-primary text-primary-foreground text-xs"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Add New Product
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        handleAdminLogout();
                        closeMobileMenu();
                      }}
                      className="w-full text-red-500 hover:text-red-600 text-xs"
                    >
                      Logout Admin
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
                    className="w-full text-xs gap-1.5"
                  >
                    <Lock className="h-3.5 w-3.5" />
                    <span>Sign In (Admin Access)</span>
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

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        onProductAdded={(newProduct: Product) => {
          // If on the shop or home page, trigger storage event so listeners refresh
          window.dispatchEvent(new Event("storage"));
        }}
      />
    </>
  );
}
