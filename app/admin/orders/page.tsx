"use client";

import { useEffect, useState, useCallback, Fragment } from "react";
import { ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import clsx from "clsx";
import { getAdminOrders } from "@/lib/actions/admin";
import { updateOrderTracking } from "@/lib/actions/orders";

interface Order {
  id: string;
  rawId: number;
  customer: string;
  store: string;
  total: number;
  status: string;
  payment: string;
  paymentType: string;
  date: string;
  courier_name: string | null;
  tracking_status: string | null;
}

const statusBadge = (s: string) => {
  const m: Record<string, string> = {
    Delivered: "text-green-400 bg-green-400/10",
    Shipped: "text-blue-400 bg-blue-400/10",
    Processing: "text-accent bg-accent/10",
    Pending: "text-accent bg-accent/10",
    Cancelled: "text-red-400 bg-red-400/10",
    Paid: "text-green-400 bg-green-400/10",
    Failed: "text-red-400 bg-red-400/10",
  };
  return m[s] ?? "text-text bg-white/10";
};

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [updating, setUpdating] = useState<Record<string, boolean>>({});

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const res = await getAdminOrders();
    if (!("error" in res)) setOrders(res.orders);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const toggleExpand = (rawId: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(rawId)) next.delete(rawId);
      else next.add(rawId);
      return next;
    });
  };

  const handleUpdate = async (o: Order, field: string, value: string | null) => {
    const key = `${o.rawId}-${field}`;
    setUpdating((prev) => ({ ...prev, [key]: true }));

    const payload: Record<string, string | null> = {};
    if (field === "status") {
      payload.status = value ?? "pending";
    } else {
      payload[field] = value;
    }

    const res = await updateOrderTracking(String(o.rawId), payload);
    if ("success" in res) {
      await fetchOrders();
    }
    setUpdating((prev) => ({ ...prev, [key]: false }));
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
      <h2 className="text-xl font-bold text-text">Manage Orders</h2>
      <div className="neu-flat overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-text/50 font-medium px-4 py-3 w-8"></th>
                <th className="text-left text-text/50 font-medium px-4 py-3">Order</th>
                <th className="text-left text-text/50 font-medium px-4 py-3">Customer</th>
                <th className="text-left text-text/50 font-medium px-4 py-3">Total</th>
                <th className="text-left text-text/50 font-medium px-4 py-3">Payment</th>
                <th className="text-left text-text/50 font-medium px-4 py-3">Status</th>
                <th className="text-left text-text/50 font-medium px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <Fragment key={o.rawId}>
                  <tr className="border-b border-white/5 hover:bg-white/5 cursor-pointer" onClick={() => toggleExpand(o.rawId)}>
                    <td className="px-4 py-3">
                      {expanded.has(o.rawId) ? <ChevronUp size={14} className="text-text/30" /> : <ChevronDown size={14} className="text-text/30" />}
                    </td>
                    <td className="px-4 py-3 text-text font-medium">{o.id}</td>
                    <td className="px-4 py-3 text-text/70">{o.customer}</td>
                    <td className="px-4 py-3 text-text">৳{o.total}</td>
                    <td className="px-4 py-3">
                      <span className={clsx("text-xs font-semibold px-2 py-0.5 rounded-lg", statusBadge(o.payment))}>
                        {o.payment}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={clsx("text-xs font-semibold px-2 py-0.5 rounded-lg", statusBadge(o.status))}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text/50">{o.date}</td>
                  </tr>
                  {expanded.has(o.rawId) && (
                    <tr className="bg-white/5">
                      <td colSpan={7} className="px-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {/* Status update */}
                          <div>
                            <label className="text-xs text-text/50 font-medium mb-1 block">Order Status</label>
                            <div className="flex items-center gap-2">
                              <select
                                defaultValue={o.status.toLowerCase() === "processing" ? "confirmed" : o.status.toLowerCase()}
                                className="bg-surface text-text text-xs rounded-xl px-3 py-2 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
                                onChange={(e) => handleUpdate(o, "status", e.target.value)}
                                disabled={updating[`${o.rawId}-status`]}
                              >
                                {statusOptions.map((opt) => (
                                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                              </select>
                              {updating[`${o.rawId}-status`] && <RefreshCw size={14} className="animate-spin text-text/30 flex-shrink-0" />}
                            </div>
                          </div>

                          {/* Courier name */}
                          <div>
                            <label className="text-xs text-text/50 font-medium mb-1 block">Courier</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                defaultValue={o.courier_name ?? ""}
                                placeholder="e.g. Sundarban, SA Paribahan"
                                className="bg-surface text-text text-xs rounded-xl px-3 py-2 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
                                onBlur={(e) => {
                                  const val = e.target.value.trim() || null;
                                  if (val !== o.courier_name) handleUpdate(o, "courier_name", val);
                                }}
                              />
                            </div>
                          </div>

                          {/* Tracking status */}
                          <div>
                            <label className="text-xs text-text/50 font-medium mb-1 block">Tracking Status</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                defaultValue={o.tracking_status ?? ""}
                                placeholder="e.g. In transit, Out for delivery"
                                className="bg-surface text-text text-xs rounded-xl px-3 py-2 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
                                onBlur={(e) => {
                                  const val = e.target.value.trim() || null;
                                  if (val !== o.tracking_status) handleUpdate(o, "tracking_status", val);
                                }}
                              />
                            </div>
                          </div>

                          {/* Quick save indicator */}
                          <div className="flex items-end pb-2">
                            <span className="text-xs text-text/30">Updates reflect live on the tracking page</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
