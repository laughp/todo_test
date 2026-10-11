import { test } from "vitest";
import assert from "node:assert/strict";

import { createTodo, reorderTodos, startOfWeek, buildWeekTimeline } from "../src/todo.js";

function titles(todos) {
  return todos.map((todo) => todo.title);
}

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

test("finds the Monday that starts the week", () => {
  assert.equal(startOfWeek("2026-10-14").toISOString(), "2026-10-12T00:00:00.000Z");
});

test("treats Sunday as the last day of the week", () => {
  assert.equal(startOfWeek("2026-10-18").toISOString(), "2026-10-12T00:00:00.000Z");
});

test("supports a configurable week start day", () => {
  assert.equal(startOfWeek("2026-10-14", 0).toISOString(), "2026-10-11T00:00:00.000Z");
});

test("rejects an invalid date or week start day", () => {
  assert.throws(() => startOfWeek(null), TypeError);
  assert.throws(() => startOfWeek("not a date"), TypeError);
  assert.throws(() => startOfWeek("2026-10-14", 7), RangeError);
  assert.throws(() => startOfWeek("2026-10-14", 1.5), RangeError);
});

test("builds a seven day timeline for the week containing the reference date", () => {
  const timeline = buildWeekTimeline([], "2026-10-14");

  assert.equal(timeline.length, 7);
  assert.deepEqual(
    timeline.map((day) => day.key),
    [
      "2026-10-12",
      "2026-10-13",
      "2026-10-14",
      "2026-10-15",
      "2026-10-16",
      "2026-10-17",
      "2026-10-18",
    ]
  );
});

test("flags the reference day and the days before and after it", () => {
  const timeline = buildWeekTimeline([], "2026-10-14");

  assert.deepEqual(
    timeline.map((day) => (day.isPast ? "past" : day.isToday ? "today" : "future")),
    ["past", "past", "today", "future", "future", "future", "future"]
  );
});

test("places each todo on the day it is due", () => {
  const todos = [
    createTodo({ title: "Monday task", dueDate: "2026-10-12" }),
    createTodo({ title: "Friday task", dueDate: "2026-10-16" }),
  ];

  const timeline = buildWeekTimeline(todos, "2026-10-14");

  assert.deepEqual(
    timeline.map((day) => day.todos.map((todo) => todo.title)),
    [["Monday task"], [], [], [], ["Friday task"], [], []]
  );
});

test("omits todos that fall outside the week", () => {
  const todos = [
    createTodo({ title: "Last week", dueDate: "2026-10-09" }),
    createTodo({ title: "Next week", dueDate: "2026-10-19" }),
  ];

  const timeline = buildWeekTimeline(todos, "2026-10-14");

  assert.equal(timeline.flatMap((day) => day.todos).length, 0);
});

test("rejects a non-array todo list or invalid reference date", () => {
  assert.throws(() => buildWeekTimeline(null, "2026-10-14"), TypeError);
  assert.throws(() => buildWeekTimeline([], null), TypeError);
  assert.throws(() => buildWeekTimeline([], "not a date"), TypeError);
});
