/**
 * Shared domain types for FormPilot.
 *
 * These types describe a parsed Google Form, the per-question answer
 * strategy the user configures in the UI, and the sampled submissions
 * that get sent to Google. They are intentionally framework-agnostic so
 * the same code can run on the server (parsing + submitting) and in the
 * browser (live distribution preview).
 */

export type QuestionType =
  | "SHORT_ANSWER"
  | "PARAGRAPH"
  | "RADIO"
  | "DROPDOWN"
  | "CHECKBOX"
  | "LINEAR_SCALE"
  | "DATE"
  | "TIME"
  | "GRID"
  | "UNSUPPORTED";

export interface ParsedOption {
  value: string;
  isOther: boolean;
}

export interface GridRow {
  entryId: string;
  label: string;
  required: boolean;
}

export interface ParsedQuestion {
  /** Stable client id (entry id when available, otherwise generated). */
  id: string;
  /** Google "entry" id without the `entry.` prefix. Empty for non-inputs. */
  entryId: string;
  title: string;
  description: string;
  type: QuestionType;
  required: boolean;
  /** For RADIO / DROPDOWN / CHECKBOX / LINEAR_SCALE. */
  options: ParsedOption[];
  /** For GRID only — each row is its own Google entry. */
  gridRows?: GridRow[];
  /** For GRID only — the shared column labels. */
  gridColumns?: string[];
  /** Raw Google type code, kept for debugging / unsupported types. */
  rawType: number;
}

export interface ParsedForm {
  formId: string;
  title: string;
  description: string;
  viewUrl: string;
  responseUrl: string;
  /** Anti-CSRF token embedded in the form, forwarded on submit when present. */
  fbzx: string | null;
  /** Number of pages/sections — used to build the `pageHistory` field. */
  pageCount: number;
  questions: ParsedQuestion[];
  /** Best-effort detection that the form is restricted to signed-in users. */
  requiresLogin: boolean;
}

/** How a single question's answer is decided for each generated submission. */
export type StrategyMode = "fixed" | "random";

export interface WeightedOption {
  value: string;
  /** Whether this option is part of the random pool. */
  enabled: boolean;
  /** Relative weight used for weighted-random selection. */
  weight: number;
  isOther: boolean;
  /** Text sent as the "Other" free-text response when this option is chosen. */
  otherText: string;
}

export interface QuestionConfig {
  questionId: string;
  entryId: string;
  title: string;
  type: QuestionType;
  required: boolean;
  /** Whether this question participates in generated submissions. */
  include: boolean;
  mode: StrategyMode;
  /**
   * Weighted answers. For choice types these come from the form; for text
   * types the user adds their own answer strings, each with a weight.
   */
  options: WeightedOption[];
  /** Fixed single value (choice or text). */
  fixedValue: string;
  /** CHECKBOX: min / max number of options to pick per submission. */
  checkboxMin: number;
  checkboxMax: number;
  /** GRID: entryId -> weighted column options for that row. */
  gridRowConfigs?: Record<string, WeightedOption[]>;
}

/** A single answered field, ready to be turned into `entry.<id>=value` params. */
export interface SampledAnswer {
  entryId: string;
  values: string[];
}

export type SampledSubmission = SampledAnswer[];

export interface SubmitResultItem {
  index: number;
  ok: boolean;
  status: number;
  error?: string;
}

export interface ParseApiResponse {
  form: ParsedForm;
}

/**
 * The client samples each submission locally (so it can show a live preview
 * that matches reality) and posts them one at a time. The server only proxies
 * the POST to Google — keeping each serverless invocation short.
 */
export interface SubmitApiRequest {
  responseUrl: string;
  fbzx: string | null;
  pageCount: number;
  answers: SampledAnswer[];
}

export interface SubmitApiResponse {
  ok: boolean;
  status: number;
}
