import { useEffect } from "react";
import { useQueryClient, InfiniteData } from "@tanstack/react-query";
import { MessagesPage, Message, Thread } from "@/utils/types";
import { SERVER_URL } from "@/utils/constants";

function openThreadStream(threadId: string): EventSource {
  return new EventSource(`${SERVER_URL}/threads/${threadId}/stream`);
}

export function useThreadStream(threadId: string | null) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!threadId) return;

    const es = openThreadStream(threadId);

    const onMessage = (evt: MessageEvent) => {
      const parsed = JSON.parse(evt.data) as { message: Message };
      const msg = parsed.message;

      qc.setQueryData<InfiniteData<MessagesPage>>(["messages", threadId], (old) => {
        if (!old) return old;

        const pages = old.pages.slice();
        const lastIdx = pages.length - 1;
        const last = pages[lastIdx];

        if (last.items.some(m => m.id === msg.id)) return old;

        pages[lastIdx] = { ...last, items: [...last.items, msg] };
        return { ...old, pages };
      });

      qc.setQueryData<Thread[]>(["threads"], (oldThreads) => {
        if (!Array.isArray(oldThreads)) return oldThreads;
        return oldThreads
          .map((t) =>
            t.id === threadId ? { ...t, lastMessageAt: msg.createdAt } : t
          )
          .sort((a, b) => b.lastMessageAt - a.lastMessageAt);
      });
    };

    es.addEventListener("message", onMessage);

    return () => {
      es.removeEventListener("message", onMessage);
      es.close();
    };
  }, [threadId, qc]);
}
