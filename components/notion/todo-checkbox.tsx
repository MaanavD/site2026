"use client";

import { useState, type ReactNode } from "react";

export function TodoCheckbox({
  id,
  initialChecked,
  label,
  children,
}: {
  id: string;
  initialChecked: boolean;
  label: ReactNode;
  children?: ReactNode;
}) {
  const [isChecked, setIsChecked] = useState(initialChecked);
  const inputId = `todo-${id}`;

  return (
    <div className="my-2">
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          id={inputId}
          checked={isChecked}
          onChange={(event) => setIsChecked(event.currentTarget.checked)}
          className="mt-1 h-5 w-5 shrink-0 accent-turmeric focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-turmeric"
        />
        <label
          htmlFor={inputId}
          className={isChecked ? "text-paper-faint line-through" : ""}
        >
          {label}
        </label>
      </div>
      {children}
    </div>
  );
}
