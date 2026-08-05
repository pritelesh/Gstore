"use client";

import { useEffect, useState, useCallback } from "react";
import { RefreshCw, Eye, Package, Search, X } from "lucide-react";
import { getSellerOrders, getOrderDetails, updateOrderStatus } from "@/lib/actions/seller";

const statusColors: Record<string, string> = {
  pending: "text-yellow-400 bg-yellow-400/10",
  processing: "text-blue-400 bg-blue-400/10",
  shipped: "text-purple-400 bg-purple-400/10",
  delivered: "text-green-400 bg-green-400/10",
  cancelled: "text-red-400 bg-red-400/10",
};

const nextStatus: Record<string, string[]> = {
  pending: ["processing"],
  processing: ["shipped"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<{ id: string; order_id: string; product_name: string; amount: number; status: string; date: string; customer_name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<{
    id: string; total: number; status: string; customer_name: string; customer_phone: string; shipping_address: string;
    payment_method: string; created_at: string; items: { product_name: string; quantity: number; price: number }[];
  } | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError("");
    const res = await getSellerOrders();
    if ("error" in res) { setError(res.error); setLoading(false); return; }
    setOrders(res.orders.map(o => ({ ...o, customer_name: o.customer_name ?? "—" })));
    setLoading(false);
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const filtered = orders.filter(o => {
    if (search && !o.product_name.toLowerCase().includes(search.toLowerCase()) && !String(o.order_id).includes(search)) return false;
    if (statusFilter && o.status !== statusFilter) return false;
    return true;
  });

  const handleViewDetail = async (orderId: string) => {
    setDetailLoading(true);
    const res = await getOrderDetails(orderId);
    if ("error" in res) { setError(res.error); setDetailLoading(false); return; }
    setSelectedOrder(res.order);
    setDetailLoading(false);
  };

  const handleStatusUpdate = async (orderId: string, status: string) => {
    setActionLoading(orderId);
    const res = await updateOrderStatus(orderId, status);
    if ("error" in res) { setError(res.error); setActionLoading(null); return; }
    setOrders(prev => prev.map(o => o.order_id === orderId ? { ...o, status } : o));
    setSelectedOrder(prev => prev && prev.id === orderId ? { ...prev, status } : prev);
    setActionLoading(null);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full p-8"><RefreshCw size={24} className="animate-spin text-[#FAFFC4]/30" /></div>;
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="max-w-2xl mx-auto mt-16 p-6 rounded-2xl bg-red-500/20 border border-red-500/40">
          <h2 className="text-lg font-bold text-red-300 mb-2">Error Loading Orders</h2>
          <p className="text-[#FAFFC4]/80 text-sm font-mono break-all">{error}</p>
          <button onClick={fetchOrders} className="mt-4 px-4 py-2 rounded-xl bg-[#FE7F2D] text-white text-sm font-medium hover:bg-[#e66e1f]">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-[#FAFFC4]">Orders</h1>
        <p className="text-[#FAFFC4]/60 mt-1">{orders.length} order{orders.length !== 1 ? "s" : ""}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#FAFFC4]/30" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#293681] text-[#FAFFC4] placeholder-[#FAFFC4]/40 border border-[#FAFFC4]/20 focus:outline-none focus:border-[#FE7F2D] text-sm shadow-[inset_4px_4px_8px_#1a2354,inset_-4px_-4px_8px_#3849ae]"
          />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-[#293681] text-[#FAFFC4] border border-[#FAFFC4]/20 focus:outline-none focus:border-[#FE7F2D] text-sm shadow-[inset_4px_4px_8px_#1a2354,inset_-4px_-4px_8px_#3849ae]"
        >
          <option value="">All Statuses</option>
          {Object.keys(statusColors).map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="max-w-lg mx-auto mt-16 p-10 rounded-2xl bg-white/10 backdrop-blur-md text-center shadow-[10px_10px_20px_#1a2354,-10px_-10px_20px_#3849ae]">
          <Package size={48} className="mx-auto mb-4 text-[#FAFFC4]/20" />
          <p className="text-[#FAFFC4]/60">{orders.length === 0 ? "No orders yet." : "No orders match your filter."}</p>
        </div>
      ) : (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden shadow-[10px_10px_20px_#1a2354,-10px_-10px_20px_#3849ae]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#FAFFC4]/10">
                  <th className="text-left text-[#FAFFC4]/50 font-medium px-4 py-3">Order</th>
                  <th className="text-left text-[#FAFFC4]/50 font-medium px-4 py-3">Product</th>
                  <th className="text-left text-[#FAFFC4]/50 font-medium px-4 py-3">Total</th>
                  <th className="text-left text-[#FAFFC4]/50 font-medium px-4 py-3">Customer</th>
                  <th className="text-left text-[#FAFFC4]/50 font-medium px-4 py-3">Date</th>
                  <th className="text-left text-[#FAFFC4]/50 font-medium px-4 py-3">Status</th>
                  <th className="text-right text-[#FAFFC4]/50 font-medium px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr key={o.id} className="border-b border-[#FAFFC4]/5 hover:bg-white/5">
                    <td className="px-4 py-3 text-[#FAFFC4] font-mono">#{o.order_id}</td>
                    <td className="px-4 py-3 text-[#FAFFC4]">{o.product_name}</td>
                    <td className="px-4 py-3 text-[#FAFFC4]">৳{o.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-[#FAFFC4]/70">{o.customer_name}</td>
                    <td className="px-4 py-3 text-[#FAFFC4]/50">{o.date}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${statusColors[o.status] ?? "text-white/40 bg-white/10"}`}>
                        {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleViewDetail(o.order_id)} title="View Details"
                          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"><Eye size={16} className="text-blue-400" /></button>
                        {nextStatus[o.status]?.map(ns => (
                          <button key={ns} onClick={() => handleStatusUpdate(o.order_id, ns)} disabled={actionLoading === o.order_id}
                            className="px-2.5 py-1 rounded-lg bg-[#FE7F2D]/20 text-[#FE7F2D] text-xs font-medium hover:bg-[#FE7F2D]/30 transition-colors disabled:opacity-50"
                          >
                            {actionLoading === o.order_id ? "..." : `Mark ${ns.charAt(0).toUpperCase() + ns.slice(1)}`}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {detailLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-[#293681] rounded-2xl p-6 shadow-[20px_20px_40px_#1a2354,-20px_-20px_40px_#3849ae]">
            <RefreshCw size={24} className="animate-spin mx-auto text-[#FE7F2D]" />
          </div>
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelectedOrder(null)}>
          <div className="bg-[#293681] rounded-2xl p-6 max-w-lg w-full shadow-[20px_20px_40px_#1a2354,-20px_-20px_40px_#3849ae] max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#FAFFC4]">Order #{selectedOrder.id}</h2>
              <button onClick={() => setSelectedOrder(null)}><X size={20} className="text-[#FAFFC4]/40 hover:text-[#FAFFC4]" /></button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-[#FAFFC4]/50">Status</span><span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${statusColors[selectedOrder.status]}`}>{selectedOrder.status}</span></div>
              <div className="flex justify-between"><span className="text-[#FAFFC4]/50">Total</span><span className="text-[#FAFFC4]">৳{selectedOrder.total.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-[#FAFFC4]/50">Payment</span><span className="text-[#FAFFC4]">{selectedOrder.payment_method}</span></div>
              <div className="flex justify-between"><span className="text-[#FAFFC4]/50">Date</span><span className="text-[#FAFFC4]">{selectedOrder.created_at}</span></div>
              <div className="border-t border-[#FAFFC4]/10 pt-3">
                <p className="text-[#FAFFC4]/50 mb-1">Customer</p>
                <p className="text-[#FAFFC4]">{selectedOrder.customer_name}</p>
                <p className="text-[#FAFFC4]/60">{selectedOrder.customer_phone}</p>
              </div>
              <div className="border-t border-[#FAFFC4]/10 pt-3">
                <p className="text-[#FAFFC4]/50 mb-1">Shipping Address</p>
                <p className="text-[#FAFFC4]">{selectedOrder.shipping_address}</p>
              </div>
              <div className="border-t border-[#FAFFC4]/10 pt-3">
                <p className="text-[#FAFFC4]/50 mb-2">Items</p>
                {selectedOrder.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm py-1"><span className="text-[#FAFFC4]">{item.product_name} × {item.quantity}</span><span className="text-[#FAFFC4]">৳{(item.price * item.quantity).toLocaleString()}</span></div>
                ))}
                <div className="flex justify-between text-sm font-bold border-t border-[#FAFFC4]/10 pt-2 mt-2"><span className="text-[#FAFFC4]">Total</span><span className="text-[#FE7F2D]">৳{selectedOrder.total.toLocaleString()}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
