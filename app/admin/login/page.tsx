"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.ok) {
      router.push("/admin");
    } else {
      toast.error("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-4">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(201,168,76,0.5) 39px, rgba(201,168,76,0.5) 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(201,168,76,0.5) 39px, rgba(201,168,76,0.5) 40px)"
        }}
      />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="relative">
              <div className="w-12 h-12 bg-gold flex items-center justify-center rounded-sm">
                <span className="text-dark font-display font-black text-xl leading-none">B</span>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 border-2 border-gold bg-transparent rounded-sm" />
            </div>
            <div className="text-left">
              <div className="text-white font-display font-bold text-xl leading-none">Build Demo</div>
              <div className="text-gold text-xs tracking-widest uppercase mt-0.5">Admin Panel</div>
            </div>
          </div>
          <h1 className="font-display font-bold text-2xl text-white">Welcome Back</h1>
          <p className="text-white/40 text-sm mt-1">Sign in to manage your website</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-dark-lighter border border-white/5 rounded-sm p-8 space-y-5">
          <div>
            <label className="block text-white/50 text-xs uppercase tracking-wider mb-2">Email</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@site.com"
                className="w-full bg-dark border border-white/10 focus:border-gold text-white placeholder-white/20 rounded-sm pl-9 pr-4 py-3 text-sm outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-white/50 text-xs uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-dark border border-white/10 focus:border-gold text-white placeholder-white/20 rounded-sm pl-9 pr-10 py-3 text-sm outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gold hover:bg-gold-light disabled:opacity-50 disabled:cursor-not-allowed text-dark font-bold py-3 rounded-sm transition-all text-sm uppercase tracking-wider"
          >
            {loading ? (
              <><Loader2 size={16} className="animate-spin" /> Signing in...</>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <p className="text-center text-white/20 text-xs mt-6">
          Default: admin@site.com / Admin@123
        </p>
      </div>
    </div>
  );
}
