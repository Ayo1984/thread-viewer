"use client";
import { useState, useCallback } from "react";
import { useThreads } from "@/hooks/useThreads";
import { Thread } from "@/utils/types";
import { formatDate } from "@/utils";

type Props = {
  selectedThreadId: string | null;
  onSelect: (id: string) => void;
};

export function ThreadList({ selectedThreadId, onSelect }: Props) {
  const [query, setQuery] = useState("");
  const { threads, loading, error } = useThreads(query);

  const handleSelect = useCallback(
    (id: string) => () => onSelect(id),
    [onSelect]
  );

  return (
    <aside className="w-[300px] border-r border-gray-300 flex flex-col h-full overflow-hidden">
      <input
        placeholder="Search threads…"
        value={query}
        onChange={e => setQuery(e.target.value)}
        className="w-full py-2 px-4 border-b border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary shrink-0"
      />

      {loading && <p className="p-4 text-gray-600 shrink-0">Loading…</p>}
      {error && <p className="p-4 text-red-600 shrink-0">{error}</p>}

      <ul className="list-none overflow-y-auto flex-1 min-h-0">
        {threads.map((t: Thread) => (
          <li
            key={t.id}
            onClick={handleSelect(t.id)}
            className={`py-2 px-4 cursor-pointer transition-colors ${
              t.id === selectedThreadId
                ? "bg-primary/20 border-l-4 border-primary"
                : "hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            <div className="font-medium">{t.title}</div>
            <small className="text-gray-500 dark:text-gray-400">
              {formatDate(new Date(t.lastMessageAt))}
            </small>
          </li>
        ))}
      </ul>
    </aside>
  );
}
