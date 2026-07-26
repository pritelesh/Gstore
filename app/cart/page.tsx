"use client";

import Link from "next/link";
import Image from "next/image";
import { Trash2, Minus, Plus, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <section className="py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="neu-flat p-12 max-w-md mx-auto">
            <ShoppingCart size={48} className="mx-auto mb-4 text-text/30" />
            <h1 className="text-2xl font-bold text-text mb-3">Your Cart is Empty</h1>
            <p className="text-sm text-text/60 mb-6">
              Looks like you haven&apos;t added anything yet.
            </p>
            <Link
              href="/products"
              className="inline-block px-6 py-3 bg-accent text-white font-semibold rounded-2xl hover:brightness-110 transition-all focus:outline-none focus:ring-2 focus:ring-accent"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-text mb-8">Shopping Cart</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="neu-flat p-4 flex items-center gap-4">
                <Link
                  href={`/products/${item.id}`}
                  className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                    unoptimized
                  />
                </Link>

                <div className="flex-1 min-w-0">
                  <Link
                    href={`/products/${item.id}`}
                    className="text-sm font-semibold text-text hover:text-accent transition-colors focus:outline-none focus:ring-2 focus:ring-accent rounded"
                  >
                    {item.name}
                  </Link>
                  <p className="text-sm text-accent font-bold mt-1">
                    ৳{item.price.toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="neu-flat p-1.5 text-text hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent rounded-xl transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center text-sm font-semibold text-text">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="neu-flat p-1.5 text-text hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent rounded-xl transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <p className="text-sm font-bold text-text w-20 text-right">
                  ৳{(item.price * item.quantity).toLocaleString()}
                </p>

                <button
                  onClick={() => removeItem(item.id)}
                  className="neu-flat p-2 text-red-400 hover:bg-red-400/10 focus:outline-none focus:ring-2 focus:ring-red-400 rounded-xl transition-all"
                  aria-label="Remove item"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          <div className="lg:w-1/3">
            <div className="neu-flat p-6">
              <h2 className="text-lg font-bold text-text mb-4">Order Summary</h2>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text/60">Subtotal</span>
                  <span className="font-semibold text-text">৳{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text/60">Shipping</span>
                  <span className="font-semibold text-text">Calculated at checkout</span>
                </div>
              </div>

              <hr className="border-white/5 my-4" />

              <div className="flex justify-between text-base">
                <span className="font-bold text-text">Total</span>
                <span className="font-bold text-accent">৳{subtotal.toLocaleString()}</span>
              </div>

              <Link
                href="/checkout"
                className="mt-6 w-full block text-center px-6 py-3 bg-accent text-white font-semibold rounded-2xl hover:brightness-110 transition-all focus:outline-none focus:ring-2 focus:ring-accent"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
