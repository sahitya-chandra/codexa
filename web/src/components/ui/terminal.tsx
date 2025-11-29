"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TerminalProps {
  className?: string;
  children?: React.ReactNode;
}

export function Terminal({ className, children }: TerminalProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border bg-zinc-950 shadow-2xl",
        className
      )}
    >
      <div className="flex items-center gap-1.5 border-b border-zinc-800 bg-zinc-900/50 px-4 py-3">
        <div className="h-3 w-3 rounded-full bg-red-500/20" />
        <div className="h-3 w-3 rounded-full bg-yellow-500/20" />
        <div className="h-3 w-3 rounded-full bg-green-500/20" />
      </div>
      <div className="p-4 font-mono text-sm text-zinc-300">
        {children}
      </div>
    </div>
  );
}

export function TerminalLine({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3 }}
      viewport={{ once: true }}
      className="flex gap-2"
    >
      <span className="text-blue-400">➜</span>
      <span className="text-zinc-100">{children}</span>
    </motion.div>
  );
}

export function TerminalOutput({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ delay, duration: 0.3 }}
      viewport={{ once: true }}
      className="pb-2 pl-6 text-zinc-400"
    >
      {children}
    </motion.div>
  );
}
