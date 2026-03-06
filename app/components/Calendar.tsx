import { useState, useMemo } from "react";
import {
  calendarEvents,
  calendarCompanies as COMPANIES,
  type CalEvent,
  type CalCompany as Company,
  type CalCategory as Category,
} from "../textos";
import type { NfqEventRaw } from "../lib/mongodb.server";

const TODAY = new Date();

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const DAYS_SHORT = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isSameMonth(date: Date, y: number, m: number) {
  return date.getFullYear() === y && date.getMonth() === m;
}

export default function Calendar({ nfqEvents = [] }: { nfqEvents?: NfqEventRaw[] }) {
  // Static events (non-NFQ) + MongoDB NFQ events merged
  const EVENTS: CalEvent[] = useMemo(() => {
    const staticNonNfq = calendarEvents.filter((e) => e.category !== "nfq");
    const mongoNfq: CalEvent[] = nfqEvents.map((e) => ({
      ...e,
      start: new Date(e.start),
    }));
    return [...staticNonNfq, ...mongoNfq];
  }, [nfqEvents]);

  const [currentMonth, setCurrentMonth] = useState(
    new Date(TODAY.getFullYear(), TODAY.getMonth(), 1)
  );
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [activeCategories, setActiveCategories] = useState<Set<Category>>(
    new Set<Category>(["everis", "inetum", "nfq", "personal"])
  );

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDow = new Date(year, month, 1).getDay();

  const calDays = useMemo(() => {
    const days: (number | null)[] = Array(startDow).fill(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  }, [year, month, startDow, daysInMonth]);

  // Solo muestra eventos cuya fecha de INICIO coincide con el día
  function getEventsStartingOnDay(day: number): CalEvent[] {
    const date = new Date(year, month, day);
    return EVENTS.filter(
      (e) => activeCategories.has(e.category) && isSameDay(e.start, date)
    );
  }

  const selectedDayEvents = selectedDay
    ? getEventsStartingOnDay(selectedDay.getDate()).filter(
        () => selectedDay.getFullYear() === year && selectedDay.getMonth() === month
      )
    : [];

  function prevMonth() {
    setCurrentMonth(new Date(year, month - 1, 1));
    setSelectedDay(null);
  }
  function nextMonth() {
    setCurrentMonth(new Date(year, month + 1, 1));
    setSelectedDay(null);
  }
  function goToday() {
    setCurrentMonth(new Date(TODAY.getFullYear(), TODAY.getMonth(), 1));
    setSelectedDay(new Date(TODAY));
  }

  function toggleCategory(cat: Category) {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  // Navega al mes donde empieza el proyecto más reciente de esa empresa
  function goToCompany(company: Company) {
    const companyEvents = EVENTS.filter((e) => e.category === company);
    if (companyEvents.length === 0) return;
    const latest = companyEvents.reduce((max, e) =>
      e.start > max.start ? e : max
    );
    setCurrentMonth(new Date(latest.start.getFullYear(), latest.start.getMonth(), 1));
    setSelectedDay(new Date(latest.start));
  }

  const isOngoing = (e: CalEvent) => !e.end || e.end.getFullYear() >= 2099;

  const formatPeriod = (e: CalEvent) => {
    const s = `${MONTHS[e.start.getMonth()].slice(0, 3)} ${e.start.getFullYear()}`;
    const endStr = isOngoing(e)
      ? "Actualidad"
      : `${MONTHS[e.end!.getMonth()].slice(0, 3)} ${e.end!.getFullYear()}`;
    return `${s} — ${endStr}`;
  };

  // Días del mes actual que tienen eventos (para marcar visualmente)
  const daysWithEvents = useMemo(() => {
    const set = new Set<number>();
    EVENTS.forEach((e) => {
      if (activeCategories.has(e.category) && isSameMonth(e.start, year, month)) {
        set.add(e.start.getDate());
      }
    });
    return set;
  }, [year, month, activeCategories, EVENTS]);

  return (
    <div className="flex h-full bg-[#1a1a1c] text-white select-none overflow-hidden">
      {/* ── Sidebar ── */}
      <div className="w-40 shrink-0 bg-[#111113] border-r border-white/[0.06] flex flex-col py-4 px-3 gap-6">
        <div>
          <p className="text-[9px] text-gray-600 uppercase tracking-[0.15em] font-medium mb-2.5 px-1">
            Trabajo
          </p>
          <div className="flex flex-col gap-0.5">
            {COMPANIES.map((c) => (
              <div key={c.key} className="flex items-center gap-1.5">
                <button
                  onClick={() => toggleCategory(c.key)}
                  className="shrink-0 w-7 h-7 flex items-center justify-center rounded-md hover:bg-white/5 transition-colors"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full transition-all duration-200"
                    style={{
                      backgroundColor: activeCategories.has(c.key) ? c.color : "#2d2d30",
                      boxShadow: activeCategories.has(c.key) ? `0 0 6px ${c.color}66` : "none",
                    }}
                  />
                </button>
                <button
                  onClick={() => goToCompany(c.key)}
                  className="flex-1 text-left py-1 px-1 rounded-md hover:bg-white/5 transition-colors"
                >
                  <span className="text-[11px] text-gray-300 font-medium">{c.label}</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[9px] text-gray-600 uppercase tracking-[0.15em] font-medium mb-2.5 px-1">
            Personal
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => toggleCategory("personal")}
              className="shrink-0 w-7 h-7 flex items-center justify-center rounded-md hover:bg-white/5 transition-colors"
            >
              <span
                className="w-2.5 h-2.5 rounded-full transition-all duration-200"
                style={{
                  backgroundColor: activeCategories.has("personal") ? "#34d399" : "#2d2d30",
                  boxShadow: activeCategories.has("personal") ? "0 0 6px #34d39966" : "none",
                }}
              />
            </button>
            <span className="text-[11px] text-gray-300 font-medium px-1">Proyectos</span>
          </div>
        </div>
      </div>

      {/* ── Main calendar ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-white/[0.06] shrink-0">
          <div className="flex items-center gap-1.5">
            <button
              onClick={prevMonth}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/8 text-gray-500 hover:text-white transition-all text-base"
            >
              ‹
            </button>
            <button
              onClick={nextMonth}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/8 text-gray-500 hover:text-white transition-all text-base"
            >
              ›
            </button>
            <h2 className="text-sm font-semibold text-white ml-2 tracking-tight">
              {MONTHS[month]} <span className="text-gray-500 font-normal">{year}</span>
            </h2>
          </div>
          <button
            onClick={goToday}
            className="text-[11px] px-3 py-1 rounded-md border border-white/10 hover:bg-white/8 text-gray-400 hover:text-white transition-all"
          >
            Hoy
          </button>
        </div>

        {/* Day-of-week headers */}
        <div className="grid grid-cols-7 border-b border-white/[0.06] shrink-0">
          {DAYS_SHORT.map((d) => (
            <div
              key={d}
              className="text-[10px] text-gray-600 text-center py-2 font-medium tracking-widest"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div className="flex-1 grid grid-cols-7 auto-rows-fr min-h-0">
          {calDays.map((day, i) => {
            if (day === null) {
              return <div key={`e-${i}`} className="border-b border-r border-white/[0.04]" />;
            }

            const startingEvents = getEventsStartingOnDay(day);
            const hasEvents = daysWithEvents.has(day);
            const date = new Date(year, month, day);
            const isToday = isSameDay(date, TODAY);
            const isSelected = selectedDay ? isSameDay(date, selectedDay) : false;

            return (
              <div
                key={`d-${day}`}
                onClick={() => setSelectedDay(date)}
                className={`border-b border-r border-white/[0.04] p-1.5 cursor-pointer transition-colors flex flex-col gap-1
                  ${isSelected ? "bg-white/[0.06]" : "hover:bg-white/[0.03]"}`}
              >
                {/* Day number */}
                <div className="flex justify-center">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-medium transition-all
                      ${isToday
                        ? "bg-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.4)]"
                        : isSelected
                          ? "text-white"
                          : hasEvents
                            ? "text-white/80"
                            : "text-gray-600"
                      }`}
                  >
                    {day}
                  </span>
                </div>

                {/* Event dots */}
                {startingEvents.length > 0 && (
                  <div className="flex flex-col gap-[3px] px-0.5">
                    {startingEvents.slice(0, 3).map((e) => (
                      <div
                        key={e.id}
                        className="flex items-center gap-1 rounded px-1 py-[2px]"
                        style={{ backgroundColor: e.color + "18" }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: e.color }}
                        />
                        <span
                          className="text-[9px] truncate leading-none font-medium"
                          style={{ color: e.color }}
                        >
                          {e.title.split("—")[0].trim()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Detail panel ── */}
      {selectedDay && (
        <div className="w-60 shrink-0 border-l border-white/[0.06] bg-[#111113] flex flex-col">
          {/* Panel header */}
          <div className="px-4 pt-4 pb-3 border-b border-white/[0.06]">
            <p className="text-xs font-semibold text-white">
              {selectedDay.getDate()} de {MONTHS[selectedDay.getMonth()]}
            </p>
            <p className="text-[10px] text-gray-600 mt-0.5">
              {selectedDay.getFullYear()} ·{" "}
              {selectedDayEvents.length === 0
                ? "Sin eventos"
                : `${selectedDayEvents.length} evento${selectedDayEvents.length > 1 ? "s" : ""}`}
            </p>
          </div>

          {/* Events */}
          <div className="flex-1 overflow-auto p-3 flex flex-col gap-3">
            {selectedDayEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-2 pb-8">
                <span className="text-2xl opacity-20">📅</span>
                <p className="text-[10px] text-gray-700 text-center">
                  No hay eventos este día
                </p>
              </div>
            ) : (
              selectedDayEvents.map((e) => (
                <div key={e.id} className="rounded-xl overflow-hidden border border-white/[0.06]">
                  {/* Color bar */}
                  <div className="h-[3px]" style={{ backgroundColor: e.color }} />

                  <div className="p-3 space-y-3 bg-white/[0.02]">
                    {/* Title + period */}
                    <div>
                      <p className="text-[12px] font-semibold text-white leading-tight mb-0.5">
                        {e.title}
                      </p>
                      <p className="text-[9px] text-gray-600 font-mono">
                        {formatPeriod(e)}
                        {isOngoing(e) && (
                          <span
                            className="ml-1.5 px-1 py-0.5 rounded text-[8px] font-sans"
                            style={{ backgroundColor: e.color + "22", color: e.color }}
                          >
                            En curso
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Sections */}
                    {[
                      { label: "Problema",    text: e.problema },
                      { label: "Solución",    text: e.solucion },
                      { label: "Aprendizaje", text: e.aprendizaje },
                    ].map(({ label, text }) => (
                      <div key={label}>
                        <p
                          className="text-[8px] uppercase tracking-[0.12em] font-bold mb-1"
                          style={{ color: e.color + "cc" }}
                        >
                          {label}
                        </p>
                        <p className="text-[10px] text-gray-400 leading-relaxed">{text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          <button
            onClick={() => setSelectedDay(null)}
            className="mx-3 mb-3 text-[10px] text-gray-700 hover:text-gray-400 transition-colors text-center py-1.5 rounded-lg hover:bg-white/5"
          >
            Cerrar panel
          </button>
        </div>
      )}
    </div>
  );
}
