import { Layout } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { LocaleSwitcherFab } from '@/widgets/locale-switcher/ui/LocaleSwitcherFab';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#050505] flex flex-col">
      <header className="px-6 py-5 relative z-10">
        <Link href="/" className="inline-flex items-center space-x-3 group">
          <div className="w-9 h-9 bg-gradient-to-br from-[#eab308] to-[#ca8a04] rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.2)] group-hover:scale-105 transition-transform duration-300">
            <Layout className="text-black w-5 h-5" />
          </div>
          <span className="text-base sm:text-lg font-black tracking-tight uppercase">
            LTX-<span className="text-[#eab308]">VIDEO</span>
          </span>
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center">
        {children}
      </div>

      <LocaleSwitcherFab />
    </div>
  );
}
