import { Message, Thread } from "./types";
import { seedData } from "./seed";

type SseClient = {
  id: string;
  res: import("express").Response;
};

export class MemoryStore {
  private threads: Map<string, Thread>;
  private messagesByThread: Map<string, Message[]>;
  private sseClientsByThread: Map<string, Map<string, SseClient>>;

  constructor() {
    const seeded = seedData();
    this.threads = new Map(seeded.threads.map(t => [t.id, t]));
    this.messagesByThread = seeded.messagesByThread;
    this.sseClientsByThread = new Map();
  }

  getThreads(): Thread[] {
    return Array.from(this.threads.values()).sort((a, b) => b.lastMessageAt - a.lastMessageAt);
  }

  getThread(threadId: string): Thread | undefined {
    return this.threads.get(threadId);
  }

  getMessagesPage(threadId: string, cursor: number | null, limit: number) {
    const list = this.messagesByThread.get(threadId);
    if (!list) return null;

    const safeLimit = Math.max(1, Math.min(200, limit));
    const endExclusive = cursor != null ? lowerBound(list, cursor) : list.length;
    const start = Math.max(0, endExclusive - safeLimit);
    const page = list.slice(start, endExclusive);
    const nextCursor = start > 0 ? page[0].createdAt : null;

    return { items: page, nextCursor };
  }

  addMessage(threadId: string, text: string): Message | null {
    const thread = this.getThread(threadId);
    const list = this.messagesByThread.get(threadId);
    if (!thread || !list) return null;

    const createdAt = Date.now();
    const msg: Message = {
      id: `m_${createdAt}_${Math.random().toString(16).slice(2)}`,
      threadId,
      text,
      createdAt,
    };

    list.push(msg);
    thread.lastMessageAt = createdAt;
    this.broadcast(threadId, msg);

    return msg;
  }

  addSseClient(threadId: string, client: SseClient) {
    if (!this.sseClientsByThread.has(threadId)) {
      this.sseClientsByThread.set(threadId, new Map());
    }
    this.sseClientsByThread.get(threadId)!.set(client.id, client);
  }

  removeSseClient(threadId: string, clientId: string) {
    const map = this.sseClientsByThread.get(threadId);
    if (!map) return;
    map.delete(clientId);
    if (map.size === 0) this.sseClientsByThread.delete(threadId);
  }

  private broadcast(threadId: string, message: Message) {
    const clients = this.sseClientsByThread.get(threadId);
    if (!clients) return;

    const payload = `event: message\ndata: ${JSON.stringify({ message })}\n\n`;
    for (const { res } of clients.values()) {
      try {
        res.write(payload);
      } catch {
      }
    }
  }
}

function lowerBound(list: { createdAt: number }[], target: number): number {
  const search = (low: number, high: number): number => {
    if (low >= high) return low;
    const mid = (low + high) >> 1;
    return list[mid].createdAt < target
      ? search(mid + 1, high)
      : search(low, mid);
  };
  return search(0, list.length);
}
