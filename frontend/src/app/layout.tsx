import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "PrepCat — Preparation for College Admission Test",
  description: "Crack MDCAT 2025 with Pakistan's smartest prep platform. AI-powered MCQ explanations, past papers (2015–2024), streaks, leaderboards, and real-time analytics. Join 200,000+ aspirants.",
  keywords: "MDCAT preparation, NUMS preparation, Pakistan medical entrance exam, MDCAT past papers, MCQ practice, MDCAT 2025",
  openGraph: {
    title: "PrepCat — Preparation for College Admission Test",
    description: "Pakistan's most powerful MDCAT prep platform with AI explanations, past papers & gamification.",
    type: "website",
  },
};

import { Inter, Plus_Jakarta_Sans, Bricolage_Grotesque } from "next/font/google";

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-inter',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
});

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-bricolage',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.variable} ${plusJakarta.variable} ${bricolage.variable} font-sans antialiased`} suppressHydrationWarning>
        {children}
        <Analytics />
      </body>
    </html>
  );
}

