"use client";

import Link from "next/link";
import { MessageCircle, Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-16 bg-white border-t border-slate-100 mt-20">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-14 mb-14">
          <div className="flex flex-col gap-6 md:col-span-2">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center">
                <span className="text-white font-black text-xl">P</span>
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-xl font-black text-slate-900">Prep<span className="text-brand-secondary">Cat</span></span>
                <span className="text-[10px] font-black uppercase tracking-[0.1em] text-brand-primary mt-1">Study Companion</span>
              </div>
            </Link>
            <p className="text-text-muted text-sm font-bold leading-relaxed max-w-sm">
              Empowering the next generation of Pakistani medical students with structured practice and data-driven insights.
            </p>
          </div>

          <div>
            <h4 className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-brand-primary mb-8">Product</h4>
            <ul className="flex flex-col gap-4">
              {[
                { label: "Dashboard", href: "/#dashboard" },
                { label: "Past Papers", href: "/#past-papers" },
                { label: "AI Tutor", href: "/#ai-tutor" },
                { label: "Progress", href: "/#progress" },
              ].map((link) => (
                <li key={link.label}>
                  <Link href={link.href} target="_self" className="text-text-main hover:text-brand-primary text-sm font-semibold transition-all hover:translate-x-1 inline-block">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-brand-primary mb-8">Resources</h4>
            <ul className="flex flex-col gap-4">
              {[
                { label: "About", href: "/#about" },
                { label: "FAQ", href: "/#faq" },
                { label: "Privacy Policy", href: "/#privacy" },
                { label: "Terms", href: "/#terms" },
              ].map((link) => (
                <li key={link.label}>
                  <Link href={link.href} target="_self" className="text-text-main hover:text-brand-primary text-sm font-semibold transition-all hover:translate-x-1 inline-block">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-brand-primary mb-8">Support</h4>
            <ul className="flex flex-col gap-4">
              {[
                { label: "Contact", href: "https://wa.me/923448260340" },
                { label: "Report Bug", href: "/#report-bug" },
                { label: "Help Center", href: "/#help-center" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    target="_self"
                    className="text-text-main hover:text-brand-primary text-sm font-semibold transition-all hover:translate-x-1 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-8 border-t border-slate-100">
          <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] flex items-center gap-2">
            MADE WITH <Heart size={12} className="text-brand-accent fill-brand-accent" /> FOR STUDENTS
          </div>
          <div className="flex gap-6 text-[10px] font-extrabold uppercase tracking-[0.3em] text-slate-400">
            <span>PrepCat</span>
            <span>MDCAT</span>
            <span>NUMS</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
