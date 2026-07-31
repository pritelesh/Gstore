"use client";

import { useEffect, useState, useCallback } from "react";
import { RefreshCw, Wallet, Plus, X } from "lucide-react";
import { getCashoutRequests, createCashoutRequest, getSellerEarnings } from "@/lib/actions/seller";

export default function SellerCashoutPage() {
  const [requests, setRequests] = useState<{ id: string; amount: number; method: string; status: string; date: string }[]>([]);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("bkash");
  const [mobile, setMobile] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    const [r, e] = await Promise.all([getCashoutRequests(), getSellerEarnings()]);
    if ("error" in r) { setError(r.error); setLoading(false); return; }
    setRequests(r.cashouts);
    if ("stats" in e) setAvailableBalance(e.stats.availableBalance);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccessMsg("");
    const res = await createCashoutRequest(Number(amount));
    if ("error" in res) { setError(res.error); setSubmitting(false); return; }
    setSuccessMsg("Cashout request submitted successfully!");
    setShowForm(false);
    setAmount("");
    setMobile("");
    setSubmitting(false);
    fetchData();
  };

  const statusBadge = (s: string) => {
    const m: Record<string, string> = {
      pending: "text-yellow-400 bg-yellow-400/10",
      approved: "text-green-400 bg-green-400/10",
      completed: "text-blue-400 bg-blue-400/10",
      rejected: "text-red-400 bg-red-400/10",
    };
    return m[s.toLowerCase()] ?? "text-gray-400 bg-white/10";
  };

  if (loading) return <div className="flex items-center justify-center h-full p-8"><RefreshCw size={24} className="animate-spin text-[#FAFFC4]/30" /></div>;

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#FAFFC4]">Cashout Requests</h1>
          <p className="text-[#FAFFC4]/60 mt-1">Withdraw your earnings</p>
        </div>
        <button onClick={() => { setShowForm(true); setError(""); setSuccessMsg(""); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#FE7F2D] text-white font-semibold rounded-xl hover:bg-[#e66e1f] transition-colors text-sm shadow-[4px_4px_8px_#1a2354,-4px_-4px_8px_#3849ae]">
          <Plus size={18} /> New Request
        </button>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 mb-6 shadow-[10px_10px_20px_#1a2354,-10px_-10px_20px_#3849ae]">
        <div className="flex items-center gap-3">
          <Wallet size={24} className="text-[#FE7F2D]" />
          <div>
            <p className="text-sm text-[#FAFFC4]/60">Available Balance</p>
            <p className="text-2xl font-bold text-[#FAFFC4]">৳{availableBalance.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {error && <div className="mb-4 p-4 rounded-xl bg-red-500/20 border border-red-500/40 text-sm text-red-300">{error}</div>}
      {successMsg && <div className="mb-4 p-4 rounded-xl bg-green-500/20 border border-green-500/40 text-sm text-green-300">{successMsg}</div>}

      {requests.length === 0 ? (
        <div className="max-w-lg mx-auto mt-8 p-10 rounded-2xl bg-white/10 backdrop-blur-md text-center shadow-[10px_10px_20px_#1a2354,-10px_-10px_20px_#3849ae]">
          <Wallet size={48} className="mx-auto mb-4 text-[#FAFFC4]/20" />
          <p className="text-[#FAFFC4]/60">No cashout requests yet.</p>
        </div>
      ) : (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden shadow-[10px_10px_20px_#1a2354,-10px_-10px_20px_#3849ae]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#FAFFC4]/10">
                  <th className="text-left text-[#FAFFC4]/50 font-medium px-4 py-3">ID</th>
                  <th className="text-left text-[#FAFFC4]/50 font-medium px-4 py-3">Amount</th>
                  <th className="text-left text-[#FAFFC4]/50 font-medium px-4 py-3">Method</th>
                  <th className="text-left text-[#FAFFC4]/50 font-medium px-4 py-3">Status</th>
                  <th className="text-left text-[#FAFFC4]/50 font-medium px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id} className="border-b border-[#FAFFC4]/5">
                    <td className="px-4 py-3 text-[#FAFFC4] font-mono">#{r.id}</td>
                    <td className="px-4 py-3 text-[#FAFFC4] font-semibold">৳{r.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-[#FAFFC4]/70">{r.method}</td>
                    <td className="px-4 py-3"><span className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${statusBadge(r.status)}`}>{r.status}</span></td>
                    <td className="px-4 py-3 text-[#FAFFC4]/50">{r.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => { if (!submitting) setShowForm(false); }}>
          <div className="bg-[#293681] rounded-2xl p-6 max-w-sm w-full shadow-[20px_20px_40px_#1a2354,-20px_-20px_40px_#3849ae]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#FAFFC4]">New Cashout Request</h2>
              <button onClick={() => setShowForm(false)} disabled={submitting}><X size={20} className="text-[#FAFFC4]/40 hover:text-[#FAFFC4]" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-[#FAFFC4]/50 mb-1">Amount (৳)</label>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} required min="1" max={availableBalance}
                  placeholder={`Max ৳${availableBalance.toLocaleString()}`}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#1e2860] text-[#FAFFC4] placeholder-[#FAFFC4]/30 border border-[#FAFFC4]/20 focus:outline-none focus:border-[#FE7F2D] text-sm shadow-[inset_4px_4px_8px_#141b40,inset_-4px_-4px_8px_#2835a0]"
                />
              </div>
              <div>
                <label className="block text-sm text-[#FAFFC4]/50 mb-1">Method</label>
                <select value={method} onChange={e => setMethod(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#1e2860] text-[#FAFFC4] border border-[#FAFFC4]/20 focus:outline-none focus:border-[#FE7F2D] text-sm shadow-[inset_4px_4px_8px_#141b40,inset_-4px_-4px_8px_#2835a0]"
                >
                  <option value="bkash">bKash</option>
                  <option value="nagad">Nagad</option>
                  <option value="rocket">Rocket</option>
                  <option value="bank">Bank Transfer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-[#FAFFC4]/50 mb-1">Mobile Number</label>
                <input type="text" value={mobile} onChange={e => setMobile(e.target.value)} required placeholder="01XXXXXXXXX"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#1e2860] text-[#FAFFC4] placeholder-[#FAFFC4]/30 border border-[#FAFFC4]/20 focus:outline-none focus:border-[#FE7F2D] text-sm shadow-[inset_4px_4px_8px_#141b40,inset_-4px_-4px_8px_#2835a0]"
                />
              </div>
              <button type="submit" disabled={submitting || Number(amount) > availableBalance}
                className="w-full px-5 py-2.5 bg-[#FE7F2D] text-white font-semibold rounded-xl hover:bg-[#e66e1f] transition-colors text-sm disabled:opacity-50 shadow-[4px_4px_8px_#1a2354,-4px_-4px_8px_#3849ae]"
              >
                {submitting ? "Submitting..." : "Submit Request"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
