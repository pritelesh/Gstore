"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CreditCard, CheckCircle } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { placeOrder } from "@/lib/actions/orders";
import clsx from "clsx";

const paymentMethods = [
  { id: "cod", label: "Cash on Delivery" },
  { id: "bkash", label: "bKash" },
  { id: "nagad", label: "Nagad" },
];

export default function CheckoutPage() {
  const { items, subtotal, clearCart, loading } = useCart();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [placed, setPlaced] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  if (!loading && items.length === 0 && !placed) {
    return (
      <section className="py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="neu-flat p-12 max-w-md mx-auto">
            <h1 className="text-2xl font-bold text-text mb-3">Cart is Empty</h1>
            <p className="text-sm text-text/60 mb-6">Add some products before checking out.</p>
            <Link
              href="/products"
              className="inline-block px-6 py-3 bg-accent text-white font-semibold rounded-2xl hover:brightness-110 transition-all"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const handlePlaceOrder = async () => {
    setError("");
    if (!name.trim() || !phone.trim() || !address.trim() || !city.trim()) {
      setError("Please fill in all required fields.");
      return;
    }
    setPlacing(true);
    const result = await placeOrder();
    if ("error" in result) {
      setError(result.error);
      setPlacing(false);
      return;
    }
    clearCart();
    setOrderId(result.orderId);
    setPlaced(true);
  };

  if (placed) {
    return (
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="neu-flat p-12 text-center max-w-lg mx-auto">
            <CheckCircle size={48} className="mx-auto mb-4 text-green-400" />
            <h1 className="text-2xl font-bold text-text mb-3">Order Placed Successfully!</h1>
            <p className="text-sm text-text/50 mb-2">
              Order ID: #{orderId}
            </p>
            <p className="text-sm text-text/60 leading-relaxed">
              Thank you for your order. We&apos;ll process it shortly and notify you
              once it ships.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-8 justify-center">
              <Link
                href="/products"
                className="px-6 py-3 bg-accent text-white font-semibold rounded-2xl hover:brightness-110 transition-all"
              >
                Continue Shopping
              </Link>
              <Link
                href={`/track-order/${orderId}`}
                className="px-6 py-3 border-2 border-accent text-accent font-semibold rounded-2xl hover:bg-accent hover:text-white transition-all"
              >
                Track Order
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const inputClass =
    "w-full neu-pressed bg-surface text-text text-sm rounded-xl px-4 py-2.5 placeholder-text/40 focus:outline-none focus:ring-2 focus:ring-accent transition-all";

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-text mb-8">Checkout</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3 space-y-6">
            <div className="neu-flat p-6">
              <h2 className="text-lg font-bold text-text mb-5">Shipping Address</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-text/70 mb-1 block">Full Name *</label>
                  <input
                    type="text" value={name} onChange={(e) => setName(e.target.value)}
                    className={inputClass} placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="text-sm text-text/70 mb-1 block">Phone Number *</label>
                  <input
                    type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                    className={inputClass} placeholder="01XXXXXXXXX"
                  />
                </div>
                <div>
                  <label className="text-sm text-text/70 mb-1 block">Address *</label>
                  <input
                    type="text" value={address} onChange={(e) => setAddress(e.target.value)}
                    className={inputClass} placeholder="Street, house, apartment"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm text-text/70 mb-1 block">City *</label>
                    <input
                      type="text" value={city} onChange={(e) => setCity(e.target.value)}
                      className={inputClass} placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-text/70 mb-1 block">Area</label>
                    <input
                      type="text" value={area} onChange={(e) => setArea(e.target.value)}
                      className={inputClass} placeholder="Area / Thana"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-text/70 mb-1 block">Postal Code</label>
                    <input
                      type="text" value={postalCode} onChange={(e) => setPostalCode(e.target.value)}
                      className={inputClass} placeholder="Postal code"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="neu-flat p-6">
              <h2 className="text-lg font-bold text-text mb-5">Payment Method</h2>
              <div className="space-y-3">
                {paymentMethods.map((pm) => (
                  <button
                    key={pm.id}
                    onClick={() => setPaymentMethod(pm.id)}
                    className={clsx(
                      "w-full flex items-center gap-3 neu-pressed bg-surface text-sm font-medium rounded-xl px-4 py-3 transition-all border-2 focus:outline-none focus:ring-2 focus:ring-accent",
                      paymentMethod === pm.id
                        ? "border-accent text-text"
                        : "border-transparent text-text/60 hover:text-text"
                    )}
                  >
                    <CreditCard size={18} className={paymentMethod === pm.id ? "text-accent" : "text-text/30"} />
                    {pm.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:w-1/3">
            <div className="neu-flat p-6">
              <h2 className="text-lg font-bold text-text mb-4">Order Summary</h2>

              <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                        unoptimized
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-text truncate">{item.name}</p>
                      <p className="text-xs text-text/50">×{item.quantity}</p>
                    </div>
                    <p className="text-xs font-semibold text-text">
                      ৳{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              <hr className="border-white/5 my-4" />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text/60">Subtotal</span>
                  <span className="font-semibold text-text">৳{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text/60">Shipping</span>
                  <span className="font-semibold text-text">—</span>
                </div>
              </div>

              <hr className="border-white/5 my-4" />

              <div className="flex justify-between text-base">
                <span className="font-bold text-text">Total</span>
                <span className="font-bold text-accent">৳{subtotal.toLocaleString()}</span>
              </div>

              {error && (
                <p className="text-xs text-red-400 bg-red-400/10 rounded-lg px-3 py-2 mt-4">{error}</p>
              )}

              <button
                onClick={handlePlaceOrder}
                disabled={placing}
                className="mt-6 w-full px-6 py-3 bg-accent text-white font-semibold rounded-2xl hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-accent"
              >
                {placing ? "Placing Order…" : "Place Order"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
