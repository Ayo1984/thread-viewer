import type { Thread, Message } from "./types";

function makeId(prefix: string, n: number) {
  return `${prefix}_${n.toString(36)}`;
}

function pick<T>(arr: T[], i: number) {
  return arr[i % arr.length];
}

const WORDS = [
  "hello", "update", "meeting", "shipping", "feature", "bug", "note", "idea", "follow-up",
  "thanks", "cool", "please", "review", "ping", "status", "context", "question",
];

function makeText(i: number) {
  const a = pick(WORDS, i);
  const b = pick(WORDS, i * 7 + 3);
  const c = pick(WORDS, i * 13 + 9);
  return `${a} ${b} ${c} (#${i})`;
}

export function seedData(): { threads: Thread[]; messagesByThread: Map<string, Message[]> } {
  const threads: Thread[] = [];
  const messagesByThread = new Map<string, Message[]>();

  const now = Date.now();
  const threadCount = 50;
  const bigThreadIndex = 0;
  const bigThreadMessages = 25_000;

  for (let t = 0; t < threadCount; t++) {
    const id = makeId("thread", t);
    const title = t === bigThreadIndex ? "Big Thread (25k msgs)" : `Thread ${t + 1}`;
    threads.push({ id, title, lastMessageAt: now, unreadCount: 0 });
    messagesByThread.set(id, []);
  }

  for (let t = 0; t < threadCount; t++) {
    const thread = threads[t];
    const list = messagesByThread.get(thread.id)!;

    const count = t === bigThreadIndex ? bigThreadMessages : 200 + (t * 37) % 800;
    const start = now - 30 * 24 * 60 * 60 * 1000;
    const step = Math.floor((now - start) / Math.max(1, count));

    for (let i = 0; i < count; i++) {
      const createdAt = start + i * step + (t % 7) * 123;
      list.push({
        id: makeId(`msg${t}`, i),
        threadId: thread.id,
        text: makeText(i + t * 1000),
        createdAt,
      });
    }

    list.sort((a, b) => a.createdAt - b.createdAt);

    const last = list[list.length - 1];
    thread.lastMessageAt = last?.createdAt ?? now;
  }

  threads.sort((a, b) => b.lastMessageAt - a.lastMessageAt);

  return { threads, messagesByThread };
}
