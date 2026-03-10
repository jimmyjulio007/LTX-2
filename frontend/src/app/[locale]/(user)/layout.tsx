import { requireSession } from '@/shared/lib/server-permissions';
import Sidebar from '@/widgets/sidebar/ui/Sidebar';
import TopBar from './TopBar';

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();

  return (
    <div className="flex h-screen bg-[#050505] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar user={session.user} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
