import React, { useState, useEffect, useMemo } from 'react';
import { Plane, Home, Calendar, RefreshCw, Utensils } from 'lucide-react';

// Default budget values
const DEFAULT_BUDGET = {
  flights: {
    lhrToSin: 312,
    sinToKul: 60,
    kulToDps: 46,
    dpsToSin: 70,
    sinToDoh: 125, // SIN → DOH (QR947)
    dohToLgw: 125, // DOH → LGW (QR009)
  },
  accommodation: {
    singapore: 300, // 3 nights initially
    kualaLumpur: 200, // 3 nights
    bali: 840, // 7 nights (5 + 2 extra)
    singaporeExtra: 100, // 1 extra night
  },
  dailyExpenses: {
    food: 50, // per person per day
    activities: 30, // per person per day
  },
  totalDays: 15, // Total trip duration
};

const formatCurrency = (amount) => `£${Math.round(amount)}`;

export default function Budget() {
  const [budget, setBudget] = useState(() => {
    try {
      const saved = localStorage.getItem('trip_budget');
      return saved ? JSON.parse(saved) : DEFAULT_BUDGET;
    } catch {
      return DEFAULT_BUDGET;
    }
  });

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('trip_budget', JSON.stringify(budget));
    } catch {}
  }, [budget]);

  // Calculate totals
  const totals = useMemo(() => {
    const flightCostsPerPerson =
      budget.flights.lhrToSin +
      budget.flights.sinToKul +
      budget.flights.kulToDps +
      budget.flights.dpsToSin +
      budget.flights.sinToDoh +
      budget.flights.dohToLgw;

    const flightCostsForCouple = flightCostsPerPerson * 2;

    const accommodationTotal =
      budget.accommodation.singapore +
      budget.accommodation.kualaLumpur +
      budget.accommodation.bali +
      budget.accommodation.singaporeExtra;

    const dailyExpensesPerPerson = (budget.dailyExpenses.food + budget.dailyExpenses.activities) * budget.totalDays;
    const dailyExpensesForCouple = dailyExpensesPerPerson * 2;

    const totalPerPerson = flightCostsPerPerson + (accommodationTotal / 2) + dailyExpensesPerPerson;
    const totalForCouple = flightCostsForCouple + accommodationTotal + dailyExpensesForCouple;

    return {
      flights: { perPerson: flightCostsPerPerson, forCouple: flightCostsForCouple },
      accommodation: { perPerson: accommodationTotal / 2, forCouple: accommodationTotal },
      dailyExpenses: { perPerson: dailyExpensesPerPerson, forCouple: dailyExpensesForCouple },
      total: { perPerson: totalPerPerson, forCouple: totalForCouple },
    };
  }, [budget]);

  const updateBudget = (path, value) => {
    setBudget((prev) => {
      const newBudget = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let obj = newBudget;
      for (let i = 0; i < keys.length - 1; i++) {
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = parseFloat(value) || 0;
      return newBudget;
    });
  };

  const handleReset = () => {
    setBudget(DEFAULT_BUDGET);
  };

  // Trip itinerary
  const itinerary = [
    {
      date: '31 Mar',
      label: 'LHR → SIN',
      type: 'flight',
      color: 'blue',
      time: '19:35 - 16:05+1',
      flightNumber: 'BA011',
      duration: '13h 30m'
    },
    { date: '01 Apr', label: 'Arrive Singapore', type: 'arrival', color: 'blue' },
    { date: '01-04 Apr', label: 'Singapore', nights: 3, type: 'stay', color: 'green' },
    {
      date: '04 Apr',
      label: 'SIN → KUL',
      type: 'flight',
      color: 'blue',
      time: '18:15 - 19:25',
      flightNumber: 'MH608',
      duration: '1h 10m'
    },
    { date: '04 Apr', label: 'Arrive Malaysia', type: 'arrival', color: 'blue' },
    { date: '04-07 Apr', label: 'Kuala Lumpur', nights: 3, type: 'stay', color: 'orange' },
    {
      date: '07 Apr',
      label: 'KUL → DPS',
      type: 'flight',
      color: 'blue',
      time: '10:35 - 13:40',
      flightNumber: 'QZ551',
      duration: '3h 5m'
    },
    { date: '07 Apr', label: 'Arrive Indonesia', type: 'arrival', color: 'blue' },
    { date: '07-14 Apr', label: 'Bali', nights: 7, type: 'stay', color: 'purple' },
    {
      date: '14 Apr',
      label: 'DPS → SIN',
      type: 'flight',
      color: 'blue',
      time: '15:05 - 18:00',
      flightNumber: 'JQ88',
      duration: '2h 55m'
    },
    { date: '14 Apr', label: 'Arrive Singapore', type: 'arrival', color: 'blue' },
    { date: '14-15 Apr', label: 'Singapore', nights: 1, type: 'stay', color: 'green' },
    {
      date: '15 Apr',
      label: 'SIN → DOH',
      type: 'flight',
      color: 'cyan',
      time: '19:40 - 22:40',
      flightNumber: 'QR947',
      duration: '8h 0m'
    },
    { date: '15 Apr', label: 'Arrive Qatar', type: 'arrival', color: 'cyan' },
    { date: '15 Apr', label: 'Doha Layover', type: 'layover', color: 'cyan', duration: '2h 25m' },
    {
      date: '16 Apr',
      label: 'DOH → LGW',
      type: 'flight',
      color: 'cyan',
      time: '01:30 - 06:40',
      flightNumber: 'QR009',
      duration: '7h 10m'
    },
    { date: '16 Apr', label: 'Arrive United Kingdom', type: 'arrival', color: 'cyan' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="mx-auto max-w-5xl px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">
            Budget Planner
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Singapore · Kuala Lumpur · Bali · April 2026
          </p>
        </div>

        {/* Trip Itinerary */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 mb-4">
          <h2 className="text-base font-bold mb-4 text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Calendar size={18} />
            Trip Itinerary
          </h2>
          <div className="space-y-1.5">
            {itinerary.map((event, idx) => {
              if (event.type === 'flight') {
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-3 py-2 px-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50"
                  >
                    <Plane size={14} className="text-blue-600 dark:text-blue-400" />
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                        {event.label}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        {event.flightNumber} · {event.time} · {event.duration}
                      </div>
                    </div>
                    <div className="text-xs font-bold text-blue-600 dark:text-blue-400">
                      {event.date}
                    </div>
                  </div>
                );
              }

              if (event.type === 'stay') {
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 py-2 px-3 rounded-lg bg-${event.color}-50 dark:bg-${event.color}-950/30 border border-${event.color}-200 dark:border-${event.color}-900/50`}
                  >
                    <Home size={14} className={`text-${event.color}-600 dark:text-${event.color}-400`} />
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                        {event.label}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        {event.nights} night{event.nights > 1 ? 's' : ''}
                      </div>
                    </div>
                    <div className="text-xs font-bold text-slate-600 dark:text-slate-400">
                      {event.date}
                    </div>
                  </div>
                );
              }

              if (event.type === 'layover') {
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-3 py-2 px-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700"
                  >
                    <Calendar size={14} className="text-slate-500 dark:text-slate-400" />
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                        {event.label}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        {event.duration}
                      </div>
                    </div>
                    <div className="text-xs font-bold text-slate-600 dark:text-slate-400">
                      {event.date}
                    </div>
                  </div>
                );
              }

              if (event.type === 'arrival') {
                return (
                  <div
                    key={idx}
                    className="h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent my-2 relative"
                  >
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-50 dark:bg-slate-900 px-3 py-0.5 text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {event.label}
                    </div>
                  </div>
                );
              }

              return null;
            })}
          </div>
        </div>

        {/* Budget Calculator */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-700 dark:text-slate-300">
              Budget Calculator
            </h2>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-xs font-medium text-slate-600 dark:text-slate-300"
            >
              <RefreshCw size={14} />
              Reset
            </button>
          </div>

          <div className="space-y-6">
            {/* Flights */}
            <div>
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wider flex items-center gap-2">
                <Plane size={16} />
                Flights (per person)
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                    LHR → SIN (BA011)
                  </label>
                  <input
                    type="number"
                    value={budget.flights.lhrToSin}
                    onChange={(e) => updateBudget('flights.lhrToSin', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                    SIN → KUL (MH608)
                  </label>
                  <input
                    type="number"
                    value={budget.flights.sinToKul}
                    onChange={(e) => updateBudget('flights.sinToKul', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                    KUL → DPS (QZ551)
                  </label>
                  <input
                    type="number"
                    value={budget.flights.kulToDps}
                    onChange={(e) => updateBudget('flights.kulToDps', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                    DPS → SIN (JQ88)
                  </label>
                  <input
                    type="number"
                    value={budget.flights.dpsToSin}
                    onChange={(e) => updateBudget('flights.dpsToSin', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                    SIN → DOH (QR947)
                  </label>
                  <input
                    type="number"
                    value={budget.flights.sinToDoh}
                    onChange={(e) => updateBudget('flights.sinToDoh', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                    DOH → LGW (QR009)
                  </label>
                  <input
                    type="number"
                    value={budget.flights.dohToLgw}
                    onChange={(e) => updateBudget('flights.dohToLgw', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Accommodation */}
            <div>
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wider flex items-center gap-2">
                <Home size={16} />
                Accommodation (for 2 people)
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                    Singapore (3 nights)
                  </label>
                  <input
                    type="number"
                    value={budget.accommodation.singapore}
                    onChange={(e) => updateBudget('accommodation.singapore', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                    Kuala Lumpur (3 nights)
                  </label>
                  <input
                    type="number"
                    value={budget.accommodation.kualaLumpur}
                    onChange={(e) => updateBudget('accommodation.kualaLumpur', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                    Bali (7 nights)
                  </label>
                  <input
                    type="number"
                    value={budget.accommodation.bali}
                    onChange={(e) => updateBudget('accommodation.bali', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                    Singapore Extra (1 night)
                  </label>
                  <input
                    type="number"
                    value={budget.accommodation.singaporeExtra}
                    onChange={(e) => updateBudget('accommodation.singaporeExtra', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Daily Expenses */}
            <div>
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wider flex items-center gap-2">
                <Utensils size={16} />
                Daily Expenses (per person per day)
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                    Food
                  </label>
                  <input
                    type="number"
                    value={budget.dailyExpenses.food}
                    onChange={(e) => updateBudget('dailyExpenses.food', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                    Activities
                  </label>
                  <input
                    type="number"
                    value={budget.dailyExpenses.activities}
                    onChange={(e) => updateBudget('dailyExpenses.activities', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                    Total Days
                  </label>
                  <input
                    type="number"
                    value={budget.totalDays}
                    onChange={(e) => updateBudget('totalDays', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Budget Summary */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl border border-blue-200 dark:border-blue-900/50 p-5">
          <h2 className="text-base font-bold mb-4 text-slate-700 dark:text-slate-300">
            Budget Summary
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Per Person */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Per Person
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Flights</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{formatCurrency(totals.flights.perPerson)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Accommodation</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{formatCurrency(totals.accommodation.perPerson)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Daily Expenses</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{formatCurrency(totals.dailyExpenses.perPerson)}</span>
                </div>
                <div className="h-px bg-slate-300 dark:bg-slate-600 my-2"></div>
                <div className="flex justify-between text-lg">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Total</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">{formatCurrency(totals.total.perPerson)}</span>
                </div>
              </div>
            </div>

            {/* For Couple */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                For Couple
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Flights</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{formatCurrency(totals.flights.forCouple)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Accommodation</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{formatCurrency(totals.accommodation.forCouple)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Daily Expenses</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{formatCurrency(totals.dailyExpenses.forCouple)}</span>
                </div>
                <div className="h-px bg-slate-300 dark:bg-slate-600 my-2"></div>
                <div className="flex justify-between text-lg">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Total</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">{formatCurrency(totals.total.forCouple)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
