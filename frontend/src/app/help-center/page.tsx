import Link from "next/link";

export default function HelpCenterPage() {
  return (
    <main className="container py-24">
      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-primary mb-4">Support</p>
      <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Help Center</h1>
      <p className="text-slate-600 max-w-2xl leading-relaxed">
        Use the dashboard, quiz section, and AI Tutor to study. If you need direct help, contact us on WhatsApp.
      </p>
      <div className="mt-8 flex gap-6">
        <Link href="/dashboard" className="text-brand-primary font-semibold hover:underline">Dashboard</Link>
        <Link href="https://wa.me/923448260340" target="_blank" rel="noopener noreferrer" className="text-brand-primary font-semibold hover:underline">Contact Us on WhatsApp</Link>
      </div>
    </main>
  );
}
