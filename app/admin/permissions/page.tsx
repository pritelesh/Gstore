"use client";

import { useEffect, useState, useCallback } from "react";
import { RefreshCw, Search, Check, X, ShieldCheck, Wrench, UserCog, AlertTriangle } from "lucide-react";
import clsx from "clsx";
import {
  getUsers, updateUserRole, getPermissionHealth, backfillMissingStores, syncRolesToAuthMetadata,
} from "@/lib/actions/admin";
import type { UserProfile, PermissionHealth } from "@/lib/actions/admin";

const roleBadge = (r: string) => {
  const m: Record<string, string> = {
    admin: "bg-purple-500/20 text-purple-400",
    seller: "bg-blue-500/20 text-blue-400",
    customer: "bg-green-500/20 text-green-400",
  };
  return m[r.toLowerCase()] ?? "bg-white/10 text-[#FAFFC4]";
};

type HealthRow = {
  key: string;
  label: string;
  ok: boolean;
  detail: string;
  fix?: "backfill_stores";
};

export default function AdminPermissionsPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [health, setHealth] = useState<HealthRow[]>([]);
  const [healthLoading, setHealthLoading] = useState(true);
  const [fixing, setFixing] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    const res = await getUsers();
    if ("error" in res) setNotice({ type: "error", text: res.error });
    else setUsers(res.users);
    setUsersLoading(false);
  }, []);

  const fetchHealth = useCallback(async () => {
    setHealthLoading(true);
    const res = await getPermissionHealth();
    if ("error" in res) {
      setHealth([{ key: "health_error", label: "Permission diagnostics", ok: false, detail: res.error }]);
    } else {
      const h: PermissionHealth = res.health;
      setHealth([
        { key: "is_admin", label: "is_admin() function", ok: h.is_admin_function, detail: h.is_admin_function ? "Helper function exists and is callable" : "Missing — recreate the is_admin() helper function" },
        { key: "stores_rls", label: "stores table RLS", ok: h.stores_rls, detail: h.stores_rls ? "Row Level Security is enabled" : "RLS is disabled on the stores table" },
        { key: "stores_admin_policy", label: "Admin access to stores", ok: h.stores_admin_policy, detail: h.stores_admin_policy ? "Admin policies present" : "Missing admin policies on stores" },
        { key: "role_constraint", label: "Role constraint", ok: h.role_constraint_ok, detail: h.role_constraint_ok ? "profiles.role allows customer/seller/admin" : "profiles.role constraint blocks admin" },
        { key: "missing_stores", label: "Missing store records", ok: h.sellers_missing_stores === 0, detail: h.sellers_missing_stores === 0 ? "All sellers have store records" : `${h.sellers_missing_stores} seller(s) missing a store record`, fix: "backfill_stores" },
      ]);
    }
    setHealthLoading(false);
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchHealth();
  }, [fetchUsers, fetchHealth]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setSavingUserId(userId);
    setNotice(null);
    const res = await updateUserRole(userId, newRole);
    if ("error" in res) {
      setNotice({ type: "error", text: res.error });
    } else {
      setNotice({ type: "success", text: "Role updated successfully." });
    }
    setSavingUserId(null);
    fetchUsers();
  };

  const runFix = async (fix: "backfill_stores" | "sync_roles") => {
    setFixing(fix);
    setNotice(null);
    if (fix === "backfill_stores") {
      const res = await backfillMissingStores();
      if ("error" in res) setNotice({ type: "error", text: res.error });
      else setNotice({ type: "success", text: `Backfilled ${res.fixed} missing store record(s).` });
    } else {
      const res = await syncRolesToAuthMetadata();
      if ("error" in res) setNotice({ type: "error", text: res.error });
      else setNotice({ type: "success", text: `Synced role to auth metadata for ${res.synced} user(s).` });
    }
    setFixing(null);
    fetchHealth();
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    if (!q) return true;
    return (
      (u.full_name?.toLowerCase() || "").includes(q) ||
      (u.email?.toLowerCase() || "").includes(q)
    );
  });

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[#FAFFC4]">Permissions</h1>
        <p className="text-[#FAFFC4]/60 mt-1">Manage user roles and resolve data/access issues</p>
      </div>

      {notice && (
        <div className={clsx("p-4 rounded-2xl border text-sm font-medium", notice.type === "success" ? "bg-green-500/10 border-green-500/30 text-green-300" : "bg-red-500/10 border-red-500/30 text-red-300")}>
          {notice.text}
        </div>
      )}

      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 shadow-[10px_10px_20px_#1a2354,-10px_-10px_20px_#3849ae]">
        <div className="flex items-center gap-2 mb-4">
          <UserCog size={18} className="text-[#FE7F2D]" />
          <h2 className="text-lg font-bold text-[#FAFFC4]">User Role Management</h2>
        </div>
        <p className="text-xs text-[#FAFFC4]/50 mb-4">
          Search any user by name or email and change their role directly — no SQL required. This replaces the manual role-promotion process.
        </p>

        <div className="relative mb-4 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#FAFFC4]/30" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full bg-[#293681] text-[#FAFFC4] text-sm rounded-xl pl-9 pr-4 py-2.5 border border-[#FAFFC4]/20 focus:outline-none focus:border-[#FE7F2D] placeholder-[#FAFFC4]/30"
          />
        </div>

        {usersLoading ? (
          <div className="flex items-center justify-center py-10">
            <RefreshCw size={20} className="animate-spin text-[#FAFFC4]/30" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-[#FAFFC4]/40 text-center py-8">No users found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#FAFFC4]/10">
                  <th className="text-left text-[#FAFFC4]/50 font-medium px-3 py-2.5">Name</th>
                  <th className="text-left text-[#FAFFC4]/50 font-medium px-3 py-2.5">Email</th>
                  <th className="text-left text-[#FAFFC4]/50 font-medium px-3 py-2.5">Role</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 50).map((u) => (
                  <tr key={u.id} className="border-b border-[#FAFFC4]/5 last:border-b-0 hover:bg-white/5">
                    <td className="px-3 py-2.5 text-[#FAFFC4] font-medium">{u.full_name || "—"}</td>
                    <td className="px-3 py-2.5 text-[#FAFFC4]/70">{u.email || "—"}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
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
                          <RefreshCw size={12} className="animate-spin text-[#FAFFC4]/50" />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 shadow-[10px_10px_20px_#1a2354,-10px_-10px_20px_#3849ae]">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck size={18} className="text-green-400" />
          <h2 className="text-lg font-bold text-[#FAFFC4]">Permission Diagnostics</h2>
        </div>
        <p className="text-xs text-[#FAFFC4]/50 mb-4">
          Quick health check of critical database functions and policies. Fix any problem with one click.
        </p>

        {healthLoading ? (
          <div className="flex items-center justify-center py-10">
            <RefreshCw size={20} className="animate-spin text-[#FAFFC4]/30" />
          </div>
        ) : (
          <div className="space-y-2">
            {health.map((row) => (
              <div key={row.key} className="flex items-center justify-between py-2.5 border-b border-[#FAFFC4]/5 last:border-b-0 gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  {row.ok ? (
                    <Check size={16} className="text-green-400 flex-shrink-0" />
                  ) : (
                    <X size={16} className="text-red-400 flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm text-[#FAFFC4] font-medium">{row.label}</p>
                    <p className="text-xs text-[#FAFFC4]/50">{row.detail}</p>
                  </div>
                </div>
                {row.fix && !row.ok && (
                  <button
                    onClick={() => runFix("backfill_stores")}
                    disabled={fixing !== null}
                    className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FE7F2D] text-white text-xs font-semibold hover:brightness-110 transition-all disabled:opacity-60"
                  >
                    {fixing === "backfill_stores" ? <RefreshCw size={12} className="animate-spin" /> : <Wrench size={12} />}
                    Fix Now
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 shadow-[10px_10px_20px_#1a2354,-10px_-10px_20px_#3849ae]">
        <div className="flex items-center gap-2 mb-4">
          <Wrench size={18} className="text-blue-400" />
          <h2 className="text-lg font-bold text-[#FAFFC4]">Fix Common Issues</h2>
        </div>
        <p className="text-xs text-[#FAFFC4]/50 mb-4">
          Known recurring problems, resolvable from the UI — no manual SQL needed.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-4 rounded-xl bg-[#FE7F2D]/10 border border-[#FE7F2D]/20">
            <p className="text-sm font-semibold text-[#FE7F2D]">Backfill missing store records for sellers</p>
            <p className="text-xs text-[#FAFFC4]/40 mt-1">Creates a store record for any seller profile that doesn&apos;t have one.</p>
            <button
              onClick={() => runFix("backfill_stores")}
              disabled={fixing !== null}
              className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FE7F2D] text-white text-xs font-semibold hover:brightness-110 transition-all disabled:opacity-60"
            >
              {fixing === "backfill_stores" ? <RefreshCw size={12} className="animate-spin" /> : <Wrench size={12} />}
              Run Fix
            </button>
          </div>

          <div className="p-4 rounded-xl bg-blue-400/10 border border-blue-400/20">
            <p className="text-sm font-semibold text-blue-400">Sync role to auth metadata for all users</p>
            <p className="text-xs text-[#FAFFC4]/40 mt-1">Ensures each user&apos;s app_metadata.role matches the profiles table.</p>
            <button
              onClick={() => runFix("sync_roles")}
              disabled={fixing !== null}
              className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-400 text-white text-xs font-semibold hover:brightness-110 transition-all disabled:opacity-60"
            >
              {fixing === "sync_roles" ? <RefreshCw size={12} className="animate-spin" /> : <AlertTriangle size={12} />}
              Run Fix
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
