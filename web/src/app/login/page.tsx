"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Eye, EyeOff, ShieldCheck, ArrowRight, AlertCircle } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Authentication failed. Please check your credentials.");
        setIsSubmitting(false);
        return;
      }

      const safeNext = nextPath.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "/";
      router.replace(safeNext);
      router.refresh();
    } catch {
      setError("Network error while verifying credentials. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#eceef4] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
        {/* Top Accent Banner */}
        <div className="bg-gradient-to-r from-[#05389f] to-[#0a1e4d] px-7 py-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-2xl bg-white p-1 shadow-md flex items-center justify-center shrink-0">
                <img
                  src="/logo-square.png"
                  alt="Project Banwaan"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="font-extrabold text-lg tracking-tight leading-tight">
                  Project Banwaan
                </h1>
                <p className="text-[11px] text-blue-200 font-medium">
                  Naga City Command Center
                </p>
              </div>
            </div>
            <span className="inline-flex items-center space-x-1 bg-white/15 border border-white/20 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase">
              <Lock className="w-3 h-3" />
              <span>Private</span>
            </span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-7 space-y-5">
          <div className="space-y-1">
            <div className="flex items-center space-x-1.5 text-[11px] font-bold text-[#05389f] uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Authorized Reviewer Access</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Sign in with your assigned credentials to access the 3D geo-spatial command center and CBMS intelligence suite.
            </p>
          </div>

          {error && (
            <div className="flex items-start space-x-2.5 bg-rose-50 border border-rose-200 text-rose-800 px-3.5 py-2.5 rounded-xl text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="font-medium leading-snug">{error}</span>
            </div>
          )}

          <div className="space-y-3.5">
            <div>
              <label
                htmlFor="username"
                className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#05389f] focus:ring-2 focus:ring-[#05389f]/15 transition-all"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Access Passcode
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter passcode"
                  className="w-full px-3.5 py-2.5 pr-10 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#05389f] focus:ring-2 focus:ring-[#05389f]/15 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  aria-label={showPassword ? "Hide passcode" : "Show passcode"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-[#05389f] hover:bg-[#042c7e] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <span>{isSubmitting ? "Verifying Access..." : "Sign In to Command Center"}</span>
            {!isSubmitting && <ArrowRight className="w-4 h-4" />}
          </button>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
            <span>RA 10173 Protected Environment</span>
            <span className="font-mono font-semibold text-slate-500">HTTP-Only Session</span>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full bg-[#eceef4] flex items-center justify-center">
          <div className="text-xs font-semibold text-slate-500">Loading secure login...</div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

