import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Signal — AI Sales Intelligence",
  description:
    "Find ideal prospects and monitor buying signals across your target accounts. Powered by Crustdata.",
  icons: { icon: "/icon.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#09090b] text-zinc-400 antialiased">
        <div className="noise-bg" aria-hidden="true" />
        <div className="top-gradient" aria-hidden="true" />
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
