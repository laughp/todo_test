import { useState } from "react";

import { buildWeekTimeline, createTodo, reorderTodos } from "./todo.js";

export default function App() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");
  const [showTimeline, setShowTimeline] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();

    try {
      const todo = createTodo({ title, dueDate });
      setTodos((current) => [...current, todo]);
      setTitle("");
      setDueDate("");
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  function toggleTodo(index) {
    setTodos((current) =>
      current.map((todo, i) => (i === index ? { ...todo, done: !todo.done } : todo))
    );
  }

  function removeTodo(index) {
    setTodos((current) => current.filter((_, i) => i !== index));
  }

  function moveTodo(index, offset) {
    const target = index + offset;
    if (target < 0 || target >= todos.length) {
      return;
    }

    setTodos((current) => reorderTodos(current, index, target));
  }

  return (
    <main className="app">
      <h1>Todo App</h1>

      <form className="todo-form" onSubmit={handleSubmit}>
        <label htmlFor="todo-title">Title</label>
        <input
          id="todo-title"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="What needs doing?"
        />

        <label htmlFor="todo-due-date">Due date</label>
        <input
          id="todo-due-date"
          type="date"
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
        />

        <button type="submit">Add todo</button>
      </form>

      {error ? (
        <p className="error" role="alert">
          {error}
        </p>
      ) : null}

      {todos.length === 0 ? (
        <p className="empty">No todos yet. Add one above.</p>
      ) : (
        <ul className="todo-list">
          {todos.map((todo, index) => (
            <li key={index} className={todo.done ? "todo done" : "todo"}>
              <label className="todo-toggle">
                <input
                  type="checkbox"
                  checked={todo.done}
                  onChange={() => toggleTodo(index)}
                  aria-label={`Mark ${todo.title} as done`}
                />
                <span className="todo-title">{todo.title}</span>
              </label>

              <span className="todo-due">
                {todo.dueDate.toISOString().slice(0, 10)}
              </span>

              <div className="todo-actions">
                <button
                  type="button"
                  onClick={() => moveTodo(index, -1)}
                  disabled={index === 0}
                  aria-label={`Move ${todo.title} up`}
                >
                  Up
                </button>
                <button
                  type="button"
                  onClick={() => moveTodo(index, 1)}
                  disabled={index === todos.length - 1}
                  aria-label={`Move ${todo.title} down`}
                >
                  Down
                </button>
                <button
                  type="button"
                  onClick={() => removeTodo(index)}
                  aria-label={`Delete ${todo.title}`}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="count" aria-live="polite">
        {todos.filter((todo) => !todo.done).length} of {todos.length} remaining
      </p>

      <section className="timeline">
        <label className="timeline-toggle">
          <input
            type="checkbox"
            checked={showTimeline}
            onChange={(event) => setShowTimeline(event.target.checked)}
          />
          Show week timeline
        </label>

        {showTimeline ? (
          <ol className="timeline-days" aria-label="Week timeline">
            {buildWeekTimeline(todos).map((day) => (
              <li
                key={day.key}
                className={[
                  "timeline-day",
                  day.isToday ? "today" : "",
                  day.isPast ? "past" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <span className="timeline-day-label">
                  {day.date.toLocaleDateString(undefined, {
                    weekday: "short",
                    timeZone: "UTC",
                  })}
                </span>
                <span className="timeline-day-date">{day.key.slice(5)}</span>
                <ul className="timeline-day-todos">
                  {day.todos.map((todo, index) => (
                    <li
                      key={index}
                      className={[
                        "timeline-todo",
                        todo.done ? "done" : "",
                        day.isPast && !todo.done ? "missed" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      {todo.title}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        ) : null}
      </section>
    </main>
  );
}
