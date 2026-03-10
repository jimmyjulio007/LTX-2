import { apiClient } from "@/shared/api/api-client";
import type { ReferralStats } from "../model/types";

export async function getReferralCode(): Promise<{ referral_code: string }> {
  const { data } = await apiClient.get("/referrals/my-code");
  return data;
}

export async function getReferralStats(): Promise<ReferralStats> {
  const { data } = await apiClient.get("/referrals/stats");
  return data;
}

export async function validateReferralCode(
  code: string,
): Promise<{ valid: boolean; referrer_name: string }> {
  const { data } = await apiClient.post(`/referrals/validate/${code}`);
  return data;
}

export async function completeReferral(
  code: string,
): Promise<{ status: string; credits_awarded: number }> {
  const { data } = await apiClient.post("/referrals/complete", null, {
    params: { code },
  });
  return data;
}
