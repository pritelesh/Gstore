"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { signIn } from "@/lib/actions/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    if (!email || !password) {
      setError("Email and password are required.");
      setLoading(false);
      return;
    }
    const result = await signIn({ email, password });
    if (result.type === "error") {
      setError(result.error);
      setLoading(false);
      return;
    }
    if (result.role === "seller") {
      router.push("/sell/dashboard");
    } else {
      router.push("/account");
    }
  };

  const inputClass =
    "w-full neu-pressed bg-surface text-text text-sm rounded-xl px-4 py-2.5 placeholder-text/40 focus:outline-none focus:ring-2 focus:ring-accent transition-all";

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text mb-2">Welcome Back</h1>
          <p className="text-sm text-text/60">Log in to your account</p>
        </div>

        <div className="neu-flat p-8 max-w-md mx-auto space-y-5">
          <div>
            <label className="text-sm text-text/70 mb-1 block">Email *</label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className={inputClass} placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="text-sm text-text/70 mb-1 block">Password *</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password} onChange={(e) => setPassword(e.target.value)}
                className={inputClass + " pr-10"} placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text/50 hover:text-text focus:outline-none focus:ring-2 focus:ring-accent rounded"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-400/10 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full px-6 py-3 bg-accent text-white font-semibold rounded-2xl hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-accent"
          >
            {loading ? "Logging in…" : "Log In"}
          </button>

          <p className="text-sm text-text/50 text-center">
            Don&apos;t have an account?{" "}
            <Link href="/account/register" className="text-accent font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-accent rounded">
              Register
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
