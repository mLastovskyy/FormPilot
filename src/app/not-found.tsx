"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Compass, Home, SearchX } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/components/I18nProvider";

export default function NotFound() {
  const { d } = useI18n();
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-lg flex-col items-center justify-center px-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="mb-6 flex justify-center"
        >
          <div className="relative">
            <Logo size={72} />
            <span className="absolute -right-2 -top-2 grid h-8 w-8 place-items-center rounded-full border border-line bg-surface text-[var(--danger)] shadow-lg">
              <SearchX className="h-4 w-4" />
            </span>
          </div>
        </motion.div>

        <h1 className="text-7xl font-bold tracking-tight">
          <span className="text-gradient">404</span>
        </h1>
        <h2 className="mt-3 text-xl font-semibold">{d.notFound.title}</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted">{d.notFound.body}</p>

        <div className="mt-7 flex items-center justify-center gap-3">
          <Link href="/">
            <Button>
              <Home className="h-4 w-4" /> {d.notFound.home}
            </Button>
          </Link>
          <Link href="/#how-it-works">
            <Button variant="outline">
              <Compass className="h-4 w-4" /> {d.notFound.how}
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
