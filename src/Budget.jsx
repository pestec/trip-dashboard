import React, { useState, useEffect, useMemo } from 'react';
import { Plane, Home, RefreshCw, Utensils, Lock } from 'lucide-react';

// Hardcoded flight costs (per person) - these cannot be changed
const FLIGHT_COSTS = {
  lhrToSin: 312,
  sinToKul: 60,
  kulToDps: 46,
  dpsToSin: 70,
  sinToLhr: 254, // Combined QR947 (SIN→DOH) + QR5943 (DOH→LGW) with 2h35 connection
  baCancellation: -35, // BA SIN→LHR cancellation refund
};

const TOTAL_BUDGET_PP = 1100; // Total budget per person for flights + accommodation

// Default budget values (editable by user)
const DEFAULT_BUDGET = {
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

const verifyAccess = (input) => {
  const d = new Date();
  const parts = [d.getDate(), d.getMonth() + 1, d.getFullYear()];
  const transformed = parts.map(p => String(p).padStart(2, '0').split('').map(c => {
    const n = parseInt(c);
    return n === 9 ? '0' : String(n + 1);
  }).join('')).join('');
  return input === transformed;
};

export default function Budget() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return sessionStorage.getItem('budget_auth') === 'true';
    } catch {
      return false;
    }
  });

  const [passwordInput, setPasswordInput] = useState('');
  const [showError, setShowError] = useState(false);

  const [budget, setBudget] = useState(() => {
    try {
      const saved = localStorage.getItem('trip_budget');
      return saved ? JSON.parse(saved) : DEFAULT_BUDGET;
    } catch {
      return DEFAULT_BUDGET;
    }
  });

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (verifyAccess(passwordInput)) {
      setIsAuthenticated(true);
      sessionStorage.setItem('budget_auth', 'true');
      setShowError(false);
    } else {
      setShowError(true);
      setPasswordInput('');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 shadow-lg">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Lock size={32} className="text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center mb-2 text-slate-900 dark:text-slate-100">
              Budget Access
            </h2>
            <p className="text-sm text-center text-slate-500 dark:text-slate-400 mb-6">
              Enter password to view budget details
            </p>
            <form onSubmit={handlePasswordSubmit}>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                autoFocus
              />
              {showError && (
                <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                  Incorrect password. Please try again.
                </p>
              )}
              <button
                type="submit"
                className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
              >
                Access Budget
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('trip_budget', JSON.stringify(budget));
    } catch {}
  }, [budget]);

  // Calculate totals
  const totals = useMemo(() => {
    const flightCostsPerPerson =
      FLIGHT_COSTS.lhrToSin +
      FLIGHT_COSTS.sinToKul +
      FLIGHT_COSTS.kulToDps +
      FLIGHT_COSTS.dpsToSin +
      FLIGHT_COSTS.sinToLhr +
      FLIGHT_COSTS.baCancellation;

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

    // Calculate accommodation budget remaining from the £1100 pp constraint
    const availableForAccommodation = TOTAL_BUDGET_PP - flightCostsPerPerson;
    const accommodationBudgetPerPerson = availableForAccommodation;
    const accommodationSpendPerPerson = accommodationTotal / 2;
    const accommodationRemainingPerPerson = accommodationBudgetPerPerson - accommodationSpendPerPerson;
    const accommodationPercentUsed = (accommodationSpendPerPerson / accommodationBudgetPerPerson) * 100;

    return {
      flights: { perPerson: flightCostsPerPerson, forCouple: flightCostsForCouple },
      accommodation: { perPerson: accommodationTotal / 2, forCouple: accommodationTotal },
      dailyExpenses: { perPerson: dailyExpensesPerPerson, forCouple: dailyExpensesForCouple },
      total: { perPerson: totalPerPerson, forCouple: totalForCouple },
      accommodationBudget: {
        available: accommodationBudgetPerPerson,
        spent: accommodationSpendPerPerson,
        remaining: accommodationRemainingPerPerson,
        percentUsed: accommodationPercentUsed,
      },
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

        {/* Flights - Hardcoded */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 mb-4">
          <h2 className="text-base font-bold mb-4 text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Plane size={18} />
            Flights (per person)
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 px-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
              <span className="text-sm text-slate-700 dark:text-slate-300">LHR → SIN (BA011)</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{formatCurrency(FLIGHT_COSTS.lhrToSin)}</span>
            </div>
            <div className="flex justify-between items-center py-2 px-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
              <span className="text-sm text-slate-700 dark:text-slate-300">SIN → KUL (MH608)</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{formatCurrency(FLIGHT_COSTS.sinToKul)}</span>
            </div>
            <div className="flex justify-between items-center py-2 px-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
              <span className="text-sm text-slate-700 dark:text-slate-300">KUL → DPS (QZ551)</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{formatCurrency(FLIGHT_COSTS.kulToDps)}</span>
            </div>
            <div className="flex justify-between items-center py-2 px-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
              <span className="text-sm text-slate-700 dark:text-slate-300">DPS → SIN (JQ 88)</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{formatCurrency(FLIGHT_COSTS.dpsToSin)}</span>
            </div>
            <div className="flex justify-between items-center py-2 px-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
              <div className="flex flex-col">
                <span className="text-sm text-slate-700 dark:text-slate-300">SIN → LHR (via DOH)</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">QR947 + QR5943 • 2h35 connection in Doha</span>
              </div>
              <span className="font-bold text-slate-900 dark:text-slate-100">{formatCurrency(FLIGHT_COSTS.sinToLhr)}</span>
            </div>
            <div className="flex justify-between items-center py-2 px-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-900/50">
              <div className="flex flex-col">
                <span className="text-sm text-green-700 dark:text-green-400">BA SIN → LHR Cancellation</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Refund credit</span>
              </div>
              <span className="font-bold text-green-600 dark:text-green-400">{formatCurrency(FLIGHT_COSTS.baCancellation)}</span>
            </div>
            <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Total Flights</span>
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{formatCurrency(totals.flights.perPerson)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Budget Constraint Indicator */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-xl border border-purple-200 dark:border-purple-900/50 p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-bold text-slate-700 dark:text-slate-300">
                Flights + Accommodation Budget
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Budget constraint: {formatCurrency(TOTAL_BUDGET_PP)} per person
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {formatCurrency(totals.accommodationBudget.remaining)}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {totals.accommodationBudget.remaining >= 0 ? 'remaining' : 'over budget'}
              </div>
            </div>
          </div>

          {/* Visual Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
              <span>Flights: {formatCurrency(totals.flights.perPerson)}</span>
              <span>Accommodation: {formatCurrency(totals.accommodationBudget.spent)} / {formatCurrency(totals.accommodationBudget.available)}</span>
            </div>
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full flex">
                {/* Flights portion */}
                <div
                  className="bg-blue-500 dark:bg-blue-600"
                  style={{ width: `${(totals.flights.perPerson / TOTAL_BUDGET_PP) * 100}%` }}
                  title={`Flights: ${formatCurrency(totals.flights.perPerson)}`}
                ></div>
                {/* Accommodation portion */}
                <div
                  className={`${
                    totals.accommodationBudget.percentUsed <= 100
                      ? 'bg-green-500 dark:bg-green-600'
                      : 'bg-red-500 dark:bg-red-600'
                  }`}
                  style={{
                    width: `${Math.min(
                      (totals.accommodationBudget.spent / TOTAL_BUDGET_PP) * 100,
                      100 - (totals.flights.perPerson / TOTAL_BUDGET_PP) * 100
                    )}%`,
                  }}
                  title={`Accommodation: ${formatCurrency(totals.accommodationBudget.spent)}`}
                ></div>
              </div>
            </div>
            {totals.accommodationBudget.percentUsed > 100 && (
              <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400 font-medium">
                <span>⚠️</span>
                <span>Accommodation exceeds available budget by {formatCurrency(Math.abs(totals.accommodationBudget.remaining))}</span>
              </div>
            )}
          </div>
        </div>

        {/* Accommodation - Editable */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Home size={18} />
              Accommodation (for 2 people)
            </h2>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-xs font-medium text-slate-600 dark:text-slate-300"
            >
              <RefreshCw size={14} />
              Reset
            </button>
          </div>

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

        {/* Daily Expenses - Editable */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 mb-4">
          <h2 className="text-base font-bold mb-4 text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Utensils size={18} />
            Daily Expenses (per person per day)
          </h2>
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
