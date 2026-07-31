"use client";

import { useEffect, useState, useCallback } from "react";
import { Check, X, RefreshCw } from "lucide-react";
import clsx from "clsx";
import {
  getCashoutRequests, approveCashout, rejectCashout,
} from "@/lib/actions/admin";
import type { CashoutRequest } from "@/lib/actions/admin";

const statusBadge = (s: string) => {
  const m: Record<string, string> = {
    approved: "text-green-400 bg-green-400/10",
    pending: "text-[#FE7F2D] bg-[#FE7F2D]/10",
    rejected: "text-red-400 bg-red-400/10",
  };
  return m[s.toLowerCase()] ?? "text-[#FAFFC4] bg-white/10";
};

export default function AdminCashoutsPage() {
  const [cashouts, setCashouts] = useState<CashoutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetch = useCallback(async () => {
    setLoading(true);
    const res = await getCashoutRequests();
    if ("error" in res) setError(res.error);
    else setCashouts(res.cashouts);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleApprove = async (id: string) => {
    await approveCashout(id);
    fetch();
  };

  const handleReject = async (id: string) => {
    await rejectCashout(id);
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

  const pending = cashouts.filter((c) => c.status === "pending");
  const others = cashouts.filter((c) => c.status !== "pending");

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-[#FAFFC4]">Cashout Requests ({cashouts.length})</h2>

      {pending.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-[#FAFFC4] mb-3">Pending ({pending.length})</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pending.map((c) => (
              <div key={c.id} className="neu-flat p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-lg font-bold text-[#FAFFC4]">৳{c.amount.toLocaleString("en-IN")}</p>
                    <p className="text-xs text-[#FAFFC4]/50">{c.payout_method}</p>
                  </div>
                  <span className={clsx("text-xs font-semibold px-2 py-0.5 rounded-lg", statusBadge(c.status))}>
                    {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                  </span>
                </div>
                <p className="text-xs text-[#FAFFC4]/40 break-all">{c.account_details}</p>
                <p className="text-xs text-[#FAFFC4]/40 mt-1">Requested: {c.created_at}</p>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => handleApprove(c.id)} className="flex items-center gap-1.5 px-4 py-2 bg-green-500 text-white text-xs font-semibold rounded-xl hover:brightness-110">
                    <Check size={14} /> Approve & Process
                  </button>
                  <button onClick={() => handleReject(c.id)} className="flex items-center gap-1.5 px-4 py-2 bg-red-500 text-white text-xs font-semibold rounded-xl hover:brightness-110">
                    <X size={14} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {others.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-[#FAFFC4] mb-3">History ({others.length})</h3>
          <div className="neu-flat overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left text-[#FAFFC4]/50 font-medium px-4 py-3">Amount</th>
                    <th className="text-left text-[#FAFFC4]/50 font-medium px-4 py-3">Method</th>
                    <th className="text-left text-[#FAFFC4]/50 font-medium px-4 py-3">Status</th>
                    <th className="text-left text-[#FAFFC4]/50 font-medium px-4 py-3">Requested</th>
                    <th className="text-left text-[#FAFFC4]/50 font-medium px-4 py-3">Processed</th>
                  </tr>
                </thead>
                <tbody>
                  {others.map((c) => (
                    <tr key={c.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="px-4 py-3 text-[#FAFFC4] font-medium">৳{c.amount.toLocaleString("en-IN")}</td>
                      <td className="px-4 py-3 text-[#FAFFC4]/70">{c.payout_method}</td>
                      <td className="px-4 py-3">
                        <span className={clsx("text-xs font-semibold px-2 py-0.5 rounded-lg", statusBadge(c.status))}>
                          {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#FAFFC4]/50">{c.created_at}</td>
                      <td className="px-4 py-3 text-[#FAFFC4]/50">{c.processed_at ? new Date(c.processed_at).toLocaleDateString("en-CA") : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {cashouts.length === 0 && (
        <div className="neu-flat p-8 text-center">
          <p className="text-sm text-[#FAFFC4]/50">No cashout requests yet.</p>
        </div>
      )}
    </div>
  );
}
