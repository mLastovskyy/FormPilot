"use client";

import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  Gauge,
  Hash,
  Loader2,
  Play,
  RefreshCw,
  RotateCcw,
  Send,
  Square,
  Timer,
  TriangleAlert,
  XCircle,
} from "lucide-react";
import type { ParsedForm, QuestionConfig, SampledAnswer } from "@/lib/types";
import { describeConfigIssue, isChoiceType, sampleSubmission } from "@/lib/distribution";
import { Button } from "@/components/ui/Button";
import { InfoDot } from "@/components/ui/InfoDot";
import { DistributionBars } from "@/components/DistributionBars";
import { useI18n } from "@/components/I18nProvider";

export type RunPhase = "idle" | "running" | "paused" | "done";
export interface SubmitOutcome {
  ok: boolean;
  status: number;
}
export type Realized = Record<string, Record<string, number>>;

interface Props {
  form: ParsedForm;
  configs: QuestionConfig[];
  count: number;
  delayMs: number;
  onCountChange: (n: number) => void;
  onDelayChange: (n: number) => void;
  onBack: () => void;
  onRestart: () => void;
  // Run progress is lifted to the wizard so it survives navigating back to
  // reconfigure and then continuing from where it stopped.
  results: SubmitOutcome[];
  setResults: React.Dispatch<React.SetStateAction<SubmitOutcome[]>>;
  realized: Realized;
  setRealized: React.Dispatch<React.SetStateAction<Realized>>;
  phase: RunPhase;
  setPhase: React.Dispatch<React.SetStateAction<RunPhase>>;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Three dots that pulse in sequence — a lively "in progress" indicator. */
function AnimatedDots() {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1 w-1 rounded-full bg-current"
          animate={{ opacity: [0.25, 1, 0.25] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.18, ease: "easeInOut" }}
        />
      ))}
    </span>
  );
}

function reasonKey(status: number): "network" | "blocked" | "rateLimited" | "rejected" | "serverError" | "http" {
  if (status === 0) return "network";
  if (status === 401 || status === 403) return "blocked";
  if (status === 429) return "rateLimited";
  if (status === 400) return "rejected";
  if (status >= 500) return "serverError";
  return "http";
}

export function RunStep({
  form,
  configs,
  count,
  delayMs,
  onCountChange,
  onDelayChange,
  onBack,
  onRestart,
  results,
  setResults,
  realized,
  setRealized,
  phase,
  setPhase,
}: Props) {
  const { d } = useI18n();
  const [ack, setAck] = useState(false);
  const stopRef = useRef(false);

  const issues = useMemo(
    () => configs.filter((c) => describeConfigIssue(c, d) !== null).length,
    [configs, d],
  );

  const succeeded = results.filter((r) => r.ok).length;
  const failed = results.length - succeeded;
  const progress = count > 0 ? Math.round((results.length / count) * 100) : 0;

  const reasonLabel = (status: number) => {
    const key = reasonKey(status);
    return key === "http" ? d.run.reason.http(status) : d.run.reason[key];
  };

  const failureGroups = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of results) {
      if (r.ok) continue;
      const label = reasonLabel(r.status);
      m.set(label, (m.get(label) ?? 0) + 1);
    }
    return [...m.entries()];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results, d]);

  function tally(prev: Realized, answers: SampledAnswer[]): Realized {
    const next: Realized = { ...prev };
    for (const a of answers) {
      if (a.entryId.endsWith(".other_option_response")) continue;
      const bucket = { ...(next[a.entryId] ?? {}) };
      for (const v of a.values) {
        const key = v === "__other_option__" ? "Other" : v;
        bucket[key] = (bucket[key] ?? 0) + 1;
      }
      next[a.entryId] = bucket;
    }
    return next;
  }

  async function submitOne(answers: SampledAnswer[]): Promise<SubmitOutcome> {
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          responseUrl: form.responseUrl,
          fbzx: form.fbzx,
          pageCount: form.pageCount,
          answers,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; status?: number };
      return { ok: Boolean(data.ok), status: data.status ?? res.status };
    } catch {
      return { ok: false, status: 0 };
    }
  }

  // Send submissions [fromIndex, count). Only successful sends are tallied.
  async function run(fromIndex: number) {
    setPhase("running");
    stopRef.current = false;
    let acc: Realized = fromIndex === 0 ? {} : { ...realized };
    let stopped = false;
    for (let i = fromIndex; i < count; i++) {
      if (stopRef.current) {
        stopped = true;
        break;
      }
      const answers = sampleSubmission(configs);
      const outcome = await submitOne(answers);
      if (outcome.ok) {
        acc = tally(acc, answers);
        setRealized(acc);
      }
      setResults((r) => [...r, outcome]);
      if (delayMs > 0 && i < count - 1) await sleep(delayMs);
    }
    setPhase(stopped ? "paused" : "done");
  }

  // Re-send only the submissions that failed, flipping them in place on success.
  // Retrying doesn't change the total attempted, so if we still haven't reached
  // the target count, stay "paused" so the user can keep sending the rest.
  async function retryFailed() {
    setPhase("running");
    stopRef.current = false;
    let acc: Realized = { ...realized };
    const failedIdx = results.flatMap((r, i) => (r.ok ? [] : [i]));
    const targetReached = results.length >= count;
    for (const idx of failedIdx) {
      if (stopRef.current) break;
      const answers = sampleSubmission(configs);
      const outcome = await submitOne(answers);
      if (outcome.ok) {
        acc = tally(acc, answers);
        setRealized(acc);
      }
      setResults((r) => r.map((old, i) => (i === idx ? outcome : old)));
      if (delayMs > 0) await sleep(delayMs);
    }
    setPhase(stopRef.current || !targetReached ? "paused" : "done");
  }

  function startFresh() {
    setResults([]);
    setRealized({});
    run(0);
  }

  function stop() {
    stopRef.current = true;
  }

  const statusLabel =
    phase === "running" ? d.run.submitting : phase === "paused" ? d.run.paused : d.run.finished;

  const choiceConfigs = configs.filter(
    (c) => c.include && isChoiceType(c.type) && c.entryId && realized[c.entryId],
  );

  return (
    <div className="mx-auto max-w-3xl">
      <div className="card p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-soft text-brand">
            <Gauge className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">{d.run.title}</h2>
            <p className="text-sm text-muted">
              {d.run.subtitle}{" "}
              <span className="font-medium text-foreground">{form.title}</span>.
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="flex items-center gap-1.5 text-sm font-medium">
              <Hash className="h-4 w-4 text-muted" /> {d.run.submissions}
              <InfoDot content={d.glossary.count} />
            </span>
            <input
              type="text"
              inputMode="numeric"
              disabled={phase === "running"}
              value={String(count)}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, "");
                onCountChange(digits === "" ? 1 : Math.max(1, Math.min(500, parseInt(digits, 10))));
              }}
              className="h-11 rounded-xl border border-line bg-surface px-3.5 text-sm focus-ring disabled:opacity-50"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="flex items-center gap-1.5 text-sm font-medium">
              <Timer className="h-4 w-4 text-muted" /> {d.run.delay}
              <InfoDot content={d.glossary.delay} />
            </span>
            <input
              type="text"
              inputMode="numeric"
              disabled={phase === "running"}
              value={String(delayMs)}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, "");
                onDelayChange(digits === "" ? 0 : Math.min(5000, parseInt(digits, 10)));
              }}
              className="h-11 rounded-xl border border-line bg-surface px-3.5 text-sm focus-ring disabled:opacity-50"
            />
          </label>
        </div>

        {issues > 0 && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-[color-mix(in_srgb,var(--warning)_35%,transparent)] bg-[color-mix(in_srgb,var(--warning)_10%,transparent)] px-3.5 py-2.5 text-sm text-[var(--warning)]">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{d.run.issues(issues)}</span>
          </div>
        )}

        {/* Acknowledgement (first run only) */}
        {phase === "idle" && (
          <label className="mt-4 flex cursor-pointer items-start gap-2.5 rounded-xl border border-line bg-surface-2/50 p-3.5 text-sm">
            <input
              type="checkbox"
              checked={ack}
              onChange={(e) => setAck(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-[var(--brand)]"
            />
            <span className="text-muted">{d.run.ack}</span>
          </label>
        )}

        {/* Paused note */}
        {phase === "paused" && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-line bg-surface-2/50 px-3.5 py-2.5 text-sm text-muted">
            <Play className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
            <span>{d.run.pausedNote(results.length, count)}</span>
          </div>
        )}

        {/* Progress */}
        <AnimatePresence>
          {phase !== "idle" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 overflow-hidden"
            >
              <div className="mb-2 flex items-center justify-between text-sm">
                {phase === "running" ? (
                  <span className="flex items-center gap-2 font-medium text-brand">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{d.run.submitting.replace(/…$/, "")}</span>
                    <AnimatedDots />
                  </span>
                ) : (
                  <span className="font-medium">{statusLabel}</span>
                )}
                <span className="tabular-nums text-muted">
                  {results.length} / {count}
                </span>
              </div>

              {/* Progress bar with an on-brand paper plane riding the edge */}
              <div className="relative pt-6">
                {phase === "running" && (
                  <motion.div
                    className="pointer-events-none absolute top-0 z-10"
                    animate={{ left: `${progress}%` }}
                    transition={{ ease: "easeOut", duration: 0.3 }}
                  >
                    <motion.span
                      className="block -translate-x-1/2 text-brand"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ repeat: Infinity, duration: 1.1, ease: "easeInOut" }}
                    >
                      <Send className="h-5 w-5 -rotate-12" />
                    </motion.span>
                  </motion.div>
                )}
                <div className="h-3 w-full overflow-hidden rounded-full bg-surface-2">
                  <motion.div
                    className="relative h-full rounded-full brand-gradient"
                    animate={{ width: `${progress}%` }}
                    transition={{ ease: "easeOut", duration: 0.3 }}
                  >
                    {phase === "running" && (
                      <span className="absolute inset-0 block -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                    )}
                  </motion.div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 rounded-xl border border-line bg-surface p-3">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  <div>
                    <p className="text-xl font-semibold tabular-nums">{succeeded}</p>
                    <p className="text-xs text-muted">{d.run.succeeded}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-line bg-surface p-3">
                  <XCircle className="h-5 w-5 text-[var(--danger)]" />
                  <div>
                    <p className="text-xl font-semibold tabular-nums">{failed}</p>
                    <p className="text-xs text-muted">{d.run.failed}</p>
                  </div>
                </div>
              </div>

              {/* Failure reasons + retry */}
              {phase !== "running" && failed > 0 && (
                <div className="mt-3 rounded-xl border border-[color-mix(in_srgb,var(--danger)_30%,transparent)] bg-[color-mix(in_srgb,var(--danger)_8%,transparent)] p-3.5">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="flex items-center gap-1.5 text-sm font-medium text-[var(--danger)]">
                      <TriangleAlert className="h-4 w-4" /> {d.run.failures}
                    </p>
                    <Button size="sm" variant="outline" onClick={retryFailed}>
                      <RefreshCw className="h-4 w-4" /> {d.run.retryFailed(failed)}
                    </Button>
                  </div>
                  <ul className="flex flex-col gap-1 text-xs text-muted">
                    {failureGroups.map(([label, n]) => (
                      <li key={label} className="flex items-center justify-between">
                        <span>{label}</span>
                        <span className="tabular-nums font-medium text-foreground">{n}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-between gap-3">
          <Button variant="outline" onClick={onBack} disabled={phase === "running"}>
            <ArrowLeft className="h-4 w-4" /> {d.run.back}
          </Button>
          <div className="flex gap-2">
            {phase === "running" ? (
              <Button variant="danger" onClick={stop}>
                <Square className="h-4 w-4" /> {d.run.stop}
              </Button>
            ) : phase === "paused" ? (
              <>
                <Button variant="outline" onClick={onRestart}>
                  {d.run.newForm}
                </Button>
                <Button onClick={() => run(results.length)}>
                  <Play className="h-4 w-4" /> {d.run.continue}
                </Button>
              </>
            ) : phase === "done" ? (
              <>
                <Button variant="outline" onClick={startFresh}>
                  <RotateCcw className="h-4 w-4" /> {d.run.runAgain}
                </Button>
                <Button onClick={onRestart}>{d.run.newForm}</Button>
              </>
            ) : (
              <Button onClick={startFresh} disabled={!ack}>
                <Play className="h-4 w-4" /> {d.run.start(count)}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Realized distribution */}
      {(phase === "done" || phase === "paused") && choiceConfigs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="card mt-4 p-5"
        >
          <h3 className="mb-1 flex items-center gap-1.5 font-semibold">
            {d.run.whatSent}
            <InfoDot content={d.run.whatSentInfo} />
          </h3>
          <p className="mb-4 text-sm text-muted">{d.run.aggregated(succeeded)}</p>
          <div className="flex flex-col gap-5">
            {choiceConfigs.map((c) => {
              const bucket = realized[c.entryId] ?? {};
              const data = c.options.map((o) => ({
                label: o.isOther ? d.card.other : o.value || "—",
                count: bucket[o.isOther ? "Other" : o.value] ?? 0,
              }));
              const total = data.reduce((s, x) => s + x.count, 0);
              return (
                <div key={c.entryId}>
                  <p className="mb-2 truncate text-sm font-medium">{c.title}</p>
                  <DistributionBars data={data} total={total} />
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
