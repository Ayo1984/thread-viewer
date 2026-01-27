import { Router, Request, Response } from "express";
import { MemoryStore } from "../store/memoryStore";
import { z } from "zod";

const getMessagesQuerySchema = z.object({
  cursor: z.number().int().positive().nullable(),
  limit: z.number().int().positive(),
}).strict();

const postMessageBodySchema = z.object({
  text: z.string().min(1, "Text is required"),
}).strict();


export function messagesRouter(store: MemoryStore) {
  const router = Router({ mergeParams: true });

  router.get("/", (req: Request<{ id: string }>, res: Response) => {
    const threadId = String(req.params.id);

    const result = getMessagesQuerySchema.safeParse(req.query);
    if (!result.success) return res.status(400).json({ error: result.error.message });

    const { cursor, limit } = result.data;

    const page = store.getMessagesPage(threadId, cursor, limit);
    if (!page) return res.status(404).json({ error: "Thread not found" });

    res.json(page);
  });

  router.post("/", (req: Request<{ id: string }>, res: Response) => {
    const threadId = String(req.params.id);

    const result = postMessageBodySchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error.message });
    const { text } = result.data;

    const message = store.addMessage(threadId, text);
    if (!message) return res.status(404).json({ error: "Thread not found" });

    res.status(201).json({ message });
  });

  return router;
}
