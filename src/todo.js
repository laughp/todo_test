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

export function toggleDone(todo) {
  return { ...todo, done: !todo.done };
}
