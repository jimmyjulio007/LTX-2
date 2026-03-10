import { getTranslations } from 'next-intl/server';
import { requireSession } from '@/shared/lib/server-permissions';
import DashboardContent from './DashboardContent';

export async function generateMetadata() {
  const t = await getTranslations('Dashboard');
  return { title: t('title') };
}

export default async function DashboardPage() {
  const session = await requireSession();

  return <DashboardContent user={session.user} />;
}
