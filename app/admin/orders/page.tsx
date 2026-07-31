"use client";

import { useEffect, useState, useCallback } from "react";
import { ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import clsx from "clsx";
import {
  getAdminOrders, getOrderDetail, updateOrderStatus,
} from "@/lib/actions/admin";
import type { AdminOrder, AdminOrderItem } from "@/lib/actions/admin";

const statusBadge = (s: string) => {
  const m: Record<string, string> = {
    delivered: "text-green-400 bg-green-400/10",
    shipped: "text-blue-400 bg-blue-400/10",
    processing: "text-[#FE7F2D] bg-[#FE7F2D]/10",
    pending: "text-[#FE7F2D] bg-[#FE7F2D]/10",
    cancelled: "text-red-400 bg-red-400/10",
    paid: "text-green-400 bg-green-400/10",
    failed: "text-red-400 bg-red-400/10",
  };
  return m[s.toLowerCase()] ?? "text-[#FAFFC4] bg-white/10";
};

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [details, setDetails] = useState<Record<string, { shipping: string; payment_method: string; notes: string | null; items: AdminOrderItem[] }>>({});
  const [loadingDetail, setLoadingDetail] = useState<Set<string>>(new Set());

  const fetch = useCallback(async () => {
    setLoading(true);
    const res = await getAdminOrders();
    if ("error" in res) setError(res.error);
    else setOrders(res.orders);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const toggleExpand = async (orderId: string) => {
    const next = new Set(expanded);
    if (next.has(orderId)) {
      next.delete(orderId);
    } else {
      next.add(orderId);
      if (!details[orderId]) {
        setLoadingDetail((prev) => new Set(prev).add(orderId));
        const res = await getOrderDetail(orderId);
        if ("order" in res) {
          setDetails((prev) => ({
            ...prev,
            [orderId]: {
              shipping: res.order.shipping,
              payment_method: res.order.payment_method,
              notes: res.order.notes,
              items: res.order.items,
            },
          }));
        }
        setLoadingDetail((prev) => {
          const next2 = new Set(prev);
          next2.delete(orderId);
          return next2;
        });
      }
    }
    setExpanded(next);
  };

  const handleStatusUpdate = async (orderId: string, status: string) => {
    await updateOrderStatus(orderId, status);
    fetch();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <RefreshCw size={24} className="animate-spin text-[#FAFFC4]/30" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-[#FAFFC4]">Manage Orders ({orders.length})</h2>
      <div className="neu-flat overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-[#FAFFC4]/50 font-medium px-4 py-3 w-8"></th>
                <th className="text-left text-[#FAFFC4]/50 font-medium px-4 py-3">Order #</th>
                <th className="text-left text-[#FAFFC4]/50 font-medium px-4 py-3">Customer</th>
                <th className="text-left text-[#FAFFC4]/50 font-medium px-4 py-3">Total</th>
                <th className="text-left text-[#FAFFC4]/50 font-medium px-4 py-3">Payment</th>
                <th className="text-left text-[#FAFFC4]/50 font-medium px-4 py-3">Status</th>
                <th className="text-left text-[#FAFFC4]/50 font-medium px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <>
                  <tr key={o.id} className="border-b border-white/5 hover:bg-white/5 cursor-pointer" onClick={() => toggleExpand(o.id)}>
                    <td className="px-4 py-3">
                      {expanded.has(o.id) ? <ChevronUp size={14} className="text-[#FAFFC4]/30" /> : <ChevronDown size={14} className="text-[#FAFFC4]/30" />}
                    </td>
                    <td className="px-4 py-3 text-[#FAFFC4] font-medium">{o.order_number}</td>
                    <td className="px-4 py-3 text-[#FAFFC4]/70">{o.customer_name}</td>
                    <td className="px-4 py-3 text-[#FAFFC4]">৳{o.total}</td>
                    <td className="px-4 py-3">
                      <span className={clsx("text-xs font-semibold px-2 py-0.5 rounded-lg", statusBadge(o.payment_status))}>
                        {o.payment_status.charAt(0).toUpperCase() + o.payment_status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={clsx("text-xs font-semibold px-2 py-0.5 rounded-lg", statusBadge(o.order_status))}>
                        {o.order_status.charAt(0).toUpperCase() + o.order_status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#FAFFC4]/50">{o.created_at}</td>
                  </tr>
                  {expanded.has(o.id) && (
                    <tr key={`${o.id}-detail`} className="bg-white/5">
                      <td colSpan={7} className="px-6 py-4">
                        {loadingDetail.has(o.id) ? (
                          <div className="flex items-center justify-center py-4">
                            <RefreshCw size={16} className="animate-spin text-[#FAFFC4]/30" />
                          </div>
                        ) : details[o.id] ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="text-xs text-[#FAFFC4]/50 font-medium block mb-1">Shipping</label>
                                <p className="text-xs text-[#FAFFC4]/70">{details[o.id].shipping}</p>
                              </div>
                              <div>
                                <label className="text-xs text-[#FAFFC4]/50 font-medium block mb-1">Payment Method</label>
                                <p className="text-xs text-[#FAFFC4]/70">{details[o.id].payment_method}</p>
                              </div>
                              <div>
                                <label className="text-xs text-[#FAFFC4]/50 font-medium block mb-1">Order Status</label>
                                <select
                                  defaultValue={o.order_status}
                                  className="bg-surface text-[#FAFFC4] text-xs rounded-xl px-3 py-2 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                  onChange={(e) => handleStatusUpdate(o.id, e.target.value)}
                                >
                                  {statusOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            {details[o.id].notes && (
                              <div>
                                <label className="text-xs text-[#FAFFC4]/50 font-medium block mb-1">Notes</label>
                                <p className="text-xs text-[#FAFFC4]/70">{details[o.id].notes}</p>
                              </div>
                            )}

                            <div>
                              <label className="text-xs text-[#FAFFC4]/50 font-medium block mb-2">Line Items</label>
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className="border-b border-white/10">
                                    <th className="text-left text-[#FAFFC4]/40 font-medium px-2 py-1">Product</th>
                                    <th className="text-right text-[#FAFFC4]/40 font-medium px-2 py-1">Qty</th>
                                    <th className="text-right text-[#FAFFC4]/40 font-medium px-2 py-1">Unit Price</th>
                                    <th className="text-right text-[#FAFFC4]/40 font-medium px-2 py-1">Total</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {details[o.id].items.map((item, i) => (
                                    <tr key={i} className="border-b border-white/5">
                                      <td className="px-2 py-1.5 text-[#FAFFC4]">{item.product_name}</td>
                                      <td className="px-2 py-1.5 text-[#FAFFC4]/70 text-right">{item.quantity}</td>
                                      <td className="px-2 py-1.5 text-[#FAFFC4]/70 text-right">৳{item.unit_price}</td>
                                      <td className="px-2 py-1.5 text-[#FAFFC4] text-right">৳{item.line_total}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ) : null}
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
