import { test } from "vitest";
import assert from "node:assert/strict";


import { createTodo, isDeferred, reorderTodos, splitByDeferral } from "../src/todo.js";

function titles(todos) {
  return todos.map((todo) => todo.title);
}

test("creates a todo with a title, due date, and not-done state", () => {
  const dueDate = new Date("2026-10-15T12:00:00Z");
  const todo = createTodo({ title: "Buy milk", dueDate });

  assert.equal(todo.title, "Buy milk");
  assert.equal(todo.dueDate.getTime(), dueDate.getTime());
  assert.equal(todo.deferralDate, null);
  assert.equal(todo.category, "");
  assert.equal(todo.done, false);
});

test("allows a todo with neither a due date nor a deferral date", () => {
  const todo = createTodo({ title: "Buy milk" });

  assert.equal(todo.dueDate, null);
  assert.equal(todo.deferralDate, null);
});

test("accepts an optional deferral date", () => {
  const todo = createTodo({ title: "Buy milk", deferralDate: "2026-10-20" });

  assert.equal(todo.deferralDate.toISOString(), "2026-10-20T00:00:00.000Z");
});

test("treats an empty deferral date as no deferral", () => {
  const todo = createTodo({ title: "Buy milk", deferralDate: "" });

  assert.equal(todo.deferralDate, null);
});

test("rejects an invalid deferral date", () => {
  assert.throws(
    () => createTodo({ title: "Buy milk", deferralDate: "not a date" }),
    TypeError
  );
});

test("accepts an optional category and trims it", () => {
  const todo = createTodo({ title: "Buy milk", dueDate: "2026-10-15", category: "  Work  " });

  assert.equal(todo.category, "Work");
});

test("defaults the category to an empty string when omitted", () => {
  const todo = createTodo({ title: "Buy milk", dueDate: "2026-10-15" });

  assert.equal(todo.category, "");
});

test("rejects a non-string category", () => {
  assert.throws(
    () => createTodo({ title: "Buy milk", dueDate: "2026-10-15", category: 42 }),
    TypeError
  );
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

test("allows a todo with no due date", () => {
  const todo = createTodo({ title: "Buy milk" });

  assert.equal(todo.dueDate, null);
});

test("rejects an invalid due date", () => {
  assert.throws(() => createTodo({ title: "Buy milk", dueDate: "not a date" }), TypeError);
});

test("considers a todo deferred only while its deferral date is in the future", () => {
  const now = new Date("2026-10-15T12:00:00Z");
  const future = createTodo({ title: "Later", deferralDate: "2026-10-20" });
  const past = createTodo({ title: "Now", deferralDate: "2026-10-10" });
  const none = createTodo({ title: "Unscheduled" });

  assert.equal(isDeferred(future, now), true);
  assert.equal(isDeferred(past, now), false);
  assert.equal(isDeferred(none, now), false);
});

test("splits todos into considered and deferred groups", () => {
  const now = new Date("2026-10-15T12:00:00Z");
  const todos = [
    createTodo({ title: "Active" }),
    createTodo({ title: "Deferred", deferralDate: "2026-10-20" }),
  ];

  const { active, deferred } = splitByDeferral(todos, now);

  assert.deepEqual(
    active.map(({ index }) => index),
    [0]
  );
  assert.deepEqual(
    deferred.map(({ index }) => index),
    [1]
  );
});


test("moves a todo down by dragging it later in the list", () => {
  const todos = [
    createTodo({ title: "First", dueDate: "2026-10-15" }),
    createTodo({ title: "Second", dueDate: "2026-10-15" }),
    createTodo({ title: "Third", dueDate: "2026-10-15" }),
  ];

  const reordered = reorderTodos(todos, 0, 1);

  assert.deepEqual(titles(reordered), ["Second", "First", "Third"]);
});

test("moves a todo up by dragging it earlier in the list", () => {
  const todos = [
    createTodo({ title: "First", dueDate: "2026-10-15" }),
    createTodo({ title: "Second", dueDate: "2026-10-15" }),
    createTodo({ title: "Third", dueDate: "2026-10-15" }),
  ];

  const reordered = reorderTodos(todos, 2, 1);

  assert.deepEqual(titles(reordered), ["First", "Third", "Second"]);
});

test("moves a todo from the first position to the last", () => {
  const todos = [
    createTodo({ title: "First", dueDate: "2026-10-15" }),
    createTodo({ title: "Second", dueDate: "2026-10-15" }),
    createTodo({ title: "Third", dueDate: "2026-10-15" }),
  ];

  const reordered = reorderTodos(todos, 0, 2);

  assert.deepEqual(titles(reordered), ["Second", "Third", "First"]);
});

test("keeps the same todo objects when reordering", () => {
  const first = createTodo({ title: "First", dueDate: "2026-10-15" });
  const second = createTodo({ title: "Second", dueDate: "2026-10-15" });

  const reordered = reorderTodos([first, second], 0, 1);

  assert.equal(reordered[0], second);
  assert.equal(reordered[1], first);
});

test("reordering does not mutate the original list", () => {
  const todos = [
    createTodo({ title: "First", dueDate: "2026-10-15" }),
    createTodo({ title: "Second", dueDate: "2026-10-15" }),
  ];

  reorderTodos(todos, 0, 1);

  assert.deepEqual(titles(todos), ["First", "Second"]);
});

test("rejects a non-array list", () => {
  assert.throws(() => reorderTodos(null, 0, 1), TypeError);
});

test("rejects out-of-bounds or non-integer indices", () => {
  const todos = [
    createTodo({ title: "First", dueDate: "2026-10-15" }),
    createTodo({ title: "Second", dueDate: "2026-10-15" }),
  ];

  assert.throws(() => reorderTodos(todos, -1, 1), RangeError);
  assert.throws(() => reorderTodos(todos, 0, 2), RangeError);
  assert.throws(() => reorderTodos(todos, 0.5, 1), RangeError);
  assert.throws(() => reorderTodos(todos, 0, "1"), RangeError);
});

