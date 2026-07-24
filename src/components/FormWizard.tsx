"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { ParsedForm, QuestionConfig } from "@/lib/types";
import { buildDefaultConfig } from "@/lib/distribution";
import {
  DEFAULT_STATE,
  clearState,
  loadState,
  saveState,
  type WizardStep,
} from "@/lib/persist";
import { Stepper } from "@/components/ui/Stepper";
import { UrlStep } from "@/components/steps/UrlStep";
import { ReviewStep } from "@/components/steps/ReviewStep";
import { ConfigureStep } from "@/components/steps/ConfigureStep";
import {
  RunStep,
  type Realized,
  type RunPhase,
  type SubmitOutcome,
} from "@/components/steps/RunStep";
import { useI18n } from "@/components/I18nProvider";
import type { Dict } from "@/lib/i18n";

const STEP_KEYS: WizardStep[] = ["url", "review", "configure", "run"];
const stepIndex = (s: WizardStep) => STEP_KEYS.indexOf(s);

const stepLabel = (key: WizardStep, d: Dict): string =>
  key === "url" ? d.steps.link : d.steps[key];

export function FormWizard() {
  const { d } = useI18n();
  const [step, setStep] = useState<WizardStep>("url");
  const [url, setUrl] = useState("");
  const [form, setForm] = useState<ParsedForm | null>(null);
  const [configs, setConfigs] = useState<QuestionConfig[]>([]);
  const [count, setCount] = useState(DEFAULT_STATE.count);
  const [delayMs, setDelayMs] = useState(DEFAULT_STATE.delayMs);

  // Run progress — lifted here so it persists when navigating between steps
  // (e.g. pause → reconfigure → continue).
  const [runResults, setRunResults] = useState<SubmitOutcome[]>([]);
  const [runRealized, setRunRealized] = useState<Realized>({});
  const [runPhase, setRunPhase] = useState<RunPhase>("idle");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [maxReached, setMaxReached] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Steps have different heights and share the page with the FAQ below, so
  // bring the wizard back into view whenever the step changes.
  function scrollToWizard() {
    if (typeof window === "undefined") return;
    requestAnimationFrame(() =>
      rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  }

  // One-time hydration from localStorage after mount. Reading browser storage
  // can't happen during SSR, so this is the intended place for it. `hydrated`
  // is state (not a ref) so the persist effect below only starts saving once
  // the loaded values are in React state — otherwise the first save would
  // clobber the stored state with defaults (notably under dev StrictMode).
  useEffect(() => {
    const saved = loadState();
    /* eslint-disable react-hooks/set-state-in-effect */
    if (saved) {
      setUrl(saved.url);
      setCount(saved.count);
      setDelayMs(saved.delayMs);
      if (saved.form && saved.configs.length > 0) {
        setForm(saved.form);
        setConfigs(saved.configs);
        setStep(saved.step);
        setMaxReached(Math.max(stepIndex(saved.step), 0));
      }
    }
    setHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // Persist on change — only after hydration has populated state.
  useEffect(() => {
    if (!hydrated) return;
    saveState({ step, url, form, configs, count, delayMs });
  }, [hydrated, step, url, form, configs, count, delayMs]);

  function goto(next: WizardStep) {
    setStep(next);
    setMaxReached((m) => Math.max(m, stepIndex(next)));
    scrollToWizard();
  }

  function localizeError(code: unknown, fallback?: string): string {
    if (typeof code === "string" && code in d.errors) {
      return d.errors[code as keyof typeof d.errors];
    }
    return fallback ?? d.errors.generic;
  }

  async function handleParse() {
    if (!url.trim()) {
      setError(d.errors.empty);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(localizeError(data?.code, data?.error));
        return;
      }
      const parsed = data.form as ParsedForm;
      if (parsed.questions.length === 0) {
        setError(d.errors.noQuestions);
        return;
      }
      setForm(parsed);
      setConfigs(parsed.questions.map(buildDefaultConfig));
      goto("review");
    } catch {
      setError(d.errors.clientNetwork);
    } finally {
      setLoading(false);
    }
  }

  function updateConfig(index: number, config: QuestionConfig) {
    setConfigs((cs) => cs.map((c, i) => (i === index ? config : c)));
  }

  function bulkConfig(mutator: (config: QuestionConfig) => QuestionConfig) {
    setConfigs((cs) => cs.map(mutator));
  }

  function restart() {
    clearState();
    setStep("url");
    setUrl("");
    setForm(null);
    setConfigs([]);
    setCount(DEFAULT_STATE.count);
    setDelayMs(DEFAULT_STATE.delayMs);
    setMaxReached(0);
    setError(null);
    setRunResults([]);
    setRunRealized({});
    setRunPhase("idle");
  }

  function selectStep(idx: number) {
    const target = STEP_KEYS[idx];
    if (!target) return;
    if (idx > 0 && !form) return; // can't leave the URL step without a form
    setStep(target);
    scrollToWizard();
  }

  const stepperSteps = STEP_KEYS.map((key) => ({ key, label: stepLabel(key, d) }));

  const variants = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -16 },
  };

  return (
    <div ref={rootRef} className="w-full scroll-mt-24">
      <div className="mx-auto mb-8 max-w-md">
        <Stepper
          steps={stepperSteps}
          current={stepIndex(step)}
          maxReached={maxReached}
          onSelect={selectStep}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          {step === "url" && (
            <UrlStep
              url={url}
              onUrlChange={setUrl}
              onSubmit={handleParse}
              loading={loading}
              error={error}
            />
          )}

          {step === "review" && form && (
            <ReviewStep
              form={form}
              onConfirm={() => goto("configure")}
              onBack={() => goto("url")}
            />
          )}

          {step === "configure" && form && (
            <ConfigureStep
              form={form}
              configs={configs}
              onChange={updateConfig}
              onBulk={bulkConfig}
              onBack={() => goto("review")}
              onNext={() => goto("run")}
            />
          )}

          {step === "run" && form && (
            <RunStep
              form={form}
              configs={configs}
              count={count}
              delayMs={delayMs}
              onCountChange={setCount}
              onDelayChange={setDelayMs}
              onBack={() => goto("configure")}
              onRestart={restart}
              results={runResults}
              setResults={setRunResults}
              realized={runRealized}
              setRealized={setRunRealized}
              phase={runPhase}
              setPhase={setRunPhase}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
