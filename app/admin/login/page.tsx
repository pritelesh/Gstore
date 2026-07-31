"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { adminSignIn } from "@/lib/actions/auth";

function AdminLoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(
    searchParams.get("access") === "denied"
      ? "You need admin access to view this page."
      : "",
  );
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError("");
    setLoading(true);

    try {
      const result = await adminSignIn({ email, password });

      if (result.type === "error") {
        if (result.error === "NO_ADMIN_ACCESS") {
          setError("This account does not have admin access.");
        } else {
          setError(result.error);
        }
        return;
      }

      window.location.href = "/admin";
    } catch (err) {
      console.error("[AdminLogin] signIn exception:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) handleSubmit();
  };

  return (
    <div className="min-h-screen bg-[#293681] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-[20px_20px_40px_#1a2354,-20px_-20px_40px_#3849ae]">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#FAFFC4]">Admin Login</h1>
          <p className="text-[#FAFFC4]/70 mt-2">Sign in to manage the platform</p>
        </div>

        <div className="space-y-5" onKeyDown={handleKeyDown}>
          <div>
            <label className="block text-sm font-medium text-[#FAFFC4] mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#293681] text-[#FAFFC4] placeholder-[#FAFFC4]/40 border border-[#FAFFC4]/20 focus:outline-none focus:border-[#FE7F2D] shadow-[inset_6px_6px_12px_#1a2354,inset_-6px_-6px_12px_#3849ae]"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#FAFFC4] mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#293681] text-[#FAFFC4] placeholder-[#FAFFC4]/40 border border-[#FAFFC4]/20 focus:outline-none focus:border-[#FE7F2D] shadow-[inset_6px_6px_12px_#1a2354,inset_-6px_-6px_12px_#3849ae]"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={handleSubmit}
            className="w-full py-3 rounded-xl bg-[#FE7F2D] text-white font-bold text-lg hover:bg-[#e66e1f] transition-colors disabled:opacity-60 shadow-[8px_8px_16px_#1a2354,-8px_-8px_16px_#3849ae]"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </div>

        {error && (
          <div className="mt-5 p-4 rounded-xl bg-red-500/20 border border-red-500/40 text-[#FAFFC4] text-sm text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#293681]" />}>
      <AdminLoginForm />
    </Suspense>
  );
}
