import { test } from "node:test";
import assert from "node:assert/strict";

import { createTodo, toggleDone } from "../src/todo.js";

test("creates a todo with a title, due date, and not-done state", () => {
  const dueDate = new Date("2026-10-15T12:00:00Z");
  const todo = createTodo({ title: "Buy milk", dueDate });

  assert.equal(todo.title, "Buy milk");
  assert.equal(todo.dueDate.getTime(), dueDate.getTime());
  assert.equal(todo.done, false);
});

test("accepts a due date given as an ISO string", () => {
  const todo = createTodo({ title: "Buy milk", dueDate: "2026-10-15T12:00:00Z" });

  assert.equal(todo.dueDate.toISOString(), "2026-10-15T12:00:00.000Z");
});

test("trims the title", () => {
  const todo = createTodo({ title: "  Buy milk  ", dueDate: "2026-10-15" });

  assert.equal(todo.title, "Buy milk");
});

test("rejects a missing, empty, or non-string title", () => {
  assert.throws(() => createTodo({ dueDate: "2026-10-15" }), TypeError);
  assert.throws(() => createTodo({ title: "", dueDate: "2026-10-15" }), TypeError);
  assert.throws(() => createTodo({ title: "   ", dueDate: "2026-10-15" }), TypeError);
  assert.throws(() => createTodo({ title: 42, dueDate: "2026-10-15" }), TypeError);
});

test("rejects a missing or invalid due date", () => {
  assert.throws(() => createTodo({ title: "Buy milk" }), TypeError);
  assert.throws(() => createTodo({ title: "Buy milk", dueDate: null }), TypeError);
  assert.throws(() => createTodo({ title: "Buy milk", dueDate: "not a date" }), TypeError);
});

test("toggles a todo from not done to done", () => {
  const todo = createTodo({ title: "Buy milk", dueDate: "2026-10-15" });

  const doneTodo = toggleDone(todo);

  assert.equal(doneTodo.done, true);
  assert.equal(doneTodo.title, todo.title);
  assert.equal(doneTodo.dueDate, todo.dueDate);
});

test("toggles a todo back from done to not done", () => {
  const todo = createTodo({ title: "Buy milk", dueDate: "2026-10-15" });

  const doneTodo = toggleDone(toggleDone(todo));

  assert.equal(doneTodo.done, false);
});

test("toggling does not mutate the original todo", () => {
  const todo = createTodo({ title: "Buy milk", dueDate: "2026-10-15" });

  toggleDone(todo);

  assert.equal(todo.done, false);
});
