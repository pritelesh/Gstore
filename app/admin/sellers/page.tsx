"use client";

import { useEffect, useState, useCallback } from "react";
import { Check, X, RefreshCw, EyeOff } from "lucide-react";
import clsx from "clsx";
import {
  getAdminSellers, approveStore, rejectStore, suspendStore,
  getNameChangeRequests, approveNameChange, rejectNameChange,
} from "@/lib/actions/admin";
import type { AdminSeller, NameChangeRequest } from "@/lib/actions/admin";

const statusBadge = (s: string) => {
  const m: Record<string, string> = {
    approved: "text-green-400 bg-green-400/10",
    pending: "text-[#FE7F2D] bg-[#FE7F2D]/10",
    rejected: "text-red-400 bg-red-400/10",
  };
  return m[s.toLowerCase()] ?? "text-[#FAFFC4] bg-white/10";
};

export default function AdminSellersPage() {
  const [sellers, setSellers] = useState<AdminSeller[]>([]);
  const [nameChanges, setNameChanges] = useState<NameChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"approvals" | "all" | "namechanges">("approvals");

  const fetch = useCallback(async () => {
    setLoading(true);
    setError("");
    const [sellersRes, nameRes] = await Promise.all([
      getAdminSellers(),
      getNameChangeRequests(),
    ]);
    if ("error" in sellersRes) setError(sellersRes.error);
    else setSellers(sellersRes.sellers);
    if ("error" in nameRes) console.error(nameRes.error);
    else setNameChanges(nameRes.requests);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleApprove = async (id: string) => {
    await approveStore(id);
    fetch();
  };

  const handleReject = async (id: string) => {
    await rejectStore(id);
    fetch();
  };

  const handleSuspend = async (id: string) => {
    if (!window.confirm("Suspend this seller?")) return;
    await suspendStore(id);
    fetch();
  };

  const handleApproveName = async (id: string) => {
    await approveNameChange(id);
    fetch();
  };

  const handleRejectName = async (id: string) => {
    await rejectNameChange(id);
    fetch();
  };

  const pendingSellers = sellers.filter((s) => s.status === "pending");

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
      <div className="flex items-center gap-4 border-b border-white/10 pb-3">
        {(["approvals", "all", "namechanges"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={clsx(
              "text-sm font-medium pb-1 border-b-2 transition-colors",
              tab === t ? "text-[#FAFFC4] border-[#FE7F2D]" : "text-[#FAFFC4]/50 border-transparent hover:text-[#FAFFC4]/70"
            )}
          >
            {t === "approvals" && `Pending Approvals (${pendingSellers.length})`}
            {t === "all" && `All Sellers (${sellers.length})`}
            {t === "namechanges" && `Name Change Requests (${nameChanges.length})`}
          </button>
        ))}
      </div>

      {tab === "approvals" && (
        <>
          {pendingSellers.length === 0 ? (
            <div className="neu-flat p-8 text-center">
              <p className="text-sm text-[#FAFFC4]/50">No pending applications.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {pendingSellers.map((s) => (
                <div key={s.id} className="neu-flat p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm font-bold text-[#FAFFC4]">{s.store}</p>
                      <p className="text-xs text-[#FAFFC4]/50">{s.owner}</p>
                    </div>
                    <span className={clsx("text-xs font-semibold px-2 py-0.5 rounded-lg", statusBadge(s.status))}>
                      {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                    </span>
                  </div>
                  {s.description && <p className="text-xs text-[#FAFFC4]/40 mb-2">{s.description}</p>}
                  <p className="text-xs text-[#FAFFC4]/50">{s.email} · {s.phone || "—"}</p>
                  <p className="text-xs text-[#FAFFC4]/40 mt-1">Applied: {s.applied}</p>
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => handleApprove(s.id)} className="flex items-center gap-1.5 px-4 py-2 bg-green-500 text-white text-xs font-semibold rounded-xl hover:brightness-110 transition-all focus:outline-none focus:ring-2 focus:ring-green-400">
                      <Check size={14} /> Approve
                    </button>
                    <button onClick={() => handleReject(s.id)} className="flex items-center gap-1.5 px-4 py-2 bg-red-500 text-white text-xs font-semibold rounded-xl hover:brightness-110 transition-all focus:outline-none focus:ring-2 focus:ring-red-400">
                      <X size={14} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === "all" && (
        <div className="neu-flat overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-[#FAFFC4]/50 font-medium px-4 py-3">Store</th>
                  <th className="text-left text-[#FAFFC4]/50 font-medium px-4 py-3">Owner</th>
                  <th className="text-left text-[#FAFFC4]/50 font-medium px-4 py-3">Email</th>
                  <th className="text-left text-[#FAFFC4]/50 font-medium px-4 py-3">Status</th>
                  <th className="text-left text-[#FAFFC4]/50 font-medium px-4 py-3">Applied</th>
                  <th className="text-left text-[#FAFFC4]/50 font-medium px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {sellers.map((s) => (
                  <tr key={s.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-4 py-3 text-[#FAFFC4] font-medium">{s.store}</td>
                    <td className="px-4 py-3 text-[#FAFFC4]/70">{s.owner}</td>
                    <td className="px-4 py-3 text-[#FAFFC4]/50">{s.email}</td>
                    <td className="px-4 py-3">
                      <span className={clsx("text-xs font-semibold px-2 py-0.5 rounded-lg", statusBadge(s.status))}>
                        {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#FAFFC4]/50">{s.applied}</td>
                    <td className="px-4 py-3">
                      {s.status === "approved" && (
                        <button onClick={() => handleSuspend(s.id)} className="flex items-center gap-1 text-xs text-[#FE7F2D] font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-[#FE7F2D] rounded">
                          <EyeOff size={14} /> Suspend
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "namechanges" && (
        <>
          {nameChanges.length === 0 ? (
            <div className="neu-flat p-8 text-center">
              <p className="text-sm text-[#FAFFC4]/50">No pending name change requests.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {nameChanges.map((r) => (
                <div key={r.id} className="neu-flat p-5">
                  <p className="text-sm font-bold text-[#FAFFC4]">{r.current_name}</p>
                  <p className="text-xs text-[#FAFFC4]/50 mt-1">Requests change to:</p>
                  <p className="text-sm text-[#FE7F2D] font-semibold">{r.requested_name}</p>
                  <p className="text-xs text-[#FAFFC4]/40 mt-2">Requested: {r.created_at}</p>
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => handleApproveName(r.id)} className="flex items-center gap-1.5 px-4 py-2 bg-green-500 text-white text-xs font-semibold rounded-xl hover:brightness-110">
                      <Check size={14} /> Approve
                    </button>
                    <button onClick={() => handleRejectName(r.id)} className="flex items-center gap-1.5 px-4 py-2 bg-red-500 text-white text-xs font-semibold rounded-xl hover:brightness-110">
                      <X size={14} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
