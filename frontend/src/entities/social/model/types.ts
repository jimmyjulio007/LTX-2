export interface SocialAccount {
  id: string;
  provider: 'tiktok' | 'instagram' | 'meta';
  provider_user_id: string;
  username: string;
  expires_at?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface SocialPost {
  id: string;
  job_id: string;
  social_account_id: string;
  status: 'PENDING' | 'PUBLISHED' | 'FAILED';
  platform_post_id?: string;
  error_message?: string;
  published_at?: string;
  created_at: string;
}

export interface LinkAccountResponse {
  status: string;
  message: string;
}
