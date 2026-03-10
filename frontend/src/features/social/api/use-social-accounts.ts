import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { socialService } from "@/entities/social/api/social.service";

export const useSocialAccounts = () => {
  return useQuery({
    queryKey: ["social-accounts"],
    queryFn: () => socialService.getAccounts(),
  });
};

export const useLinkSocialAccount = () => {
  return {
    link: (provider: string) => socialService.authorize(provider)
  };
};

export const usePublishToSocial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ jobId, socialAccountId }: { jobId: string; socialAccountId: string }) =>
      socialService.publishToSocial(jobId, socialAccountId),
    onSuccess: () => {
      // Invalidate queries to refresh UI if needed
      queryClient.invalidateQueries({ queryKey: ["video-jobs"] });
    },
  });
};
