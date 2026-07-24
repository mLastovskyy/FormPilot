"use client";

import { motion } from "framer-motion";
import { Switch } from "@/components/ui/Switch";
import { InfoDot } from "@/components/ui/InfoDot";
import { useI18n } from "@/components/I18nProvider";
import type { WeightedOption } from "@/lib/types";
import { cn } from "@/lib/cn";

interface Props {
  options: WeightedOption[];
  onChange: (options: WeightedOption[]) => void;
  showWeights?: boolean;
}

const fieldClass =
  "h-8 w-16 rounded-lg border border-line bg-surface px-2 text-center text-sm tabular-nums focus-ring disabled:opacity-40";

export function WeightedOptionsEditor({ options, onChange, showWeights = true }: Props) {
  const { d } = useI18n();
  function update(index: number, patch: Partial<WeightedOption>) {
    onChange(options.map((o, i) => (i === index ? { ...o, ...patch } : o)));
  }

  return (
    <div className="flex flex-col divide-y divide-line/70 overflow-hidden rounded-xl border border-line">
      {options.map((opt, i) => (
        <div
          key={`${opt.value}-${i}`}
          className={cn(
            "flex flex-wrap items-center gap-3 px-3 py-2.5 transition-colors",
            opt.enabled ? "bg-surface" : "bg-surface-2/40",
          )}
        >
          <Switch
            checked={opt.enabled}
            onChange={(v) => update(i, { enabled: v })}
            label={`Toggle option ${opt.value}`}
          />
          <span
            className={cn(
              "min-w-0 flex-1 truncate text-sm",
              !opt.enabled && "text-muted line-through",
            )}
          >
            {opt.isOther ? (
              <span className="inline-flex items-center gap-1.5">
                <span className="rounded-md bg-brand-soft px-1.5 py-0.5 text-xs font-medium text-brand">
                  {d.card.other}
                </span>
              </span>
            ) : (
              opt.value || <span className="text-muted italic">{d.card.empty}</span>
            )}
          </span>

          {opt.isOther && opt.enabled && (
            <input
              type="text"
              value={opt.otherText}
              placeholder={d.card.otherPlaceholder}
              onChange={(e) => update(i, { otherText: e.target.value })}
              className="h-8 w-40 rounded-lg border border-line bg-surface px-2.5 text-sm focus-ring"
            />
          )}

          {showWeights && (
            <label className="flex items-center gap-1.5 text-xs text-muted">
              <span className="hidden sm:inline">{d.card.weight}</span>
              <input
                type="text"
                inputMode="numeric"
                disabled={!opt.enabled}
                value={String(opt.weight)}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "");
                  update(i, {
                    weight: digits === "" ? 0 : Math.min(999, parseInt(digits, 10)),
                  });
                }}
                className={fieldClass}
              />
            </label>
          )}
        </div>
      ))}
      {showWeights && (
        <div className="flex items-center gap-1.5 bg-surface-2/40 px-3 py-2 text-xs text-muted">
          <InfoDot content={d.glossary.weight} />
          {d.card.higherWeight}
          <motion.span
            key={options.filter((o) => o.enabled).length}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="ml-auto font-medium text-foreground"
          >
            {d.card.enabled(options.filter((o) => o.enabled).length)}
          </motion.span>
        </div>
      )}
    </div>
  );
}
