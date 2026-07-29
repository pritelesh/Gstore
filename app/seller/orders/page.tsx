"use client";

import { Package } from "lucide-react";

export default function SellerOrdersPage() {
  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-8">
        <Package size={28} className="text-[#FE7F2D]" />
        <div>
          <h1 className="text-3xl font-bold text-[#FAFFC4]">Orders</h1>
          <p className="text-[#FAFFC4]/60 mt-1">View and manage customer orders</p>
        </div>
      </div>
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-10 text-center shadow-[10px_10px_20px_#1a2354,-10px_-10px_20px_#3849ae]">
        <p className="text-[#FAFFC4]/50 text-lg">Orders page coming soon</p>
        <p className="text-[#FAFFC4]/30 text-sm mt-2">
          Here you&apos;ll be able to view and manage orders from customers.
        </p>
      </div>
    </div>
  );
}
