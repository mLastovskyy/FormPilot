"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useI18n } from "@/components/I18nProvider";

/**
 * Staged loading indicator shown while the parse API is in flight. The stage
 * text advances on a timer to make the (usually short) wait feel responsive;
 * it's purely cosmetic and doesn't track real backend progress.
 */
export function ParsingLoader() {
  const { d } = useI18n();
  const STAGES = d.loader.stages;
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setStage((s) => Math.min(s + 1, STAGES.length - 1));
    }, 1100);
    return () => clearInterval(id);
  }, [STAGES.length]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 rounded-xl border border-line bg-surface-2/40 p-4"
    >
      <div className="mb-4 flex flex-col gap-2">
        {STAGES.map((label, i) => {
          const done = i < stage;
          const active = i === stage;
          if (i > stage) return null;
          return (
            <AnimatePresence key={label} mode="popLayout">
              <motion.div
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 text-sm"
              >
                {done ? (
                  <CheckCircle2 className="h-4 w-4 text-success" />
                ) : (
                  <Loader2 className="h-4 w-4 animate-spin text-brand" />
                )}
                <span className={active ? "text-foreground" : "text-muted"}>
                  {label}
                </span>
              </motion.div>
            </AnimatePresence>
          );
        })}
      </div>

      {/* Skeleton preview of a form being read */}
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-xl border border-line p-3">
            <div className="skeleton mb-2 h-3.5 w-2/5 rounded-md" />
            <div className="flex gap-2">
              <div className="skeleton h-6 w-16 rounded-md" />
              <div className="skeleton h-6 w-20 rounded-md" />
              <div className="skeleton h-6 w-14 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
