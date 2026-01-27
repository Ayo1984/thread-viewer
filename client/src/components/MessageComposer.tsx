"use client";

import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/utils/axios";
import { SendIcon } from "@/utils/icons";

type Props = {
  threadId: string;
};

export function MessageComposer({ threadId }: Props) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (t: string) => axiosInstance.post(`/threads/${threadId}/messages`, { text: t }),
  });

  const onSend = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || mutation.isPending) return;

    try {
      await mutation.mutateAsync(trimmed);
      setText("");
      setError(null);
    } catch {
      setError("Failed to send message");
    }
  }, [text, mutation]);

  return (
    <form onSubmit={onSend} className="border-t border-gray-200 p-3 flex gap-2 shrink-0">
      {error
       ? <div className="bg-red-800 text-sm absolute left-1/2 bottom-20 text-white px-4 py-2 rounded-md">{error}</div>
       : null
      }
      <input
        type="text"
        className="flex-1 text-dark dark:text-white rounded-md border border-dark/50 dark:border-gray-300 px-3 py-2 outline-none focus:border-dark dark:focus:border-primary/50"
        placeholder="Reply…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={mutation.isPending}
      />
      <button
        type="submit"
        className="rounded-full bg-primary text-black p-3 disabled:opacity-50"
        disabled={mutation.isPending || !text.trim()}
      >
        <SendIcon className="w-5 h-5" />
      </button>
    </form>
  );
}
