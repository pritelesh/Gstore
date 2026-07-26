"use client";

import { useEffect, useState, useCallback } from "react";
import { Check, X, RefreshCw } from "lucide-react";
import clsx from "clsx";
import { getAdminSellers, approveStore, rejectStore } from "@/lib/actions/admin";

interface Seller {
  id: string;
  seller_id: string;
  name: string;
  store: string;
  email: string;
  phone: string;
  status: string;
  applied: string;
}

const statusBadge = (s: string) => {
  const m: Record<string, string> = {
    approved: "text-green-400 bg-green-400/10",
    pending: "text-accent bg-accent/10",
    rejected: "text-red-400 bg-red-400/10",
  };
  return m[s.toLowerCase()] ?? "text-text bg-white/10";
};

export default function AdminSellersPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSellers = useCallback(async () => {
    setLoading(true);
    const res = await getAdminSellers();
    if ("sellers" in res) setSellers(res.sellers);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSellers();
  }, [fetchSellers]);

  const handleApprove = async (id: string) => {
    const res = await approveStore(id);
    if ("success" in res) fetchSellers();
  };

  const handleReject = async (id: string) => {
    const res = await rejectStore(id);
    if ("success" in res) fetchSellers();
  };

  const pending = sellers.filter((s) => s.status === "pending");
  const others = sellers.filter((s) => s.status !== "pending");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <RefreshCw size={24} className="animate-spin text-text/30" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-text mb-4">Pending Approvals ({pending.length})</h2>
        {pending.length === 0 ? (
          <div className="neu-flat p-8 text-center">
            <p className="text-sm text-text/50">No pending applications.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pending.map((s) => (
              <div key={s.id} className="neu-flat p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-bold text-text">{s.store}</p>
                    <p className="text-xs text-text/50">{s.name}</p>
                  </div>
                  <span className={clsx("text-xs font-semibold px-2 py-0.5 rounded-lg", statusBadge(s.status))}>
                    {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                  </span>
                </div>
                <p className="text-xs text-text/50">{s.email} · {s.phone}</p>
                <p className="text-xs text-text/40 mt-1">Applied: {s.applied}</p>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleApprove(s.id)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-green-500 text-white text-xs font-semibold rounded-xl hover:brightness-110 transition-all focus:outline-none focus:ring-2 focus:ring-green-400"
                  >
                    <Check size={14} /> Approve
                  </button>
                  <button
                    onClick={() => handleReject(s.id)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-red-500 text-white text-xs font-semibold rounded-xl hover:brightness-110 transition-all focus:outline-none focus:ring-2 focus:ring-red-400"
                  >
                    <X size={14} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-xl font-bold text-text mb-4">All Sellers ({others.length})</h2>
        <div className="neu-flat overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-text/50 font-medium px-4 py-3">Store</th>
                  <th className="text-left text-text/50 font-medium px-4 py-3">Owner</th>
                  <th className="text-left text-text/50 font-medium px-4 py-3">Email</th>
                  <th className="text-left text-text/50 font-medium px-4 py-3">Phone</th>
                  <th className="text-left text-text/50 font-medium px-4 py-3">Status</th>
                  <th className="text-left text-text/50 font-medium px-4 py-3">Applied</th>
                </tr>
              </thead>
              <tbody>
                {others.map((s) => (
                  <tr key={s.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-4 py-3 text-text font-medium">{s.store}</td>
                    <td className="px-4 py-3 text-text/70">{s.name}</td>
                    <td className="px-4 py-3 text-text/50">{s.email}</td>
                    <td className="px-4 py-3 text-text/50">{s.phone}</td>
                    <td className="px-4 py-3">
                      <span className={clsx("text-xs font-semibold px-2 py-0.5 rounded-lg", statusBadge(s.status))}>
                        {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text/50">{s.applied}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
