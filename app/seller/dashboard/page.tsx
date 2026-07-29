"use client";

import { useEffect, useState } from "react";
import { getSellerDashboardData } from "@/lib/actions/seller";

export default function SellerDashboardPage() {
  const [storeName, setStoreName] = useState("");
  const [totalProducts, setTotalProducts] = useState(0);
  const [pendingProducts, setPendingProducts] = useState(0);
  const [totalSales] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    getSellerDashboardData().then((res) => {
      if ("error" in res) {
        setError(res.error);
        return;
      }
      setStoreName(res.storeName);
      setTotalProducts(res.totalProducts);
      setPendingProducts(res.pendingProducts);
    });
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-[#FAFFC4] text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#FAFFC4]">
          Welcome, {storeName}
        </h1>
        <p className="text-[#FAFFC4]/60 mt-1">Here&apos;s your store overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-[10px_10px_20px_#1a2354,-10px_-10px_20px_#3849ae]">
          <p className="text-[#FAFFC4]/60 text-sm">Total Products</p>
          <p className="text-3xl font-bold text-[#FAFFC4] mt-1">{totalProducts}</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-[10px_10px_20px_#1a2354,-10px_-10px_20px_#3849ae]">
          <p className="text-[#FAFFC4]/60 text-sm">Pending Approval</p>
          <p className="text-3xl font-bold text-yellow-400 mt-1">{pendingProducts}</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-[10px_10px_20px_#1a2354,-10px_-10px_20px_#3849ae]">
          <p className="text-[#FAFFC4]/60 text-sm">Total Sales</p>
          <p className="text-3xl font-bold text-green-400 mt-1">
            ৳{totalSales.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <a
          href="/seller/add-product"
          className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-[10px_10px_20px_#1a2354,-10px_-10px_20px_#3849ae] hover:bg-white/15 transition-colors"
        >
          <h3 className="text-lg font-semibold text-[#FAFFC4]">Add New Product</h3>
          <p className="text-[#FAFFC4]/50 text-sm mt-1">
            Upload a new product for review
          </p>
        </a>

        <a
          href="/seller/products"
          className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-[10px_10px_20px_#1a2354,-10px_-10px_20px_#3849ae] hover:bg-white/15 transition-colors"
        >
          <h3 className="text-lg font-semibold text-[#FAFFC4]">View Products</h3>
          <p className="text-[#FAFFC4]/50 text-sm mt-1">
            Manage your existing products
          </p>
        </a>
      </div>
    </div>
  );
}
