export function createTodo({ title, dueDate } = {}) {
  if (typeof title !== "string" || title.trim() === "") {
    throw new TypeError("title must be a non-empty string");
  }

  const parsedDueDate = new Date(dueDate);
  if (dueDate == null || Number.isNaN(parsedDueDate.getTime())) {
    throw new TypeError("dueDate must be a valid date");
  }

  return {
    title: title.trim(),
    dueDate: parsedDueDate,
    done: false,
  };
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

export const WEEK_START_DAY = 1;

export function toDateKey(date) {
  return new Date(date).toISOString().slice(0, 10);
}

export function startOfWeek(date, weekStartsOn = WEEK_START_DAY) {
  const parsed = new Date(date);
  if (date == null || Number.isNaN(parsed.getTime())) {
    throw new TypeError("date must be a valid date");
  }

  if (!Number.isInteger(weekStartsOn) || weekStartsOn < 0 || weekStartsOn > 6) {
    throw new RangeError("weekStartsOn must be an integer between 0 and 6");
  }

  const start = new Date(
    Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate())
  );
  const offset = (start.getUTCDay() - weekStartsOn + 7) % 7;
  start.setUTCDate(start.getUTCDate() - offset);

  return start;
}

export function buildWeekTimeline(todos, referenceDate = new Date()) {
  if (!Array.isArray(todos)) {
    throw new TypeError("todos must be an array");
  }

  const reference = new Date(referenceDate);
  if (referenceDate == null || Number.isNaN(reference.getTime())) {
    throw new TypeError("referenceDate must be a valid date");
  }

  const todayKey = toDateKey(reference);
  const start = startOfWeek(reference);
  const days = [];

  for (let offset = 0; offset < 7; offset += 1) {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + offset);
    const key = toDateKey(date);

    days.push({
      date,
      key,
      isToday: key === todayKey,
      isPast: key < todayKey,
      isFuture: key > todayKey,
      todos: todos.filter((todo) => toDateKey(todo.dueDate) === key),
    });
  }

  return days;
}
