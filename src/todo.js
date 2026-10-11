export function createTodo({ title, dueDate, category = "" } = {}) {
  if (typeof title !== "string" || title.trim() === "") {
    throw new TypeError("title must be a non-empty string");
  }

  const parsedDueDate = new Date(dueDate);
  if (dueDate == null || Number.isNaN(parsedDueDate.getTime())) {
    throw new TypeError("dueDate must be a valid date");
  }

  if (typeof category !== "string") {
    throw new TypeError("category must be a string");
  }

  return {
    title: title.trim(),
    dueDate: parsedDueDate,
    category: category.trim(),
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
