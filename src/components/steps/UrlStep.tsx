"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Link2, ScanLine, ShieldQuestion, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { InfoDot } from "@/components/ui/InfoDot";
import { ParsingLoader } from "@/components/ParsingLoader";
import { useI18n } from "@/components/I18nProvider";

interface Props {
  url: string;
  onUrlChange: (url: string) => void;
  onSubmit: () => void;
  loading: boolean;
  error: string | null;
}

export function UrlStep({ url, onUrlChange, onSubmit, loading, error }: Props) {
  const { d } = useI18n();
  return (
    <div className="mx-auto max-w-2xl">
      <div className="card p-6 sm:p-8">
        <div className="mb-5 flex items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-soft text-brand">
            <Link2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="flex items-center gap-1.5 text-lg font-semibold">
              {d.url.title}
              <InfoDot content={d.url.titleInfo} />
            </h2>
            <p className="text-sm text-muted">{d.url.subtitle}</p>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <div className="relative flex-1">
            <ScanLine className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted" />
            <input
              type="url"
              value={url}
              autoFocus
              onChange={(e) => onUrlChange(e.target.value)}
              placeholder={d.url.placeholder}
              className="h-12 w-full rounded-xl border border-line bg-surface pl-10 pr-3.5 text-sm focus-ring"
            />
          </div>
          <Button type="submit" size="lg" loading={loading} className="sm:w-auto">
            {!loading && <Sparkles className="h-4 w-4" />}
            {loading ? d.url.parsing : d.url.parse}
          </Button>
        </form>

        <AnimatePresence>{loading && <ParsingLoader />}</AnimatePresence>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 flex items-start gap-2 overflow-hidden rounded-xl border border-[color-mix(in_srgb,var(--danger)_35%,transparent)] bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] px-3.5 py-2.5 text-sm text-[var(--danger)]"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-success" /> docs.google.com/forms/…
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-success" /> forms.gle/…
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ShieldQuestion className="h-3.5 w-3.5" />
            {d.url.signIn}
            <InfoDot content={d.url.signInInfo} />
          </span>
        </div>
      </div>
    </div>
  );
}
