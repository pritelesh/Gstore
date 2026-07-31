"use client";

import { useState } from "react";
import { Store, LogIn, Eye, EyeOff, CheckCircle } from "lucide-react";
import { signUp, signIn } from "@/lib/actions/auth";

type View = "choose" | "register" | "login";

export default function SellerEntryPage() {
  const [view, setView] = useState<View>("choose");

  return (
    <section className="min-h-screen bg-[#293681] py-16 md:py-24">
      <div className="container mx-auto px-4">
        {view === "choose" && <ChooseView onSelect={setView} />}
        {view === "register" && <RegisterForm onBack={() => setView("choose")} onSuccess={() => { window.location.href = "/seller/dashboard"; }} />}
        {view === "login" && <LoginForm onBack={() => setView("choose")} onSuccess={() => { window.location.href = "/seller/dashboard"; }} />}
      </div>
    </section>
  );
}

function ChooseView({ onSelect }: { onSelect: (v: View) => void }) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-text mb-4">Become a Seller</h1>
        <p className="text-text/60 max-w-md mx-auto">
          Start selling on KGStore. Create your store and reach customers across Bangladesh.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          onClick={() => onSelect("register")}
          className="neu-flat p-8 text-center group transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer active:neu-pressed"
        >
          <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center mx-auto mb-5">
            <Store size={32} className="text-accent" />
          </div>
          <h2 className="text-xl font-bold text-text mb-2">Create Seller Account</h2>
          <p className="text-sm text-text/50 leading-relaxed">
            Register your store, list products, and start selling today.
          </p>
          <span className="inline-block mt-5 px-6 py-2.5 bg-accent text-white font-semibold rounded-2xl transition-all">
            Get Started
          </span>
        </button>

        <button
          onClick={() => onSelect("login")}
          className="neu-flat p-8 text-center group transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer active:neu-pressed"
        >
          <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center mx-auto mb-5">
            <LogIn size={32} className="text-accent" />
          </div>
          <h2 className="text-xl font-bold text-text mb-2">Already Have an Account?</h2>
          <p className="text-sm text-text/50 leading-relaxed">
            Sign in to manage your store, products, and orders.
          </p>
          <span className="inline-block mt-5 px-6 py-2.5 bg-accent text-white font-semibold rounded-2xl transition-all">
            Sign In
          </span>
        </button>
      </div>
    </div>
  );
}

function RegisterForm({ onBack, onSuccess }: { onBack: () => void; onSuccess: () => void }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [storeName, setStoreName] = useState("");
  const [storeDescription, setStoreDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    if (!fullName || !password || !storeName) {
      setError("Full name, password, and store name are required.");
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
    try {
      const result = await signUp({
        email,
        password,
        name: fullName,
        role: "seller",
        storeName,
        storeDescription: storeDescription || undefined,
        phone: phone || undefined,
      });
      if (result.type === "error") {
        setError(result.error);
        setLoading(false);
        return;
      }
      setSuccess(true);
      setTimeout(() => onSuccess(), 1500);
    } catch (err) {
      console.error("[RegisterForm] signUp exception:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
      setLoading(false);
    }
  };

  const inputClass =
    "w-full neu-pressed bg-surface text-text text-sm rounded-xl px-4 py-2.5 placeholder-text/40 focus:outline-none focus:ring-2 focus:ring-accent transition-all";

  if (success) {
    return (
      <div className="neu-flat p-12 text-center max-w-lg mx-auto">
        <CheckCircle size={48} className="mx-auto text-green-400 mb-4" />
        <h2 className="text-2xl font-bold text-text mb-3">Account Created!</h2>
        <p className="text-sm text-text/60 leading-relaxed">
          Your seller account has been created. Redirecting to dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <button
        onClick={onBack}
        className="text-text/60 hover:text-text text-sm mb-6 transition-colors focus:outline-none focus:ring-2 focus:ring-accent rounded"
      >
        &larr; Back
      </button>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-text mb-2">Create Seller Account</h1>
        <p className="text-sm text-text/60">Fill in the details to get started</p>
      </div>

      <div className="neu-flat p-8 space-y-5">
        <div>
          <label className="text-sm text-text/70 mb-1 block">Store Name *</label>
          <input
            type="text" value={storeName} onChange={(e) => setStoreName(e.target.value)}
            className={inputClass} placeholder="Your store name"
          />
        </div>

        <div>
          <label className="text-sm text-text/70 mb-1 block">Store Description</label>
          <textarea
            value={storeDescription} onChange={(e) => setStoreDescription(e.target.value)}
            className={inputClass + " resize-none h-20"} placeholder="Briefly describe what you sell"
          />
        </div>

        <hr className="border-white/5" />

        <div>
          <label className="text-sm text-text/70 mb-1 block">Your Full Name *</label>
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
          <label className="text-sm text-text/70 mb-1 block">Phone</label>
          <input
            type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
            className={inputClass} placeholder="+880 1XXX-XXXXXX"
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
          {loading ? "Creating account…" : "Create Seller Account"}
        </button>
      </div>
    </div>
  );
}

function LoginForm({ onBack, onSuccess }: { onBack: () => void; onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    try {
      const result = await signIn({ email, password });

      if (result.type === "error") {
        console.error("[LoginForm] signIn returned error:", result.error);
        setError(result.error);
        return;
      }

      if (result.role !== "seller") {
        console.error("[LoginForm] not a seller, role:", result.role);
        setError("This account is not registered as a seller. Please create a seller account first.");
        return;
      }

      console.log("[LoginForm] signIn success, redirecting to /seller/dashboard");
      onSuccess();
    } catch (err) {
      console.error("[LoginForm] signIn threw exception:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) {
      handleSubmit();
    }
  };

  const inputClass =
    "w-full neu-pressed bg-surface text-text text-sm rounded-xl px-4 py-2.5 placeholder-text/40 focus:outline-none focus:ring-2 focus:ring-accent transition-all";

  return (
    <div className="max-w-lg mx-auto">
      <button
        type="button"
        onClick={onBack}
        className="text-text/60 hover:text-text text-sm mb-6 transition-colors focus:outline-none focus:ring-2 focus:ring-accent rounded"
      >
        &larr; Back
      </button>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-text mb-2">Seller Login</h1>
        <p className="text-sm text-text/60">Sign in to manage your store</p>
      </div>

      <div className="neu-flat p-8 space-y-5" onKeyDown={handleKeyDown}>
        <div>
          <label className="text-sm text-text/70 mb-1 block">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="seller@example.com"
          />
        </div>

        <div>
          <label className="text-sm text-text/70 mb-1 block">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            placeholder="Enter your password"
          />
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={handleSubmit}
          className="w-full py-3 bg-accent text-white font-bold text-lg rounded-2xl hover:brightness-110 transition-all disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-accent"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/20 border border-red-500/40 text-text text-sm text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
