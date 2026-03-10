import { Metadata } from "next";
import { SharePageContent } from "@/features/share/ui/SharePageContent";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function getVideo(shareId: string) {
  const res = await fetch(`${API_URL}/gallery/public/${shareId}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) return null;
  return res.json();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const video = await getVideo(id);

  if (!video) {
    return { title: "Video Not Found | LTX-VIDEO" };
  }

  const title = video.title || "AI Generated Video";
  const description = video.prompt?.slice(0, 160) || "Created with LTX-VIDEO";

  return {
    title: `${title} | LTX-VIDEO`,
    description,
    openGraph: {
      type: "video.other",
      title,
      description,
      images: video.thumbnail_url ? [{ url: video.thumbnail_url }] : [],
      videos: video.video_url ? [{ url: video.video_url }] : [],
    },
    twitter: {
      card: "player",
      title,
      description,
      images: video.thumbnail_url ? [video.thumbnail_url] : [],
    },
  };
}

export default async function SharePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;
  const video = await getVideo(id);

  if (!video) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Video Not Found</h1>
          <p className="mt-2 text-slate-500">This video may have been removed or made private.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] px-4 py-12 sm:px-6 lg:px-8">
      <SharePageContent video={video} />
    </div>
  );
}
