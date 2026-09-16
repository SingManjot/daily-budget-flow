import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  format,
  getISOWeek,
  getISOWeekYear,
  isWithinInterval,
  parseISO,
  startOfISOWeek,
  startOfMonth,
} from "date-fns";
import type { PeriodType } from "./types";

export function toISODate(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

export function fromISODate(s: string): Date {
  return parseISO(s);
}

/** Mon-Fri => weekday, Sat-Sun => weekend */
export function periodTypeForDate(d: Date): PeriodType {
  const day = d.getDay();
  return day === 0 || day === 6 ? "weekend" : "weekday";
}

export interface PeriodRange {
  id: string;
  type: PeriodType;
  start: Date;
  end: Date;
}

/** The weekday (Mon-Fri) and weekend (Sat-Sun) blocks of the ISO week containing `d`. */
export function weekPeriods(d: Date): { weekday: PeriodRange; weekend: PeriodRange } {
  const monday = startOfISOWeek(d);
  const key = `${getISOWeekYear(monday)}-W${String(getISOWeek(monday)).padStart(2, "0")}`;
  return {
    weekday: {
      id: `${key}-WD`,
      type: "weekday",
      start: monday,
      end: addDays(monday, 4),
    },
    weekend: {
      id: `${key}-WE`,
      type: "weekend",
      start: addDays(monday, 5),
      end: addDays(monday, 6),
    },
  };
}

export function currentPeriodType(d = new Date()): PeriodType {
  return periodTypeForDate(d);
}

export function dateForPeriod(period: PeriodType, d = new Date()): Date {
  const base = new Date(d);
  if (period === "weekday") return base;

  const day = base.getDay();
  const daysUntilSaturday = (6 - day + 7) % 7;
  return addDays(base, daysUntilSaturday);
}

export function periodContains(p: PeriodRange, dateISO: string): boolean {
  const d = fromISODate(dateISO);
  return isWithinInterval(d, { start: p.start, end: p.end });
}

export function formatPeriodRange(p: PeriodRange): string {
  const sameMonth = p.start.getMonth() === p.end.getMonth();
  return sameMonth
    ? `${format(p.start, "MMM d")}–${format(p.end, "d")}`
    : `${format(p.start, "MMM d")} – ${format(p.end, "MMM d")}`;
}

/** All weekday/weekend periods that overlap the given month, ordered by start date. */
export function periodsInMonth(monthKey: string): PeriodRange[] {
  const first = fromISODate(`${monthKey}-01`);
  const last = endOfMonth(first);
  const out: PeriodRange[] = [];
  const seen = new Set<string>();
  let cursor = startOfISOWeek(first);
  while (cursor <= last) {
    const { weekday, weekend } = weekPeriods(cursor);
    for (const p of [weekday, weekend]) {
      if (seen.has(p.id)) continue;
      if (p.end >= first && p.start <= last) {
        seen.add(p.id);
        out.push(p);
      }
    }
    cursor = addDays(cursor, 7);
  }
  return out.sort((a, b) => a.start.getTime() - b.start.getTime());
}

export function monthKeyOf(d: Date | string): string {
  const date = typeof d === "string" ? fromISODate(d) : d;
  return format(date, "yyyy-MM");
}

export function monthLabel(monthKey: string, withYear = true): string {
  return format(fromISODate(`${monthKey}-01`), withYear ? "MMMM yyyy" : "MMMM");
}

export function daysOfMonth(monthKey: string): Date[] {
  const first = fromISODate(`${monthKey}-01`);
  return eachDayOfInterval({ start: startOfMonth(first), end: endOfMonth(first) });
}
