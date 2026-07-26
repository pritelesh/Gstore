"use client";

import { useEffect, useState } from "react";
import { getAdminDashboard } from "@/lib/actions/admin";

interface DashboardStats {
  totalStores: number;
  totalProducts: number;
  totalOrders: number;
  pendingApprovals: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    getAdminDashboard().then((res) => {
      if ("stats" in res) setStats(res.stats);
    });
  }, []);

  const items = stats
    ? [
        { label: "Total Stores", value: stats.totalStores },
        { label: "Total Products", value: stats.totalProducts },
        { label: "Total Orders", value: stats.totalOrders },
        { label: "Pending Approvals", value: stats.pendingApprovals },
      ]
    : [
        { label: "Total Stores", value: "—" },
        { label: "Total Products", value: "—" },
        { label: "Total Orders", value: "—" },
        { label: "Pending Approvals", value: "—" },
      ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-text">Dashboard</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((s) => (
          <div key={s.label} className="neu-flat p-5 text-center">
            <p className="text-xs text-text/50 mb-1">{s.label}</p>
            <p className="text-2xl font-bold text-text">{s.value}</p>
          </div>
        ))}
      </div>
      <div className="neu-flat p-6">
        <p className="text-xs text-text/40 text-center py-6">
          Recent activity and charts will appear here.
        </p>
      </div>
    </div>
  );
}
