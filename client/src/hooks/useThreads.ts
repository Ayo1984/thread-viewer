import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axios";
import { Thread } from "@/utils/types";

async function fetchThreads(signal?: AbortSignal): Promise<Thread[]> {
  const { data } = await axiosInstance.get<Thread[]>("/threads", {
    signal,
  });
  return data;
}

export function useThreads(query: string) {
  const { data: threads = [], isLoading, error } = useQuery({
    queryKey: ["threads"],
    queryFn: ({ signal }) => fetchThreads(signal),
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return threads;
    return threads.filter(t =>
      t.title.toLowerCase().includes(q)
    );
  }, [threads, query]);

  return {
    threads: filtered,
    loading: isLoading,
    error: error instanceof Error ? error.message : null,
  };
}
