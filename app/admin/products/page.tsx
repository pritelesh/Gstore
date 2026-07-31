"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Trash2, RefreshCw, X, Eye, EyeOff } from "lucide-react";
import clsx from "clsx";
import {
  getAdminProducts, approveProduct, rejectProduct, unpublishProduct, deleteAdminProduct,
} from "@/lib/actions/admin";
import type { AdminProduct } from "@/lib/actions/admin";

const statusBadge = (s: string) => {
  const m: Record<string, string> = {
    approved: "text-green-400 bg-green-400/10",
    active: "text-green-400 bg-green-400/10",
    pending_review: "text-[#FE7F2D] bg-[#FE7F2D]/10",
    rejected: "text-red-400 bg-red-400/10",
    draft: "text-[#FAFFC4]/50 bg-white/5",
  };
  return m[s.toLowerCase()] ?? "text-[#FAFFC4] bg-white/10";
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    const res = await getAdminProducts();
    if ("error" in res) setError(res.error);
    else setProducts(res.products);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleApprove = async (id: string) => {
    await approveProduct(id);
    fetch();
  };

  const handleReject = async (id: string) => {
    await rejectProduct(id);
    setRejectingId(null);
    fetch();
  };

  const handleUnpublish = async (id: string) => {
    await unpublishProduct(id);
    fetch();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this product permanently?")) return;
    await deleteAdminProduct(id);
    fetch();
  };

  const filtered = products.filter((p) => statusFilter === "all" || p.status === statusFilter);
  const statuses = ["all", ...Array.from(new Set(products.map((p) => p.status)))];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <RefreshCw size={24} className="animate-spin text-[#FAFFC4]/30" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#FAFFC4]">Manage Products ({products.length})</h2>
        <div className="flex gap-2">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={clsx(
                "text-xs px-3 py-1.5 rounded-lg font-medium transition-colors",
                statusFilter === s
                  ? "bg-blue-500 text-white"
                  : "bg-white/5 text-[#FAFFC4]/60 hover:text-[#FAFFC4]"
              )}
            >
              {s === "all" ? "All" : s.replace("_", " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      <div className="neu-flat overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-[#FAFFC4]/50 font-medium px-4 py-3">Product</th>
                <th className="text-left text-[#FAFFC4]/50 font-medium px-4 py-3">Category</th>
                <th className="text-left text-[#FAFFC4]/50 font-medium px-4 py-3">Price</th>
                <th className="text-left text-[#FAFFC4]/50 font-medium px-4 py-3">Stock</th>
                <th className="text-left text-[#FAFFC4]/50 font-medium px-4 py-3">Status</th>
                <th className="text-left text-[#FAFFC4]/50 font-medium px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                        <Image src={p.image} alt={p.name} fill className="object-cover" sizes="40px" unoptimized />
                      </div>
                      <span className="text-[#FAFFC4] font-medium">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#FAFFC4]/50">{p.category}</td>
                  <td className="px-4 py-3 text-[#FAFFC4]">৳{p.price}</td>
                  <td className="px-4 py-3 text-[#FAFFC4]/70">{p.stock}</td>
                  <td className="px-4 py-3">
                    <span className={clsx("text-xs font-semibold px-2 py-0.5 rounded-lg", statusBadge(p.status))}>
                      {p.status.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {p.status === "pending_review" && (
                        <>
                          <button onClick={() => handleApprove(p.id)} className="text-xs text-green-400 font-medium hover:underline">Approve</button>
                          {rejectingId === p.id ? (
                            <div className="flex items-center gap-1">
                              <button onClick={() => handleReject(p.id)} className="text-xs text-red-400 font-medium hover:underline">Confirm Reject</button>
                              <button onClick={() => setRejectingId(null)} className="text-[#FAFFC4]/40 hover:text-[#FAFFC4]"><X size={14} /></button>
                            </div>
                          ) : (
                            <button onClick={() => setRejectingId(p.id)} className="text-xs text-red-400 font-medium hover:underline">Reject</button>
                          )}
                        </>
                      )}
                      {p.status === "approved" && (
                        <button onClick={() => handleUnpublish(p.id)} className="text-xs text-[#FE7F2D] font-medium hover:underline"><EyeOff size={14} className="inline" /> Unpublish</button>
                      )}
                      {p.status === "rejected" && (
                        <button onClick={() => handleApprove(p.id)} className="text-xs text-green-400 font-medium hover:underline"><Eye size={14} className="inline" /> Approve</button>
                      )}
                      <button onClick={() => handleDelete(p.id)} className="neu-flat p-1.5 text-red-400 hover:bg-red-400/10 rounded-xl" aria-label="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
