import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="container py-24">
      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-primary mb-4">Terms</p>
      <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Terms of Use</h1>
      <p className="text-slate-600 max-w-2xl leading-relaxed">
        This is a simple placeholder terms page for PrepCat. Replace it with your final terms when ready.
      </p>
      <div className="mt-8">
        <Link href="/" className="text-brand-primary font-semibold hover:underline">Back to home</Link>
      </div>
    </main>
  );
}
