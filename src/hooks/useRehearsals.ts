import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import type { Rehearsal } from '@/types/api';

export const useRehearsals = () => {
  return useQuery<Rehearsal[]>({
    queryKey: ['rehearsals'],
    queryFn: () => apiClient.getRehearsals() as Promise<Rehearsal[]>,
  });
};

export const useUpcomingRehearsals = () => {
  return useQuery<Rehearsal[]>({
    queryKey: ['rehearsals', 'upcoming'],
    queryFn: () => apiClient.getUpcomingRehearsals() as Promise<Rehearsal[]>,
  });
};

export const useRehearsal = (id: string) => {
  return useQuery({
    queryKey: ['rehearsal', id],
    queryFn: () => apiClient.getRehearsal(id),
    enabled: !!id,
  });
};

export const useCreateRehearsal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (rehearsal: any) => apiClient.createRehearsal(rehearsal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rehearsals'] });
    },
  });
};

export const useUpdateRehearsal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...updates }: any) => apiClient.updateRehearsal(id, updates),
    onSuccess: (data: Rehearsal) => {
      queryClient.invalidateQueries({ queryKey: ['rehearsals'] });
      queryClient.invalidateQueries({ queryKey: ['rehearsal', data.id] });
    },
  });
};

export const useDeleteRehearsal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteRehearsal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rehearsals'] });
    },
  });
};

export const useUpdateAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ rehearsalId, memberId, status }: { rehearsalId: string; memberId: string; status: string }) =>
      apiClient.updateRehearsalAttendance(rehearsalId, memberId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rehearsals'] });
    },
  });
};