import { useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axios";
import { MessagesPage } from "@/utils/types";

const PAGE_SIZE = 50;

async function fetchMessages(
  threadId: string,
  cursor: number | null,
  limit: number,
  signal?: AbortSignal
): Promise<MessagesPage> {
  const { data } = await axiosInstance.get<MessagesPage>(
    `/threads/${threadId}/messages`,
    {
      params: { cursor, limit },
      signal,
    }
  );
  return data;
}

export function useThreadMessagesInfinite(threadId: string | null) {
  const {
    data,
    isLoading,
    error,
    hasPreviousPage,
    fetchPreviousPage,
    isFetchingPreviousPage,
  } = useInfiniteQuery({
    queryKey: ["messages", threadId],
    enabled: !!threadId,
    initialPageParam: null as number | null,
    queryFn: ({ pageParam, signal }) => {
      if (!threadId) throw new Error("No threadId");
      return fetchMessages(threadId, pageParam as number | null, PAGE_SIZE, signal);
    },
    getPreviousPageParam: (firstPage) => firstPage.nextCursor,
    getNextPageParam: () => undefined,
    staleTime: 10_000,
  });

  const messages = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.items);
  }, [data]);

  return {
    messages,
    loading: isLoading,
    error: error instanceof Error ? error.message : null,
    hasNextPage: hasPreviousPage,
    fetchNextPage: fetchPreviousPage,
    isFetchingNextPage: isFetchingPreviousPage,
  };
}
