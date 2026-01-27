import { Router } from "express";
import { MemoryStore } from "../store/memoryStore";

export function threadsRouter(store: MemoryStore) {
  const router = Router();

  router.get("/", (_req, res) => {
    res.json(store.getThreads());
  });

  return router;
}
