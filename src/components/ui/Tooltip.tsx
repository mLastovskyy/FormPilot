"use client";

// The tooltip measures its trigger in an effect and writes the position back to
// state; that's a legitimate DOM-sync effect the rule below would otherwise flag.
/* eslint-disable react-hooks/set-state-in-effect */

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/cn";

type Side = "top" | "bottom" | "left" | "right";

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  side?: Side;
  className?: string;
}

const GAP = 8;
const MARGIN = 8; // keep this far from the viewport edge

/**
 * Accessible tooltip rendered in a portal so it's never clipped by a parent's
 * `overflow: hidden`. Position is measured from the trigger and clamped inside
 * the viewport. Opens on hover and keyboard focus.
 */
export function Tooltip({ content, children, side = "top", className }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tipRef = useRef<HTMLSpanElement>(null);
  const id = useId();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;

    const place = () => {
      const trigger = triggerRef.current;
      const tip = tipRef.current;
      if (!trigger || !tip) return;
      const tr = trigger.getBoundingClientRect();
      const w = tip.offsetWidth;
      const h = tip.offsetHeight;
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      let top: number;
      let left: number;

      if (side === "left" || side === "right") {
        top = tr.top + tr.height / 2 - h / 2;
        left = side === "right" ? tr.right + GAP : tr.left - GAP - w;
      } else {
        left = tr.left + tr.width / 2 - w / 2;
        top = side === "bottom" ? tr.bottom + GAP : tr.top - GAP - h;
        // Flip vertically if it would overflow.
        if (side === "top" && top < MARGIN) top = tr.bottom + GAP;
        if (side === "bottom" && top + h > vh - MARGIN) top = tr.top - GAP - h;
      }

      left = Math.min(Math.max(left, MARGIN), vw - w - MARGIN);
      top = Math.min(Math.max(top, MARGIN), vh - h - MARGIN);
      setPos({ top, left });
    };

    place();
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [open, side, content]);

  const show = () => setOpen(true);
  const hide = () => {
    setOpen(false);
    setPos(null);
  };

  return (
    <>
      <span
        ref={triggerRef}
        className="inline-flex"
        aria-describedby={open ? id : undefined}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        onKeyDown={(e) => e.key === "Escape" && hide()}
      >
        {children}
      </span>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.span
                ref={tipRef}
                id={id}
                role="tooltip"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: pos ? 1 : 0, scale: pos ? 1 : 0.96 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.13, ease: "easeOut" }}
                style={{
                  position: "fixed",
                  top: pos?.top ?? -9999,
                  left: pos?.left ?? -9999,
                  zIndex: 2147483647,
                }}
                className={cn(
                  "pointer-events-none block w-max max-w-[16rem] rounded-xl px-3 py-2 text-xs leading-relaxed shadow-xl",
                  "border border-[color-mix(in_srgb,var(--tooltip-fg)_14%,transparent)]",
                  "bg-[var(--tooltip-bg)] text-[var(--tooltip-fg)]",
                  className,
                )}
              >
                {content}
              </motion.span>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
