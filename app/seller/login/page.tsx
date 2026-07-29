"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { sellerSignIn } from "@/lib/actions/auth";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(
    searchParams.get("no_store") === "1"
      ? 'No seller account found. Please <a href="/sell/register" class="underline font-bold">create your store</a> first.'
      : "",
  );
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await sellerSignIn({ email, password });

    if (result.type === "error") {
      if (result.error === "NO_SELLER_ACCOUNT") {
        setError(
          'No seller account found. Please <a href="/sell/register" class="underline font-bold">create your store</a> first.',
        );
      } else {
        setError(result.error);
      }
      setLoading(false);
      return;
    }

    router.push("/seller/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#293681] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-[20px_20px_40px_#1a2354,-20px_-20px_40px_#3849ae]">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#FAFFC4]">Seller Login</h1>
          <p className="text-[#FAFFC4]/70 mt-2">Sign in to manage your store</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#FAFFC4] mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-[#293681] text-[#FAFFC4] placeholder-[#FAFFC4]/40 border border-[#FAFFC4]/20 focus:outline-none focus:border-[#FE7F2D] shadow-[inset_6px_6px_12px_#1a2354,inset_-6px_-6px_12px_#3849ae]"
              placeholder="seller@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#FAFFC4] mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-[#293681] text-[#FAFFC4] placeholder-[#FAFFC4]/40 border border-[#FAFFC4]/20 focus:outline-none focus:border-[#FE7F2D] shadow-[inset_6px_6px_12px_#1a2354,inset_-6px_-6px_12px_#3849ae]"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#FE7F2D] text-white font-bold text-lg hover:bg-[#e66e1f] transition-colors disabled:opacity-60 shadow-[8px_8px_16px_#1a2354,-8px_-8px_16px_#3849ae]"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {error && (
          <div className="mt-5 p-4 rounded-xl bg-red-500/20 border border-red-500/40 text-[#FAFFC4] text-sm text-center">
            <span dangerouslySetInnerHTML={{ __html: error }} />
          </div>
        )}

        <p className="mt-6 text-center text-[#FAFFC4]/60 text-sm">
          Don&apos;t have a seller account?{" "}
          <a
            href="/sell/register"
            className="text-[#FE7F2D] font-semibold hover:underline"
          >
            Create your store
          </a>
        </p>
      </div>
    </div>
  );
}

export default function SellerLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#293681]" />}>
      <LoginForm />
    </Suspense>
  );
}
