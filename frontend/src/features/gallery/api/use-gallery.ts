import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPublicVideos, toggleLike } from "@/entities/gallery/api/gallery.service";
import type { GallerySortOption } from "@/entities/gallery/model/types";

export function useGalleryVideos(sort: GallerySortOption = "recent") {
  return useInfiniteQuery({
    queryKey: ["gallery", sort],
    queryFn: ({ pageParam = 0 }) => getPublicVideos(sort, 20, pageParam),
    getNextPageParam: (lastPage) => {
      if (lastPage.items.length < lastPage.limit) return undefined;
      return lastPage.offset + lastPage.limit;
    },
    initialPageParam: 0,
  });
}

export function useToggleLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobId: string) => toggleLike(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gallery"] });
    },
  });
}
