"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, RefreshCw, Edit3, Trash2, Eye, EyeOff, Search } from "lucide-react";
import { getSellerProducts, deleteProduct, toggleProductPublish, type SellerProductData } from "@/lib/actions/seller";

const statusBadge = (s: string) => {
  const m: Record<string, string> = {
    draft: "text-gray-400 bg-white/10",
    pending: "text-yellow-400 bg-yellow-400/10",
    approved: "text-green-400 bg-green-400/10",
    published: "text-green-400 bg-green-400/10",
    rejected: "text-red-400 bg-red-400/10",
  };
  return m[s.toLowerCase()] ?? "text-gray-400 bg-white/10";
};

export default function SellerProductsPage() {
  const [products, setProducts] = useState<SellerProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    const res = await getSellerProducts();
    if ("error" in res) { setError(res.error); setLoading(false); return; }
    setProducts(res.products);
    setLoading(false);
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const categories = Array.from(new Set(products.map(p => p.category)));

  const filtered = products.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (categoryFilter && p.category !== categoryFilter) return false;
    return true;
  });

  const handleDelete = async (id: string) => {
    setDeleting(true);
    await deleteProduct(id);
    setProducts(prev => prev.filter(p => p.id !== id));
    setDeleteConfirm(null);
    setDeleting(false);
  };

  const handleTogglePublish = async (id: string, currentStatus: string) => {
    const isPublished = currentStatus === "approved" || currentStatus === "published";
    await toggleProductPublish(id, !isPublished);
    setProducts(prev => prev.map(p => p.id === id ? { ...p, status: isPublished ? "draft" : "pending" } : p));
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full p-8"><RefreshCw size={24} className="animate-spin text-[#FAFFC4]/30" /></div>;
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="max-w-2xl mx-auto mt-16 p-6 rounded-2xl bg-red-500/20 border border-red-500/40">
          <h2 className="text-lg font-bold text-red-300 mb-2">Error Loading Products</h2>
          <p className="text-[#FAFFC4]/80 text-sm font-mono break-all">{error}</p>
          <button onClick={fetchProducts} className="mt-4 px-4 py-2 rounded-xl bg-[#FE7F2D] text-white text-sm font-medium hover:bg-[#e66e1f]">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#FAFFC4]">My Products</h1>
          <p className="text-[#FAFFC4]/60 mt-1">{products.length} product{products.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/seller/add-product" className="flex items-center gap-2 px-5 py-2.5 bg-[#FE7F2D] text-white font-semibold rounded-xl hover:bg-[#e66e1f] transition-colors text-sm shadow-[4px_4px_8px_#1a2354,-4px_-4px_8px_#3849ae]">
          <Plus size={18} /> Add Product
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#FAFFC4]/30" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#293681] text-[#FAFFC4] placeholder-[#FAFFC4]/40 border border-[#FAFFC4]/20 focus:outline-none focus:border-[#FE7F2D] text-sm shadow-[inset_4px_4px_8px_#1a2354,inset_-4px_-4px_8px_#3849ae]"
          />
        </div>
        <select
          value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-[#293681] text-[#FAFFC4] border border-[#FAFFC4]/20 focus:outline-none focus:border-[#FE7F2D] text-sm appearance-none shadow-[inset_4px_4px_8px_#1a2354,inset_-4px_-4px_8px_#3849ae]"
        >
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="max-w-lg mx-auto mt-16 p-10 rounded-2xl bg-white/10 backdrop-blur-md text-center shadow-[10px_10px_20px_#1a2354,-10px_-10px_20px_#3849ae]">
          <p className="text-[#FAFFC4]/60 mb-4">{products.length === 0 ? "You haven't added any products yet." : "No products match your search."}</p>
          {products.length === 0 && (
            <Link href="/seller/add-product" className="inline-block px-6 py-3 bg-[#FE7F2D] text-white font-semibold rounded-xl hover:bg-[#e66e1f] transition-colors">
              Add Your First Product
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden shadow-[10px_10px_20px_#1a2354,-10px_-10px_20px_#3849ae]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#FAFFC4]/10">
                  <th className="text-left text-[#FAFFC4]/50 font-medium px-4 py-3">Product</th>
                  <th className="text-left text-[#FAFFC4]/50 font-medium px-4 py-3">Category</th>
                  <th className="text-left text-[#FAFFC4]/50 font-medium px-4 py-3">Price</th>
                  <th className="text-left text-[#FAFFC4]/50 font-medium px-4 py-3">Stock</th>
                  <th className="text-left text-[#FAFFC4]/50 font-medium px-4 py-3">Status</th>
                  <th className="text-right text-[#FAFFC4]/50 font-medium px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-[#FAFFC4]/5 hover:bg-white/5">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-[#1e2860]">
                          <Image src={p.image} alt={p.name} fill className="object-cover" sizes="40px" unoptimized />
                        </div>
                        <span className="text-[#FAFFC4] font-medium">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#FAFFC4]/50">{p.category}{p.season ? ` · ${p.season}` : ""}</td>
                    <td className="px-4 py-3 text-[#FAFFC4]">৳{p.price.toLocaleString()}</td>
                    <td className="px-4 py-3 text-[#FAFFC4]/70">{p.stock}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${statusBadge(p.status)}`}>
                        {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                      </span>
                      {p.status === "rejected" && p.rejection_reason && (
                        <p className="text-xs text-red-400 mt-1 max-w-xs">{p.rejection_reason}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleTogglePublish(p.id, p.status)}
                          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-[#FE7F2D]"
                          title={p.status === "approved" || p.status === "published" ? "Unpublish" : "Publish"}
                        >
                          {p.status === "approved" || p.status === "published" ? <EyeOff size={16} className="text-yellow-400" /> : <Eye size={16} className="text-green-400" />}
                        </button>
                        <Link
                          href={`/seller/add-product?id=${p.id}`}
                          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-[#FE7F2D]"
                          title="Edit"
                        >
                          <Edit3 size={16} className="text-blue-400" />
                        </Link>
                        <button
                          onClick={() => setDeleteConfirm(p.id)}
                          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
                          title="Delete"
                        >
                          <Trash2 size={16} className="text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-[#293681] rounded-2xl p-6 max-w-sm w-full shadow-[20px_20px_40px_#1a2354,-20px_-20px_40px_#3849ae]">
            <h3 className="text-lg font-bold text-[#FAFFC4] mb-2">Delete Product?</h3>
            <p className="text-sm text-[#FAFFC4]/60 mb-6">This will soft-delete the product. Order history referencing it will not be affected.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-[#FAFFC4]/20 text-[#FAFFC4] text-sm font-medium hover:bg-white/5 transition-colors">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} disabled={deleting} className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50">
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
