"use client";

import { useState, useEffect, Fragment } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Trash2, Edit3, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import clsx from "clsx";
import {
  getSellerStore,
  getSellerProducts,
  deleteProduct,
  getSellerOrders,
  getSellerEarnings,
  createCashoutRequest,
  getCashoutRequests,
} from "@/lib/actions/seller";
import { updateOrderTracking } from "@/lib/actions/orders";
import type {
  SellerProductData,
  SellerOrderData,
  EarningsRow,
  CashoutRow,
} from "@/lib/actions/seller";

type Tab = "overview" | "products" | "orders" | "earnings" | "cashout";

const statusBadge = (s: string) => {
  const m: Record<string, string> = {
    processing: "text-accent bg-accent/10",
    shipped: "text-blue-400 bg-blue-400/10",
    delivered: "text-green-400 bg-green-400/10",
    paid: "text-green-400 bg-green-400/10",
    pending: "text-accent bg-accent/10",
    approved: "text-green-400 bg-green-400/10",
    rejected: "text-red-400 bg-red-400/10",
  };
  return m[s.toLowerCase()] ?? "text-text bg-white/10";
};

export default function SellDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const [storeName, setStoreName] = useState("");
  const [storeInitial, setStoreInitial] = useState("M");
  const [storeStatus, setStoreStatus] = useState("");

  const [products, setProducts] = useState<SellerProductData[]>([]);
  const [orders, setOrders] = useState<SellerOrderData[]>([]);
  const [earnings, setEarnings] = useState<EarningsRow[]>([]);
  const [earningsStats, setEarningsStats] = useState({ totalSales: 0, totalOrders: 0, availableBalance: 0 });
  const [cashouts, setCashouts] = useState<CashoutRow[]>([]);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [updatingOrder, setUpdatingOrder] = useState<Record<string, boolean>>({});
  const [dashboardLoading, setDashboardLoading] = useState(true);

  const loadAll = async () => {
    const storeRes = await getSellerStore();
    if (storeRes.found) {
      setStoreName(storeRes.store.name);
      setStoreInitial(storeRes.store.name.charAt(0).toUpperCase());
      setStoreStatus(storeRes.store.status);
    }

    const prodRes = await getSellerProducts();
    if ("products" in prodRes) setProducts(prodRes.products);

    const ordRes = await getSellerOrders();
    if ("orders" in ordRes) setOrders(ordRes.orders);

    const earnRes = await getSellerEarnings();
    if ("stats" in earnRes) {
      setEarningsStats(earnRes.stats);
      setEarnings(earnRes.earnings);
    }

    const cashRes = await getCashoutRequests();
    if ("cashouts" in cashRes) setCashouts(cashRes.cashouts);

    setDashboardLoading(false);
  };

  useEffect(() => { loadAll(); }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this product?")) return;
    const res = await deleteProduct(id);
    if ("success" in res) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleCashout = async () => {
    if (earningsStats.availableBalance <= 0) return;
    const res = await createCashoutRequest(earningsStats.availableBalance);
    if ("success" in res) {
      setEarningsStats((s) => ({ ...s, availableBalance: 0 }));
      await loadAll();
    }
  };

  if (dashboardLoading) {
    return (
      <section className="py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="neu-flat p-12 max-w-md mx-auto animate-pulse">
            <div className="h-6 w-2/3 mx-auto rounded bg-text/5 mb-4" />
            <div className="h-4 w-1/2 mx-auto rounded bg-text/5" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="neu-flat p-5 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              {storeInitial}
            </div>
            <div>
              <h1 className="text-lg font-bold text-text">{storeName}</h1>
              <span className={clsx("text-xs font-semibold", statusBadge(storeStatus))}>
                {storeStatus.charAt(0).toUpperCase() + storeStatus.slice(1)}
              </span>
            </div>
          </div>
        </div>

        {storeStatus === "pending" && (
          <div className="neu-flat p-4 mb-6 border-l-4 border-accent bg-accent/5">
            <p className="text-sm text-text font-medium">
              Your seller account is pending admin approval. You can set up your store, but products won&apos;t go live until approved.
            </p>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/5">
            <div className="neu-flat p-3 space-y-1">
              {([
                { key: "overview" as Tab, label: "Overview" },
                { key: "products" as Tab, label: "My Products" },
                { key: "orders" as Tab, label: "Orders" },
                { key: "earnings" as Tab, label: "Sales / Earnings" },
                { key: "cashout" as Tab, label: "Cashout Request" },
              ]).map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={clsx(
                    "w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-accent",
                    activeTab === t.key
                      ? "bg-accent text-white"
                      : "text-text hover:bg-white/5",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="lg:w-4/5">
            <div className="neu-flat p-4 mb-6 flex items-center justify-between">
              <p className="text-sm text-text/60">
                Add and manage products on the seller dashboard.
              </p>
              <button
                onClick={() => router.push("/seller/add-product")}
                className="px-4 py-2 bg-accent text-white text-sm font-semibold rounded-xl hover:brightness-110 transition-all focus:outline-none focus:ring-2 focus:ring-accent"
              >
                Add Product
              </button>
            </div>
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="neu-flat p-6">
                  <h2 className="text-xl font-bold text-text mb-5">Overview</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="neu-pressed bg-surface p-5 text-center">
                      <p className="text-xs text-text/50 mb-1">Total Sales</p>
                      <p className="text-xl font-bold text-accent">
                        ৳{earningsStats.totalSales.toLocaleString()}
                      </p>
                    </div>
                    <div className="neu-pressed bg-surface p-5 text-center">
                      <p className="text-xs text-text/50 mb-1">Total Orders</p>
                      <p className="text-xl font-bold text-text">
                        {earningsStats.totalOrders}
                      </p>
                    </div>
                    <div className="neu-pressed bg-surface p-5 text-center">
                      <p className="text-xs text-text/50 mb-1">Available Balance</p>
                      <p className="text-xl font-bold text-accent">
                        ৳{earningsStats.availableBalance.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="neu-flat p-6">
                  <p className="text-xs text-text/40 text-center py-4">
                    Recent activity will appear here.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "products" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-text">
                    My Products ({products.length})
                  </h2>
                  <button
                    onClick={() => router.push("/seller/add-product")}
                    className="px-4 py-2 bg-accent text-white text-sm font-semibold rounded-xl hover:brightness-110 transition-all focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    Add New
                  </button>
                </div>
                {products.length === 0 ? (
                  <div className="neu-flat p-8 text-center">
                    <p className="text-sm text-text/50">No products yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {products.map((p) => (
                      <div key={p.id} className="neu-flat p-4 flex gap-4">
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                          <Image src={p.image} alt={p.name} fill className="object-cover" sizes="64px" unoptimized />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-text truncate">{p.name}</p>
                          <p className="text-xs text-text/50">৳{p.price} · Stock: {p.stock}</p>
                          <p className="text-xs text-text/40">{p.category}{p.season ? ` · ${p.season}` : ""}</p>
                          <span className={clsx("text-[10px] font-semibold px-1.5 py-0.5 rounded", statusBadge(p.status))}>
                            {p.status}
                          </span>
                        </div>
                        <div className="flex flex-col gap-2">
                          <button onClick={() => router.push(`/seller/add-product?id=${p.id}`)} className="neu-flat p-1.5 text-text hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent rounded-xl" aria-label="Edit">
                            <Edit3 size={14} />
                          </button>
                          <button onClick={() => handleDelete(p.id)} className="neu-flat p-1.5 text-red-400 hover:bg-red-400/10 focus:outline-none focus:ring-2 focus:ring-red-400 rounded-xl" aria-label="Delete">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "orders" && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-text mb-4">Orders</h2>
                {orders.length === 0 ? (
                  <div className="neu-flat p-8 text-center">
                    <p className="text-sm text-text/50">No orders yet.</p>
                  </div>
                ) : (
                  <div className="neu-flat overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-white/5">
                            <th className="text-left text-text/50 font-medium px-4 py-3 w-8"></th>
                            <th className="text-left text-text/50 font-medium px-4 py-3">Product</th>
                            <th className="text-left text-text/50 font-medium px-4 py-3">Customer</th>
                            <th className="text-left text-text/50 font-medium px-4 py-3">Amount</th>
                            <th className="text-left text-text/50 font-medium px-4 py-3">Status</th>
                            <th className="text-left text-text/50 font-medium px-4 py-3">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map((o) => (
                            <Fragment key={o.id}>
                              <tr className="border-b border-white/5 hover:bg-white/5 cursor-pointer" onClick={() => {
                                setExpandedOrders((prev) => {
                                  const next = new Set(prev);
                                  if (next.has(o.id)) next.delete(o.id);
                                  else next.add(o.id);
                                  return next;
                                });
                              }}>
                                <td className="px-4 py-3">
                                  {expandedOrders.has(o.id) ? <ChevronUp size={14} className="text-text/30" /> : <ChevronDown size={14} className="text-text/30" />}
                                </td>
                                <td className="px-4 py-3 text-text">{o.product_name}</td>
                                <td className="px-4 py-3 text-text/70">{o.customer_name}</td>
                                <td className="px-4 py-3 text-text">৳{o.amount}</td>
                                <td className="px-4 py-3">
                                  <span className={clsx("text-xs font-semibold px-2 py-0.5 rounded-lg capitalize", statusBadge(o.status))}>
                                    {o.status}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-text/50">{o.date}</td>
                              </tr>
                              {expandedOrders.has(o.id) && (
                                <tr className="bg-white/5">
                                  <td colSpan={6} className="px-6 py-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      <div>
                                        <label className="text-xs text-text/50 font-medium mb-1 block">Courier</label>
                                        <input
                                          type="text"
                                          defaultValue={o.courier_name ?? ""}
                                          placeholder="e.g. Sundarban, SA Paribahan"
                                          className="bg-surface text-text text-xs rounded-xl px-3 py-2 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
                                          onBlur={async (e) => {
                                            const val = e.target.value.trim() || null;
                                            if (val === o.courier_name) return;
                                            const key = `${o.id}-courier`;
                                            setUpdatingOrder((p) => ({ ...p, [key]: true }));
                                            await updateOrderTracking(String(o.order_id), { courier_name: val });
                                            setUpdatingOrder((p) => ({ ...p, [key]: false }));
                                            loadAll();
                                          }}
                                        />
                                      </div>
                                      <div>
                                        <label className="text-xs text-text/50 font-medium mb-1 block">Tracking Status</label>
                                        <div className="flex items-center gap-2">
                                          <input
                                            type="text"
                                            defaultValue={o.tracking_status ?? ""}
                                            placeholder="e.g. In transit, Out for delivery"
                                            className="bg-surface text-text text-xs rounded-xl px-3 py-2 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
                                            onBlur={async (e) => {
                                              const val = e.target.value.trim() || null;
                                              if (val === o.tracking_status) return;
                                              const key = `${o.id}-tracking`;
                                              setUpdatingOrder((p) => ({ ...p, [key]: true }));
                                              await updateOrderTracking(String(o.order_id), { tracking_status: val });
                                              setUpdatingOrder((p) => ({ ...p, [key]: false }));
                                              loadAll();
                                            }}
                                          />
                                          {updatingOrder[`${o.id}-tracking`] && <RefreshCw size={14} className="animate-spin text-text/30 flex-shrink-0" />}
                                        </div>
                                      </div>
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
                )}
              </div>
            )}

            {activeTab === "earnings" && (
              <div className="space-y-6">
                <div className="neu-flat p-6">
                  <h2 className="text-xl font-bold text-text mb-4">Sales &amp; Earnings</h2>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {[
                      { label: "Total Sales", value: `৳${earningsStats.totalSales.toLocaleString()}` },
                      { label: "Commission", value: `৳${(earningsStats.totalSales - earningsStats.availableBalance).toLocaleString()}` },
                      { label: "Net Earnings", value: `৳${earningsStats.availableBalance.toLocaleString()}`, color: true },
                    ].map((s) => (
                      <div key={s.label} className="text-center">
                        <p className="text-xs text-text/50">{s.label}</p>
                        <p className={clsx("text-lg font-bold", s.color ? "text-accent" : "text-text")}>{s.value}</p>
                      </div>
                    ))}
                  </div>

                  {earnings.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-white/5">
                            <th className="text-left text-text/50 font-medium px-3 py-2">Order</th>
                            <th className="text-left text-text/50 font-medium px-3 py-2">Product</th>
                            <th className="text-left text-text/50 font-medium px-3 py-2">Amount</th>
                            <th className="text-left text-text/50 font-medium px-3 py-2">Commission</th>
                            <th className="text-left text-text/50 font-medium px-3 py-2">Net</th>
                            <th className="text-left text-text/50 font-medium px-3 py-2">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {earnings.map((e) => (
                            <tr key={e.id} className="border-b border-white/5">
                              <td className="px-3 py-2 text-text/70">#{e.order_id}</td>
                              <td className="px-3 py-2 text-text">{e.product_name}</td>
                              <td className="px-3 py-2 text-text">৳{e.amount.toLocaleString()}</td>
                              <td className="px-3 py-2 text-text/50">৳{e.commission.toLocaleString()}</td>
                              <td className="px-3 py-2 text-accent font-semibold">৳{e.net.toLocaleString()}</td>
                              <td className="px-3 py-2 text-text/50">{e.date}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="neu-flat p-6 text-center">
                  <p className="text-sm text-text/60 mb-4">
                    Available Balance: <span className="text-accent font-bold">৳{earningsStats.availableBalance.toLocaleString()}</span>
                  </p>
                  <button
                    onClick={handleCashout}
                    disabled={earningsStats.availableBalance <= 0}
                    className="px-6 py-3 bg-accent text-white font-semibold rounded-2xl hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    Request Cashout
                  </button>
                </div>
              </div>
            )}

            {activeTab === "cashout" && (
              <div className="space-y-6">
                <div className="neu-flat p-6">
                  <h2 className="text-xl font-bold text-text mb-4">Cashout History</h2>
                  {cashouts.length === 0 ? (
                    <p className="text-sm text-text/50 text-center py-4">No cashout requests yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-white/5">
                            <th className="text-left text-text/50 font-medium px-3 py-2">Amount</th>
                            <th className="text-left text-text/50 font-medium px-3 py-2">Method</th>
                            <th className="text-left text-text/50 font-medium px-3 py-2">Status</th>
                            <th className="text-left text-text/50 font-medium px-3 py-2">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cashouts.map((c) => (
                            <tr key={c.id} className="border-b border-white/5">
                              <td className="px-3 py-2 text-text font-semibold">৳{c.amount.toLocaleString()}</td>
                              <td className="px-3 py-2 text-text/70">{c.method}</td>
                              <td className="px-3 py-2">
                                <span className={clsx("text-xs font-semibold px-2 py-0.5 rounded-lg capitalize", statusBadge(c.status))}>
                                  {c.status}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-text/50">{c.date}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
