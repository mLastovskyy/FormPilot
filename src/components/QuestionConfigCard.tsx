"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  AlignLeft,
  AlertTriangle,
  Calendar,
  CheckSquare,
  ChevronDown,
  CircleDot,
  Clock,
  HelpCircle,
  LayoutGrid,
  Pin,
  Shuffle,
  SlidersHorizontal,
  Type,
  type LucideIcon,
} from "lucide-react";
import type { ParsedQuestion, QuestionConfig, StrategyMode, WeightedOption } from "@/lib/types";
import { describeConfigIssue, isChoiceType, isTextType } from "@/lib/distribution";
import { TYPE_META } from "@/lib/typeMeta";
import { useI18n } from "@/components/I18nProvider";
import type { Dict } from "@/lib/i18n";
import { Switch } from "@/components/ui/Switch";
import { Segmented } from "@/components/ui/Segmented";
import { InfoDot } from "@/components/ui/InfoDot";
import { DistributionBars } from "@/components/DistributionBars";
import { WeightedOptionsEditor } from "@/components/config/WeightedOptionsEditor";
import { WeightedTextEditor } from "@/components/config/WeightedTextEditor";
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
  question: ParsedQuestion;
  config: QuestionConfig;
  index: number;
  onChange: (config: QuestionConfig) => void;
}

export function QuestionConfigCard({ question, config, index, onChange }: Props) {
  const { d } = useI18n();
  const meta = TYPE_META[question.type];
  const typeText = d.types[question.type];
  const Icon = ICONS[meta.icon] ?? HelpCircle;
  const choice = isChoiceType(question.type);
  const text = isTextType(question.type);

  const modeOptions = [
    { value: "random" as StrategyMode, label: d.card.modeRandom, icon: <Shuffle className="h-3.5 w-3.5" /> },
    { value: "fixed" as StrategyMode, label: d.card.modeFixed, icon: <Pin className="h-3.5 w-3.5" /> },
  ];

  const patch = (p: Partial<QuestionConfig>) => onChange({ ...config, ...p });

  // Expected distribution derived directly from the weights (deterministic), in
  // the question's original option order — so tweaking a weight only changes bar
  // lengths, never the order of the answers.
  const previewData = config.options
    .filter((o) => o.enabled)
    .map((o) => ({
      label: o.isOther ? d.card.other : o.value || d.card.empty,
      count: o.weight > 0 ? o.weight : 0,
    }));
  const previewTotal = previewData.reduce((s, dd) => s + dd.count, 0);

  const warning = useMemo(() => describeConfigIssue(config, d), [config, d]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.3) }}
      className="card p-4 sm:p-5"
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold leading-snug sm:text-base">
              {question.title}
            </h3>
            {question.required && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[color-mix(in_srgb,var(--danger)_14%,transparent)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--danger)]">
                {d.card.required}
                <InfoDot content={d.glossary.required} />
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-muted">
            <span className="inline-flex items-center gap-1">
              {typeText.label}
              <InfoDot content={typeText.hint} />
            </span>
            {question.description && (
              <span className="truncate">· {question.description}</span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <InfoDot content={d.glossary.include} />
          <Switch
            checked={config.include}
            disabled={!meta.supported}
            onChange={(v) => patch({ include: v })}
            label="Include question"
          />
        </div>
      </div>

      {/* Body */}
      {config.include && meta.supported && (
        <motion.div
          key="body"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
        >
          <div className="mt-4 border-t border-line/70 pt-4">
              {warning && (
                <div className="mb-3 flex items-start gap-2 rounded-xl border border-[color-mix(in_srgb,var(--warning)_35%,transparent)] bg-[color-mix(in_srgb,var(--warning)_10%,transparent)] px-3 py-2 text-xs text-[var(--warning)]">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>{warning}</span>
                </div>
              )}

              {/* Mode switch for choice + text */}
              {(choice && question.type !== "CHECKBOX") || text ? (
                <div className="mb-4 flex items-center gap-2">
                  <Segmented
                    size="sm"
                    value={config.mode}
                    options={modeOptions}
                    onChange={(m) => patch({ mode: m })}
                  />
                  <InfoDot content={d.glossary.fixedVsRandom} side="right" />
                </div>
              ) : null}

              {/* CHOICE (radio / dropdown / scale) */}
              {choice && question.type !== "CHECKBOX" && (
                <>
                  {config.mode === "fixed" ? (
                    <FixedChoicePicker
                      options={config.options}
                      value={config.fixedValue}
                      emptyLabel={d.card.empty}
                      onChange={(v) => patch({ fixedValue: v })}
                    />
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      <WeightedOptionsEditor
                        options={config.options}
                        onChange={(o) => patch({ options: o })}
                      />
                      <div className="rounded-xl border border-line bg-surface-2/40 p-3">
                        <p className="mb-2 flex items-center gap-1.5 text-xs font-medium">
                          {d.card.projected}
                          <InfoDot content={d.glossary.distribution} />
                        </p>
                        <DistributionBars data={previewData} total={previewTotal} />
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* CHECKBOX */}
              {question.type === "CHECKBOX" && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-3">
                    <CheckboxRange config={config} onChange={patch} d={d} />
                    <WeightedOptionsEditor
                      options={config.options}
                      onChange={(o) => patch({ options: o })}
                    />
                  </div>
                  <div className="rounded-xl border border-line bg-surface-2/40 p-3">
                    <p className="mb-2 flex items-center gap-1.5 text-xs font-medium">
                      {d.card.howOften}
                      <InfoDot content={d.glossary.distribution} />
                    </p>
                    <DistributionBars data={previewData} total={previewTotal} />
                  </div>
                </div>
              )}

              {/* TEXT */}
              {text &&
                (config.mode === "fixed" ? (
                  question.type === "PARAGRAPH" ? (
                    <textarea
                      value={config.fixedValue}
                      onChange={(e) => patch({ fixedValue: e.target.value })}
                      placeholder={d.card.fixedTextPlaceholder}
                      rows={3}
                      className="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm focus-ring"
                    />
                  ) : (
                    <input
                      type="text"
                      value={config.fixedValue}
                      onChange={(e) => patch({ fixedValue: e.target.value })}
                      placeholder={d.card.fixedTextPlaceholder}
                      className="h-10 w-full rounded-xl border border-line bg-surface px-3.5 text-sm focus-ring"
                    />
                  )
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    <WeightedTextEditor
                      options={config.options}
                      onChange={(o) => patch({ options: o })}
                    />
                    <div className="rounded-xl border border-line bg-surface-2/40 p-3">
                      <p className="mb-2 flex items-center gap-1.5 text-xs font-medium">
                        {d.card.projected}
                        <InfoDot content={d.glossary.distribution} />
                      </p>
                      <DistributionBars data={previewData} total={previewTotal} />
                    </div>
                  </div>
                ))}

              {/* DATE */}
              {question.type === "DATE" && (
                <input
                  type="date"
                  value={config.fixedValue}
                  onChange={(e) => patch({ fixedValue: e.target.value })}
                  className="h-10 rounded-xl border border-line bg-surface px-3.5 text-sm focus-ring"
                />
              )}

              {/* TIME */}
              {question.type === "TIME" && (
                <input
                  type="time"
                  value={config.fixedValue}
                  onChange={(e) => patch({ fixedValue: e.target.value })}
                  className="h-10 rounded-xl border border-line bg-surface px-3.5 text-sm focus-ring"
                />
              )}

              {/* GRID */}
              {question.type === "GRID" && (
                <GridEditor question={question} config={config} onChange={onChange} />
              )}
          </div>
        </motion.div>
      )}

      {!config.include && (
        <p className="mt-3 border-t border-line/70 pt-3 text-xs text-muted">
          {meta.supported ? d.card.leftBlank : d.card.unsupportedNote}
        </p>
      )}
    </motion.div>
  );
}

function FixedChoicePicker({
  options,
  value,
  emptyLabel,
  onChange,
}: {
  options: WeightedOption[];
  value: string;
  emptyLabel: string;
  onChange: (value: string) => void;
}) {
  const { d } = useI18n();
  return (
    <div className="flex flex-col gap-1.5">
      {options.map((opt, i) => {
        const selected = opt.value === value;
        return (
          <button
            key={`${opt.value}-${i}`}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex items-center gap-2.5 rounded-xl border px-3 py-2 text-left text-sm transition-colors focus-ring",
              selected
                ? "border-brand bg-brand-soft text-foreground"
                : "border-line hover:bg-surface-2",
            )}
          >
            <span
              className={cn(
                "grid h-4 w-4 place-items-center rounded-full border-2",
                selected ? "border-brand" : "border-line",
              )}
            >
              {selected && <span className="h-2 w-2 rounded-full brand-gradient" />}
            </span>
            {opt.isOther ? d.card.other : opt.value || emptyLabel}
          </button>
        );
      })}
    </div>
  );
}

function CheckboxRange({
  config,
  onChange,
  d,
}: {
  config: QuestionConfig;
  onChange: (patch: Partial<QuestionConfig>) => void;
  d: Dict;
}) {
  const enabledCount = config.options.filter((o) => o.enabled).length;
  const field =
    "h-9 w-16 rounded-lg border border-line bg-surface px-2 text-center text-sm tabular-nums focus-ring";
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-surface-2/40 px-3 py-2.5">
      <span className="flex items-center gap-1.5 text-xs font-medium">
        {d.card.selectionsPer}
        <InfoDot content={d.glossary.checkboxRange} />
      </span>
      <label className="flex items-center gap-1.5 text-xs text-muted">
        {d.card.min}
        <input
          type="text"
          inputMode="numeric"
          value={String(config.checkboxMin)}
          onChange={(e) => {
            const digits = e.target.value.replace(/\D/g, "");
            onChange({
              checkboxMin: clamp(digits === "" ? 0 : parseInt(digits, 10), 0, config.checkboxMax),
            });
          }}
          className={field}
        />
      </label>
      <label className="flex items-center gap-1.5 text-xs text-muted">
        {d.card.max}
        <input
          type="text"
          inputMode="numeric"
          value={String(config.checkboxMax)}
          onChange={(e) => {
            const digits = e.target.value.replace(/\D/g, "");
            onChange({
              checkboxMax: clamp(
                digits === "" ? 1 : parseInt(digits, 10),
                config.checkboxMin,
                enabledCount || 1,
              ),
            });
          }}
          className={field}
        />
      </label>
    </div>
  );
}

function GridEditor({
  question,
  config,
  onChange,
}: {
  question: ParsedQuestion;
  config: QuestionConfig;
  onChange: (config: QuestionConfig) => void;
}) {
  const rows = question.gridRows ?? [];
  const rowConfigs = config.gridRowConfigs ?? {};

  function updateRow(entryId: string, options: WeightedOption[]) {
    onChange({
      ...config,
      gridRowConfigs: { ...rowConfigs, [entryId]: options },
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {rows.map((row) => (
        <div key={row.entryId}>
          <p className="mb-2 text-sm font-medium">{row.label}</p>
          <WeightedOptionsEditor
            options={rowConfigs[row.entryId] ?? []}
            onChange={(o) => updateRow(row.entryId, o)}
          />
        </div>
      ))}
    </div>
  );
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}
