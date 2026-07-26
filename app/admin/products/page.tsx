"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, RefreshCw } from "lucide-react";
import clsx from "clsx";
import { getAdminProducts, approveProduct, rejectProduct, deleteAdminProduct } from "@/lib/actions/admin";

interface Product {
  id: string;
  name: string;
  image: string;
  store: string;
  price: number;
  status: string;
  category: string;
}

const statusBadge = (s: string) => {
  const m: Record<string, string> = {
    active: "text-green-400 bg-green-400/10",
    approved: "text-green-400 bg-green-400/10",
    pending: "text-accent bg-accent/10",
    rejected: "text-red-400 bg-red-400/10",
  };
  return m[s.toLowerCase()] ?? "text-text bg-white/10";
};

const displayStatus = (s: string) => {
  if (s === "pending") return "Pending Review";
  if (s === "active" || s === "approved") return "Active";
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const res = await getAdminProducts();
    if ("products" in res) setProducts(res.products);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this product?")) return;
    const res = await deleteAdminProduct(id);
    if ("success" in res) fetchProducts();
  };

  const handleApprove = async (id: string) => {
    const res = await approveProduct(id);
    if ("success" in res) fetchProducts();
  };

  const handleReject = async (id: string) => {
    const res = await rejectProduct(id);
    if ("success" in res) fetchProducts();
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
      <h2 className="text-xl font-bold text-text">Manage Products</h2>
      <div className="neu-flat overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-text/50 font-medium px-4 py-3">Product</th>
                <th className="text-left text-text/50 font-medium px-4 py-3">Store</th>
                <th className="text-left text-text/50 font-medium px-4 py-3">Price</th>
                <th className="text-left text-text/50 font-medium px-4 py-3">Category</th>
                <th className="text-left text-text/50 font-medium px-4 py-3">Status</th>
                <th className="text-left text-text/50 font-medium px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3">
                    <Link href={`/products/${p.id}`} className="flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                        <Image src={p.image} alt={p.name} fill className="object-cover" sizes="40px" unoptimized />
                      </div>
                      <span className="text-text font-medium">{p.name}</span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-text/70">{p.store}</td>
                  <td className="px-4 py-3 text-text">৳{p.price}</td>
                  <td className="px-4 py-3 text-text/50">{p.category}</td>
                  <td className="px-4 py-3">
                    <span className={clsx("text-xs font-semibold px-2 py-0.5 rounded-lg", statusBadge(p.status))}>
                      {displayStatus(p.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {p.status === "pending" && (
                        <>
                          <button onClick={() => handleApprove(p.id)} className="text-xs text-green-400 font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-green-400 rounded">Approve</button>
                          <button onClick={() => handleReject(p.id)} className="text-xs text-red-400 font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-red-400 rounded">Reject</button>
                        </>
                      )}
                      {p.status !== "pending" && (
                        <button onClick={() => handleDelete(p.id)} className="neu-flat p-1.5 text-red-400 hover:bg-red-400/10 focus:outline-none focus:ring-2 focus:ring-red-400 rounded-xl" aria-label="Delete">
                          <Trash2 size={14} />
                        </button>
                      )}
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
