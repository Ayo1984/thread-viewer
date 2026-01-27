import { Router, Request, Response } from "express";
import { MemoryStore } from "../store/memoryStore";

export function streamRouter(store: MemoryStore) {
  const router = Router({ mergeParams: true });

  router.get("/", (req: Request<{ id: string }>, res: Response) => {
    const threadId = String(req.params.id);
    const thread = store.getThread(threadId);
    if (!thread) return res.status(404).json({ error: "Thread not found" });

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();

    const clientId = `c_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    store.addSseClient(threadId, { id: clientId, res });

    res.write(`: connected ${clientId}\n\n`);

    const heartbeat = setInterval(() => {
      try {
        res.write(`: hb ${Date.now()}\n\n`);
      } catch {
      }
    }, 25_000);

    req.on("close", () => {
      clearInterval(heartbeat);
      store.removeSseClient(threadId, clientId);
    });
  });

  return router;
}
