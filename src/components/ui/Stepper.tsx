"use client";

import { Check } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

export interface StepperItem {
  key: string;
  label: string;
}

interface StepperProps {
  steps: StepperItem[];
  current: number;
  maxReached: number;
  onSelect?: (index: number) => void;
}

export function Stepper({ steps, current, maxReached, onSelect }: StepperProps) {
  const progress = steps.length > 1 ? current / (steps.length - 1) : 0;

  return (
    <div className="w-full">
      <div className="relative flex items-center justify-between">
        {/* track */}
        <div className="absolute left-0 right-0 top-4 -z-0 mx-5 h-0.5 rounded-full bg-line" />
        <motion.div
          className="absolute left-0 top-4 -z-0 mx-5 h-0.5 rounded-full brand-gradient"
          initial={false}
          animate={{ width: `calc(${progress * 100}% - ${progress * 40}px)` }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        />

        {steps.map((step, i) => {
          const done = i < current;
          const active = i === current;
          const reachable = i <= maxReached;
          return (
            <button
              key={step.key}
              type="button"
              disabled={!reachable}
              onClick={() => reachable && onSelect?.(i)}
              className={cn(
                "relative z-10 flex flex-col items-center gap-2",
                reachable ? "cursor-pointer" : "cursor-not-allowed",
              )}
            >
              <span
                className={cn(
                  "grid h-8 w-8 place-items-center rounded-full border-2 text-xs font-semibold transition-all duration-300",
                  active && "border-transparent brand-gradient text-white shadow-lg",
                  done && "border-transparent brand-gradient text-white",
                  !active && !done && "border-line bg-surface text-muted",
                )}
              >
                {done ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              <span
                className={cn(
                  "text-[11px] font-medium transition-colors sm:text-xs",
                  active ? "text-foreground" : "text-muted",
                )}
              >
                {step.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
