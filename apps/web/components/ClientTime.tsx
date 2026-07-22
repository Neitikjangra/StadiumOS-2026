"use client";

import { useEffect, useState } from "react";

export function ClientTime({
  date,
  options,
  className,
}: {
  date: string | Date;
  options?: Intl.DateTimeFormatOptions;
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <span className={className}>--:--</span>;
  const d = typeof date === "string" ? new Date(date) : date;
  return <span className={className}>{d.toLocaleTimeString("en-US", options)}</span>;
}

export function ClientDate({
  date,
  options,
  className,
}: {
  date: string | Date;
  options?: Intl.DateTimeFormatOptions;
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <span className={className}>---</span>;
  const d = typeof date === "string" ? new Date(date) : date;
  return <span className={className}>{d.toLocaleDateString("en-US", options)}</span>;
}

export function ClientDateTime({
  date,
  options,
  className,
}: {
  date: string | Date;
  options?: Intl.DateTimeFormatOptions;
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <span className={className}>---</span>;
  const d = typeof date === "string" ? new Date(date) : date;
  return <span className={className}>{d.toLocaleString("en-US", options)}</span>;
}

export function formatTimeSafe(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}
