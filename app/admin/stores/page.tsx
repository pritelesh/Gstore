"use client";

import { useEffect, useState, useCallback } from "react";
import { Trash2, RefreshCw } from "lucide-react";
import clsx from "clsx";
import { getAdminStores, toggleStoreStatus, deleteStore } from "@/lib/actions/admin";

interface Store {
  id: string;
  name: string;
  seller: string;
  products: number;
  status: string;
  joined: string;
}

const statusBadge = (s: string) => {
  const m: Record<string, string> = {
    approved: "text-green-400 bg-green-400/10",
    rejected: "text-red-400 bg-red-400/10",
    pending: "text-accent bg-accent/10",
  };
  return m[s.toLowerCase()] ?? "text-text bg-white/10";
};

const displayStatus = (s: string) => {
  if (s === "approved") return "Active";
  if (s === "rejected") return "Suspended";
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export default function AdminStoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStores = useCallback(async () => {
    setLoading(true);
    const res = await getAdminStores();
    if ("stores" in res) setStores(res.stores);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this store?")) return;
    const res = await deleteStore(id);
    if ("success" in res) fetchStores();
  };

  const handleToggle = async (id: string) => {
    const res = await toggleStoreStatus(id);
    if ("success" in res) fetchStores();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <RefreshCw size={24} className="animate-spin text-text/30" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-text">Manage Stores</h2>
      <div className="neu-flat overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-text/50 font-medium px-4 py-3">Store</th>
                <th className="text-left text-text/50 font-medium px-4 py-3">Seller</th>
                <th className="text-left text-text/50 font-medium px-4 py-3">Products</th>
                <th className="text-left text-text/50 font-medium px-4 py-3">Status</th>
                <th className="text-left text-text/50 font-medium px-4 py-3">Joined</th>
                <th className="text-left text-text/50 font-medium px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {stores.map((s) => (
                <tr key={s.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3 text-text font-medium">{s.name}</td>
                  <td className="px-4 py-3 text-text/70">{s.seller}</td>
                  <td className="px-4 py-3 text-text">{s.products}</td>
                  <td className="px-4 py-3">
                    <span className={clsx("text-xs font-semibold px-2 py-0.5 rounded-lg", statusBadge(s.status))}>
                      {displayStatus(s.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text/50">{s.joined}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleToggle(s.id)} className="text-xs text-blue-400 font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded">
                        {s.status === "approved" ? "Suspend" : "Activate"}
                      </button>
                      <button onClick={() => handleDelete(s.id)} className="neu-flat p-1.5 text-red-400 hover:bg-red-400/10 focus:outline-none focus:ring-2 focus:ring-red-400 rounded-xl" aria-label="Delete">
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
