import { Layout } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { requireSession } from '@/shared/lib/server-permissions';

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireSession();

  return (
    <div className="min-h-screen bg-[#050505]">
      <header className="border-b border-white/[0.06] bg-[#050505]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center space-x-3 group">
            <div className="w-8 h-8 bg-gradient-to-br from-[#eab308] to-[#ca8a04] rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.15)] group-hover:scale-105 transition-transform duration-300">
              <Layout className="text-black w-4 h-4" />
            </div>
            <span className="text-sm font-black tracking-tight uppercase">
              LTX-<span className="text-[#eab308]">VIDEO</span>
            </span>
          </Link>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
