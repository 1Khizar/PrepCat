"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Mail,
  Lock,
  ShieldCheck,
  AlertCircle,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    identifier: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.identifier || !formData.password) {
      setError("Identification required. Please fill in both fields.");
      return;
    }

    setLoading(true);

    try {
      // FastAPI expects OAuth2PasswordRequestForm as form-data
      const formDataParams = new FormData();
      formDataParams.append('username', formData.identifier);
      formDataParams.append('password', formData.password);

      const res = await api.post("/auth/login", formDataParams, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("prepBuddy_user", formData.identifier);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Invalid credentials. Please ensure you are registered.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-amazing-gradient relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-xl">
        <div className="amazing-card !p-8 md:!p-12 bg-white">
          <form className="space-y-8" onSubmit={handleSubmit}>
            {/* Simple Powerful Heading */}
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Welcome Back</h1>
              <p className="text-slate-500 font-medium text-sm">Sign in to your account to continue your preparation.</p>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-xs font-bold"
                >
                  <AlertCircle size={14} />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Login Form */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest pl-1">Email / Username</label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  <input
                    type="text"
                    placeholder="Email"
                    className="amazing-input !pl-14 !py-3.5"
                    value={formData.identifier}
                    onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Password</label>
                  <Link href="#" className="text-[10px] font-semibold text-brand-primary uppercase tracking-widest hover:underline underline-offset-4">Forgot?</Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  <input
                    type="password"
                    placeholder="Password"
                    className="amazing-input !pl-14 !py-3.5"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-amazing w-full py-4 text-base group disabled:opacity-50 !rounded-xl shadow-xl"
              >
                {loading ? "Signing In..." : "Sign In to Academy"}
                {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex items-center">
              <div className="flex-grow border-t border-slate-100"></div>
              <span className="flex-shrink mx-4 text-[10px] font-medium text-slate-400 uppercase tracking-widest">Or Continue With</span>
              <div className="flex-grow border-t border-slate-100"></div>
            </div>

            {/* Social Login */}
            <div className="flex gap-4">
              <button type="button" className="flex-1 btn-amazing-outline py-3.5 !rounded-xl">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </button>
            </div>

            <p className="text-center text-xs font-medium text-slate-500">
              Don't have an account? <Link href="/register" className="text-brand-primary font-semibold hover:underline underline-offset-4">Register Free</Link>
            </p>
          </form>
        </div>

        {/* Footer Meta */}
        <div className="mt-8 flex justify-center items-center gap-6 text-[10px] font-medium text-slate-400 uppercase tracking-widest text-center">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-brand-primary" />
            Secure Hub Access
          </div>
          <div>Trusted by 25k+ Students 🇵🇰</div>
        </div>
      </div>
    </div>
  );
}
