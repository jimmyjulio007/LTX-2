import { apiClient } from "@/shared/api/api-client";
import { SocialAccount, SocialPost } from "../model/types";

export const socialService = {
  /**
   * Get all linked social accounts for the current user
   */
  async getAccounts(): Promise<SocialAccount[]> {
    const response = await apiClient.get<SocialAccount[]>("/ads/social/accounts");
    return response.data;
  },

  /**
   * Start OAuth flow for a provider
   */
  authorize(provider: string) {
    // Redirect to the backend authorization endpoint
    window.location.href = `${apiClient.defaults.baseURL}/ads/social/${provider}/authorize`;
  },

  /**
   * Publish a completed video job to a social account
   */
  async publishToSocial(jobId: string, socialAccountId: string): Promise<{ status: string; post_id: string }> {
    const response = await apiClient.post<{ status: string; post_id: string }>(
      `/ads/social/publish/${jobId}`,
      null,
      { params: { social_account_id: socialAccountId } }
    );
    return response.data;
  }
};
