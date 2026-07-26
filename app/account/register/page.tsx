"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { signUp } from "@/lib/actions/auth";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="neu-flat p-12 text-center max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-text mb-3">Account Created!</h2>
            <p className="text-sm text-text/60 mb-6">
              Your account has been created successfully.
            </p>
            <Link
              href="/account"
              className="inline-block px-6 py-3 bg-accent text-white font-semibold rounded-2xl hover:brightness-110 transition-all focus:outline-none focus:ring-2 focus:ring-accent"
            >
              Go to My Account
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    if (!fullName || !email || !password) {
      setError("All required fields must be filled.");
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }
    const result = await signUp({
      email,
      password,
      name: fullName,
      phone: phone || undefined,
      role: "customer",
    });
    if (result.type === "error") {
      setError(result.error);
      setLoading(false);
      return;
    }
    setSubmitted(true);
  };

  const inputClass =
    "w-full neu-pressed bg-surface text-text text-sm rounded-xl px-4 py-2.5 placeholder-text/40 focus:outline-none focus:ring-2 focus:ring-accent transition-all";

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text mb-2">Create Account</h1>
          <p className="text-sm text-text/60">Register to start shopping</p>
        </div>

        <div className="neu-flat p-8 max-w-md mx-auto space-y-5">
          <div>
            <label className="text-sm text-text/70 mb-1 block">Full Name *</label>
            <input
              type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
              className={inputClass} placeholder="Your full name"
            />
          </div>

          <div>
            <label className="text-sm text-text/70 mb-1 block">Email *</label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className={inputClass} placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="text-sm text-text/70 mb-1 block">Phone Number</label>
            <input
              type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
              className={inputClass} placeholder="01XXXXXXXXX"
            />
          </div>

          <div>
            <label className="text-sm text-text/70 mb-1 block">Password *</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password} onChange={(e) => setPassword(e.target.value)}
                className={inputClass + " pr-10"} placeholder="Minimum 6 characters"
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

          <div>
            <label className="text-sm text-text/70 mb-1 block">Confirm Password *</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputClass + " pr-10"} placeholder="Re-enter your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text/50 hover:text-text focus:outline-none focus:ring-2 focus:ring-accent rounded"
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
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
            {loading ? "Creating account…" : "Register"}
          </button>

          <p className="text-sm text-text/50 text-center">
            Already have an account?{" "}
            <Link href="/account/login" className="text-accent font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-accent rounded">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
