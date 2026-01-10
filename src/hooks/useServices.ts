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

export const useCreateService = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (service: any) => apiClient.createService(service),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
};