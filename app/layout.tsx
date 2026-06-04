import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Orbital One Realty",
  description: "Novelty lunar property by Orbital One Realty",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <nav className="flex flex-wrap items-center justify-between border-b border-white/20 bg-black px-6 py-4 text-white">
          <a href="/" className="text-xl font-black text-yellow-400">
            Orbital One Realty
          </a>

          <div className="flex flex-wrap gap-4 text-sm font-bold uppercase tracking-wide">
            <a href="/">Home</a>
            <a href="/explore">Explore</a>
            <a href="/pricing">Pricing</a>
            <a href="/faq">FAQ</a>
            <a href="/hoa">HOA</a>
            <a href="/passports">Passports</a>
            <a href="/contact">Contact</a>
          </div>
        </nav>

        {children}
      </body>
    </html>
  );
}