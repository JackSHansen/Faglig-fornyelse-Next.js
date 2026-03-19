"use client";

import { FormEvent, useEffect, useState } from "react";

type Todo = {
  id: string;
  text: string;
  done: boolean;
};

const TODO_STORAGE_KEY = "dashboard-todos-v1";

type TodoPanelProps = {
  compact?: boolean;
};

export function TodoPanel({ compact = false }: TodoPanelProps) {
  const [todos, setTodos] = useState<Todo[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    const stored = localStorage.getItem(TODO_STORAGE_KEY);
    if (!stored) {
      return [];
    }

    try {
      return JSON.parse(stored) as Todo[];
    } catch {
      localStorage.removeItem(TODO_STORAGE_KEY);
      return [];
    }
  });
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmed = inputValue.trim();
    if (!trimmed) {
      return;
    }

    setTodos((previous) => [
      { id: crypto.randomUUID(), text: trimmed, done: false },
      ...previous,
    ]);
    setInputValue("");
  };

  const toggleTodo = (id: string) => {
    setTodos((previous) =>
      previous.map((todo) =>
        todo.id === id ? { ...todo, done: !todo.done } : todo,
      ),
    );
  };

  const deleteTodo = (id: string) => {
    setTodos((previous) => previous.filter((todo) => todo.id !== id));
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="stack">
        <input
          type="text"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          placeholder="Ny opgave..."
          maxLength={120}
        />
        <button type="submit">Tilføj</button>
      </form>

      <ul className="list">
        {todos.length === 0 ? (
          <li className="empty">Ingen opgaver endnu.</li>
        ) : (
          todos.map((todo, index) => (
            <li
              key={todo.id}
              className={`${todo.done ? "done" : ""} ${compact && index > 4 ? "hiddenOnCompact" : ""}`.trim()}
            >
              <label>
                <input
                  type="checkbox"
                  checked={todo.done}
                  onChange={() => toggleTodo(todo.id)}
                />
                <span>{todo.text}</span>
              </label>
              <button type="button" onClick={() => deleteTodo(todo.id)}>
                Slet
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
