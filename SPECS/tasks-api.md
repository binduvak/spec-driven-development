# Feature: Tasks CRUD API

## Problem
Users need to track simple tasks.

## Definitions
Task:
- id: string (uuid)
- title: string, required, 1..120
- completed: boolean, default false
- createdAt: ISO timestamp
- updatedAt: ISO timestamp

## Acceptance Criteria
- Create task: POST /tasks with {title}. Returns 201 and task.
- List tasks: GET /tasks returns array, supports ?q= for substring match on title.
- Get task: GET /tasks/:id returns 404 if not found.
- Update task: PATCH /tasks/:id with {title?, completed?}. Returns updated task.
- Delete task: DELETE /tasks/:id returns 204, idempotent.

## Non-Functional
- In-memory store is fine.
- Input validation with 400 on invalid payloads.
- Timestamps auto-managed.

## Tests
- Create then fetch equals.
- Search filters by title.
- Update toggles completed.
- Delete is idempotent.