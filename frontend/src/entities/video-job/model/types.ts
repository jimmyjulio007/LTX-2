export type JobStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export type JobType = 'text-to-video' | 'image-to-video' | 'audio-to-video' | 'retake' | 'extend';

export interface VideoJob {
  id: string;
  job_type: JobType;
  status: JobStatus;
  progress: number;
  video_url?: string;
  runpod_job_id?: string;
  user_id: string;
  prompt: string;
  negative_prompt?: string;
  width: number;
  height: number;
  num_frames: number;
  frame_rate: number;
  model_tier?: 'draft' | 'standard' | 'premium';
  output_quality?: string;
  target_fps?: number;
  camera_motion?: string;
  motion_paths?: string;
  lora_model_id?: string;
  workspace_id?: string;
  watermark_enabled?: boolean;
  watermark_text?: string;
  c2pa_enabled?: boolean;
  thumbnail_url?: string;
  title?: string;
  created_at: string;
  updated_at: string;
}

export interface JobCreateBase {
  prompt: string;
  negative_prompt?: string;
  width?: number;
  height?: number;
  num_frames?: number;
  frame_rate?: number;
}

export interface TextToVideoCreate extends JobCreateBase {}

export interface ImageToVideoCreate extends JobCreateBase {
  image_uri: string;
}

export interface AudioToVideoCreate extends JobCreateBase {
  audio_uri: string;
}

export interface RetakeCreate extends JobCreateBase {
  video_uri: string;
  start_time: number;
  end_time: number;
}

export interface ExtendCreate extends JobCreateBase {
  video_uri: string;
  additional_frames?: number;
}

export interface JobResponse {
  id: string;
  job_type: JobType;
  status: JobStatus;
  progress: number;
  video_url?: string;
  runpod_job_id?: string;
  user_id: string;
  model_tier?: string;
  output_quality?: string;
}

export interface UploadResponse {
  storage_uri: string;
  filename: string;
}

// --- Marketplace ---
export interface MarketplaceTemplate {
  id: string;
  creator_id: string;
  name: string;
  name_fr: string;
  description: string;
  description_fr: string;
  prompt_text: string;
  negative_prompt?: string;
  category: string;
  thumbnail_url?: string;
  preview_video_url?: string;
  price_credits: number;
  total_sales: number;
  is_approved: boolean;
  created_at: string;
}

// --- Project ---
export interface Project {
  id: string;
  name: string;
  description?: string;
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectClip {
  id: string;
  project_id: string;
  job_id: string;
  position: number;
  start_trim: number;
  end_trim: number;
  transition_type: string;
  transition_duration: number;
}

// --- API Key ---
export interface ApiKey {
  id: string;
  key_prefix: string;
  name: string;
  permissions: string;
  rate_limit: number;
  total_requests: number;
  is_active: boolean;
  last_used_at?: string;
  created_at: string;
}

// --- LoRA ---
export interface LoraModel {
  id: string;
  name: string;
  status: string;
  training_images_count: number;
  trigger_word: string;
  model_url?: string;
  created_at: string;
  updated_at: string;
}

// --- Avatar ---
export interface Avatar {
  id: string;
  name: string;
  lora_model_id?: string;
  style_prompt: string;
  profile_image_url?: string;
  created_at: string;
}

export interface ScheduledPost {
  id: string;
  avatar_id: string;
  prompt: string;
  platform: string;
  scheduled_at: string;
  status: string;
  job_id?: string;
  created_at: string;
}

// --- Workspace ---
export interface Workspace {
  id: string;
  name: string;
  owner_id: string;
  plan: string;
  created_at: string;
}

export interface WorkspaceMember {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
}

// --- Ad Performance ---
export interface AdPerformance {
  id: string;
  campaign_id: string;
  job_id: string;
  platform: string;
  impressions: number;
  clicks: number;
  ctr: number;
  conversions: number;
  spend: number;
  is_active: boolean;
}
