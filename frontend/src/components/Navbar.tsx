"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled
        ? "py-4 bg-white/80 backdrop-blur-2xl border-b border-slate-100/50 shadow-sm"
        : "py-5 bg-transparent"
        }`}
    >
      <div className="container flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 md:gap-3 group">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-brand-primary rounded-lg md:rounded-xl flex items-center justify-center text-white font-black text-sm md:text-lg shadow-lg shadow-brand-primary/20 group-hover:scale-110 transition-all">
            P
          </div>
          <span className="text-xl md:text-2xl font-black text-slate-900 tracking-tighter">
            PrepBuddy
          </span>
        </Link>

        {/* Auth Buttons */}
        <div className="flex items-center gap-4 md:gap-8">
          <Link href="/login" className="px-4 md:px-5 py-2 md:py-2.5 text-[14px] md:text-[15px] font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-all rounded-lg md:rounded-xl shadow-sm active:scale-95">
            Login
          </Link>
          <Link
            href="/register"
            className="flex items-center gap-2 px-5 md:px-6 py-2 md:py-2.5 bg-brand-primary text-white text-[14px] md:text-[15px] font-bold rounded-lg md:rounded-xl hover:bg-emerald-600 transition-all shadow-primary-glow active:scale-95"
          >
            <span>Register</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
