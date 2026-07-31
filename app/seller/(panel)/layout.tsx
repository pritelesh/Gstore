"use client";

import { useRouter, usePathname } from "next/navigation";
import { signOut } from "@/lib/actions/auth";

const navLinks = [
  { label: "Dashboard", href: "/seller/dashboard" },
  { label: "My Products", href: "/seller/products" },
  { label: "Add Product", href: "/seller/add-product" },
  { label: "Orders", href: "/seller/orders" },
  { label: "Earnings", href: "/seller/earnings" },
  { label: "Cashout", href: "/seller/cashout" },
  { label: "Store Settings", href: "/seller/settings" },
];

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  async function handleLogout() {
    await signOut();
    router.push("/seller");
  }

  // IMPORTANT: This layout does NOT import globals.css — it doesn't need to because
  // the root layout (app/layout.tsx) already does. DO NOT add another import of
  // globals.css here, and DO NOT remove it from the root layout.
  // If you create any NEW nested layout.tsx files, they also should NOT import
  // globals.css unless they are intended to be standalone entry points.

  return (
    <div className="min-h-screen bg-[#293681] flex">
      <aside className="w-64 bg-[#1e2860] p-6 flex flex-col shadow-[4px_0_12px_#1a2354] flex-shrink-0">
        <div className="mb-8">
          <h2 className="text-[#FE7F2D] font-bold text-lg">KGStore</h2>
          <p className="text-[#FAFFC4]/50 text-xs mt-1">Seller Panel</p>
        </div>

        <nav className="flex-1 space-y-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                pathname === link.href
                  ? "bg-[#FE7F2D]/20 text-[#FE7F2D]"
                  : "text-[#FAFFC4]/70 hover:bg-white/5 hover:text-[#FAFFC4]"
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="w-full py-2.5 rounded-xl bg-red-500/20 text-red-300 text-sm font-medium hover:bg-red-500/30 transition-colors"
        >
          Logout
        </button>
      </aside>

      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
