"use client";
import { useState, useCallback } from "react";
import { useThreads } from "@/hooks/useThreads";
import { Thread } from "@/utils/types";
import { formatDate } from "@/utils";
import { CrossIcon } from "@/utils/icons";

type Props = {
  selectedThreadId: string | null;
  onSelect: (id: string, title: string) => void;
};

export function ThreadList({ selectedThreadId, onSelect }: Props) {
  const [query, setQuery] = useState("");
  const { threads, loading, error } = useThreads(query);

  const handleSelect = useCallback(
    (id: string, title: string) => () => onSelect(id, title),
    [onSelect]
  );

  return (
    <aside className="w-[300px] border-r border-gray-300 flex flex-col h-full overflow-hidden">
      <div className="flex border-b border-gray-300">
        <input
          placeholder="Search threads…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="py-2.5 px-4 flex-1 focus:outline-none shrink-0"
        />
        { query
          ? <button className="p-2.5 cursor-pointer" onClick={() => setQuery("")}>
            <CrossIcon className="w-5 h-5 hover:text-red-600" />
          </button>
          : null
        }
      </div>
      {loading && <p className="p-4 text-gray-600 shrink-0">Loading…</p>}
      {error && <p className="p-4 text-red-600 shrink-0">{error}</p>}

      <ul className="list-none overflow-y-auto flex-1 min-h-0">
        {threads.map((t: Thread) => (
          <li
            key={t.id}
            onClick={handleSelect(t.id, t.title)}
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
