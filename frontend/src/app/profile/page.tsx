"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  LogOut,
  ChevronLeft,
  Loader2,
  Trophy,
  ArrowLeft
} from "lucide-react";
import api from "@/lib/api";

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data);
      } catch (err) {
        console.error("Failed to fetch user data", err);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("prepcat_user");
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-brand-primary" size={48} />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <button 
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-slate-500 hover:text-brand-primary font-bold transition-colors"
          >
            <div className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center shadow-sm">
              <ArrowLeft size={16} />
            </div>
            Back to Dashboard
          </button>
        </div>

        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="amazing-card relative overflow-hidden"
        >
          {/* Decorative Background Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row gap-8 items-start mb-10">
              <div className="w-24 h-24 rounded-2xl bg-brand-primary flex items-center justify-center text-white font-black text-4xl shadow-xl shadow-brand-primary/30 shrink-0">
                {user?.full_name?.charAt(0) || user?.username?.charAt(0) || "U"}
              </div>
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">
                  My Profile
                </h1>
                <p className="text-slate-500 font-medium max-w-md">
                  View and manage your account details. Currently signed in as a PrepCat Student.
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest mt-4">
                  <ShieldCheck size={14} /> Official Aspirant
                </div>
              </div>
            </div>

            <div className="grid gap-4 mb-10">
              {/* Profile Details List */}
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-400 flex items-center justify-center shrink-0">
                  <User size={18} />
                </div>
                <div className="flex-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Full Name</div>
                  <div className="font-bold text-slate-900">{user?.full_name || "N/A"}</div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-400 flex items-center justify-center shrink-0">
                  <Mail size={18} />
                </div>
                <div className="flex-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Email Address</div>
                  <div className="font-bold text-slate-900">{user?.email || "N/A"}</div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-400 flex items-center justify-center shrink-0">
                  <Trophy size={18} />
                </div>
                <div className="flex-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Aspirant ID</div>
                  <div className="font-bold text-slate-900">PB-{user?.id?.toString().padStart(4, '0')}</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-100">
              <button 
                onClick={handleLogout}
                className="btn-amazing-outline !border-blue-100 !text-blue-600 hover:!bg-blue-50 flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <LogOut size={18} /> Sign Out
              </button>
              <div className="text-xs font-medium text-slate-400 text-center sm:text-left flex items-center flex-1 justify-center sm:justify-end">
                To update your details, contact an administrator.
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
