import { useQuery } from "@tanstack/react-query";
import { getReferralCode, getReferralStats } from "@/entities/referral/api/referral.service";

export function useReferralCode() {
  return useQuery({
    queryKey: ["referral-code"],
    queryFn: getReferralCode,
  });
}

export function useReferralStats() {
  return useQuery({
    queryKey: ["referral-stats"],
    queryFn: getReferralStats,
  });
}
