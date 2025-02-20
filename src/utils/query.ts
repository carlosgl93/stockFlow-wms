import {
  DefinedQueryObserverResult,
  QueryClient,
  QueryKey,
  useQuery as useReactQuery,
  UseQueryOptions,
} from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Refetches the query when the window regains focus
      refetchOnWindowFocus: false,
      // Refetches the query when the component mounts
      refetchOnMount: false,
      refetchOnReconnect: true,
    },
  },
});

export function useQuery<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
>(options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>) {
  return useReactQuery<TQueryFnData, TError, TData, TQueryKey>({
    staleTime: 2000,
    ...options,
  }) as DefinedQueryObserverResult<TData, TError>;
}
