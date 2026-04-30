import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useAivioSettings() {
  const query = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      return {
        profile: { name: 'Георгий', email: 'kuzevanovgeorgiy@gmail.com', role: 'admin' },
        company: { name: 'Aivio Inc', timezone: 'МСК', currency: 'RUB' },
        subscription: { plan: 'Aivio Pro', status: 'active', periodEnd: '12 дней' },
      };
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (patch: any) => {
      await new Promise(r => setTimeout(r, 600));
      return patch;
    },
    onSuccess: () => {
      toast.success('Изменения сохранены');
    },
  });

  return {
    settings: query.data,
    isLoading: query.isLoading,
    updateProfile: (patch: any) => updateProfileMutation.mutate(patch),
  };
}
