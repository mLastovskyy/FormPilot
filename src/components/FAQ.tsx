"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Send } from "lucide-react";
import { useI18n } from "./I18nProvider";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/cn";

export function FAQ() {
  const { d } = useI18n();
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section id="faq" className="scroll-mt-20 py-16">
      <div className="mb-10 text-center">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {d.faq.title}
        </h2>
        <p className="mt-2 text-muted">{d.faq.subtitle}</p>
      </div>

      <div className="mx-auto flex max-w-3xl flex-col gap-3">
        {d.faq.items.map((item, i) => {
          const open = openIdx === i;
          return (
            <div key={i} className="card overflow-hidden">
              <button
                type="button"
                aria-expanded={open}
                onClick={() => setOpenIdx(open ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left focus-ring"
              >
                <span className="text-sm font-medium sm:text-base">{item.q}</span>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 shrink-0 text-muted transition-transform duration-300",
                    open && "rotate-180 text-brand",
                  )}
                />
              </button>
              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-4 text-sm leading-relaxed text-muted">
                      {item.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <div className="mx-auto mt-8 flex max-w-3xl flex-col items-center justify-between gap-3 rounded-2xl border border-line bg-surface-2/50 px-6 py-5 text-center sm:flex-row sm:text-left">
        <span className="text-sm font-medium">{d.faq.contactText}</span>
        <a
          href={SITE.telegram}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white brand-gradient transition-all hover:brightness-110 focus-ring"
        >
          <Send className="h-4 w-4" />
          {d.faq.contactCta}
        </a>
      </div>
    </section>
  );
}
