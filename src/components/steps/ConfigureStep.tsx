"use client";

import { useMemo } from "react";
import { ArrowLeft, ArrowRight, CheckCheck, ListX, Sliders } from "lucide-react";
import type { ParsedForm, QuestionConfig } from "@/lib/types";
import { describeConfigIssue } from "@/lib/distribution";
import { QuestionConfigCard } from "@/components/QuestionConfigCard";
import { Button } from "@/components/ui/Button";
import { InfoDot } from "@/components/ui/InfoDot";
import { useI18n } from "@/components/I18nProvider";

interface Props {
  form: ParsedForm;
  configs: QuestionConfig[];
  onChange: (index: number, config: QuestionConfig) => void;
  onBulk: (mutator: (config: QuestionConfig) => QuestionConfig) => void;
  onBack: () => void;
  onNext: () => void;
}

export function ConfigureStep({ form, configs, onChange, onBulk, onBack, onNext }: Props) {
  const { d } = useI18n();
  const issues = useMemo(
    () => configs.filter((c) => describeConfigIssue(c, d) !== null).length,
    [configs, d],
  );
  const included = configs.filter((c) => c.include).length;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="card mb-4 flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-soft text-brand">
            <Sliders className="h-4.5 w-4.5" />
          </div>
          <div>
            <p className="flex items-center gap-1.5 text-sm font-semibold">
              {d.configure.title}
              <InfoDot content={d.configure.titleInfo} />
            </p>
            <p className="text-xs text-muted">
              {d.configure.included(included, configs.length)}
              {issues > 0 && (
                <span className="text-[var(--warning)]">
                  {d.configure.needAttention(issues)}
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onBulk((c) => ({ ...c, include: c.type !== "UNSUPPORTED" }))}
          >
            <CheckCheck className="h-4 w-4" /> {d.configure.includeAll}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onBulk((c) => ({ ...c, include: false }))}
          >
            <ListX className="h-4 w-4" /> {d.configure.excludeAll}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {form.questions.map((q, i) => (
          <QuestionConfigCard
            key={q.id + i}
            index={i}
            question={q}
            config={configs[i]}
            onChange={(c) => onChange(i, c)}
          />
        ))}
      </div>

      <div className="sticky bottom-4 mt-5 flex items-center justify-between gap-3 rounded-2xl border border-line bg-[color-mix(in_srgb,var(--surface)_85%,transparent)] p-3 backdrop-blur-xl">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" /> {d.configure.back}
        </Button>
        <div className="flex items-center gap-3">
          {issues > 0 && (
            <span className="hidden text-xs text-[var(--warning)] sm:inline">
              {d.configure.issues(issues)}
            </span>
          )}
          <Button onClick={onNext}>
            {d.configure.reviewRun} <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
