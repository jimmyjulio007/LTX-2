export interface GalleryVideo {
  id: string;
  share_id: string | null;
  title: string | null;
  prompt: string;
  video_url: string;
  thumbnail_url: string | null;
  likes_count: number;
  views_count: number;
  user_id: string;
  created_at: string;
}

export interface GalleryResponse {
  items: GalleryVideo[];
  limit: number;
  offset: number;
}

export interface ShareVideo extends GalleryVideo {
  job_type: string;
  width: number;
  height: number;
  negative_prompt?: string;
  num_frames?: number;
  frame_rate?: number;
  creator: {
    name: string;
    image: string | null;
  };
}

export type GallerySortOption = "recent" | "popular" | "likes";
