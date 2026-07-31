"use client";

import { useEffect, useState } from "react";
import { RefreshCw, TrendingUp, Wallet, ShoppingCart, DollarSign } from "lucide-react";
import { getSellerEarnings, getSellerOrders } from "@/lib/actions/seller";

export default function SellerEarningsPage() {
  const [stats, setStats] = useState({ totalSales: 0, totalOrders: 0, availableBalance: 0 });
  const [monthlyEarnings, setMonthlyEarnings] = useState<{ month: string; amount: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getSellerEarnings(), getSellerOrders()]).then(([e, o]) => {
      if ("error" in e) { setError(e.error); setLoading(false); return; }
      setStats(e.stats);
      if ("orders" in o) {
        const monthly: Record<string, number> = {};
        o.orders.filter(ord => ord.status === "delivered").forEach(ord => {
          const m = new Date(ord.date).toLocaleString("default", { month: "short", year: "numeric" });
          monthly[m] = (monthly[m] ?? 0) + ord.amount;
        });
        setMonthlyEarnings(Object.entries(monthly).map(([month, amount]) => ({ month, amount })).reverse());
      }
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="flex items-center justify-center h-full p-8"><RefreshCw size={24} className="animate-spin text-[#FAFFC4]/30" /></div>;

  if (error) return <div className="p-8"><div className="p-6 rounded-2xl bg-red-500/20 border border-red-500/40 text-[#FAFFC4]">{error}</div></div>;

  const cards = [
    { label: "Total Sales", value: `৳${stats.totalSales.toLocaleString()}`, icon: TrendingUp, color: "text-green-400" },
    { label: "Total Orders", value: stats.totalOrders, icon: ShoppingCart, color: "text-blue-400" },
    { label: "Available Balance", value: `৳${stats.availableBalance.toLocaleString()}`, icon: Wallet, color: "text-[#FE7F2D]" },
    { label: "Lifetime Earnings", value: `৳${stats.totalSales.toLocaleString()}`, icon: DollarSign, color: "text-purple-400" },
  ];

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#FAFFC4]">Earnings</h1>
        <p className="text-[#FAFFC4]/60 mt-1">Track your revenue and payouts</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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

      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 shadow-[10px_10px_20px_#1a2354,-10px_-10px_20px_#3849ae]">
        <h2 className="text-lg font-bold text-[#FAFFC4] mb-4">Monthly Earnings</h2>
        {monthlyEarnings.length === 0 ? (
          <p className="text-sm text-[#FAFFC4]/40 text-center py-8">No completed orders yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#FAFFC4]/10">
                  <th className="text-left text-[#FAFFC4]/50 font-medium px-4 py-3">Month</th>
                  <th className="text-right text-[#FAFFC4]/50 font-medium px-4 py-3">Earnings</th>
                </tr>
              </thead>
              <tbody>
                {monthlyEarnings.map((m) => (
                  <tr key={m.month} className="border-b border-[#FAFFC4]/5">
                    <td className="px-4 py-3 text-[#FAFFC4]">{m.month}</td>
                    <td className="px-4 py-3 text-right text-green-400 font-semibold">৳{m.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
