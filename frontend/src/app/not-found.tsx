import { Inter } from "next/font/google";
import Link from "next/link";
import "./[locale]/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export default function RootNotFound() {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} font-sans antialiased text-white min-h-screen`}
      >
        <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <p className="text-[120px] sm:text-[160px] font-black leading-none tracking-tighter bg-gradient-to-b from-white/20 to-white/[0.03] bg-clip-text text-transparent select-none">
              404
            </p>

            <h1 className="text-2xl sm:text-3xl font-bold text-white -mt-4 mb-3">
              Page Not Found
            </h1>

            <p className="text-slate-500 text-[15px] mb-8 leading-relaxed">
              The page you&apos;re looking for doesn&apos;t exist or has been
              moved.
            </p>

            <Link
              href="/en"
              className="inline-block px-6 py-3 text-sm font-bold uppercase tracking-wider bg-[#eab308] text-black rounded-xl hover:bg-[#eab308]/90 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
