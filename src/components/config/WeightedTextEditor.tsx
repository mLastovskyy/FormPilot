"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, X } from "lucide-react";
import { InfoDot } from "@/components/ui/InfoDot";
import { NumberField } from "@/components/ui/NumberField";
import { useI18n } from "@/components/I18nProvider";
import type { WeightedOption } from "@/lib/types";

interface Props {
  options: WeightedOption[];
  onChange: (options: WeightedOption[]) => void;
}

/**
 * Lets the user type their own answers for a text question and give each a
 * weight, so responses are drawn from them with the desired distribution.
 */
export function WeightedTextEditor({ options, onChange }: Props) {
  const { d } = useI18n();
  const [draft, setDraft] = useState("");

  function add() {
    const value = draft.trim();
    if (!value) return;
    onChange([
      ...options,
      { value, enabled: true, weight: 1, isOther: false, otherText: "" },
    ]);
    setDraft("");
  }

  function update(index: number, patch: Partial<WeightedOption>) {
    onChange(options.map((o, i) => (i === index ? { ...o, ...patch } : o)));
  }

  function remove(index: number) {
    onChange(options.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          placeholder={d.textPool.placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          className="h-10 flex-1 rounded-xl border border-line bg-surface px-3.5 text-sm focus-ring"
        />
        <button
          type="button"
          onClick={add}
          className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-surface-2 px-3.5 text-sm font-medium transition-colors hover:bg-brand-soft hover:text-brand focus-ring"
        >
          <Plus className="h-4 w-4" /> {d.textPool.add}
        </button>
      </div>

      {options.length === 0 ? (
        <p className="text-xs text-muted">{d.textPool.empty}</p>
      ) : (
        <div className="flex flex-col divide-y divide-line/70 overflow-hidden rounded-xl border border-line">
          <AnimatePresence initial={false}>
            {options.map((opt, i) => (
              <motion.div
                key={`${opt.value}-${i}`}
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-3 bg-surface px-3 py-2.5"
              >
                <span className="min-w-0 flex-1 truncate text-sm" title={opt.value}>
                  {opt.value}
                </span>
                <label className="flex items-center gap-1.5 text-xs text-muted">
                  {d.card.weight}
                  <NumberField
                    value={opt.weight}
                    min={0}
                    max={999}
                    emptyValue={0}
                    onCommit={(n) => update(i, { weight: n })}
                    className="h-8 w-16 rounded-lg px-2 text-center text-sm"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  aria-label={`Remove ${opt.value}`}
                  className="grid h-7 w-7 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-danger focus-ring"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
          <div className="flex items-center gap-1.5 bg-surface-2/40 px-3 py-2 text-xs text-muted">
            <InfoDot content={d.glossary.weight} />
            {d.card.higherWeight}
          </div>
        </div>
      )}
    </div>
  );
}
