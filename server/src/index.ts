import express from "express";
import cors from "cors";
import { MemoryStore } from "./store/memoryStore";
import { threadsRouter } from "./routes/threads";
import { messagesRouter } from "./routes/messages";
import { streamRouter } from "./routes/stream";

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

const store = new MemoryStore();

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/threads", threadsRouter(store));
app.use("/threads/:id/messages", messagesRouter(store));
app.use("/threads/:id/stream", streamRouter(store));

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
