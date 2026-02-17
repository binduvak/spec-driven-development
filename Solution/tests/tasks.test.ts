import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/server";

describe("Tasks API", () => {
  it("creates and fetches a task", async () => {
    const create = await request(app).post("/tasks").send({ title: "Write spec" }).expect(201);
    const id = create.body.id;

    const get = await request(app).get(`/tasks/${id}`).expect(200);
    expect(get.body.title).toBe("Write spec");
    expect(get.body.completed).toBe(false);
  });

  it("lists and searches tasks", async () => {
    await request(app).post("/tasks").send({ title: "Buy milk" });
    await request(app).post("/tasks").send({ title: "Book flight" });

    const all = await request(app).get("/tasks").expect(200);
    expect(all.body.length).toBeGreaterThanOrEqual(2);

    const search = await request(app).get("/tasks?q=milk").expect(200);
    expect(search.body.length).toBe(1);
    expect(search.body[0].title).toContain("milk");
  });

  it("updates a task", async () => {
    const c = await request(app).post("/tasks").send({ title: "Toggle me" }).expect(201);
    const id = c.body.id;

    const u = await request(app).patch(`/tasks/${id}`).send({ completed: true }).expect(200);
    expect(u.body.completed).toBe(true);
    expect(new Date(u.body.updatedAt).getTime()).toBeGreaterThan(new Date(u.body.createdAt).getTime());
  });

  it("delete is idempotent", async () => {
    const c = await request(app).post("/tasks").send({ title: "Remove me" }).expect(201);
    const id = c.body.id;

    await request(app).delete(`/tasks/${id}`).expect(204);
    await request(app).delete(`/tasks/${id}`).expect(204);
  });

  it("validates input", async () => {
    await request(app).post("/tasks").send({ title: "" }).expect(400);
    await request(app).patch("/tasks/not-found").send({ completed: true }).expect(404);
    await request(app).patch("/tasks/not-found").send({}).expect(404);
  });
});