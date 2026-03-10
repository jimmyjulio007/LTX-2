export interface SeoPageData {
  slug: string;
  titleKey: string;
  keywords: string[];
}

export const SEO_PAGES: SeoPageData[] = [
  {
    slug: "ai-video-generator",
    titleKey: "aiVideoGenerator",
    keywords: ["AI video generator", "text to video AI", "AI video maker"],
  },
  {
    slug: "text-to-video",
    titleKey: "textToVideo",
    keywords: ["text to video", "convert text to video", "AI text video"],
  },
  {
    slug: "image-to-video",
    titleKey: "imageToVideo",
    keywords: ["image to video AI", "animate image", "photo to video"],
  },
  {
    slug: "ai-filmmaking",
    titleKey: "aiFilmmaking",
    keywords: ["AI filmmaking", "AI cinema", "AI movie maker"],
  },
  {
    slug: "cinematic-ai",
    titleKey: "cinematicAi",
    keywords: ["cinematic AI", "cinematic video generation", "AI cinematography"],
  },
];
