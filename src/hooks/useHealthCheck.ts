import { useQuery } from '@tanstack/react-query';
import { healthCheck } from '../apis/chat.api';

export const useHealthCheck = () =>
  useQuery({
    queryKey: ['health-check'],
    queryFn: healthCheck,
    refetchInterval: 30_000,
    retry: 1,
  });