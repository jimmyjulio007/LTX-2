import { useMutation, useQueryClient } from '@tanstack/react-query';
import { videoJobService } from '@/entities/video-job/api/video-job.service';
import { 
  AudioToVideoCreate, 
  ExtendCreate, 
  ImageToVideoCreate, 
  RetakeCreate, 
  TextToVideoCreate 
} from '@/entities/video-job/model/types';

export const useTextToVideo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TextToVideoCreate) => videoJobService.createTextToVideo(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['video-jobs'] });
      queryClient.setQueryData(['video-job', data.id], data);
    },
  });
};

export const useImageToVideo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ImageToVideoCreate) => videoJobService.createImageToVideo(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['video-jobs'] });
      queryClient.setQueryData(['video-job', data.id], data);
    },
  });
};

export const useAudioToVideo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AudioToVideoCreate) => videoJobService.createAudioToVideo(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['video-jobs'] });
      queryClient.setQueryData(['video-job', data.id], data);
    },
  });
};

export const useRetake = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RetakeCreate) => videoJobService.createRetake(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['video-jobs'] });
      queryClient.setQueryData(['video-job', data.id], data);
    },
  });
};

export const useExtend = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ExtendCreate) => videoJobService.createExtend(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['video-jobs'] });
      queryClient.setQueryData(['video-job', data.id], data);
    },
  });
};

export const useUploadMedia = () => {
  return useMutation({
    mutationFn: (file: File) => videoJobService.uploadMedia(file),
  });
};
