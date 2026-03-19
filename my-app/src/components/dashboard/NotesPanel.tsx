"use client";

import { FormEvent, useEffect, useState } from "react";

type Note = {
  id: string;
  text: string;
};

const NOTES_STORAGE_KEY = "dashboard-notes-v1";

type NotesPanelProps = {
  compact?: boolean;
};

export function NotesPanel({ compact = false }: NotesPanelProps) {
  const [notes, setNotes] = useState<Note[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    const stored = localStorage.getItem(NOTES_STORAGE_KEY);
    if (!stored) {
      return [];
    }

    try {
      return JSON.parse(stored) as Note[];
    } catch {
      localStorage.removeItem(NOTES_STORAGE_KEY);
      return [];
    }
  });
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmed = inputValue.trim();
    if (!trimmed) {
      return;
    }

    setNotes((previous) => [
      { id: crypto.randomUUID(), text: trimmed },
      ...previous,
    ]);
    setInputValue("");
  };

  const handleDelete = (id: string) => {
    setNotes((previous) => previous.filter((note) => note.id !== id));
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="stack">
        <input
          type="text"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          placeholder="Skriv en note..."
          maxLength={140}
        />
        <button type="submit">Tilfoj</button>
      </form>

      <ul className="list">
        {notes.length === 0 ? (
          <li className="empty">Ingen noter endnu.</li>
        ) : (
          notes.map((note, index) => (
            <li key={note.id} className={compact && index > 2 ? "hiddenOnCompact" : ""}>
              <span>{note.text}</span>
              <button type="button" onClick={() => handleDelete(note.id)}>
                Slet
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
