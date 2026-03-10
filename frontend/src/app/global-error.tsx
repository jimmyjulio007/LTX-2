"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased text-white min-h-screen bg-[#050505]">
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <p className="text-[120px] sm:text-[160px] font-black leading-none tracking-tighter bg-gradient-to-b from-red-500/30 to-red-500/[0.03] bg-clip-text text-transparent select-none">
              500
            </p>

            <h1 className="text-2xl sm:text-3xl font-bold text-white -mt-4 mb-3">
              Server Error
            </h1>

            <p className="text-slate-500 text-[15px] mb-8 leading-relaxed">
              Something went wrong on our end. Our team has been notified and is working on a fix.
            </p>

            <button
              onClick={reset}
              className="inline-block px-6 py-3 text-sm font-bold uppercase tracking-wider bg-[#eab308] text-black rounded-xl hover:bg-[#eab308]/90 transition-colors cursor-pointer"
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
