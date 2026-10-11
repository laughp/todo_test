export function parseOptionalDate(value, name) {
  if (value == null || value === "") {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new TypeError(`${name} must be a valid date`);
  }

  return parsed;
}

export function createTodo({ title, dueDate, deferralDate, category = "" } = {}) {
  if (typeof title !== "string" || title.trim() === "") {
    throw new TypeError("title must be a non-empty string");
  }

  const parsedDueDate = parseOptionalDate(dueDate, "dueDate");
  const parsedDeferralDate = parseOptionalDate(deferralDate, "deferralDate");

  if (typeof category !== "string") {
    throw new TypeError("category must be a string");
  }

  return {
    title: title.trim(),
    dueDate: parsedDueDate,
    deferralDate: parsedDeferralDate,
    category: category.trim(),
    done: false,
  };
}

export function isDeferred(todo, now = new Date()) {
  return todo.deferralDate != null && todo.deferralDate.getTime() > now.getTime();
}

export function splitByDeferral(todos, now = new Date()) {
  const active = [];
  const deferred = [];

  todos.forEach((todo, index) => {
    const entry = { todo, index };
    if (isDeferred(todo, now)) {
      deferred.push(entry);
    } else {
      active.push(entry);
    }
  });

  return { active, deferred };
}

export function reorderTodos(todos, fromIndex, toIndex) {
  if (!Array.isArray(todos)) {
    throw new TypeError("todos must be an array");
  }

  if (!Number.isInteger(fromIndex) || fromIndex < 0 || fromIndex >= todos.length) {
    throw new RangeError("fromIndex is out of bounds");
  }

  if (!Number.isInteger(toIndex) || toIndex < 0 || toIndex >= todos.length) {
    throw new RangeError("toIndex is out of bounds");
  }

  const reordered = [...todos];
  const [moved] = reordered.splice(fromIndex, 1);
  reordered.splice(toIndex, 0, moved);

  return reordered;
}
