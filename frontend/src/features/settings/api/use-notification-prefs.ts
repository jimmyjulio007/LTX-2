import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/api-client";

interface NotificationPrefs {
  email_on_completion: boolean;
  email_on_failure: boolean;
  email_marketing: boolean;
}

export function useNotificationPrefs() {
  return useQuery<NotificationPrefs>({
    queryKey: ["notification-prefs"],
    queryFn: async () => {
      const { data } = await apiClient.get("/notifications/preferences");
      return data;
    },
  });
}

export function useUpdateNotificationPrefs() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (prefs: Partial<NotificationPrefs>) => {
      const { data } = await apiClient.patch("/notifications/preferences", null, {
        params: prefs,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-prefs"] });
    },
  });
}
