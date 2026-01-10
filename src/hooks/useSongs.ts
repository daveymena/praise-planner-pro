import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import type { Database } from "@/integrations/supabase/types";

type Song = Database['public']['Tables']['songs']['Row'];

export const useSongs = (filters?: { type?: string; favorite?: boolean; search?: string }) => {
  return useQuery<Song[]>({
    queryKey: ['songs', filters],
    queryFn: async () => {
      const data = await apiClient.getSongs(filters);
      return data as Song[];
    },
  });
};

export const useSong = (id: string) => {
  return useQuery({
    queryKey: ['song', id],
    queryFn: () => apiClient.getSong(id),
    enabled: !!id,
  });
};

export const useCreateSong = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (song: any) => apiClient.createSong(song),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songs'] });
    },
  });
};

export const useUpdateSong = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...updates }: any) => apiClient.updateSong(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['songs'] });
      queryClient.invalidateQueries({ queryKey: ['song', data.id] });
    },
  });
};

export const useToggleSongFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, is_favorite }: { id: string; is_favorite: boolean }) =>
      apiClient.toggleSongFavorite(id, is_favorite),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songs'] });
    },
  });
};

export const useDeleteSong = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteSong(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songs'] });
    },
  });
};