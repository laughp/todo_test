import { describe, test, expect, beforeEach } from "vitest";
import { render, screen, within, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import App from "../src/App.jsx";

function addTodo(user, { title, dueDate = "2026-10-15", category } = {}) {
  return user.type(screen.getByLabelText("Title"), title).then(() => {
    fireEvent.change(screen.getByLabelText("Due date"), {
      target: { value: dueDate },
    });
    if (category !== undefined) {
      fireEvent.change(screen.getByLabelText("Category"), {
        target: { value: category },
      });
    }
    return user.click(screen.getByRole("button", { name: "Add todo" }));
  });
}

function todoTitles() {
  return screen.getAllByRole("listitem").map((item) => item.textContent);
}

beforeEach(() => {
  render(<App />);
});

describe("Todo App GUI", () => {
  test("adds a todo with a title and due date", async () => {
    const user = userEvent.setup();

    await addTodo(user, { title: "Buy milk" });

    const item = screen.getByRole("listitem");
    expect(within(item).getByText("Buy milk")).toBeInTheDocument();
    expect(within(item).getByText("2026-10-15")).toBeInTheDocument();
  });

  test("adds a todo with a category", async () => {
    const user = userEvent.setup();

    await addTodo(user, { title: "Buy milk", category: "Groceries" });

    const item = screen.getByRole("listitem");
    expect(within(item).getByText("Groceries")).toBeInTheDocument();
  });

  test("omits the category when none is given", async () => {
    const user = userEvent.setup();

    await addTodo(user, { title: "Buy milk" });

    expect(screen.queryByText("Groceries")).not.toBeInTheDocument();
  });

  test("clears the form after adding a todo", async () => {
    const user = userEvent.setup();

    await addTodo(user, { title: "Buy milk", category: "Groceries" });

    expect(screen.getByLabelText("Title")).toHaveValue("");
    expect(screen.getByLabelText("Due date")).toHaveValue("");
    expect(screen.getByLabelText("Category")).toHaveValue("");
  });

  test("shows an error instead of adding an invalid todo", async () => {
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "Add todo" }));

    expect(screen.getByRole("alert")).toHaveTextContent(/title must be a non-empty string/i);
    expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
  });

  test("marks a todo as done", async () => {
    const user = userEvent.setup();

    await addTodo(user, { title: "Buy milk" });
    await user.click(screen.getByRole("checkbox", { name: /mark buy milk as done/i }));

    expect(screen.getByRole("checkbox", { name: /mark buy milk as done/i })).toBeChecked();
  });

  test("deletes a todo", async () => {
    const user = userEvent.setup();

    await addTodo(user, { title: "Buy milk" });
    await user.click(screen.getByRole("button", { name: /delete buy milk/i }));

    expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
  });

  test("reorders todos with the move buttons", async () => {
    const user = userEvent.setup();

    await addTodo(user, { title: "First" });
    await addTodo(user, { title: "Second" });
    await user.click(screen.getByRole("button", { name: /move second up/i }));

    expect(todoTitles()[0]).toContain("Second");
    expect(todoTitles()[1]).toContain("First");
  });

  test("disables moving the first todo up and the last todo down", async () => {
    const user = userEvent.setup();

    await addTodo(user, { title: "Only todo" });

    expect(screen.getByRole("button", { name: /move only todo up/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /move only todo down/i })).toBeDisabled();
  });

  test("reports how many todos remain", async () => {
    const user = userEvent.setup();

    await addTodo(user, { title: "First" });
    await addTodo(user, { title: "Second" });
    await user.click(screen.getByRole("checkbox", { name: /mark first as done/i }));

    expect(screen.getByText("1 of 2 remaining")).toBeInTheDocument();
  });
});
