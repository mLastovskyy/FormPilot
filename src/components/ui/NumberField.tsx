"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

interface Props {
  value: number;
  onCommit: (n: number) => void;
  min?: number;
  max?: number;
  /** Value used when the field is left empty on blur (defaults to `min` or 0). */
  emptyValue?: number;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/**
 * Integer input that lets the user type (and clear) freely; the value is only
 * parsed and clamped to [min, max] on blur / Enter — never mid-typing. This
 * avoids the "caret keeps snapping to the minimum" problem of clamp-on-change.
 */
export function NumberField({
  value,
  onCommit,
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
  emptyValue,
  disabled,
  className,
  "aria-label": ariaLabel,
}: Props) {
  const [focused, setFocused] = useState(false);
  const [text, setText] = useState("");

  const display = focused ? text : String(value);

  function commit() {
    setFocused(false);
    const digits = text.replace(/\D/g, "");
    const fallback = emptyValue ?? min;
    const n = digits === "" ? fallback : parseInt(digits, 10);
    onCommit(clamp(n, min, max));
  }

  return (
    <input
      type="text"
      inputMode="numeric"
      disabled={disabled}
      aria-label={ariaLabel}
      value={display}
      onFocus={() => {
        setText(String(value));
        setFocused(true);
      }}
      onChange={(e) => setText(e.target.value.replace(/\D/g, ""))}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
      }}
      className={cn(
        "border border-line bg-surface tabular-nums focus-ring disabled:opacity-40",
        className,
      )}
    />
  );
}
