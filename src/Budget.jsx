import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Plane, Home, Calculator, RefreshCw, Info, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import {
  DEFAULT_ASSUMPTIONS,
  calculatePerNightCosts,
  calculateScenario1,
  calculateScenario2,
  calculateScenario3,
  calculateDelta,
  generateNarrative,
  formatCurrency,
} from './budgetCalc';

export default function Budget() {
  // Load assumptions from localStorage or use defaults
  const [assumptions, setAssumptions] = useState(() => {
    try {
      const saved = localStorage.getItem('trip_budget_assumptions');

      if (!saved) {
        return { ...DEFAULT_ASSUMPTIONS };
      }

      const parsed = JSON.parse(saved);

      // Validate that all required fields exist and have values
      const isValid = parsed &&
        parsed.flights && typeof parsed.flights.lhrToSin === 'number' &&
        parsed.accommodation && typeof parsed.accommodation.singapore === 'number' &&
        parsed.assumedNights && typeof parsed.assumedNights.singapore === 'number';

      if (!isValid) {
        localStorage.removeItem('trip_budget_assumptions');
        return { ...DEFAULT_ASSUMPTIONS };
      }

      return parsed;
    } catch (error) {
      localStorage.removeItem('trip_budget_assumptions');
      return { ...DEFAULT_ASSUMPTIONS };
    }
  });

  // Scenario 2: Fixed at 3 extra nights in Bali
  const baliExtraNightsS2 = 3;

  // Scenario 3: Fixed at 1 extra night in Bali
  const baliExtraNightsS3 = 1;

  const [selectedCalendar, setSelectedCalendar] = useState(1);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('trip_budget_assumptions', JSON.stringify(assumptions));
    } catch {}
  }, [assumptions]);


  // Calculate per-night costs
  const perNightCosts = useMemo(() => calculatePerNightCosts(assumptions), [assumptions]);

  // Calculate all scenarios
  const scenario1 = useMemo(() => calculateScenario1(assumptions), [assumptions]);
  const scenario2 = useMemo(
    () => calculateScenario2(assumptions, baliExtraNightsS2, perNightCosts),
    [assumptions, baliExtraNightsS2, perNightCosts]
  );
  const scenario3 = useMemo(
    () => calculateScenario3(assumptions, baliExtraNightsS3, perNightCosts),
    [assumptions, baliExtraNightsS3, perNightCosts]
  );

  // Calculate deltas
  const delta2 = useMemo(() => calculateDelta(scenario2, scenario1), [scenario2, scenario1]);
  const delta3 = useMemo(() => calculateDelta(scenario3, scenario1), [scenario3, scenario1]);

  // Generate narratives
  const narrative1 = generateNarrative(1, scenario1, { perPerson: 0, forCouple: 0 });
  const narrative2 = generateNarrative(2, scenario2, delta2, baliExtraNightsS2);
  const narrative3 = generateNarrative(3, scenario3, delta3, baliExtraNightsS3);

  // Reset to defaults
  const handleReset = () => {
    setAssumptions(DEFAULT_ASSUMPTIONS);
  };

  // Update assumption helper
  const updateAssumption = (path, value) => {
    setAssumptions((prev) => {
      const newAssumptions = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let obj = newAssumptions;
      for (let i = 0; i < keys.length - 1; i++) {
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = parseFloat(value) || 0;
      return newAssumptions;
    });
  };

  // Calendar helper to generate trip timeline
  const generateCalendar = useCallback((scenario, scenarioNum) => {
    const singaporeNights = assumptions.assumedNights.singapore;
    const kualaLumpurNights = assumptions.assumedNights.kualaLumpur;

    const events = [
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
      { date: '01-04 Apr', label: 'Singapore', nights: singaporeNights, type: 'stay', color: 'green' },
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
      { date: '04-07 Apr', label: 'Kuala Lumpur', nights: kualaLumpurNights, type: 'stay', color: 'orange' },
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
    ];

    if (scenarioNum === 1) {
      // Scenario 1: Bali 7-12 Apr, return on 12 Apr
      events.push(
        { date: '07-12 Apr', label: 'Bali', nights: 5, type: 'stay', color: 'purple' },
        {
          date: '12 Apr',
          label: 'DPS → SIN',
          type: 'flight',
          color: 'blue',
          time: '15:05 - 18:00',
          flightNumber: 'JQ88',
          duration: '2h 55m'
        },
        { date: '12 Apr', label: 'Arrive Singapore', type: 'arrival', color: 'blue' },
        {
          date: '12 Apr',
          label: 'SIN → LHR',
          type: 'flight',
          color: 'red',
          time: '23:25 - 06:30+1',
          flightNumber: 'BA012',
          duration: '14h 5m'
        },
        { date: '13 Apr', label: 'Arrive United Kingdom', type: 'arrival', color: 'red' }
      );
    } else if (scenarioNum === 2) {
      // Scenario 2: Bali 7-15 Apr, flights on 15 Apr
      events.push(
        { date: '07-15 Apr', label: 'Bali', nights: 8, type: 'stay', color: 'purple' },
        {
          date: '15 Apr',
          label: 'DPS → SIN',
          type: 'flight',
          color: 'blue',
          time: '15:05 - 18:00',
          flightNumber: 'JQ88',
          duration: '2h 55m'
        },
        { date: '15 Apr', label: 'Arrive Singapore', type: 'arrival', color: 'blue' },
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
      );
    } else if (scenarioNum === 3) {
      // Scenario 3: Bali 7-12 Apr, fly on 13 Apr, SIN on 13 Apr, DOH 13-15 Apr, fly to LHR on 16 Apr
      events.push(
        { date: '07-13 Apr', label: 'Bali', nights: 6, type: 'stay', color: 'purple' },
        {
          date: '13 Apr',
          label: 'DPS → SIN',
          type: 'flight',
          color: 'blue',
          time: '15:05 - 18:00',
          flightNumber: 'JQ88',
          duration: '2h 55m'
        },
        { date: '13 Apr', label: 'Arrive Singapore', type: 'arrival', color: 'blue' },
        { date: '13 Apr', label: 'Singapore', nights: 1, type: 'stay', color: 'green' },
        {
          date: '14 Apr',
          label: 'SIN → DOH',
          type: 'flight',
          color: 'cyan',
          time: '10:20 - 13:20',
          flightNumber: 'QR943',
          duration: '7h 0m'
        },
        { date: '14 Apr', label: 'Arrive Qatar', type: 'arrival', color: 'cyan' },
        { date: '14-15 Apr', label: 'Doha', nights: 2, type: 'stay', color: 'cyan' },
        {
          date: '16 Apr',
          label: 'DOH → LHR',
          type: 'flight',
          color: 'cyan',
          time: '12:35 - 18:00',
          flightNumber: 'QR003',
          duration: '7h 25m'
        },
        { date: '16 Apr', label: 'Arrive United Kingdom', type: 'arrival', color: 'cyan' }
      );
    }

    return events;
  }, [assumptions]);

  const calendar1 = useMemo(() => generateCalendar(scenario1, 1), [generateCalendar, scenario1]);
  const calendar2 = useMemo(() => generateCalendar(scenario2, 2), [generateCalendar, scenario2]);
  const calendar3 = useMemo(() => generateCalendar(scenario3, 3), [generateCalendar, scenario3]);

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

        {/* Current Committed Costs */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 mb-4">
          <h2 className="text-base font-bold mb-4 text-slate-700 dark:text-slate-300">
            Committed Costs
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Flights */}
            <div>
              <h3 className="font-bold text-sm text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Plane size={16} />
                Flights (per person)
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>LHR → SIN (BA011)</span>
                  <span className="font-bold">{formatCurrency(assumptions.flights.lhrToSin)}</span>
                </div>
                <div className="flex justify-between">
                  <span>SIN → LHR (BA012) <span className="text-xs text-green-600 dark:text-green-400">refundable</span></span>
                  <span className="font-bold">{formatCurrency(assumptions.flights.sinToLhr)}</span>
                </div>
                <div className="flex justify-between">
                  <span>SIN → KUL (MH608)</span>
                  <span className="font-bold">{formatCurrency(assumptions.flights.sinToKul)}</span>
                </div>
                <div className="flex justify-between">
                  <span>KUL → DPS (QZ551)</span>
                  <span className="font-bold">{formatCurrency(assumptions.flights.kulToDps)}</span>
                </div>
                <div className="flex justify-between">
                  <span>DPS → SIN (JQ88) <span className="text-xs text-blue-600 dark:text-blue-400">date flexible</span></span>
                  <span className="font-bold">{formatCurrency(assumptions.flights.dpsToSin)}</span>
                </div>
              </div>
            </div>

            {/* Accommodation */}
            <div>
              <h3 className="font-bold text-sm text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Home size={16} />
                Accommodation (for 2 people)
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Singapore ({assumptions.assumedNights.singapore} nights)</span>
                  <span className="font-bold">{formatCurrency(assumptions.accommodation.singapore)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Kuala Lumpur ({assumptions.assumedNights.kualaLumpur} nights)</span>
                  <span className="font-bold">{formatCurrency(assumptions.accommodation.kualaLumpur)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Bali ({assumptions.assumedNights.bali} nights)</span>
                  <span className="font-bold">{formatCurrency(assumptions.accommodation.bali)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Assumptions Editor */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-700 dark:text-slate-300">
              Assumptions
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
            {/* Accommodation Costs */}
            <div>
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wider">
                Accommodation Costs (for 2 people)
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                    Singapore Total
                  </label>
                  <input
                    type="number"
                    value={assumptions.accommodation.singapore}
                    onChange={(e) => updateAssumption('accommodation.singapore', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Per night: {formatCurrency(perNightCosts.singapore)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                    Kuala Lumpur Total
                  </label>
                  <input
                    type="number"
                    value={assumptions.accommodation.kualaLumpur}
                    onChange={(e) => updateAssumption('accommodation.kualaLumpur', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Per night: {formatCurrency(perNightCosts.kualaLumpur)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                    Bali Total
                  </label>
                  <input
                    type="number"
                    value={assumptions.accommodation.bali}
                    onChange={(e) => updateAssumption('accommodation.bali', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Per night: {formatCurrency(perNightCosts.bali)}
                  </p>
                </div>
              </div>
            </div>

            {/* Other Costs */}
            <div>
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wider">
                Other Costs
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                    New BA Return Cost (Scenario 2)
                  </label>
                  <input
                    type="number"
                    value={assumptions.scenario2.newSinToLhr}
                    onChange={(e) => updateAssumption('scenario2.newSinToLhr', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                    Qatar Bundle Cost (Scenario 3)
                  </label>
                  <input
                    type="number"
                    value={assumptions.scenario3.qatarBundle}
                    onChange={(e) => updateAssumption('scenario3.qatarBundle', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    SIN→DOH + 2 nights Doha + DOH→LON
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scenario Comparison */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 mb-4">
          <h2 className="text-base font-bold mb-4 text-slate-700 dark:text-slate-300">Scenario Comparison</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-slate-200 dark:border-slate-700">
                  <th className="text-left py-3 px-4 font-bold">Category</th>
                  <th className="text-right py-3 px-4 font-bold">
                    <div>Scenario 1</div>
                    <div className="text-xs font-normal text-slate-500">Keep as-is</div>
                  </th>
                  <th className="text-right py-3 px-4 font-bold">
                    <div>Scenario 2</div>
                    <div className="text-xs font-normal text-slate-500">Extend Bali (3n extra) + Qatar via DOH</div>
                  </th>
                  <th className="text-right py-3 px-4 font-bold">
                    <div>Scenario 3</div>
                    <div className="text-xs font-normal text-slate-500">Extend Bali (1n extra) + Qatar via DOH</div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {/* Flights */}
                <tr>
                  <td className="py-3 px-4 font-medium">Flights</td>
                  <td className="py-3 px-4 text-right font-mono">{formatCurrency(scenario1.flights.perPerson)}</td>
                  <td className="py-3 px-4 text-right font-mono">{formatCurrency(scenario2.flights.perPerson)}</td>
                  <td className="py-3 px-4 text-right font-mono">{formatCurrency(scenario3.flights.perPerson)}</td>
                </tr>

                {/* Accommodation */}
                <tr>
                  <td className="py-3 px-4 font-medium">Accommodation</td>
                  <td className="py-3 px-4 text-right font-mono">{formatCurrency(scenario1.accommodation.perPerson)}</td>
                  <td className="py-3 px-4 text-right font-mono">{formatCurrency(scenario2.accommodation.perPerson)}</td>
                  <td className="py-3 px-4 text-right font-mono">{formatCurrency(scenario3.accommodation.perPerson)}</td>
                </tr>

                {/* Other */}
                <tr>
                  <td className="py-3 px-4 font-medium">
                    Other
                    {scenario3.other.label && (
                      <div className="text-xs text-slate-500 dark:text-slate-400">{scenario3.other.label}</div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right font-mono">{formatCurrency(scenario1.other.perPerson)}</td>
                  <td className="py-3 px-4 text-right font-mono">{formatCurrency(scenario2.other.perPerson)}</td>
                  <td className="py-3 px-4 text-right font-mono">{formatCurrency(scenario3.other.perPerson)}</td>
                </tr>

                {/* Totals */}
                <tr className="bg-slate-50 dark:bg-slate-700/50 font-bold">
                  <td className="py-3 px-4">Total per person</td>
                  <td className="py-3 px-4 text-right font-mono text-lg">{formatCurrency(scenario1.total.perPerson)}</td>
                  <td className="py-3 px-4 text-right font-mono text-lg">{formatCurrency(scenario2.total.perPerson)}</td>
                  <td className="py-3 px-4 text-right font-mono text-lg">{formatCurrency(scenario3.total.perPerson)}</td>
                </tr>

                {/* Delta */}
                <tr className="border-t-2 border-slate-300 dark:border-slate-600">
                  <td className="py-3 px-4 font-bold">Delta vs Scenario 1</td>
                  <td className="py-3 px-4 text-right font-mono">—</td>
                  <td className="py-3 px-4 text-right font-mono">
                    <span className={delta2.perPerson > 0 ? 'text-red-600' : delta2.perPerson < 0 ? 'text-green-600' : ''}>
                      {delta2.perPerson > 0 ? '+' : ''}{formatCurrency(delta2.perPerson)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono">
                    <span className={delta3.perPerson > 0 ? 'text-red-600' : delta3.perPerson < 0 ? 'text-green-600' : ''}>
                      {delta3.perPerson > 0 ? '+' : ''}{formatCurrency(delta3.perPerson)}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Visual Calendar */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden mb-4">
          <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
            <h2 className="text-base font-bold text-slate-700 dark:text-slate-300">
              Trip Itinerary
            </h2>
            <div className="flex gap-1.5">
              {[1, 2, 3].map((num) => (
                <button
                  key={num}
                  onClick={() => setSelectedCalendar(num)}
                  className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all ${
                    selectedCalendar === num
                      ? num === 1
                        ? 'bg-slate-700 text-white'
                        : num === 2
                        ? 'bg-blue-600 text-white'
                        : 'bg-cyan-600 text-white'
                      : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600'
                  }`}
                >
                  S{num}
                </button>
              ))}
            </div>
          </div>

          <div className="p-5">
            {[calendar1, calendar2, calendar3].map((calendar, calIdx) => (
              selectedCalendar === calIdx + 1 && (
                <div key={calIdx} className="space-y-2.5">
                  {calendar.map((event, idx) => (
                    <div key={idx}>
                      {event.type === 'flight' ? (
                        <div className="flex items-start gap-4 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-100 dark:border-blue-900/50">
                          <div className="flex-shrink-0">
                            <Plane size={20} className="text-blue-600 dark:text-blue-400 mt-0.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline justify-between gap-2 mb-1">
                              <span className="font-bold text-slate-900 dark:text-slate-100">{event.label}</span>
                              <span className="text-xs font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">{event.flightNumber}</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
                              <span className="font-medium">{event.date}</span>
                              <span>•</span>
                              <span className="font-mono">{event.time}</span>
                              <span>•</span>
                              <span>{event.duration}</span>
                            </div>
                          </div>
                        </div>
                      ) : event.type === 'stay' ? (
                        <div className={`py-3 px-4 rounded-xl ${
                          event.color === 'green'
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50'
                            : event.color === 'orange'
                            ? 'bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50'
                            : event.color === 'purple'
                            ? 'bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/50'
                            : 'bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-100 dark:border-cyan-900/50'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Home size={18} className={
                                event.color === 'green'
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : event.color === 'orange'
                                  ? 'text-amber-600 dark:text-amber-400'
                                  : event.color === 'purple'
                                  ? 'text-purple-600 dark:text-purple-400'
                                  : 'text-cyan-600 dark:text-cyan-400'
                              } />
                              <div>
                                <span className="font-bold text-slate-900 dark:text-slate-100">{event.label}</span>
                                <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{event.date}</div>
                              </div>
                            </div>
                            <span className={`text-xs font-bold px-2 py-1 rounded ${
                              event.color === 'green'
                                ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
                                : event.color === 'orange'
                                ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300'
                                : event.color === 'purple'
                                ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300'
                                : 'bg-cyan-100 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300'
                            }`}>
                              {event.nights} night{event.nights !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="py-2 px-4 text-center">
                          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{event.label}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 mb-4">
          <h2 className="text-base font-bold mb-4 text-slate-700 dark:text-slate-300">Summary</h2>

          <div className="space-y-3">
            {/* Scenario 1 */}
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-700/30 border border-slate-200 dark:border-slate-600">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-300">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1.5 text-sm">Keep Original Plan</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {narrative1}
                  </p>
                  <div className="mt-2 text-sm font-bold">
                    Total: {formatCurrency(scenario1.total.forCouple)} for 2 people
                    ({formatCurrency(scenario1.total.perPerson)} pp)
                  </div>
                </div>
              </div>
            </div>

            {/* Scenario 2 */}
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-700/30 border border-slate-200 dark:border-slate-600">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-xs font-bold text-blue-700 dark:text-blue-300">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1.5 flex items-center gap-2 text-sm">
                    Extend Bali (3n) + Qatar via DOH
                    {delta2.perPerson !== 0 && (
                      <span className={`flex items-center gap-1 text-sm ${delta2.perPerson > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {delta2.perPerson > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                        {delta2.perPerson > 0 ? '+' : ''}{formatCurrency(delta2.perPerson)} pp
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {narrative2}
                  </p>
                  <div className="mt-2 text-sm font-bold">
                    Total: {formatCurrency(scenario2.total.forCouple)} for 2 people
                    ({formatCurrency(scenario2.total.perPerson)} pp)
                  </div>
                </div>
              </div>
            </div>

            {/* Scenario 3 */}
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-700/30 border border-slate-200 dark:border-slate-600">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center text-xs font-bold text-cyan-700 dark:text-cyan-300">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1.5 flex items-center gap-2 text-sm">
                    Extend Bali (1n) + Qatar via DOH
                    {delta3.perPerson !== 0 && (
                      <span className={`flex items-center gap-1 text-sm ${delta3.perPerson > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {delta3.perPerson > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                        {delta3.perPerson > 0 ? '+' : ''}{formatCurrency(delta3.perPerson)} pp
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {narrative3}
                  </p>
                  <div className="mt-2 text-sm font-bold">
                    Total: {formatCurrency(scenario3.total.forCouple)} for 2 people
                    ({formatCurrency(scenario3.total.perPerson)} pp)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
