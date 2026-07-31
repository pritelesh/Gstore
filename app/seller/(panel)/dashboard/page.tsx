"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, ShoppingCart, TrendingUp, Clock, Wallet, RefreshCw } from "lucide-react";
import { getSellerDashboardData, getSellerEarnings, getSellerOrders, getRecentActivity } from "@/lib/actions/seller";

export default function SellerDashboardPage() {
  const [data, setData] = useState({ storeName: "", storeStatus: "", totalProducts: 0, pendingProducts: 0, totalSales: 0 });
  const [stats, setStats] = useState({ totalSales: 0, totalOrders: 0, availableBalance: 0 });
  const [pendingOrders, setPendingOrders] = useState(0);
  const [recentActivity, setRecentActivity] = useState<{ id: number; product_name: string; amount: number; status: string; date: string }[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getSellerDashboardData(),
      getSellerEarnings(),
      getSellerOrders(),
      getRecentActivity(),
    ]).then(([d, e, o, r]) => {
      if ("error" in d) { setError(d.error); setLoading(false); return; }
      setData(d);
      if ("stats" in e) setStats(e.stats);
      if ("orders" in o) setPendingOrders(o.orders.filter(ord => ord.status === "pending").length);
      if ("orders" in r) setRecentActivity(r.orders);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <RefreshCw size={24} className="animate-spin text-[#FAFFC4]/30" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="p-6 rounded-2xl bg-red-500/20 border border-red-500/40 text-[#FAFFC4]">{error}</div>
      </div>
    );
  }

  const statusBadge = (s: string) => {
    const m: Record<string, string> = {
      pending: "text-yellow-400", processing: "text-blue-400", shipped: "text-purple-400", delivered: "text-green-400", cancelled: "text-red-400",
    };
    return m[s.toLowerCase()] ?? "text-[#FAFFC4]/50";
  };

  const cards = [
    { label: "Total Products", value: data.totalProducts, icon: Package, color: "text-[#FE7F2D]" },
    { label: "Total Orders", value: stats.totalOrders, icon: ShoppingCart, color: "text-blue-400" },
    { label: "Total Sales", value: `৳${stats.totalSales.toLocaleString()}`, icon: TrendingUp, color: "text-green-400" },
    { label: "Pending Orders", value: pendingOrders, icon: Clock, color: "text-yellow-400" },
    { label: "Available Balance", value: `৳${stats.availableBalance.toLocaleString()}`, icon: Wallet, color: "text-[#FE7F2D]" },
  ];

  return (
    <div className="p-4 md:p-8">
      {data.storeStatus === "pending" && (
        <div className="mb-6 p-4 rounded-2xl border-l-4 border-[#FE7F2D] bg-[#FE7F2D]/5 shadow-[10px_10px_20px_#1a2354,-10px_-10px_20px_#3849ae]">
          <p className="text-sm text-[#FAFFC4] font-medium">
            Your account is pending approval. You can prepare your store, but products won&apos;t be visible to customers until approved.
          </p>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#FAFFC4]">Welcome, {data.storeName}</h1>
        <p className="text-[#FAFFC4]/60 mt-1">Here&apos;s your store overview</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="bg-white/10 backdrop-blur-md rounded-2xl p-4 md:p-5 shadow-[10px_10px_20px_#1a2354,-10px_-10px_20px_#3849ae]">
              <Icon size={20} className={`${c.color} mb-2`} />
              <p className="text-[#FAFFC4]/60 text-xs mb-1">{c.label}</p>
              <p className={`text-lg md:text-xl font-bold ${c.color}`}>{c.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 shadow-[10px_10px_20px_#1a2354,-10px_-10px_20px_#3849ae]">
          <h2 className="text-lg font-bold text-[#FAFFC4] mb-4">Recent Activity</h2>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-[#FAFFC4]/40 text-center py-6">No recent activity</p>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((a) => (
                <div key={a.id} className="flex items-center justify-between py-2 border-b border-[#FAFFC4]/5 last:border-b-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-[#FAFFC4] truncate">{a.product_name}</p>
                    <p className="text-xs text-[#FAFFC4]/40">{a.date}</p>
                  </div>
                  <div className="text-right ml-4 flex-shrink-0">
                    <p className="text-sm font-semibold text-[#FAFFC4]">৳{a.amount.toLocaleString()}</p>
                    <p className={`text-xs font-medium ${statusBadge(a.status)}`}>{a.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 shadow-[10px_10px_20px_#1a2354,-10px_-10px_20px_#3849ae]">
          <h2 className="text-lg font-bold text-[#FAFFC4] mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link href="/seller/add-product" className="block p-4 rounded-xl bg-[#FE7F2D]/10 border border-[#FE7F2D]/20 hover:bg-[#FE7F2D]/20 transition-colors">
              <p className="text-sm font-semibold text-[#FE7F2D]">Add Product</p>
              <p className="text-xs text-[#FAFFC4]/40 mt-1">Upload a new product</p>
            </Link>
            <Link href="/seller/products" className="block p-4 rounded-xl bg-blue-400/10 border border-blue-400/20 hover:bg-blue-400/20 transition-colors">
              <p className="text-sm font-semibold text-blue-400">View Products</p>
              <p className="text-xs text-[#FAFFC4]/40 mt-1">Manage your inventory</p>
            </Link>
            <Link href="/seller/orders" className="block p-4 rounded-xl bg-green-400/10 border border-green-400/20 hover:bg-green-400/20 transition-colors">
              <p className="text-sm font-semibold text-green-400">View Orders</p>
              <p className="text-xs text-[#FAFFC4]/40 mt-1">Process customer orders</p>
            </Link>
            <Link href="/seller/cashout" className="block p-4 rounded-xl bg-purple-400/10 border border-purple-400/20 hover:bg-purple-400/20 transition-colors">
              <p className="text-sm font-semibold text-purple-400">Request Cashout</p>
              <p className="text-xs text-[#FAFFC4]/40 mt-1">Withdraw your earnings</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
