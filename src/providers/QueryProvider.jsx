import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Create a client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
            staleTime: 60 * 1000, // 1 minute
            cacheTime: 5 * 60 * 1000, // 5 minutes
            onError: (error) => {
                console.error('Query error:', error);
            },
        },
        mutations: {
            retry: 0,
            onError: (error) => {
                console.error('Mutation error:', error);
            },
        },
    },
});

export function QueryProvider({ children }) {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
            {/* DevTools only in development */}
            {import.meta.env.DEV && (
                <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
            )}
        </QueryClientProvider>
    );
}

export { queryClient };
