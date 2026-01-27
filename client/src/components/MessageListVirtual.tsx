"use client";
import React, { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { List, type RowComponentProps, useListRef } from "react-window";
import type { Message } from "@/utils/types";
import { ROW_HEIGHT, TOP_THRESHOLD, BOTTOM_THRESHOLD } from "@/utils/constants";

type Props = {
  resetKey: string;
  messages: Message[];
  hasOlder: boolean;
  isFetchingOlder: boolean;
  onLoadOlder: () => void;
  onAtBottomChange: (atBottom: boolean) => void;
  jumpToBottomSignal: number;
};

export function MessageListVirtual({
  resetKey,
  messages,
  hasOlder,
  isFetchingOlder,
  onLoadOlder,
  onAtBottomChange,
  jumpToBottomSignal,
}: Props) {
  const listRef = useListRef(null);
  const outerElRef = useRef<HTMLElement | null>(null);
  const atBottomRef = useRef(true);
  const scrollListenerAttachedRef = useRef(false);
  const scrollHandlerRef = useRef<((e: Event) => void) | null>(null);
  const hasScrolledToBottomForThreadRef = useRef<string | null>(null);
  const initialMessageCountRef = useRef<number | null>(null);

  const pendingPrependRef = useRef<{
    prevScrollHeight: number;
    prevScrollTop: number;
    prevCount: number;
  } | null>(null);

  const getOuterElement = useCallback(() => {
    return listRef.current?.element ?? null;
  }, [listRef]);

  const scrollToBottom = useCallback(() => {
    const el = getOuterElement();
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [getOuterElement]);

  const computeAtBottom = useCallback(() => {
    const el = getOuterElement();
    if (!el) return;

    const distance = el.scrollHeight - (el.scrollTop + el.clientHeight);
    const atBottom = distance <= BOTTOM_THRESHOLD;

    if (atBottom !== atBottomRef.current) {
      atBottomRef.current = atBottom;
      onAtBottomChange(atBottom);
    }
  }, [onAtBottomChange, getOuterElement]);

  const setupScrollListener = useCallback(() => {
    const el = getOuterElement();
    if (!el || scrollListenerAttachedRef.current) return;

    outerElRef.current = el;
    scrollListenerAttachedRef.current = true;

    const onScroll = () => {
      const currentEl = outerElRef.current;
      if (!currentEl) return;

      if (hasOlder && !isFetchingOlder && currentEl.scrollTop <= TOP_THRESHOLD) {
        pendingPrependRef.current = {
          prevScrollHeight: currentEl.scrollHeight,
          prevScrollTop: currentEl.scrollTop,
          prevCount: messages.length,
        };
        onLoadOlder();
      }
      computeAtBottom();
    };

    scrollHandlerRef.current = onScroll;
    el.addEventListener("scroll", onScroll, { passive: true });
    computeAtBottom();
  }, [hasOlder, isFetchingOlder, onLoadOlder, computeAtBottom, messages.length, getOuterElement]);

  useEffect(() => {
    scrollListenerAttachedRef.current = false;
    
    setupScrollListener();

    return () => {
      const el = outerElRef.current;
      const handler = scrollHandlerRef.current;
      if (el && handler) {
        el.removeEventListener("scroll", handler);
        scrollListenerAttachedRef.current = false;
        scrollHandlerRef.current = null;
      }
    };
  }, [setupScrollListener, resetKey]);

  useEffect(() => {
    if (hasScrolledToBottomForThreadRef.current !== resetKey) {
      hasScrolledToBottomForThreadRef.current = null;
      initialMessageCountRef.current = messages.length > 0 ? messages.length : null;
    }

    if (
      hasScrolledToBottomForThreadRef.current === resetKey ||
      messages.length === 0 ||
      initialMessageCountRef.current === null ||
      messages.length !== initialMessageCountRef.current
    ) {
      return;
    }

    const initialCount = initialMessageCountRef.current;
    const attemptScroll = (retries = 0) => {
      const el = getOuterElement();
      if (!el) {
        if (retries < 10) {
          requestAnimationFrame(() => attemptScroll(retries + 1));
        }
        return;
      }

      const minHeight = initialCount * ROW_HEIGHT * 0.5;
      if (el.scrollHeight < minHeight && retries < 10) {
        requestAnimationFrame(() => attemptScroll(retries + 1));
        return;
      }

      hasScrolledToBottomForThreadRef.current = resetKey;
      requestAnimationFrame(() => {
        scrollToBottom();
        computeAtBottom();
      });
    };

    attemptScroll();
  }, [resetKey, messages.length, scrollToBottom, computeAtBottom, getOuterElement]);

  useLayoutEffect(() => {
    const el = outerElRef.current;
    const pending = pendingPrependRef.current;
    if (!el || !pending) return;

    if (messages.length > pending.prevCount) {
      const delta = el.scrollHeight - pending.prevScrollHeight;
      el.scrollTop = pending.prevScrollTop + delta;
    }
    pendingPrependRef.current = null;
  }, [messages.length]);

  const lastMsgIdRef = useRef<string | null>(null);
  useEffect(() => {
    const last = messages[messages.length - 1];
    const lastId = last?.id ?? null;

    if (lastId && lastId !== lastMsgIdRef.current) {
      lastMsgIdRef.current = lastId;
      
      const el = getOuterElement();
      if (el && atBottomRef.current) {
        const distance = el.scrollHeight - (el.scrollTop + el.clientHeight);
        const actuallyAtBottom = distance <= BOTTOM_THRESHOLD;
        
        if (actuallyAtBottom) {
          requestAnimationFrame(scrollToBottom);
        }
      }
    }
  }, [messages, scrollToBottom, getOuterElement]);

  const lastJumpSignalRef = useRef(jumpToBottomSignal);
  useEffect(() => {
    if (jumpToBottomSignal !== lastJumpSignalRef.current) {
      lastJumpSignalRef.current = jumpToBottomSignal;
      requestAnimationFrame(scrollToBottom);
    }
  }, [jumpToBottomSignal, scrollToBottom]);

  const handleResize = useCallback(() => {
    outerElRef.current = getOuterElement();
    setupScrollListener();
    computeAtBottom();
  }, [getOuterElement, computeAtBottom, setupScrollListener]);

  return (
    <List
      listRef={listRef}
      style={{ height: "100%", width: "100%" }}
      rowCount={messages.length}
      rowHeight={ROW_HEIGHT}
      rowComponent={Row}
      rowProps={{ messages }}
      overscanCount={6}
      onResize={handleResize}
    />
  );
}

function Row({
  index,
  style,
  messages,
}: RowComponentProps<{ messages: Message[] }>): React.ReactElement | null {
  const m = messages[index];
  if (!m) return null;
  return (
    <div style={style} className="px-3 py-2 border-b border-gray-100 dark:border-gray-800">
      <p className="text-sm text-gray-900 dark:text-gray-100 truncate">{m.text}</p>
      <p className="text-xs text-gray-400 dark:text-gray-600">
        {new Date(m.createdAt).toLocaleString()}
      </p>
    </div>
  );
}
