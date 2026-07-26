import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { trackOrder } from "@/lib/actions/orders";

import clsx from "clsx";

interface Props {
  params: { id: string };
}

const statusColor: Record<string, string> = {
  pending: "text-accent bg-accent/10",
  confirmed: "text-blue-400 bg-blue-400/10",
  shipped: "text-purple-400 bg-purple-400/10",
  delivered: "text-green-400 bg-green-400/10",
  cancelled: "text-red-400 bg-red-400/10",
};

const steps = ["pending", "confirmed", "shipped", "delivered"];

export default async function TrackOrderDetailPage({ params }: Props) {
  const result = await trackOrder(params.id);

  if ("error" in result) {
    notFound();
  }

  const { order } = result;
  const currentStep = steps.indexOf(order.status);
  const isCancelled = order.status === "cancelled";

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <Link
            href="/track-order"
            className="text-sm text-text/50 hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent rounded-lg transition-colors"
          >
            &larr; Track Another Order
          </Link>
        </div>

        <div className="neu-flat p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-text">
                Order #{order.id}
              </h1>
              <p className="text-sm text-text/50 mt-1">
                Placed on{" "}
                {new Date(order.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <span
              className={clsx(
                "text-sm font-semibold px-4 py-1.5 rounded-lg capitalize",
                statusColor[order.status] ?? "text-text bg-white/10",
              )}
            >
              {order.status}
            </span>
          </div>
        </div>

        {/* Courier info */}
        {order.courier_name && (
          <div className="neu-flat p-6 mb-8">
            <h2 className="text-sm font-semibold text-text mb-2">
              Courier Information
            </h2>
            <p className="text-sm text-text/70">
              Courier: <span className="font-medium text-text">{order.courier_name}</span>
            </p>
            {order.tracking_status && (
              <p className="text-sm text-text/70 mt-1">
                Status:{" "}
                <span className="font-medium text-text">{order.tracking_status}</span>
              </p>
            )}
          </div>
        )}

        {/* Progress tracker */}
        {!isCancelled ? (
          <div className="neu-flat p-6 mb-8">
            <h2 className="text-sm font-semibold text-text mb-6">Order Progress</h2>
            <div className="flex items-start justify-between">
              {steps.map((step, i) => {
                const done = i <= currentStep;
                return (
                  <div key={step} className="flex flex-col items-center flex-1">
                    <div
                      className={clsx(
                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                        done
                          ? "bg-accent text-white"
                          : "bg-surface text-text/30",
                      )}
                    >
                      {i + 1}
                    </div>
                    <p
                      className={clsx(
                        "text-xs mt-2 capitalize text-center",
                        done ? "text-text font-medium" : "text-text/30",
                      )}
                    >
                      {step}
                    </p>
                    {i < steps.length - 1 && (
                      <div
                        className={clsx(
                          "h-0.5 w-full mt-4",
                          i < currentStep ? "bg-accent" : "bg-surface",
                        )}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="neu-flat p-6 mb-8 text-center">
            <p className="text-sm text-red-400 font-semibold">
              This order has been cancelled.
            </p>
          </div>
        )}

        {/* Order items */}
        <div className="neu-flat p-6 mb-8">
          <h2 className="text-sm font-semibold text-text mb-4">Items</h2>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 py-3 border-b border-white/5 last:border-b-0"
              >
                <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-surface">
                  {item.product_image && (
                    <Image
                      src={item.product_image}
                      alt={item.product_name}
                      fill
                      className="object-cover"
                      sizes="56px"
                      unoptimized
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text truncate">
                    {item.product_name}
                  </p>
                  <p className="text-xs text-text/50">×{item.quantity}</p>
                </div>
                <p className="text-sm font-semibold text-text">
                  ৳{(item.price * item.quantity).toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          <hr className="border-white/5 my-4" />
          <div className="flex justify-between">
            <span className="text-sm font-semibold text-text">Total</span>
            <span className="text-base font-bold text-accent">
              ৳{Number(order.total).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/products"
            className="inline-block px-6 py-3 bg-accent text-white font-semibold rounded-2xl hover:brightness-110 transition-all focus:outline-none focus:ring-2 focus:ring-accent"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </section>
  );
}
