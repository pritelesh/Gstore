"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Store, Package, ShoppingCart, UserCheck, Menu, X,
} from "lucide-react";
import clsx from "clsx";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Manage Stores", href: "/admin/stores", icon: Store },
  { label: "Manage Products", href: "/admin/products", icon: Package },
  { label: "Manage Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "Seller Approvals", href: "/admin/sellers", icon: UserCheck },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <section className="py-8 md:py-12 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-text">Admin Panel</h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden neu-flat p-2 text-text focus:outline-none focus:ring-2 focus:ring-accent rounded-xl"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className={`lg:w-1/5 ${sidebarOpen ? "block" : "hidden"} lg:block`}>
            <div className="neu-flat p-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={clsx(
                      "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-400",
                      active
                        ? "bg-blue-500 text-white"
                        : "text-text hover:bg-white/5"
                    )}
                  >
                    <Icon size={18} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="lg:w-4/5">{children}</div>
        </div>
      </div>
    </section>
  );
}
