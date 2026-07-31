"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { signOut } from "@/lib/actions/auth";
import { getNavBadgeCounts } from "@/lib/actions/admin";

const navLinks = [
  { label: "Dashboard", href: "/admin", badge: null as null | keyof NavCounts },
  { label: "Sellers", href: "/admin/sellers", badge: "pendingSellers" as const },
  { label: "Products", href: "/admin/products", badge: "pendingProducts" as const },
  { label: "Orders", href: "/admin/orders", badge: null },
  { label: "Cashouts", href: "/admin/cashouts", badge: "pendingCashouts" as const },
  { label: "Categories", href: "/admin/categories", badge: null },
  { label: "Users", href: "/admin/users", badge: null },
  { label: "Permissions", href: "/admin/permissions", badge: null },
];

interface NavCounts {
  pendingSellers: number;
  pendingProducts: number;
  pendingCashouts: number;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [counts, setCounts] = useState<NavCounts>({ pendingSellers: 0, pendingProducts: 0, pendingCashouts: 0 });

  useEffect(() => {
    getNavBadgeCounts().then(setCounts).catch(() => {});
    const interval = setInterval(() => {
      getNavBadgeCounts().then(setCounts).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  async function handleLogout() {
    await signOut();
    router.push("/admin/login");
  }

  if (pathname === "/admin/login") {
    return <div className="min-h-screen bg-[#293681]">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-[#293681] flex">
      <aside className="w-64 bg-[#1e2860] p-6 flex flex-col shadow-[4px_0_12px_#1a2354] flex-shrink-0">
        <div className="mb-8">
          <h2 className="text-[#FE7F2D] font-bold text-lg">KGStore</h2>
          <p className="text-[#FAFFC4]/50 text-xs mt-1">Admin Panel</p>
        </div>

        <nav className="flex-1 space-y-1">
          {navLinks.map((link) => {
            const count = link.badge ? counts[link.badge] : 0;
            return (
              <a
                key={link.href}
                href={link.href}
                className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? "bg-[#FE7F2D]/20 text-[#FE7F2D]"
                    : "text-[#FAFFC4]/70 hover:bg-white/5 hover:text-[#FAFFC4]"
                }`}
              >
                <span>{link.label}</span>
                {count > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                    {count}
                  </span>
                )}
              </a>
            );
          })}
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
