"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, RefreshCw } from "lucide-react";
import { getSellerProducts, type SellerProductData } from "@/lib/actions/seller";

const statusBadge = (s: string) => {
  const m: Record<string, string> = {
    active: "text-green-400 bg-green-400/10",
    approved: "text-green-400 bg-green-400/10",
    pending: "text-yellow-400 bg-yellow-400/10",
    rejected: "text-red-400 bg-red-400/10",
  };
  return m[s.toLowerCase()] ?? "text-gray-400 bg-white/10";
};

export default function SellerProductsPage() {
  const [products, setProducts] = useState<SellerProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    const res = await getSellerProducts();
    if ("error" in res) {
      setError(res.error);
      setLoading(false);
      return;
    }
    setProducts(res.products);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

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
        <div className="max-w-2xl mx-auto mt-16 p-6 rounded-2xl bg-red-500/20 border border-red-500/40">
          <h2 className="text-lg font-bold text-red-300 mb-2">Error Loading Products</h2>
          <p className="text-[#FAFFC4]/80 text-sm font-mono break-all">{error}</p>
          <button
            onClick={fetchProducts}
            className="mt-4 px-4 py-2 rounded-xl bg-[#FE7F2D] text-white text-sm font-medium hover:bg-[#e66e1f]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#FAFFC4]">My Products</h1>
          <p className="text-[#FAFFC4]/60 mt-1">
            {products.length} product{products.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/seller/add-product"
          className="flex items-center gap-2 px-5 py-2.5 bg-[#FE7F2D] text-white font-semibold rounded-xl hover:bg-[#e66e1f] transition-colors text-sm shadow-[4px_4px_8px_#1a2354,-4px_-4px_8px_#3849ae]"
        >
          <Plus size={18} />
          Add Product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="max-w-lg mx-auto mt-16 p-10 rounded-2xl bg-white/10 backdrop-blur-md text-center shadow-[10px_10px_20px_#1a2354,-10px_-10px_20px_#3849ae]">
          <p className="text-[#FAFFC4]/60 mb-4">You haven&apos;t added any products yet.</p>
          <Link
            href="/seller/add-product"
            className="inline-block px-6 py-3 bg-[#FE7F2D] text-white font-semibold rounded-xl hover:bg-[#e66e1f] transition-colors"
          >
            Add Your First Product
          </Link>
        </div>
      ) : (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden shadow-[10px_10px_20px_#1a2354,-10px_-10px_20px_#3849ae]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#FAFFC4]/10">
                  <th className="text-left text-[#FAFFC4]/50 font-medium px-4 py-3">Product</th>
                  <th className="text-left text-[#FAFFC4]/50 font-medium px-4 py-3">Price</th>
                  <th className="text-left text-[#FAFFC4]/50 font-medium px-4 py-3">Stock</th>
                  <th className="text-left text-[#FAFFC4]/50 font-medium px-4 py-3">Category</th>
                  <th className="text-left text-[#FAFFC4]/50 font-medium px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-[#FAFFC4]/5 hover:bg-white/5">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-[#1e2860]">
                          <Image
                            src={p.image}
                            alt={p.name}
                            fill
                            className="object-cover"
                            sizes="40px"
                            unoptimized
                          />
                        </div>
                        <span className="text-[#FAFFC4] font-medium">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#FAFFC4]">
                      ৳{p.price.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-[#FAFFC4]/70">{p.stock}</td>
                    <td className="px-4 py-3 text-[#FAFFC4]/50">{p.category}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${statusBadge(p.status)}`}
                      >
                        {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                      </span>
                      {p.status === "rejected" && p.rejection_reason && (
                        <p className="text-xs text-red-400 mt-1 max-w-xs">{p.rejection_reason}</p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
