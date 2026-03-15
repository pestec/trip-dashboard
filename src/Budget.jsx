// =============================================================================
// Budget.jsx – Glassfrost revamp with Supabase persistence
//
// Required Supabase tables (run once in Supabase SQL editor):
//
//   CREATE TABLE IF NOT EXISTS budget_daily (
//     day_date   TEXT PRIMARY KEY,
//     food       DECIMAL(10,2) DEFAULT 0,
//     activities DECIMAL(10,2) DEFAULT 0,
//     updated_at TIMESTAMPTZ   DEFAULT NOW()
//   );
//
//   CREATE TABLE IF NOT EXISTS budget_settings (
//     key   TEXT PRIMARY KEY,
//     value DECIMAL(10,2) NOT NULL DEFAULT 0
//   );
//
//   ALTER TABLE budget_daily    ENABLE ROW LEVEL SECURITY;
//   ALTER TABLE budget_settings ENABLE ROW LEVEL SECURITY;
//   CREATE POLICY "auth users" ON budget_daily    FOR ALL USING (auth.role() = 'authenticated');
//   CREATE POLICY "auth users" ON budget_settings FOR ALL USING (auth.role() = 'authenticated');
// =============================================================================

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Plane, Home, Utensils, Zap } from 'lucide-react';
import { supabase } from './lib/supabase';

// ── Fixed flight costs (per person) ─────────────────────────────────────────
const FLIGHT_COSTS_PP = [
  { label: 'LHR → SIN (BA011)',         amount: 312 },
  { label: 'SIN → KUL (MH608)',         amount: 60  },
  { label: 'KUL → DPS (QZ551)',         amount: 46  },
  { label: 'DPS → SIN (JQ88)',          amount: 70  },
  { label: 'SIN → LHR (QR947+QR5943)', amount: 254 },
  { label: 'BA cancellation fee',        amount: 35  },
];
const TOTAL_FLIGHTS_PP = FLIGHT_COSTS_PP.reduce((s, f) => s + f.amount, 0); // £777

// ── Fixed accommodation costs (for 2 people) ────────────────────────────────
const ACCOMMODATION_COSTS = [
  { label: 'Singapore (3 nights)',        amount: 356 },
  { label: 'Kuala Lumpur (3 nights)',     amount: 169 },
  { label: 'Bali – Ubud (3 nights)',      amount: 470 },
  { label: 'Bali – Uluwatu (4 nights)',   amount: 485 },
  { label: 'Singapore (1 extra night)',   amount: 100 },
];
const TOTAL_ACCOMMODATION_FOR_2 = ACCOMMODATION_COSTS.reduce((s, a) => s + a.amount, 0); // £1,580
const TOTAL_ACCOMMODATION_PP    = TOTAL_ACCOMMODATION_FOR_2 / 2; // £790

// ── Trip days for daily spending tracker ────────────────────────────────────
const TRIP_DAYS = [
  { date: '1 Apr',  key: '2026-04-01', day: 'Wed', location: 'Singapore',        flag: '🇸🇬' },
  { date: '2 Apr',  key: '2026-04-02', day: 'Thu', location: 'Singapore',        flag: '🇸🇬' },
  { date: '3 Apr',  key: '2026-04-03', day: 'Fri', location: 'Singapore',        flag: '🇸🇬' },
  { date: '4 Apr',  key: '2026-04-04', day: 'Sat', location: 'Singapore → KL',   flag: '🇸🇬' },
  { date: '5 Apr',  key: '2026-04-05', day: 'Sun', location: 'Kuala Lumpur',     flag: '🇲🇾' },
  { date: '6 Apr',  key: '2026-04-06', day: 'Mon', location: 'Kuala Lumpur',     flag: '🇲🇾' },
  { date: '7 Apr',  key: '2026-04-07', day: 'Tue', location: 'KL → Bali (Ubud)', flag: '🇲🇾' },
  { date: '8 Apr',  key: '2026-04-08', day: 'Wed', location: 'Ubud',             flag: '🇮🇩' },
  { date: '9 Apr',  key: '2026-04-09', day: 'Thu', location: 'Ubud',             flag: '🇮🇩' },
  { date: '10 Apr', key: '2026-04-10', day: 'Fri', location: 'Ubud → Uluwatu',   flag: '🇮🇩' },
  { date: '11 Apr', key: '2026-04-11', day: 'Sat', location: 'Uluwatu',          flag: '🇮🇩' },
  { date: '12 Apr', key: '2026-04-12', day: 'Sun', location: 'Uluwatu',          flag: '🇮🇩' },
  { date: '13 Apr', key: '2026-04-13', day: 'Mon', location: 'Uluwatu',          flag: '🇮🇩' },
  { date: '14 Apr', key: '2026-04-14', day: 'Tue', location: 'Uluwatu → SIN',    flag: '🇮🇩' },
];

const DEFAULT_TOTAL_BUDGET = 5000;
const fmt = (v) => `£${Math.round(v)}`;

const initDaily = () => {
  const s = {};
  TRIP_DAYS.forEach((d) => { s[d.key] = { food: '', activities: '' }; });
  return s;
};

export default function Budget() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [totalBudget, setTotalBudget] = useState(DEFAULT_TOTAL_BUDGET);
  const [budgetInput, setBudgetInput] = useState(String(DEFAULT_TOTAL_BUDGET));
  const [dailySpending, setDailySpending] = useState(initDaily);

  // ── Load from Supabase ──────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [{ data: settings }, { data: daily }] = await Promise.all([
          supabase.from('budget_settings').select('*'),
          supabase.from('budget_daily').select('*'),
        ]);

        if (settings) {
          const row = settings.find((s) => s.key === 'total_budget');
          if (row) {
            const v = parseFloat(row.value) || DEFAULT_TOTAL_BUDGET;
            setTotalBudget(v);
            setBudgetInput(String(v));
          }
        }

        if (daily) {
          setDailySpending((prev) => {
            const next = { ...prev };
            daily.forEach((row) => {
              if (next[row.day_date] !== undefined) {
                next[row.day_date] = {
                  food:       row.food       != null ? String(row.food)       : '',
                  activities: row.activities != null ? String(row.activities) : '',
                };
              }
            });
            return next;
          });
        }
      } catch (e) {
        console.error('Failed to load budget data:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // ── Supabase save helpers ───────────────────────────────────────────────────
  const saveSetting = useCallback(async (key, value) => {
    try {
      await supabase
        .from('budget_settings')
        .upsert({ key, value: parseFloat(value) || 0 }, { onConflict: 'key' });
    } catch (e) {
      console.error('Failed to save setting:', e);
    }
  }, []);

  const saveDayEntry = useCallback(async (dayKey, food, activities) => {
    setSaving((prev) => ({ ...prev, [dayKey]: true }));
    try {
      await supabase
        .from('budget_daily')
        .upsert(
          { day_date: dayKey, food: parseFloat(food) || 0, activities: parseFloat(activities) || 0 },
          { onConflict: 'day_date' }
        );
    } catch (e) {
      console.error('Failed to save daily entry:', e);
    } finally {
      setSaving((prev) => ({ ...prev, [dayKey]: false }));
    }
  }, []);

  // ── Local state helpers ─────────────────────────────────────────────────────
  const updateDay = useCallback((dayKey, field, value) => {
    setDailySpending((prev) => ({
      ...prev,
      [dayKey]: { ...prev[dayKey], [field]: value },
    }));
  }, []);

  const handleDayBlur = useCallback(
    (dayKey) => {
      const entry = dailySpending[dayKey] || {};
      saveDayEntry(dayKey, entry.food, entry.activities);
    },
    [dailySpending, saveDayEntry]
  );

  // ── Totals ──────────────────────────────────────────────────────────────────
  const totals = useMemo(() => {
    let spendingTotal = 0;
    TRIP_DAYS.forEach((d) => {
      const day = dailySpending[d.key] || {};
      spendingTotal += (parseFloat(day.food) || 0) + (parseFloat(day.activities) || 0);
    });
    const fixed      = TOTAL_FLIGHTS_PP * 2 + TOTAL_ACCOMMODATION_FOR_2;
    const allSpent   = fixed + spendingTotal;
    const remaining  = totalBudget - allSpent;
    const pct        = Math.min(Math.max((allSpent / totalBudget) * 100, 0), 100);
    const flightsPct = Math.min((TOTAL_FLIGHTS_PP * 2 / totalBudget) * 100, 100);
    const hotelsPct  = Math.min((TOTAL_ACCOMMODATION_FOR_2 / totalBudget) * 100, Math.max(0, 100 - flightsPct));
    const dailyPct   = Math.min((spendingTotal / totalBudget) * 100, Math.max(0, 100 - flightsPct - hotelsPct));
    return { spendingTotal, fixed, allSpent, remaining, pct, flightsPct, hotelsPct, dailyPct };
  }, [dailySpending, totalBudget]);

  // ── Loading state ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading budget…</p>
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="mx-auto max-w-xl px-4 py-6 space-y-4">

        {/* ── Budget Hero Card ─────────────────────────────────────────────── */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-700 dark:to-indigo-900 rounded-2xl p-6 text-white shadow-lg">

          {/* Trip context + editable total */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-[11px] font-semibold text-blue-200 uppercase tracking-widest mb-0.5">April 2026</p>
              <p className="text-sm text-blue-100">Singapore · KL · Bali</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-blue-200 mb-1">Total budget (for 2)</p>
              <div className="flex items-center justify-end gap-0.5">
                <span className="text-blue-200 text-sm">£</span>
                <input
                  type="number"
                  value={budgetInput}
                  onChange={(e) => setBudgetInput(e.target.value)}
                  onBlur={() => {
                    const v = parseFloat(budgetInput) || DEFAULT_TOTAL_BUDGET;
                    setTotalBudget(v);
                    setBudgetInput(String(v));
                    saveSetting('total_budget', v);
                  }}
                  className="w-20 bg-white/15 border border-white/25 rounded-lg px-2 py-1 text-sm font-bold text-white text-center focus:outline-none focus:ring-2 focus:ring-white/50"
                />
              </div>
            </div>
          </div>

          {/* Remaining — the hero number */}
          <div className="mb-5">
            <div className={`text-6xl font-black tracking-tight leading-none ${totals.remaining >= 0 ? 'text-white' : 'text-red-300'}`}>
              {fmt(Math.abs(totals.remaining))}
            </div>
            <p className="text-blue-200 text-sm mt-2 font-medium">
              {totals.remaining >= 0
                ? `remaining of ${fmt(totalBudget)} budget`
                : `over budget — total was ${fmt(totalBudget)}`}
            </p>
          </div>

          {/* Segmented progress bar */}
          <div className="h-2 bg-white/15 rounded-full overflow-hidden mb-5 flex">
            <div className="bg-sky-400 h-full transition-all duration-500" style={{ width: `${totals.flightsPct}%` }} />
            <div className="bg-emerald-400 h-full transition-all duration-500" style={{ width: `${totals.hotelsPct}%` }} />
            <div className="bg-amber-400 h-full transition-all duration-500" style={{ width: `${totals.dailyPct}%` }} />
          </div>

          {/* Cost breakdown pills */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white/10 rounded-xl py-3">
              <div className="text-white font-bold text-sm">{fmt(TOTAL_FLIGHTS_PP * 2)}</div>
              <div className="flex items-center justify-center gap-1 text-blue-200/80 text-xs mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 inline-block flex-shrink-0" />
                Flights
              </div>
            </div>
            <div className="bg-white/10 rounded-xl py-3">
              <div className="text-white font-bold text-sm">{fmt(TOTAL_ACCOMMODATION_FOR_2)}</div>
              <div className="flex items-center justify-center gap-1 text-blue-200/80 text-xs mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block flex-shrink-0" />
                Hotels
              </div>
            </div>
            <div className="bg-white/10 rounded-xl py-3">
              <div className="text-white font-bold text-sm">{fmt(totals.spendingTotal)}</div>
              <div className="flex items-center justify-center gap-1 text-blue-200/80 text-xs mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block flex-shrink-0" />
                Daily
              </div>
            </div>
          </div>
        </div>

        {/* ── Flights + Accommodation (compact side by side) ───────────────── */}
        <div className="grid grid-cols-2 gap-3">

          {/* Flights */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-sky-100 dark:bg-sky-900/40 rounded-lg flex items-center justify-center flex-shrink-0">
                <Plane size={13} className="text-sky-600 dark:text-sky-400" />
              </div>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Flights</span>
            </div>
            <div className="space-y-1.5 mb-3">
              {FLIGHT_COSTS_PP.map(({ label, amount }) => (
                <div key={label} className="flex justify-between items-baseline gap-1">
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate leading-tight">{label}</span>
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 flex-shrink-0">{fmt(amount)}</span>
                </div>
              ))}
            </div>
            <div className="pt-2.5 border-t border-slate-100 dark:border-slate-700 flex justify-between items-baseline">
              <span className="text-xs text-slate-500 dark:text-slate-400">Per person</span>
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{fmt(TOTAL_FLIGHTS_PP)}</span>
            </div>
          </div>

          {/* Accommodation */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg flex items-center justify-center flex-shrink-0">
                <Home size={13} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Hotels</span>
            </div>
            <div className="space-y-1.5 mb-3">
              {ACCOMMODATION_COSTS.map(({ label, amount }) => (
                <div key={label} className="flex justify-between items-baseline gap-1">
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate leading-tight">{label}</span>
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 flex-shrink-0">{fmt(amount)}</span>
                </div>
              ))}
            </div>
            <div className="pt-2.5 border-t border-slate-100 dark:border-slate-700 space-y-1">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-slate-400 dark:text-slate-500">For 2</span>
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">{fmt(TOTAL_ACCOMMODATION_FOR_2)}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-slate-500 dark:text-slate-400">Per person</span>
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{fmt(TOTAL_ACCOMMODATION_PP)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Daily spending tracker ───────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">Daily Spending</h2>
            <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
              {fmt(totals.spendingTotal)} total
            </span>
          </div>

          <div className="space-y-2">
            {TRIP_DAYS.map((day) => {
              const entry    = dailySpending[day.key] || { food: '', activities: '' };
              const food     = parseFloat(entry.food)       || 0;
              const acts     = parseFloat(entry.activities) || 0;
              const dayTotal = food + acts;
              const isSaving = !!saving[day.key];

              return (
                <div
                  key={day.key}
                  className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4"
                >
                  {/* Day header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                        <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100 leading-none">
                          {day.date.split(' ')[0]}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 leading-none mt-0.5 uppercase tracking-wide">
                          Apr
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{day.date}</span>
                          <span className="text-xs text-slate-400 dark:text-slate-500">{day.day}</span>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {day.flag} {day.location}
                        </div>
                      </div>
                    </div>
                    <div className="text-right min-w-[48px]">
                      <div className={`text-sm font-bold ${dayTotal > 0 ? 'text-slate-900 dark:text-slate-100' : 'text-slate-300 dark:text-slate-600'}`}>
                        {dayTotal > 0 ? fmt(dayTotal) : '—'}
                      </div>
                      {isSaving && <div className="text-[10px] text-blue-400 mt-0.5">saving…</div>}
                    </div>
                  </div>

                  {/* Food + Activities inputs */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="flex items-center gap-1 text-[11px] font-medium text-slate-400 dark:text-slate-500 mb-1.5">
                        <Utensils size={9} />
                        Food
                      </label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">£</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0"
                          value={entry.food}
                          onChange={(e) => updateDay(day.key, 'food', e.target.value)}
                          onBlur={() => handleDayBlur(day.key)}
                          className="w-full pl-6 pr-2 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-slate-100 placeholder-slate-300 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="flex items-center gap-1 text-[11px] font-medium text-slate-400 dark:text-slate-500 mb-1.5">
                        <Zap size={9} />
                        Activities
                      </label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">£</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0"
                          value={entry.activities}
                          onChange={(e) => updateDay(day.key, 'activities', e.target.value)}
                          onBlur={() => handleDayBlur(day.key)}
                          className="w-full pl-6 pr-2 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-slate-100 placeholder-slate-300 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
