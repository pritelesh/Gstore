"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCart, User, Menu, X } from "lucide-react";
import { useCart } from "@/context/CartContext";

type HeaderProps = {
  role: string | null;
  sellerHref: string;
};

export default function Header({ role, sellerHref }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { cartCount } = useCart();

  const safeSellerHref = sellerHref || "/seller";

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
    { label: "Seasonal", href: "/seasonal" },
    { label: "Track Order", href: "/track-order" },
    { label: "About Us", href: "/about" },
  ];

  if (role === "seller" || role === "admin") {
    navLinks.push({ label: "Seller", href: safeSellerHref });
  }

  if (role === "admin") {
    navLinks.push({ label: "Admin", href: "/admin" });
  }

  return (
    <header className="sticky top-0 z-50">
      <div className="neu-flat rounded-none bg-[#293681]">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold tracking-tight text-text">
            KGStore
          </Link>

          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-text/80 hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background rounded-lg transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/account"
              className="neu-flat p-2 text-text hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent rounded-xl transition-colors"
              aria-label="Account"
            >
              <User size={20} />
            </Link>
            <Link
              href="/cart"
              className="neu-flat p-2 text-text hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent rounded-xl transition-colors relative"
              aria-label="Cart"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden neu-flat p-2 text-text hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent rounded-xl transition-colors"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="lg:hidden neu-flat rounded-none bg-[#293681] mt-0">
          <nav className="flex flex-col gap-1 px-4 pb-4 pt-2 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="neu-pressed px-4 py-2.5 text-text/80 hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent rounded-xl transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
