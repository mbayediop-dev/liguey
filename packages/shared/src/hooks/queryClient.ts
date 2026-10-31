import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

/** Clés de cache centralisées (utilisées par les requêtes, les actions et le realtime). */
export const keys = {
  services: ['services'] as const,
  vatRates: ['vat-rates'] as const,
  legal: (slug: string) => ['legal', slug] as const,
  profile: (id: string) => ['profile', id] as const,
  missions: ['missions'] as const,
  mission: (id: string) => ['mission', id] as const,
  liveRequests: ['live-requests'] as const,
  messages: (missionId: string) => ['messages', missionId] as const,
  conversations: ['conversations'] as const,
  unread: ['unread'] as const,
  notifications: ['notifications'] as const,
  reviews: (targetId: string) => ['reviews', targetId] as const,
  myReview: (missionId: string) => ['my-review', missionId] as const,
  paymentMethods: ['payment-methods'] as const,
  proDocuments: (proId: string) => ['pro-documents', proId] as const,
  proServices: (proId: string) => ['pro-services', proId] as const,
  expenses: (missionId: string) => ['expenses', missionId] as const,
  reschedules: (missionId: string) => ['reschedules', missionId] as const,
  proStats: ['pro-stats'] as const,
  availableCount: (serviceId: string) => ['available-count', serviceId] as const,
  signed: (bucket: string, path: string) => ['signed', bucket, path] as const,
};
