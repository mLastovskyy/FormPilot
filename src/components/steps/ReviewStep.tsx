"use client";

import { motion } from "framer-motion";
import {
  AlignLeft,
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckSquare,
  ChevronDown,
  CircleDot,
  Clock,
  ExternalLink,
  FileText,
  HelpCircle,
  LayoutGrid,
  ListChecks,
  SlidersHorizontal,
  Type,
  type LucideIcon,
} from "lucide-react";
import type { ParsedForm } from "@/lib/types";
import { TYPE_META } from "@/lib/typeMeta";
import { useI18n } from "@/components/I18nProvider";
import { Button } from "@/components/ui/Button";
import { InfoDot } from "@/components/ui/InfoDot";
import { cn } from "@/lib/cn";

const ICONS: Record<string, LucideIcon> = {
  type: Type,
  "align-left": AlignLeft,
  "circle-dot": CircleDot,
  "chevron-down": ChevronDown,
  "check-square": CheckSquare,
  "sliders-horizontal": SlidersHorizontal,
  calendar: Calendar,
  clock: Clock,
  "grid-3x3": LayoutGrid,
  "help-circle": HelpCircle,
};

interface Props {
  form: ParsedForm;
  onConfirm: () => void;
  onBack: () => void;
}

export function ReviewStep({ form, onConfirm, onBack }: Props) {
  const { d } = useI18n();
  const required = form.questions.filter((q) => q.required).length;
  const unsupported = form.questions.filter((q) => q.type === "UNSUPPORTED").length;

  const stats = [
    { label: d.review.questions, value: form.questions.length, icon: ListChecks },
    { label: d.review.required, value: required, icon: CircleDot },
    { label: d.review.pages, value: form.pageCount, icon: FileText },
  ];

  return (
    <div className="mx-auto max-w-3xl">
      <div className="card overflow-hidden">
        <div className="brand-gradient px-6 py-5 text-white">
          <p className="text-xs font-medium uppercase tracking-wider text-white/80">
            {d.review.parsedForm}
          </p>
          <h2 className="mt-1 text-xl font-semibold">{form.title}</h2>
          {form.description && (
            <p className="mt-1 line-clamp-2 text-sm text-white/85">{form.description}</p>
          )}
          <a
            href={form.viewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-2.5 py-1 text-xs font-medium backdrop-blur transition-colors hover:bg-white/25"
          >
            <ExternalLink className="h-3.5 w-3.5" /> {d.review.openOriginal}
          </a>
        </div>

        <div className="grid grid-cols-3 divide-x divide-line border-b border-line">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-1 py-4">
              <s.icon className="h-4 w-4 text-brand" />
              <span className="text-2xl font-semibold tabular-nums">{s.value}</span>
              <span className="text-xs text-muted">{s.label}</span>
            </div>
          ))}
        </div>

        <div className="max-h-[45vh] overflow-y-auto p-4 sm:p-5">
          <ul className="flex flex-col gap-2">
            {form.questions.map((q, i) => {
              const meta = TYPE_META[q.type];
              const Icon = ICONS[meta.icon] ?? HelpCircle;
              return (
                <motion.li
                  key={q.id + i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.4) }}
                  className={cn(
                    "flex items-start gap-3 rounded-xl border border-line p-3",
                    q.type === "UNSUPPORTED" && "opacity-60",
                  )}
                >
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-surface-2 text-muted">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium">{q.title}</p>
                      {q.required && (
                        <span className="text-[var(--danger)]" title={d.card.required}>
                          *
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted">{d.types[q.type].label}</p>
                    {q.options.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {q.options.slice(0, 6).map((o, oi) => (
                          <span
                            key={oi}
                            className="rounded-md bg-surface-2 px-1.5 py-0.5 text-[11px] text-muted"
                          >
                            {o.isOther ? d.card.other : o.value || "—"}
                          </span>
                        ))}
                        {q.options.length > 6 && (
                          <span className="px-1 text-[11px] text-muted">
                            +{q.options.length - 6}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </motion.li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-1.5 text-sm text-muted">
          {d.review.match}
          <InfoDot content={d.review.matchInfo} />
          {unsupported > 0 && (
            <span className="text-[var(--warning)]">{d.review.unsupported(unsupported)}</span>
          )}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" /> {d.review.back}
          </Button>
          <Button onClick={onConfirm}>
            {d.review.configure} <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
