import express, { type Request, type Response } from "express";
import { z } from "zod";
import { randomUUID } from "node:crypto";

type Task = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

const app = express();
app.use(express.json());

const tasks = new Map<string, Task>();

const createTaskSchema = z.object({
  title: z.string().min(1).max(120)
});
const updateTaskSchema = z.object({
  title: z.string().min(1).max(120).optional(),
  completed: z.boolean().optional()
}).refine(d => Object.keys(d).length > 0, { message: "No fields to update" });

const now = () => new Date().toISOString();

app.post("/tasks", (req, res) => {
  const parsed = createTaskSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const id = randomUUID();
  const task: Task = { id, title: parsed.data.title, completed: false, createdAt: now(), updatedAt: now() };
  tasks.set(id, task);
  res.status(201).json(task);
});

app.get("/tasks", (req, res) => {
  const q = typeof req.query.q === "string" ? req.query.q.toLowerCase() : "";
  const list = Array.from(tasks.values()).filter(t => t.title.toLowerCase().includes(q));
  res.json(list);
});

app.get("/tasks/:id", (req, res) => {
  const t = tasks.get(req.params.id);
if (!t) return res.status(404).json({ error: "not_found" });
  res.json(t);
});

app.patch("/tasks/:id", (req, res) => {
  const t = tasks.get(req.params.id);
if (!t) return res.status(404).json({ error: "not_found" });

  const parsed = updateTaskSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const updated: Task = {
    ...t,
    ...parsed.data,
    updatedAt: now()
  };
  tasks.set(t.id, updated);
  res.json(updated);
});

app.delete("/tasks/:id", (req, res) => {
  tasks.delete(req.params.id); // idempotent
  res.sendStatus(204);
});

if (process.env.NODE_ENV !== "test") {
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`API on :${port}`));
}

export default app;