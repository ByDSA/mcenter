"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient( {
  defaultOptions: {
    queries: {
      refetchInterval: 1_000 * 60 * 10,
      networkMode: "offlineFirst", // Si no hay conexión a internet, devuelve caché
    },
  },
} );

export function getQueryClient() {
  return queryClient;
}

export function GlobalQueryClientProvider( { children } ) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
