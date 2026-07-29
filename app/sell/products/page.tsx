"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, RefreshCw } from "lucide-react";
import clsx from "clsx";
import { getSellerProducts, type SellerProductData } from "@/lib/actions/seller";

const statusBadge = (s: string) => {
  const m: Record<string, string> = {
    active: "text-green-400 bg-green-400/10",
    approved: "text-green-400 bg-green-400/10",
    pending: "text-accent bg-accent/10",
    rejected: "text-red-400 bg-red-400/10",
  };
  return m[s.toLowerCase()] ?? "text-text bg-white/10";
};

export default function SellerProductsPage() {
  const [products, setProducts] = useState<SellerProductData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const res = await getSellerProducts();
    if ("products" in res) setProducts(res.products);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  if (loading) {
    return (
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center py-16">
            <RefreshCw size={24} className="animate-spin text-text/30" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-text">My Products</h1>
          <Link
            href="/sell/add-product"
            className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white font-semibold rounded-2xl hover:brightness-110 transition-all text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <Plus size={18} />
            Add Product
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="neu-flat p-10 text-center">
            <p className="text-sm text-text/60 mb-4">You haven&apos;t added any products yet.</p>
            <Link
              href="/sell/add-product"
              className="inline-block px-6 py-3 bg-accent text-white font-semibold rounded-2xl hover:brightness-110 transition-all focus:outline-none focus:ring-2 focus:ring-accent"
            >
              Add Your First Product
            </Link>
          </div>
        ) : (
          <div className="neu-flat overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left text-text/50 font-medium px-4 py-3">Product</th>
                    <th className="text-left text-text/50 font-medium px-4 py-3">Price</th>
                    <th className="text-left text-text/50 font-medium px-4 py-3">Category</th>
                    <th className="text-left text-text/50 font-medium px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                            <Image src={p.image} alt={p.name} fill className="object-cover" sizes="40px" unoptimized />
                          </div>
                          <span className="text-text font-medium">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-text">৳{p.price.toLocaleString()}</td>
                      <td className="px-4 py-3 text-text/50">{p.category}</td>
                      <td className="px-4 py-3">
                        <span className={clsx("text-xs font-semibold px-2 py-0.5 rounded-lg", statusBadge(p.status))}>
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
    </section>
  );
}
