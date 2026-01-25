"use client";

import {
    isServer,
    QueryClient,
    QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryStreamedHydration } from "@tanstack/react-query-next-experimental";

let clientQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
    if (isServer) {
        // Server: always make a new query client
        return makeQueryClient();
    } else {
        // Browser: make a new query client if we don't already have one
        if (!clientQueryClient) clientQueryClient = makeQueryClient();
        return clientQueryClient;
    }
}

/**
 * Error Handling Strategy:
 *
 * 1. React Query is configured to retry failed requests (2 attempts with exponential backoff)
 * 2. After retries are exhausted, errors propagate to the nearest ErrorBoundary
 * 3. Use <PageBoundary> or <QueryBoundary> to wrap components that fetch data
 * 4. For Server Components, use try/catch and error.tsx files
 *
 * @see src/core/components/page-boundary.tsx
 */
function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                refetchOnWindowFocus: false,
                // Retry failed requests twice with exponential backoff
                retry: 2,
                retryDelay: (attemptIndex) =>
                    Math.min(1000 * 2 ** attemptIndex, 10000),
                // With SSR, we usually want to set some default staleTime
                // above 0 to avoid refetching immediately on the client
                staleTime: 60 * 1000,
            },
        },
    });
}

export default function QueryProvider({ children }: React.PropsWithChildren) {
    const queryClient = getQueryClient();

    return (
        <QueryClientProvider client={queryClient}>
            <ReactQueryStreamedHydration>
                {children}
            </ReactQueryStreamedHydration>
        </QueryClientProvider>
    );
}
