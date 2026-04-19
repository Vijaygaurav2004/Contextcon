import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Signal — Deep Research for GTM",
  description:
    "Describe your ideal prospects in plain English. Get a sourced, ranked list with personalized outreach in under 60 seconds. Powered by Crustdata.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-ink-950 text-ink-200 antialiased">
        {children}
      </body>
    </html>
  );
}
