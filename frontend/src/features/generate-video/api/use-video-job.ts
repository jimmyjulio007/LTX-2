import { useQuery, useQueryClient } from '@tanstack/react-query';
import { videoJobService } from '@/entities/video-job/api/video-job.service';

export const useVideoJob = (jobId: string) => {
  return useQuery({
    queryKey: ['video-job', jobId],
    queryFn: () => videoJobService.getJob(jobId),
    enabled: !!jobId,
    // Poll every 3 seconds if the job is not completed or failed
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === 'COMPLETED' || status === 'FAILED') return false;
      return 3000;
    },
  });
};

export const useUserVideoJobs = () => {
  return useQuery({
    queryKey: ['video-jobs'],
    queryFn: () => videoJobService.getUserJobs(),
  });
};
