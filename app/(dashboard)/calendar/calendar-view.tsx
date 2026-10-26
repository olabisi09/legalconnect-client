"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  max,
  min,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiCalendarLine,
  RiMapPinLine,
} from "@remixicon/react";

import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardCard } from "@/components/dashboard-card";
import { AppEmpty } from "@/components/app-empty";
import { Button } from "@/components/ui/button";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Skeleton } from "@/components/ui/skeleton";
import { useCalendarEvents } from "@/hooks/features/use-calendar";
import { useCases } from "@/hooks/features/use-cases";
import { useIsClient } from "@/hooks/use-is-client";
import { cn, formatEnum } from "@/lib/utils";
import type { CalendarEvent, CalendarEventType } from "@/types/calendar";
import { DashboardError } from "../dashboard/dashboard-error";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MAX_CHIPS_PER_DAY = 2;
const DAY_KEY = "yyyy-MM-dd";

const COURT_EVENTS: CalendarEventType[] = [
  "HEARING",
  "COURT_DATE",
  "TRIAL",
  "DEPOSITION",
  "MEDIATION",
];

function eventTone(type: CalendarEventType) {
  if (COURT_EVENTS.includes(type)) return "bg-lc-stamp/12 text-lc-stamp";
  if (type === "MEETING") return "bg-lc-ledger-pale text-lc-ledger";
  if (type === "DEADLINE") return "bg-lc-ink/8 text-foreground";
  return "bg-secondary text-muted-foreground";
}

function eventDot(type: CalendarEventType) {
  if (COURT_EVENTS.includes(type)) return "bg-lc-stamp";
  if (type === "MEETING") return "bg-lc-ledger";
  return "bg-lc-slate";
}

function eventTime(event: CalendarEvent) {
  if (event.allDay) return "All day";
  const start = format(parseISO(event.startTime), "h:mm a");
  return event.endTime
    ? `${start} – ${format(parseISO(event.endTime), "h:mm a")}`
    : start;
}

/** Index events by every day they cover within the visible grid. */
function groupByDay(events: CalendarEvent[], gridStart: Date, gridEnd: Date) {
  const byDay = new Map<string, CalendarEvent[]>();
  const sorted = [...events].sort((a, b) =>
    a.startTime.localeCompare(b.startTime),
  );

  for (const event of sorted) {
    const start = startOfDay(parseISO(event.startTime));
    const end = event.endTime ? startOfDay(parseISO(event.endTime)) : start;
    const from = max([start, gridStart]);
    const to = min([end < start ? start : end, gridEnd]);
    if (from > to) continue;

    for (const day of eachDayOfInterval({ start: from, end: to })) {
      const key = format(day, DAY_KEY);
      byDay.set(key, [...(byDay.get(key) ?? []), event]);
    }
  }
  return byDay;
}

export function CalendarView() {
  // "Today" only exists in the browser; render the board after hydration.
  const isClient = useIsClient();
  return isClient ? <CalendarBoard /> : <CalendarSkeleton />;
}

function CalendarSkeleton() {
  return (
    <DashboardCard>
      <CardContent className="space-y-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </CardContent>
    </DashboardCard>
  );
}

function CalendarBoard() {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDay, setSelectedDay] = useState(() => startOfDay(new Date()));
  const [caseId, setCaseId] = useState("");

  const { gridStart, gridEnd, days } = useMemo(() => {
    const start = startOfWeek(month);
    const end = endOfWeek(endOfMonth(month));
    return {
      gridStart: start,
      gridEnd: end,
      days: eachDayOfInterval({ start, end }),
    };
  }, [month]);

  const { data, isLoading, isFetching, isError, error, refetch } =
    useCalendarEvents({
      from: format(gridStart, DAY_KEY),
      to: format(gridEnd, DAY_KEY),
      caseId: caseId || undefined,
    });
  const { data: casesPage } = useCases({ size: 100 });
  const cases = useMemo(() => casesPage?.data ?? [], [casesPage]);

  const caseTitles = useMemo(
    () => new Map(cases.map((c) => [c.id, c.title])),
    [cases],
  );
  const eventsByDay = useMemo(
    () => groupByDay(data ?? [], gridStart, gridEnd),
    [data, gridStart, gridEnd],
  );
  const selectedEvents = eventsByDay.get(format(selectedDay, DAY_KEY)) ?? [];

  const goToMonth = (next: Date) => {
    setMonth(startOfMonth(next));
    setSelectedDay(
      isSameMonth(next, new Date())
        ? startOfDay(new Date())
        : startOfMonth(next),
    );
  };

  return (
    <div className="grid grid-cols-1 gap-px bg-border p-px lg:grid-cols-[minmax(0,1fr)_320px]">
      <DashboardCard>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Previous month"
              onClick={() => goToMonth(addMonths(month, -1))}
            >
              <RiArrowLeftSLine />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Next month"
              onClick={() => goToMonth(addMonths(month, 1))}
            >
              <RiArrowRightSLine />
            </Button>
            <CardTitle className="ml-1 font-newsreader text-lg font-medium">
              {format(month, "MMMM yyyy")}
            </CardTitle>
            {isFetching && !isLoading && (
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-lc-slate" />
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => goToMonth(new Date())}
            >
              Today
            </Button>
            <NativeSelect
              className="w-48"
              value={caseId}
              onChange={(e) => setCaseId(e.target.value)}
              aria-label="Filter by case"
            >
              <NativeSelectOption value="">All cases</NativeSelectOption>
              {cases.map((c) => (
                <NativeSelectOption key={c.id} value={c.id}>
                  {c.title}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>
        </CardHeader>

        <CardContent>
          {isError ? (
            <div className="py-12">
              <DashboardError error={error} onRetry={() => refetch()} />
            </div>
          ) : (
            <div className="grid grid-cols-7 overflow-hidden rounded-[3px] border border-border">
              {WEEKDAYS.map((day) => (
                <div
                  key={day}
                  className="border-b border-border bg-lc-paper-warm px-1 py-1.5 text-center font-plexmono text-[10px] uppercase tracking-wide text-muted-foreground"
                >
                  {day}
                </div>
              ))}

              {days.map((day, i) => {
                const dayEvents = eventsByDay.get(format(day, DAY_KEY)) ?? [];
                const inMonth = isSameMonth(day, month);
                const selected = isSameDay(day, selectedDay);

                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    onClick={() => setSelectedDay(day)}
                    aria-pressed={selected}
                    aria-label={`${format(day, "EEEE d MMMM")}, ${dayEvents.length} event${dayEvents.length === 1 ? "" : "s"}`}
                    className={cn(
                      "flex min-h-14 flex-col gap-1 border-border p-1 text-left transition-colors hover:bg-accent/40 md:min-h-24",
                      i % 7 !== 6 && "border-r",
                      i < days.length - 7 && "border-b",
                      !inMonth && "bg-lc-paper-warm/50 text-muted-foreground",
                      selected && "bg-accent/60",
                    )}
                  >
                    <span
                      className={cn(
                        "grid h-6 w-6 place-items-center rounded-full font-plexmono text-[11px]",
                        isToday(day) && "bg-lc-stamp text-lc-paper",
                      )}
                    >
                      {format(day, "d")}
                    </span>

                    {isLoading ? null : (
                      <>
                        {/* Dots on small screens, titled chips from md up. */}
                        <span className="flex flex-wrap gap-0.5 md:hidden">
                          {dayEvents.slice(0, 4).map((event) => (
                            <span
                              key={event.id}
                              className={cn(
                                "h-1.5 w-1.5 rounded-full",
                                eventDot(event.eventType),
                              )}
                            />
                          ))}
                        </span>
                        <span className="hidden w-full flex-col gap-0.5 md:flex">
                          {dayEvents.slice(0, MAX_CHIPS_PER_DAY).map((event) => (
                            <span
                              key={event.id}
                              className={cn(
                                "truncate rounded-[2px] px-1 py-0.5 text-[10.5px] leading-tight",
                                eventTone(event.eventType),
                              )}
                            >
                              {event.title}
                            </span>
                          ))}
                          {dayEvents.length > MAX_CHIPS_PER_DAY && (
                            <span className="px-1 font-plexmono text-[10px] text-muted-foreground">
                              +{dayEvents.length - MAX_CHIPS_PER_DAY} more
                            </span>
                          )}
                        </span>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </DashboardCard>

      <DashboardCard>
        <CardHeader>
          <CardTitle>{format(selectedDay, "EEEE, d MMMM")}</CardTitle>
          <CardDescription>
            {isLoading
              ? "Loading…"
              : `${selectedEvents.length} event${selectedEvents.length === 1 ? "" : "s"}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {isLoading ? (
            Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))
          ) : selectedEvents.length ? (
            selectedEvents.map((event) => (
              <AgendaItem
                key={event.id}
                event={event}
                caseTitle={event.caseId ? caseTitles.get(event.caseId) : undefined}
              />
            ))
          ) : (
            <div className="py-6">
              <AppEmpty
                title="Nothing scheduled"
                description="Pick another day to see its events."
                icon={<RiCalendarLine />}
              />
            </div>
          )}
        </CardContent>
      </DashboardCard>
    </div>
  );
}

function AgendaItem({
  event,
  caseTitle,
}: {
  event: CalendarEvent;
  caseTitle?: string;
}) {
  return (
    <div className="flex gap-3 rounded-[3px] border border-border p-3">
      <span
        className={cn(
          "mt-1.5 h-2 w-2 shrink-0 rounded-full",
          eventDot(event.eventType),
        )}
      />
      <div className="min-w-0 flex-1 space-y-1">
        <p className="font-plexmono text-[10.5px] text-muted-foreground">
          {eventTime(event)} · {formatEnum(event.eventType)}
        </p>
        <p className="text-[13px] font-medium text-foreground">{event.title}</p>
        {event.description && (
          <p className="line-clamp-3 text-[12px] text-muted-foreground">
            {event.description}
          </p>
        )}
        {event.location && (
          <p className="flex items-center gap-1 text-[12px] text-muted-foreground">
            <RiMapPinLine className="size-3.5 shrink-0" />
            <span className="truncate">{event.location}</span>
          </p>
        )}
        {event.caseId && (
          <Link
            href={`/cases/${event.caseId}`}
            className="block truncate text-[12px] text-lc-ledger underline underline-offset-2"
          >
            {caseTitle ?? "View case"}
          </Link>
        )}
      </div>
    </div>
  );
}
