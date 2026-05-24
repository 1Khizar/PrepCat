"use client";

import Link from "next/link";
import { Globe, Send, Camera, Share2, ArrowRight, Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="pt-32 pb-16 bg-white border-t border-slate-100 mt-20">
      <div className="container">

        {/* Friendly Pre-footer CTA */}
        <div className="bg-brand-primary rounded-[3rem] p-10 lg:p-24 mb-24 flex flex-col lg:flex-row items-center justify-between gap-10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[150px] transition-transform duration-1000 group-hover:scale-110" />

          <div className="relative z-10 text-center lg:text-left max-w-2xl">
            <h3 className="text-4xl lg:text-7xl font-black text-white mb-8 tracking-tighter leading-[0.9]">
              Start Your <br />
              Success <span className="text-brand-accent">Story!</span>
            </h3>
            <p className="text-white/80 font-bold text-lg lg:text-xl leading-relaxed">
              Join 25,000+ classmates and make your MDCAT preparation easy and fun.
            </p>
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <Link href="/register" className="bg-white text-brand-primary px-12 py-6 rounded-3xl font-black text-base shadow-2xl hover:scale-105 transition-all flex items-center gap-3">
              Join the Fun! <ArrowRight size={20} />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-24 mb-24">
          <div className="flex flex-col gap-8">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center">
                <span className="text-white font-black text-xl">P</span>
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-xl font-black text-slate-900">Prep<span className="text-brand-secondary">Buddy</span></span>
                <span className="text-[10px] font-black uppercase tracking-[0.1em] text-brand-primary mt-1">Academic Academy</span>
              </div>
            </Link>
            <p className="text-text-muted text-sm font-bold leading-relaxed">
              The friendliest study platform for MDCAT & NUMS success. We help you study smarter, not harder.
            </p>
            <div className="flex gap-4">
              {[Globe, Send, Camera, Share2].map((Icon, i) => (
                <Link key={i} href="#" className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-brand-primary hover:border-brand-primary hover:bg-white transition-all duration-300">
                  <Icon size={18} />
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary mb-10">Study Rooms</h4>
            <ul className="flex flex-col gap-5">
              {["Biology Practice", "Physics Practice", "Chemistry Practice", "English Practice"].map((link) => (
                <li key={link}>
                  <Link href="#" className="text-text-main hover:text-brand-primary text-sm font-black transition-all hover:translate-x-1 inline-block">{link}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary mb-10">Help Center</h4>
            <ul className="flex flex-col gap-5">
              {["Success Stories", "How to Use", "MDCAT Tips", "Study Schedule"].map((link) => (
                <li key={link}>
                  <Link href="#" className="text-text-main hover:text-brand-primary text-sm font-black transition-all hover:translate-x-1 inline-block">{link}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary mb-10">Say Hello!</h4>
            <div className="space-y-6">
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none">Email Us Any time</span>
                <div className="text-sm font-black text-text-navy pb-1">hello@prepbuddy.pk</div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none">Support Hotline</span>
                <div className="text-sm font-black text-text-navy tracking-tighter text-lg">+92 (300) 000-0000</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-slate-100 gap-8">
          <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] flex items-center gap-2">
            MADE WITH <Heart size={12} className="text-brand-accent fill-brand-accent" /> FOR STUDENTS
          </div>
          <div className="flex gap-10">
            {["Privacy", "Terms", "Support"].map((link) => (
              <Link key={link} href="#" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-brand-primary transition-colors">
                {link}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
