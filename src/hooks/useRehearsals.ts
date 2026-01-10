import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export const useRehearsals = () => {
  return useQuery({
    queryKey: ['rehearsals'],
    queryFn: () => apiClient.getRehearsals(),
  });
};

export const useUpcomingRehearsals = () => {
  return useQuery({
    queryKey: ['rehearsals', 'upcoming'],
    queryFn: () => apiClient.getUpcomingRehearsals(),
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
    onSuccess: (data) => {
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