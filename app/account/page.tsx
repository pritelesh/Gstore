"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, MapPin, Package, LogOut, Edit3, Plus, Store, ExternalLink } from "lucide-react";
import clsx from "clsx";
import { createClient } from "@/lib/supabase/client";
import { signOut, upgradeToSeller } from "@/lib/actions/auth";

type Tab = "profile" | "orders" | "addresses" | "seller";

const mockOrders = [
  { id: "#ORD-001", date: "2026-07-20", status: "Delivered", total: 2499, items: 2 },
  { id: "#ORD-002", date: "2026-07-18", status: "Shipped", total: 1899, items: 1 },
  { id: "#ORD-003", date: "2026-07-15", status: "Processing", total: 3299, items: 3 },
  { id: "#ORD-004", date: "2026-07-10", status: "Cancelled", total: 899, items: 1 },
];

const mockAddresses = [
  { id: "a1", label: "Home", street: "123 Main Street, Apt 4B", city: "Dhaka", area: "Gulshan", phone: "01712345678" },
  { id: "a2", label: "Office", street: "45 Business Tower, Floor 7", city: "Dhaka", area: "Banani", phone: "01798765432" },
];

const statusBadge = (s: string) => {
  const m: Record<string, string> = {
    delivered: "text-green-400 bg-green-400/10",
    shipped: "text-blue-400 bg-blue-400/10",
    processing: "text-accent bg-accent/10",
    cancelled: "text-red-400 bg-red-400/10",
  };
  return m[s.toLowerCase()] ?? "text-text bg-white/10";
};

export default function AccountPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [initial, setInitial] = useState("?");
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [sellerStoreName, setSellerStoreName] = useState("");
  const [sellerDesc, setSellerDesc] = useState("");
  const [sellerError, setSellerError] = useState("");
  const [sellerSubmitting, setSellerSubmitting] = useState(false);
  const [sellerDone, setSellerDone] = useState(false);

  useEffect(() => {
    const initUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email ?? "");
      const nameFromMeta = user.user_metadata?.full_name as string ?? "";
      setName(nameFromMeta);
      setInitial(nameFromMeta.charAt(0).toUpperCase() || (user.email?.charAt(0).toUpperCase() ?? "?"));
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, phone, role")
        .eq("id", user.id)
        .single();
      if (profile) {
        setName(profile.full_name);
        setPhone(profile.phone ?? "");
        setInitial(profile.full_name.charAt(0).toUpperCase());
        if (profile.role) setRole(profile.role);
      }
      setLoading(false);
    };
    initUser();
  }, []);

  const handleUpgrade = async () => {
    setSellerError("");
    if (!sellerStoreName) { setSellerError("Store name is required."); return; }
    setSellerSubmitting(true);
    const res = await upgradeToSeller({ storeName: sellerStoreName, storeDescription: sellerDesc || undefined });
    if (res.type === "error") { setSellerError(res.error); setSellerSubmitting(false); return; }
    setSellerSubmitting(false);
    setSellerDone(true);
    setRole("seller");
  };

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  const inputClass =
    "w-full neu-pressed bg-surface text-text text-sm rounded-xl px-4 py-2.5 placeholder-text/40 focus:outline-none focus:ring-2 focus:ring-accent transition-all";

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="neu-flat p-5 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              {loading ? "?" : initial}
            </div>
            <div>
              <h1 className="text-lg font-bold text-text">My Account</h1>
              <p className="text-xs text-text/50">{loading ? "Loading…" : email}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/5">
            <div className="neu-flat p-3 space-y-1">
              {([
                { key: "profile" as Tab, label: "Profile", icon: User },
                { key: "orders" as Tab, label: "Order History", icon: Package },
                { key: "addresses" as Tab, label: "Addresses", icon: MapPin },
                ...(role === "seller"
                  ? [{ key: "seller" as Tab, label: "Seller Dashboard", icon: ExternalLink }]
                  : [{ key: "seller" as Tab, label: "Become a Seller", icon: Store }]
                ),
              ]).map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.key}
                    onClick={() => {
                      if (role === "seller" && t.key === "seller") {
                        router.push("/sell/dashboard");
                      } else {
                        setActiveTab(t.key);
                      }
                    }}
                    className={clsx(
                      "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-accent",
                      activeTab === t.key
                        ? "bg-accent text-white"
                        : "text-text hover:bg-white/5"
                    )}
                  >
                    <Icon size={18} />
                    {t.label}
                  </button>
                );
              })}
              <hr className="border-white/5 my-2" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-400/10 transition-all focus:outline-none focus:ring-2 focus:ring-red-400"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>

          <div className="lg:w-4/5">
            {activeTab === "profile" && (
              <div className="neu-flat p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-text">Profile Information</h2>
                  <button
                    onClick={() => setEditing(!editing)}
                    className="neu-flat p-2 text-text hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent rounded-xl transition-colors"
                    aria-label="Edit profile"
                  >
                    <Edit3 size={16} />
                  </button>
                </div>

                {editing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-text/70 mb-1 block">Full Name</label>
                      <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className="text-sm text-text/70 mb-1 block">Email</label>
                      <input type="email" value={email} disabled className={inputClass + " opacity-50 cursor-not-allowed"} />
                    </div>
                    <div>
                      <label className="text-sm text-text/70 mb-1 block">Phone</label>
                      <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setEditing(false)}
                        className="px-6 py-2.5 bg-accent text-white font-semibold rounded-2xl hover:brightness-110 transition-all focus:outline-none focus:ring-2 focus:ring-accent"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditing(false)}
                        className="px-6 py-2.5 border-2 border-text/20 text-text font-semibold rounded-2xl hover:bg-white/5 transition-all focus:outline-none focus:ring-2 focus:ring-accent"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-8">
                      <div>
                        <p className="text-xs text-text/50">Full Name</p>
                        <p className="text-sm font-medium text-text mt-0.5">{name || "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-text/50">Email</p>
                        <p className="text-sm font-medium text-text mt-0.5">{email || "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-text/50">Phone</p>
                        <p className="text-sm font-medium text-text mt-0.5">{phone || "—"}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "orders" && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-text mb-4">Order History</h2>
                {mockOrders.length === 0 ? (
                  <div className="neu-flat p-8 text-center">
                    <Package size={40} className="mx-auto mb-3 text-text/20" />
                    <p className="text-sm text-text/50">No orders yet.</p>
                  </div>
                ) : (
                  <div className="neu-flat overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-white/5">
                            <th className="text-left text-text/50 font-medium px-4 py-3">Order</th>
                            <th className="text-left text-text/50 font-medium px-4 py-3">Date</th>
                            <th className="text-left text-text/50 font-medium px-4 py-3">Items</th>
                            <th className="text-left text-text/50 font-medium px-4 py-3">Total</th>
                            <th className="text-left text-text/50 font-medium px-4 py-3">Status</th>
                            <th className="text-left text-text/50 font-medium px-4 py-3"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {mockOrders.map((o) => (
                            <tr key={o.id} className="border-b border-white/5 hover:bg-white/5">
                              <td className="px-4 py-3 text-text font-medium">{o.id}</td>
                              <td className="px-4 py-3 text-text/70">{o.date}</td>
                              <td className="px-4 py-3 text-text/70">{o.items}</td>
                              <td className="px-4 py-3 text-text">৳{o.total.toLocaleString()}</td>
                              <td className="px-4 py-3">
                                <span className={clsx("text-xs font-semibold px-2 py-0.5 rounded-lg", statusBadge(o.status))}>
                                  {o.status}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <Link
                                  href="/track-order"
                                  className="text-xs text-accent font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-accent rounded"
                                >
                                  Track
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "addresses" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-text">Saved Addresses</h2>
                  <button className="neu-flat p-2 text-text hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent rounded-xl transition-colors" aria-label="Add address">
                    <Plus size={16} />
                  </button>
                </div>
                {mockAddresses.length === 0 ? (
                  <div className="neu-flat p-8 text-center">
                    <MapPin size={40} className="mx-auto mb-3 text-text/20" />
                    <p className="text-sm text-text/50">No saved addresses.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {mockAddresses.map((a) => (
                      <div key={a.id} className="neu-flat p-5">
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-xs font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded-lg">
                            {a.label}
                          </span>
                          <button className="text-text/30 hover:text-text focus:outline-none focus:ring-2 focus:ring-accent rounded" aria-label="Edit address">
                            <Edit3 size={14} />
                          </button>
                        </div>
                        <p className="text-sm text-text">{a.street}</p>
                        <p className="text-xs text-text/50">{a.area}, {a.city}</p>
                        <p className="text-xs text-text/50 mt-1">{a.phone}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "seller" && role !== "seller" && (
              <div className="neu-flat p-6">
                {sellerDone ? (
                  <div className="text-center py-6">
                    <Store size={40} className="mx-auto mb-3 text-accent" />
                    <h2 className="text-xl font-bold text-text mb-2">Store Created!</h2>
                    <p className="text-sm text-text/60 mb-6">Your store has been registered. You can now manage it from the seller dashboard.</p>
                    <Link
                      href="/sell/dashboard"
                      className="inline-block px-6 py-3 bg-accent text-white font-semibold rounded-2xl hover:brightness-110 transition-all focus:outline-none focus:ring-2 focus:ring-accent"
                    >
                      Go to Dashboard
                    </Link>
                  </div>
                ) : (
                  <>
                    <h2 className="text-xl font-bold text-text mb-2">Become a Seller</h2>
                    <p className="text-sm text-text/60 mb-6">Create your store and start selling on KGStore.</p>
                    <div className="space-y-4 max-w-md">
                      <div>
                        <label className="text-sm text-text/70 mb-1 block">Store Name *</label>
                        <input
                          type="text" value={sellerStoreName}
                          onChange={(e) => setSellerStoreName(e.target.value)}
                          className={inputClass} placeholder="Your store name"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-text/70 mb-1 block">Store Description</label>
                        <textarea
                          value={sellerDesc}
                          onChange={(e) => setSellerDesc(e.target.value)}
                          className={`${inputClass} resize-none h-20`} placeholder="Briefly describe what you sell"
                        />
                      </div>
                      {sellerError && (
                        <p className="text-xs text-red-400 bg-red-400/10 rounded-lg px-3 py-2">{sellerError}</p>
                      )}
                      <button
                        onClick={handleUpgrade}
                        disabled={sellerSubmitting}
                        className="px-6 py-3 bg-accent text-white font-semibold rounded-2xl hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-accent"
                      >
                        {sellerSubmitting ? "Creating…" : "Create Your Store"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
