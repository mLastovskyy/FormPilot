import type { QuestionType } from "./types";

/** Lucide icon name used to represent a question type in the UI. */
export type TypeIconName =
  | "type"
  | "align-left"
  | "circle-dot"
  | "chevron-down"
  | "check-square"
  | "sliders-horizontal"
  | "calendar"
  | "clock"
  | "grid-3x3"
  | "help-circle";

export interface TypeMeta {
  icon: TypeIconName;
  /** Whether FormPilot can generate answers for this type. */
  supported: boolean;
}

/**
 * Locale-independent metadata per question type. Human-readable labels and
 * hints live in the i18n dictionary (`d.types[...]`).
 */
export const TYPE_META: Record<QuestionType, TypeMeta> = {
  SHORT_ANSWER: { icon: "type", supported: true },
  PARAGRAPH: { icon: "align-left", supported: true },
  RADIO: { icon: "circle-dot", supported: true },
  DROPDOWN: { icon: "chevron-down", supported: true },
  CHECKBOX: { icon: "check-square", supported: true },
  LINEAR_SCALE: { icon: "sliders-horizontal", supported: true },
  DATE: { icon: "calendar", supported: true },
  TIME: { icon: "clock", supported: true },
  GRID: { icon: "grid-3x3", supported: true },
  UNSUPPORTED: { icon: "help-circle", supported: false },
};
