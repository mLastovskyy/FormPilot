"use client";

import { Info } from "lucide-react";
import type { ReactNode } from "react";
import { Tooltip } from "./Tooltip";
import { cn } from "@/lib/cn";

interface InfoDotProps {
  content: ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
  label?: string;
}

/**
 * A small "i" affordance that reveals an explanatory tooltip. Focusable so it
 * works for keyboard and screen-reader users.
 */
export function InfoDot({ content, side = "top", className, label = "More info" }: InfoDotProps) {
  return (
    <Tooltip content={content} side={side}>
      <button
        type="button"
        aria-label={label}
        className={cn(
          "inline-flex h-4 w-4 items-center justify-center rounded-full text-muted/80 transition-colors hover:text-brand focus-ring",
          className,
        )}
      >
        <Info className="h-4 w-4" strokeWidth={2} />
      </button>
    </Tooltip>
  );
}
