"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Package, Search } from "lucide-react";

export default function TrackOrderPage() {
  const router = useRouter();
  const [orderId, setOrderId] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    setError("");
    const trimmed = orderId.trim();
    if (!trimmed) {
      setError("Please enter an order ID.");
      return;
    }
    router.push(`/track-order/${trimmed}`);
  };

  const inputClass =
    "w-full neu-pressed bg-surface text-text text-sm rounded-xl px-4 py-3 placeholder-text/40 focus:outline-none focus:ring-2 focus:ring-accent transition-all";

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <Package size={40} className="mx-auto mb-4 text-accent" />
          <h1 className="text-3xl font-bold text-text mb-2">Track Your Order</h1>
          <p className="text-sm text-text/60 max-w-md mx-auto">
            Enter your order ID to check the current status and tracking information.
          </p>
        </div>

        <div className="neu-flat p-8 max-w-md mx-auto">
          <div className="flex gap-3">
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="e.g. 12345"
              className={inputClass}
            />
            <button
              onClick={handleSubmit}
              className="px-6 py-3 bg-accent text-white font-semibold rounded-2xl hover:brightness-110 transition-all flex items-center gap-2 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <Search size={18} />
              Track
            </button>
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-400/10 rounded-lg px-3 py-2 mt-4">{error}</p>
          )}

          <p className="text-xs text-text/40 text-center mt-5">
            Orders are typically delivered within 3–5 business days.
          </p>
        </div>
      </div>
    </section>
  );
}
