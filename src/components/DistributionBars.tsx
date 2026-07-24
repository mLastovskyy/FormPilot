"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { useI18n } from "./I18nProvider";

export interface DistributionDatum {
  label: string;
  count: number;
}

interface DistributionBarsProps {
  data: DistributionDatum[];
  total: number;
  className?: string;
  emptyLabel?: string;
}

export function DistributionBars({
  data,
  total,
  className,
  emptyLabel,
}: DistributionBarsProps) {
  const { d } = useI18n();
  const empty = emptyLabel ?? d.dist.empty;
  if (total === 0 || data.length === 0) {
    return <p className="text-xs text-muted">{empty}</p>;
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {data.map((d) => {
        const pct = total > 0 ? Math.round((d.count / total) * 100) : 0;
        return (
          <div key={d.label} className="flex items-center gap-3">
            <span className="w-28 shrink-0 truncate text-xs text-muted" title={d.label}>
              {d.label || "—"}
            </span>
            <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-surface-2">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full brand-gradient"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            <span className="w-9 shrink-0 text-right text-xs font-medium tabular-nums">
              {pct}%
            </span>
          </div>
        );
      })}
    </div>
  );
}
