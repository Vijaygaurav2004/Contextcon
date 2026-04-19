import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Signal — Know When to Strike",
  description:
    "Watch your target accounts for buying signals: fresh funding, new executives, growth spikes, champion moves. Strike the moment a signal fires. Powered by Crustdata.",
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
