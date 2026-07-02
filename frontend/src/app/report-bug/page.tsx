import Link from "next/link";

export default function ReportBugPage() {
  return (
    <main className="container py-24">
      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-primary mb-4">Support</p>
      <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Report a Bug</h1>
      <p className="text-slate-600 max-w-2xl leading-relaxed">
        If you find an issue, contact us on WhatsApp and include a screenshot plus the page where it happened.
      </p>
      <div className="mt-8">
        <Link href="https://wa.me/923448260340" target="_blank" rel="noopener noreferrer" className="text-brand-primary font-semibold hover:underline">
          Contact Us on WhatsApp
        </Link>
      </div>
    </main>
  );
}
