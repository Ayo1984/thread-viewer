"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useThreadMessagesInfinite } from "@/hooks/useThreadsMessages";
import { useThreadStream } from "@/hooks/useThreadStream";
import { MessageComposer } from "@/components/MessageComposer";
import { MessageListVirtual } from "@/components/MessageListVirtual";
import { ArrowIcon } from "@/utils/icons";

type Props = {
  threadId: string | null;
};

export function MessagePane({ threadId }: Props) {
  useThreadStream(threadId);

  const threadMessages = useThreadMessagesInfinite(threadId);
  const { messages, hasNextPage, isFetchingNextPage, fetchNextPage, loading, error } = threadMessages;

  const isAtBottomRef = useRef(true);
  const [showNewPill, setShowNewPill] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [jumpToken, setJumpToken] = useState<number>(0);
  const lastMsgIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (messages?.length) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg?.id !== lastMsgIdRef.current) {
        lastMsgIdRef.current = lastMsg?.id;
        if (!isAtBottomRef.current) {
          setTimeout(() => {
            if (!isAtBottomRef.current) {
              setShowNewPill(true);
            }
          }, 100);
        }
      }
    }
  }, [messages]);

  const onAtBottomChange = useCallback((atBottom: boolean) => {
    isAtBottomRef.current = atBottom;
    if (atBottom) {
      setShowNewPill(false);
      setShowScrollButton(false);
    } else if (messages.length > 0) {
      setShowScrollButton(true);
    }
  }, [messages.length]);

  const onLoadOlder = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const onJumpToBottom = () => {
    setShowNewPill(false);
    setJumpToken(prev => prev + 1);
  };

  if (!threadId) {
    return (
      <section className="flex-1 flex items-center justify-center text-gray-500">
        Select a thread
      </section>
    );
  }

  return (
    <section className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
      <header className="border-b border-gray-200 p-3 shrink-0">
        <div className="text-sm dark:text-white">
          Thread: <span className="font-medium dark:text-primary/80">{threadId}</span>
        </div>
      </header>

      <section className="flex-1 relative min-h-0 overflow-hidden">
        {loading ? <p className="p-4 text-gray-500">Loading messages…</p> : null}
        {error ? <p className="p-4 text-red-600">{error}</p>: null}

        {!loading && !error ?
          <>
            {showNewPill ?
              <button
                className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 rounded-full bg-black dark:bg-primary text-white dark:text-dark px-4 py-2 text-sm font-medium shadow cursor-pointer"
                onClick={onJumpToBottom}
              >
                New messages
              </button>
              : null
            }
            <MessageListVirtual
                resetKey={threadId}
                messages={messages}
                hasOlder={!!hasNextPage}
                isFetchingOlder={isFetchingNextPage}
                onLoadOlder={onLoadOlder}
                onAtBottomChange={onAtBottomChange}
                jumpToBottomSignal={jumpToken}
            />
            {showScrollButton ?
              <ArrowIcon
                className="absolute bottom-4 right-16 rotate-270 z-10 w-8 h-8 bg-primary/80 text-dark p-1.5 rounded-full cursor-pointer hover:bg-primary"
                onClick={onJumpToBottom}
              />
              : null
            }
          </>
          : null
        }
      </section>
      <MessageComposer threadId={threadId} />
    </section>
  );
}
