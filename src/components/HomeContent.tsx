"use client";

import {
  BarChart3,
  ClipboardCheck,
  Link2,
  MousePointerClick,
  Moon,
  Save,
  ShieldCheck,
  Sparkles,
  Wand2,
  type LucideIcon,
} from "lucide-react";
import { FormWizard } from "@/components/FormWizard";
import { FAQ } from "@/components/FAQ";
import { useI18n } from "@/components/I18nProvider";

const HOW_ICONS: LucideIcon[] = [Link2, ClipboardCheck, Wand2, MousePointerClick];
const FEATURE_ICONS: LucideIcon[] = [BarChart3, Save, ShieldCheck, Moon];

export function HomeContent() {
  const { d } = useI18n();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
      {/* Hero */}
      <section className="pt-14 pb-10 text-center sm:pt-20">
        <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 px-3.5 py-1.5 text-xs font-medium text-muted backdrop-blur">
          <Sparkles className="h-3.5 w-3.5 text-brand" />
          {d.hero.badge}
        </div>
        <h1 className="mx-auto max-w-3xl text-balance text-4xl font-bold tracking-tight sm:text-6xl">
          {d.hero.titleStart}
          <span className="text-gradient">{d.hero.titleHighlight}</span>
          {d.hero.titleEnd}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-pretty text-base text-muted sm:text-lg">
          {d.hero.subtitle}
        </p>
      </section>

      {/* Wizard */}
      <section id="wizard" className="pb-8">
        <FormWizard />
      </section>

      {/* How it works */}
      <section id="how-it-works" className="scroll-mt-20 py-16">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {d.how.title}
          </h2>
          <p className="mt-2 text-muted">{d.how.subtitle}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {d.how.steps.map((step, i) => {
            const Icon = HOW_ICONS[i];
            return (
              <div key={step.title} className="card relative p-5">
                <span className="absolute right-4 top-4 text-3xl font-bold text-line">
                  {i + 1}
                </span>
                <div className="mb-3 grid h-11 w-11 place-items-center rounded-xl bg-brand-soft text-brand">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mb-1 font-semibold">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted">{step.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Features */}
      <section className="pb-8">
        <div className="grid gap-4 sm:grid-cols-2">
          {d.features.map((f, i) => {
            const Icon = FEATURE_ICONS[i];
            return (
              <div key={f.title} className="card flex items-start gap-4 p-5">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="mb-1 font-semibold">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-muted">{f.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* FAQ */}
      <FAQ />
    </div>
  );
}
