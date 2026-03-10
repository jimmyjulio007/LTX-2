import { apiClient } from '@/shared/api/api-client';
import { 
  AudioToVideoCreate, 
  ExtendCreate, 
  ImageToVideoCreate, 
  JobResponse, 
  RetakeCreate, 
  TextToVideoCreate, 
  UploadResponse, 
  VideoJob 
} from '../model/types';

export const videoJobService = {
  // --- Generation Endpoints ---
  
  createTextToVideo: async (data: TextToVideoCreate): Promise<JobResponse> => {
    const response = await apiClient.post<JobResponse>('/jobs/text-to-video', data);
    return response.data;
  },

  createImageToVideo: async (data: ImageToVideoCreate): Promise<JobResponse> => {
    const response = await apiClient.post<JobResponse>('/jobs/image-to-video', data);
    return response.data;
  },

  createAudioToVideo: async (data: AudioToVideoCreate): Promise<JobResponse> => {
    const response = await apiClient.post<JobResponse>('/jobs/audio-to-video', data);
    return response.data;
  },

  createRetake: async (data: RetakeCreate): Promise<JobResponse> => {
    const response = await apiClient.post<JobResponse>('/jobs/retake', data);
    return response.data;
  },

  createExtend: async (data: ExtendCreate): Promise<JobResponse> => {
    const response = await apiClient.post<JobResponse>('/jobs/extend', data);
    return response.data;
  },

  // --- Status & Management ---

  getJob: async (jobId: string): Promise<VideoJob> => {
    const response = await apiClient.get<VideoJob>(`/jobs/${jobId}`);
    return response.data;
  },

  getUserJobs: async (): Promise<VideoJob[]> => {
    const response = await apiClient.get<VideoJob[]>('/jobs/my-jobs');
    return response.data;
  },

  // --- Upload ---

  uploadMedia: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<UploadResponse>('/v1/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
