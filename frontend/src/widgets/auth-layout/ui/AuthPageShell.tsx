import Image from "next/image";

interface AuthPageShellProps {
  imageSrc: string;
  imageAlt: string;
  overlayText: string;
  minHeight?: string;
  children: React.ReactNode;
}

export function AuthPageShell({
  imageSrc,
  imageAlt,
  overlayText,
  minHeight = "600px",
  children,
}: AuthPageShellProps) {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-2xl overflow-hidden border border-white/[0.06] shadow-[0_40px_120px_rgba(0,0,0,0.8)]">
        <div className="relative hidden lg:block" style={{ minHeight }}>
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            className="object-cover"
            sizes="50vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#050505]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/60 via-transparent to-[#050505]/30" />

          <div className="absolute bottom-8 left-8 right-8">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#eab308]/80 mb-2">
              LTX-VIDEO
            </p>
            <p className="text-white/60 text-sm font-medium leading-relaxed max-w-xs">
              {overlayText}
            </p>
          </div>
        </div>

        <div className="bg-[#0a0a0a]/90 backdrop-blur-xl p-8 sm:p-12 lg:p-14 flex flex-col justify-center">
          {children}
        </div>
      </div>
    </div>
  );
}
