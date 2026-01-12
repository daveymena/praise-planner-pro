import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export const useServices = () => {
  return useQuery({
    queryKey: ['services'],
    queryFn: () => apiClient.getServices(),
  });
};

export const useUpcomingServices = () => {
  return useQuery({
    queryKey: ['services', 'upcoming'],
    queryFn: () => apiClient.getUpcomingServices(),
  });
};

export const useService = (id: string) => {
  return useQuery({
    queryKey: ['service', id],
    queryFn: () => apiClient.getService(id),
    enabled: !!id,
  });
};

export const useCreateService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (service: any) => apiClient.createService(service),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
};

export const useUpdateService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...updates }: any) => apiClient.updateService(id, updates),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['service', data.id] });
    },
  });
};

export const useDeleteService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
};