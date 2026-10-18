"use client";
import { useState } from "react";

const parse = (text: string) => text.split(",").map((s) => s.trim()).filter(Boolean);

/**
 * Comma-separated list input. Keeps the raw text locally so typing "a, " isn't
 * collapsed on every keystroke; the parsed list is reported on each change.
 */
export default function TagsInput({ value, onChange }: { value: string[]; onChange: (tags: string[]) => void }) {
  const [text, setText] = useState(value.join(", "));
  return (
    <input
      value={text}
      onChange={(e) => {
        setText(e.target.value);
        onChange(parse(e.target.value));
      }}
      onBlur={() => setText(parse(text).join(", "))}
    />
  );
}
