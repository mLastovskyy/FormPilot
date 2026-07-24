import type { ParsedForm, QuestionConfig } from "./types";

export type WizardStep = "url" | "review" | "configure" | "run";

export interface WizardState {
  step: WizardStep;
  url: string;
  form: ParsedForm | null;
  configs: QuestionConfig[];
  count: number;
  delayMs: number;
}

const KEY = "formpilot:state:v1";

export const DEFAULT_STATE: WizardState = {
  step: "url",
  url: "",
  form: null,
  configs: [],
  count: 10,
  delayMs: 400,
};

/** Load persisted wizard state (client-only). Returns null on SSR or errors. */
export function loadState(): WizardState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as WizardState;
    if (!parsed || typeof parsed !== "object") return null;
    return { ...DEFAULT_STATE, ...parsed };
  } catch {
    return null;
  }
}

export function saveState(state: WizardState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* quota / privacy mode — non-fatal */
  }
}

export function clearState(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

export type { ParsedForm, QuestionConfig };
