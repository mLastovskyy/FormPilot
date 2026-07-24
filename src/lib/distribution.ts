/**
 * Answer-strategy engine for FormPilot.
 *
 * Pure, dependency-free functions that turn a parsed question into a default
 * strategy, and turn a strategy into concrete sampled answers. Runs both on
 * the server (when generating real submissions) and in the browser (for the
 * live distribution preview), so it must not import anything Node/DOM specific.
 */

import type {
  ParsedQuestion,
  QuestionConfig,
  SampledAnswer,
  SampledSubmission,
  WeightedOption,
} from "./types";
import type { Dict } from "./i18n";

const OTHER_TOKEN = "__other_option__";

const CHOICE_TYPES: ReadonlySet<string> = new Set([
  "RADIO",
  "DROPDOWN",
  "CHECKBOX",
  "LINEAR_SCALE",
]);

const TEXT_TYPES: ReadonlySet<string> = new Set(["SHORT_ANSWER", "PARAGRAPH"]);

export function isChoiceType(type: string): boolean {
  return CHOICE_TYPES.has(type);
}

export function isTextType(type: string): boolean {
  return TEXT_TYPES.has(type);
}

function toWeightedOptions(question: ParsedQuestion): WeightedOption[] {
  return question.options.map((opt) => ({
    value: opt.value,
    enabled: true,
    weight: 1,
    isOther: opt.isOther,
    otherText: "",
  }));
}

function columnsToWeighted(columns: string[]): WeightedOption[] {
  return columns.map((value) => ({
    value,
    enabled: true,
    weight: 1,
    isOther: false,
    otherText: "",
  }));
}

/** Produce a sensible starting configuration for a freshly parsed question. */
export function buildDefaultConfig(question: ParsedQuestion): QuestionConfig {
  const base: QuestionConfig = {
    questionId: question.id,
    entryId: question.entryId,
    title: question.title,
    type: question.type,
    required: question.required,
    include: question.type !== "UNSUPPORTED",
    mode: "random",
    options: [],
    fixedValue: "",
    checkboxMin: 1,
    checkboxMax: 1,
  };

  if (isChoiceType(question.type)) {
    base.options = toWeightedOptions(question);
    base.fixedValue = question.options[0]?.value ?? "";
    if (question.type === "CHECKBOX") {
      base.checkboxMax = Math.min(2, Math.max(1, question.options.length));
      base.checkboxMin = 1;
    }
  } else if (question.type === "GRID") {
    const columns = question.gridColumns ?? [];
    const rowConfigs: Record<string, WeightedOption[]> = {};
    for (const row of question.gridRows ?? []) {
      rowConfigs[row.entryId] = columnsToWeighted(columns);
    }
    base.gridRowConfigs = rowConfigs;
  }
  // Text types start with an empty weighted list the user fills in.

  return base;
}

/**
 * Explain why a required question isn't ready to submit yet, or null if it's
 * fine. Shared by the per-question card and the step-level readiness summary.
 * Messages are localized via the passed dictionary.
 */
export function describeConfigIssue(config: QuestionConfig, d: Dict): string | null {
  if (!config.include || !config.required) return null;
  const issues = d.issues;
  if (isChoiceType(config.type)) {
    if (config.type === "CHECKBOX") {
      if (!config.options.some((o) => o.enabled)) return issues.noEnabledOptions;
      return null;
    }
    if (config.mode === "random" && !config.options.some((o) => o.enabled)) {
      return issues.noEnabledOptions;
    }
    if (config.mode === "fixed" && !config.fixedValue) {
      return issues.pickFixed;
    }
  }
  if (isTextType(config.type)) {
    const hasAnswer = config.options.some((o) => o.enabled && o.value.trim() && o.weight > 0);
    if (config.mode === "random" && !hasAnswer) return issues.addAnswer;
    if (config.mode === "fixed" && !config.fixedValue.trim()) return issues.enterValue;
  }
  if ((config.type === "DATE" || config.type === "TIME") && !config.fixedValue) {
    return issues.chooseValue;
  }
  return null;
}

/** Weighted-random pick among the enabled options. */
function pickWeighted(options: WeightedOption[]): WeightedOption | null {
  const pool = options.filter((o) => o.enabled && o.weight > 0);
  if (pool.length === 0) return null;
  const total = pool.reduce((sum, o) => sum + o.weight, 0);
  let r = Math.random() * total;
  for (const opt of pool) {
    r -= opt.weight;
    if (r <= 0) return opt;
  }
  return pool[pool.length - 1];
}

/** Pick `k` distinct options via weighted sampling without replacement. */
function pickManyWeighted(options: WeightedOption[], k: number): WeightedOption[] {
  const pool = options.filter((o) => o.enabled && o.weight > 0);
  const chosen: WeightedOption[] = [];
  const remaining = [...pool];
  const want = Math.min(k, remaining.length);
  for (let i = 0; i < want; i++) {
    const total = remaining.reduce((sum, o) => sum + o.weight, 0);
    let r = Math.random() * total;
    let idx = remaining.length - 1;
    for (let j = 0; j < remaining.length; j++) {
      r -= remaining[j].weight;
      if (r <= 0) {
        idx = j;
        break;
      }
    }
    chosen.push(remaining[idx]);
    remaining.splice(idx, 1);
  }
  return chosen;
}

function randomInt(min: number, max: number): number {
  const lo = Math.min(min, max);
  const hi = Math.max(min, max);
  return lo + Math.floor(Math.random() * (hi - lo + 1));
}

function optionToAnswers(
  entryId: string,
  opt: WeightedOption,
): SampledAnswer[] {
  if (opt.isOther) {
    return [
      { entryId, values: [OTHER_TOKEN] },
      {
        entryId: `${entryId}.other_option_response`,
        values: [opt.otherText || ""],
      },
    ];
  }
  return [{ entryId, values: [opt.value] }];
}

function mergeAnswers(target: SampledAnswer[], entryId: string, value: string) {
  const existing = target.find((a) => a.entryId === entryId);
  if (existing) {
    existing.values.push(value);
  } else {
    target.push({ entryId, values: [value] });
  }
}

/** Generate the answers for one question in one submission. */
export function sampleQuestion(config: QuestionConfig): SampledAnswer[] {
  if (!config.include || !config.entryId) {
    // GRID has no top-level entryId of its own; handle it below.
    if (config.type !== "GRID") return [];
  }

  switch (config.type) {
    case "RADIO":
    case "DROPDOWN":
    case "LINEAR_SCALE": {
      if (config.mode === "fixed") {
        const opt = config.options.find((o) => o.value === config.fixedValue);
        if (opt) return optionToAnswers(config.entryId, opt);
        return config.fixedValue
          ? [{ entryId: config.entryId, values: [config.fixedValue] }]
          : [];
      }
      const picked = pickWeighted(config.options);
      return picked ? optionToAnswers(config.entryId, picked) : [];
    }

    case "CHECKBOX": {
      if (config.mode === "fixed") {
        const opt = config.options.find((o) => o.value === config.fixedValue);
        return opt ? optionToAnswers(config.entryId, opt) : [];
      }
      const enabledCount = config.options.filter((o) => o.enabled).length;
      const maxAllowed = Math.min(config.checkboxMax, enabledCount);
      const minAllowed = Math.min(config.checkboxMin, maxAllowed);
      const k = randomInt(Math.max(0, minAllowed), Math.max(0, maxAllowed));
      const picks = pickManyWeighted(config.options, k);
      const answers: SampledAnswer[] = [];
      for (const opt of picks) {
        for (const a of optionToAnswers(config.entryId, opt)) {
          if (a.entryId === config.entryId) {
            mergeAnswers(answers, a.entryId, a.values[0]);
          } else {
            answers.push(a);
          }
        }
      }
      return answers;
    }

    case "SHORT_ANSWER":
    case "PARAGRAPH": {
      if (config.mode === "fixed") {
        return config.fixedValue
          ? [{ entryId: config.entryId, values: [config.fixedValue] }]
          : [];
      }
      // Weighted pick among the user-provided answers.
      const picked = pickWeighted(config.options);
      if (picked) return [{ entryId: config.entryId, values: [picked.value] }];
      return config.fixedValue
        ? [{ entryId: config.entryId, values: [config.fixedValue] }]
        : [];
    }

    case "DATE": {
      // Expected fixedValue format: YYYY-MM-DD
      const [year, month, day] = config.fixedValue.split("-");
      if (!year || !month || !day) return [];
      return [
        { entryId: `${config.entryId}_year`, values: [year] },
        { entryId: `${config.entryId}_month`, values: [String(Number(month))] },
        { entryId: `${config.entryId}_day`, values: [String(Number(day))] },
      ];
    }

    case "TIME": {
      // Expected fixedValue format: HH:MM
      const [hour, minute] = config.fixedValue.split(":");
      if (hour === undefined || minute === undefined) return [];
      return [
        { entryId: `${config.entryId}_hour`, values: [String(Number(hour))] },
        {
          entryId: `${config.entryId}_minute`,
          values: [String(Number(minute))],
        },
      ];
    }

    case "GRID": {
      const answers: SampledAnswer[] = [];
      const rowConfigs = config.gridRowConfigs ?? {};
      for (const [rowEntryId, columns] of Object.entries(rowConfigs)) {
        const picked = pickWeighted(columns);
        if (picked) answers.push({ entryId: rowEntryId, values: [picked.value] });
      }
      return answers;
    }

    default:
      return [];
  }
}

/** Generate a full submission (all included questions) as sampled answers. */
export function sampleSubmission(configs: QuestionConfig[]): SampledSubmission {
  const out: SampledSubmission = [];
  for (const config of configs) {
    if (!config.include) continue;
    out.push(...sampleQuestion(config));
  }
  return out;
}

/**
 * Monte-Carlo the realized distribution of a single choice/grid question over
 * `n` trials — used to power the live preview bars in the configurator.
 */
export function simulateQuestion(
  config: QuestionConfig,
  n: number,
): Record<string, number> {
  const tally: Record<string, number> = {};
  const bump = (key: string) => {
    tally[key] = (tally[key] ?? 0) + 1;
  };

  for (let i = 0; i < n; i++) {
    const answers = sampleQuestion(config);
    for (const answer of answers) {
      if (answer.entryId.endsWith(".other_option_response")) continue;
      for (const value of answer.values) {
        bump(value === OTHER_TOKEN ? "Other" : value);
      }
    }
  }
  return tally;
}
