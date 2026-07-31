"use client";

import { useEffect, useState, useCallback } from "react";
import { RefreshCw, Search } from "lucide-react";
import clsx from "clsx";
import { getUsers, updateUserRole } from "@/lib/actions/admin";
import type { UserProfile } from "@/lib/actions/admin";

const roleBadge = (r: string) => {
  const m: Record<string, string> = {
    admin: "bg-purple-500/20 text-purple-400",
    seller: "bg-blue-500/20 text-blue-400",
    customer: "bg-green-500/20 text-green-400",
  };
  return m[r.toLowerCase()] ?? "bg-white/10 text-[#FAFFC4]";
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [savingUserId, setSavingUserId] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    const res = await getUsers();
    if ("error" in res) setError(res.error);
    else setUsers(res.users);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setSavingUserId(userId);
    const res = await updateUserRole(userId, newRole);
    if ("error" in res) {
      alert(res.error);
    }
    setSavingUserId(null);
    fetch();
  };

  const filtered = users.filter((u) => {
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    const q = search.toLowerCase();
    if (!q) return true;
    return (
      (u.full_name?.toLowerCase() || "").includes(q) ||
      (u.email?.toLowerCase() || "").includes(q)
    );
  });

  const roles = ["all", ...Array.from(new Set(users.map((u) => u.role)))];

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
      <h2 className="text-xl font-bold text-[#FAFFC4]">User Management ({users.length})</h2>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#FAFFC4]/30" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full bg-surface text-[#FAFFC4] text-sm rounded-xl pl-9 pr-4 py-2.5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-[#FAFFC4]/30"
          />
        </div>
        <div className="flex gap-2">
          {roles.map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={clsx(
                "text-xs px-3 py-2 rounded-xl font-medium transition-colors",
                roleFilter === r
                  ? "bg-blue-500 text-white"
                  : "bg-white/5 text-[#FAFFC4]/60 hover:text-[#FAFFC4]"
              )}
            >
              {r === "all" ? "All" : r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="neu-flat overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-[#FAFFC4]/50 font-medium px-4 py-3">Name</th>
                <th className="text-left text-[#FAFFC4]/50 font-medium px-4 py-3">Email</th>
                <th className="text-left text-[#FAFFC4]/50 font-medium px-4 py-3">Phone</th>
                <th className="text-left text-[#FAFFC4]/50 font-medium px-4 py-3">Role</th>
                <th className="text-left text-[#FAFFC4]/50 font-medium px-4 py-3">Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3 text-[#FAFFC4] font-medium">{u.full_name || "—"}</td>
                  <td className="px-4 py-3 text-[#FAFFC4]/70">{u.email || "—"}</td>
                  <td className="px-4 py-3 text-[#FAFFC4]/50">{u.phone || "—"}</td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      disabled={savingUserId === u.id}
                      className={clsx(
                        "text-xs font-semibold px-2 py-1 rounded-lg border-0 cursor-pointer",
                        roleBadge(u.role)
                      )}
                    >
                      <option value="customer">Customer</option>
                      <option value="seller">Seller</option>
                      <option value="admin">Admin</option>
                    </select>
                    {savingUserId === u.id && (
                      <RefreshCw size={12} className="inline ml-1 animate-spin text-[#FAFFC4]/50" />
                    )}
                  </td>
                  <td className="px-4 py-3 text-[#FAFFC4]/50">
                    {new Date(u.created_at).toLocaleDateString("en-CA")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="neu-flat p-8 text-center">
          <p className="text-sm text-[#FAFFC4]/50">No users match your filters.</p>
        </div>
      )}
    </div>
  );
}
