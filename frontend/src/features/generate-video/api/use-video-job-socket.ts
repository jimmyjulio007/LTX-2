import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authClient } from '@/shared/lib/auth-client';
import type { VideoJob } from '@/entities/video-job/model/types';

/**
 * Hook pour écouter les mises à jour d'un job vidéo via WebSocket.
 * Améliore la fluidité en temps réel sans surcharger l'API de polling.
 */
export const useVideoJobSocket = (jobId: string | undefined) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!jobId) return;

    // Récupérer le token de session pour l'authentification WS
    // Note: Better Auth stocke la session en local, on peut récupérer le token
    // via authClient.getSession() pour être sûr d'avoir le dernier.
    const setupSocket = async () => {
      const { data: sessionData } = await authClient.getSession();
      const token = sessionData?.session?.token;

      if (!token) return;

      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const socketUrl = `${backendUrl.replace(/^http/, 'ws')}/ws/progress/${jobId}?token=${token}`;

      const socket = new WebSocket(socketUrl);

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Mettre à jour le cache TanStack Query avec les données reçues
          queryClient.setQueryData(['video-job', jobId], (oldData: VideoJob | undefined) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              ...data,
              updated_at: new Date().toISOString()
            };
          });

          // Invalider les listes globale si le job est terminé
          if (data.status === 'COMPLETED' || data.status === 'FAILED') {
            queryClient.invalidateQueries({ queryKey: ['video-jobs'] });
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      socket.onerror = (error) => {
        console.error('WebSocket Error:', error);
      };

      return socket;
    };

    let socketRef: WebSocket | undefined;
    setupSocket().then(socket => {
        socketRef = socket;
    });

    return () => {
      if (socketRef) {
        socketRef.close();
      }
    };
  }, [jobId, queryClient]);
};
