"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Store, Package, ShoppingCart, TrendingUp, AlertTriangle, RefreshCw, Wallet } from "lucide-react";
import { getAdminDashboard } from "@/lib/actions/admin";
import type { DashboardStats, ActivityEvent } from "@/lib/actions/admin";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [adminName, setAdminName] = useState("Admin");
  const [recentActivity, setRecentActivity] = useState<ActivityEvent[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminDashboard().then((res) => {
      if ("error" in res) { setError(res.error); setLoading(false); return; }
      setStats(res.stats);
      setAdminName(res.adminName);
      setRecentActivity(res.recentActivity);
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

  if (error || !stats) {
    return (
      <div className="p-8">
        <div className="p-6 rounded-2xl bg-red-500/20 border border-red-500/40 text-[#FAFFC4]">{error}</div>
      </div>
    );
  }

  const pendingApprovals = stats.pendingSellerApprovals + stats.pendingProductApprovals + stats.pendingCashouts;

  const cards = [
    { label: "Total Sellers", value: stats.totalSellers, icon: Store, color: "text-[#FE7F2D]" },
    { label: "Total Products", value: stats.totalProducts, icon: Package, color: "text-blue-400" },
    { label: "Total Orders", value: stats.totalOrders, icon: ShoppingCart, color: "text-green-400" },
    { label: "Total Revenue", value: `৳${stats.totalRevenue.toLocaleString("en-IN")}`, icon: TrendingUp, color: "text-yellow-400" },
    { label: "Pending Approvals", value: pendingApprovals, icon: AlertTriangle, color: "text-red-400" },
  ];

  const eventIcon = (type: ActivityEvent["type"]) => {
    const m: Record<ActivityEvent["type"], { icon: typeof Store; color: string }> = {
      seller: { icon: Store, color: "text-[#FE7F2D]" },
      product: { icon: Package, color: "text-blue-400" },
      order: { icon: ShoppingCart, color: "text-green-400" },
      cashout: { icon: Wallet, color: "text-purple-400" },
    };
    return m[type] ?? { icon: Store, color: "text-[#FAFFC4]/50" };
  };

  return (
    <div className="p-4 md:p-8">
      {pendingApprovals > 0 && (
        <div className="mb-6 p-4 rounded-2xl border-l-4 border-[#FE7F2D] bg-[#FE7F2D]/5 shadow-[10px_10px_20px_#1a2354,-10px_-10px_20px_#3849ae]">
          <p className="text-sm text-[#FAFFC4] font-medium">
            You have {pendingApprovals} pending item(s) awaiting approval. Please review them from the Sellers, Products, or Cashouts pages.
          </p>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#FAFFC4]">Welcome, {adminName}</h1>
        <p className="text-[#FAFFC4]/60 mt-1">Here&apos;s the platform overview</p>
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
              {recentActivity.map((a) => {
                const { icon: Icon, color } = eventIcon(a.type);
                return (
                  <div key={a.id} className="flex items-center justify-between py-2 border-b border-[#FAFFC4]/5 last:border-b-0">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Icon size={16} className={`${color} flex-shrink-0`} />
                      <div className="min-w-0">
                        <p className="text-sm text-[#FAFFC4] truncate">{a.title}</p>
                        <p className="text-xs text-[#FAFFC4]/40">{a.detail} · {a.date}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 shadow-[10px_10px_20px_#1a2354,-10px_-10px_20px_#3849ae]">
          <h2 className="text-lg font-bold text-[#FAFFC4] mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link href="/admin/sellers" className="block p-4 rounded-xl bg-[#FE7F2D]/10 border border-[#FE7F2D]/20 hover:bg-[#FE7F2D]/20 transition-colors">
              <p className="text-sm font-semibold text-[#FE7F2D]">Review Sellers {stats.pendingSellerApprovals > 0 && `(${stats.pendingSellerApprovals})`}</p>
              <p className="text-xs text-[#FAFFC4]/40 mt-1">Approve pending stores</p>
            </Link>
            <Link href="/admin/products" className="block p-4 rounded-xl bg-blue-400/10 border border-blue-400/20 hover:bg-blue-400/20 transition-colors">
              <p className="text-sm font-semibold text-blue-400">Review Products {stats.pendingProductApprovals > 0 && `(${stats.pendingProductApprovals})`}</p>
              <p className="text-xs text-[#FAFFC4]/40 mt-1">Approve submitted products</p>
            </Link>
            <Link href="/admin/orders" className="block p-4 rounded-xl bg-green-400/10 border border-green-400/20 hover:bg-green-400/20 transition-colors">
              <p className="text-sm font-semibold text-green-400">View Orders</p>
              <p className="text-xs text-[#FAFFC4]/40 mt-1">Track platform orders</p>
            </Link>
            <Link href="/admin/cashouts" className="block p-4 rounded-xl bg-purple-400/10 border border-purple-400/20 hover:bg-purple-400/20 transition-colors">
              <p className="text-sm font-semibold text-purple-400">Review Cashouts {stats.pendingCashouts > 0 && `(${stats.pendingCashouts})`}</p>
              <p className="text-xs text-[#FAFFC4]/40 mt-1">Process payout requests</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
