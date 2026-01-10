import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export const useMinistryRules = () => {
  return useQuery({
    queryKey: ['ministry-rules'],
    queryFn: () => apiClient.getRules(),
  });
};

export const useMinistryRulesByCategory = () => {
  return useQuery({
    queryKey: ['ministry-rules', 'by-category'],
    queryFn: async () => {
      const rules = await apiClient.getRules() as any[];
      return rules.reduce((acc: any, rule: any) => {
        const category = rule.category || 'General';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(rule);
        return acc;
      }, {});
    },
  });
};

export const useCreateMinistryRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (rule: any) => apiClient.createRule(rule),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ministry-rules'] });
    },
  });
};

export const useDeleteMinistryRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteRule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ministry-rules'] });
    },
  });
};