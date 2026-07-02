import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="container py-24">
      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-primary mb-4">About</p>
      <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">About PrepCat</h1>
      <p className="text-slate-600 max-w-2xl leading-relaxed">
        PrepCat helps Pakistani medical students practice smarter with structured MCQs, clear explanations, and progress tracking.
      </p>
      <div className="mt-8">
        <Link href="/" className="text-brand-primary font-semibold hover:underline">Back to home</Link>
      </div>
    </main>
  );
}
