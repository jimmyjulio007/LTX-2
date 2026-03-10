import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/api-client";

interface ExportRequest {
  job_id: string;
  format: "mp4" | "webm" | "prores" | "gif";
  quality: "720p" | "1080p" | "4k";
  fps: number;
  alpha: boolean;
}

interface ExportResponse {
  export_id: string;
  download_url: string;
  status: string;
}

export function useExportVideo() {
  return useMutation<ExportResponse, Error, ExportRequest>({
    mutationFn: async (payload) => {
      const { data } = await apiClient.post("/export", payload);
      return data;
    },
  });
}
