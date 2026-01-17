/**
 * Budget calculation module for Singapore-Malaysia-Bali trip
 * Pure functions for cost computation across three scenarios
 */

// Default values for budget calculations
export const DEFAULT_ASSUMPTIONS = {
  // Committed costs (per person)
  flights: {
    lhrToSin: 312,
    sinToLhr: 125, // Can be cancelled for refund
    sinToKul: 60,
    kulToDps: 46,
    dpsToSin: 70, // Can change date for free, no refund
  },

  // Accommodation (for 2 people total)
  accommodation: {
    singapore: 300,
    kualaLumpur: 200,
    bali: 600,
  },

  // Assumed nights for calculating per-night costs
  assumedNights: {
    singapore: 3,
    kualaLumpur: 3,
    bali: 5,
  },

  // Scenario 2: Extend Bali + Qatar via Doha
  scenario2: {
    newSinToLhr: 250, // per person, Qatar flights (SIN→DOH→LGW)
  },

  // Scenario 3: Qatar routing via Doha
  scenario3: {
    qatarBundle: 280, // per person, covers SIN→DOH + 2 nights Doha + DOH→LON
  },
};

/**
 * Calculate per-night accommodation costs based on committed totals and assumed nights
 */
export function calculatePerNightCosts(assumptions) {
  return {
    singapore: assumptions.accommodation.singapore / assumptions.assumedNights.singapore,
    kualaLumpur: assumptions.accommodation.kualaLumpur / assumptions.assumedNights.kualaLumpur,
    bali: assumptions.accommodation.bali / assumptions.assumedNights.bali,
  };
}

/**
 * Calculate Scenario 1 (baseline): Keep everything as-is
 */
export function calculateScenario1(assumptions) {
  const { flights, accommodation } = assumptions;

  // Flight costs (all per person)
  const flightCostsPerPerson =
    flights.lhrToSin +
    flights.sinToLhr +
    flights.sinToKul +
    flights.kulToDps +
    flights.dpsToSin;

  const flightCostsForCouple = flightCostsPerPerson * 2;

  // Accommodation (already for 2 people)
  const accommodationTotal =
    accommodation.singapore +
    accommodation.kualaLumpur +
    accommodation.bali;

  const totalForCouple = flightCostsForCouple + accommodationTotal;
  const totalPerPerson = flightCostsPerPerson + (accommodationTotal / 2);

  return {
    flights: {
      perPerson: flightCostsPerPerson,
      forCouple: flightCostsForCouple,
    },
    accommodation: {
      forCouple: accommodationTotal,
      perPerson: accommodationTotal / 2,
    },
    other: {
      perPerson: 0,
      forCouple: 0,
    },
    total: {
      perPerson: totalPerPerson,
      forCouple: totalForCouple,
    },
    breakdown: {
      lhrToSin: { amount: flights.lhrToSin, appliesTo: 'per_person' },
      sinToLhr: { amount: flights.sinToLhr, appliesTo: 'per_person' },
      sinToKul: { amount: flights.sinToKul, appliesTo: 'per_person' },
      kulToDps: { amount: flights.kulToDps, appliesTo: 'per_person' },
      dpsToSin: { amount: flights.dpsToSin, appliesTo: 'per_person' },
      singaporeAccom: { amount: accommodation.singapore, appliesTo: 'per_couple' },
      kualaLumpurAccom: { amount: accommodation.kualaLumpur, appliesTo: 'per_couple' },
      baliAccom: { amount: accommodation.bali, appliesTo: 'per_couple' },
    },
  };
}

/**
 * Calculate Scenario 2: Extend Bali + rebook BA return later
 * @param {number} baliExtraNights - 0, 1, or 2 extra nights in Bali
 */
export function calculateScenario2(assumptions, baliExtraNights, perNightCosts) {
  const { flights, accommodation, scenario2 } = assumptions;

  // Refund BA return
  const refund = flights.sinToLhr;

  // New BA return flight (later date)
  const newReturn = scenario2.newSinToLhr;

  // Flight costs per person (cancel old return, add new return)
  const flightCostsPerPerson =
    flights.lhrToSin +
    newReturn + // Replacement return
    flights.sinToKul +
    flights.kulToDps +
    flights.dpsToSin; // Date can be changed to align with new return

  const flightCostsForCouple = flightCostsPerPerson * 2;

  // Extra accommodation in Bali (for 2 people)
  const extraBaliCost = baliExtraNights * perNightCosts.bali;

  // Total accommodation
  const accommodationTotal =
    accommodation.singapore +
    accommodation.kualaLumpur +
    accommodation.bali +
    extraBaliCost;

  const totalForCouple = flightCostsForCouple + accommodationTotal;
  const totalPerPerson = flightCostsPerPerson + (accommodationTotal / 2);

  return {
    flights: {
      perPerson: flightCostsPerPerson,
      forCouple: flightCostsForCouple,
    },
    accommodation: {
      forCouple: accommodationTotal,
      perPerson: accommodationTotal / 2,
    },
    other: {
      perPerson: 0,
      forCouple: 0,
    },
    total: {
      perPerson: totalPerPerson,
      forCouple: totalForCouple,
    },
    refund: {
      perPerson: refund,
      forCouple: refund * 2,
    },
    extraNights: {
      bali: baliExtraNights,
      baliCost: extraBaliCost,
    },
    breakdown: {
      lhrToSin: { amount: flights.lhrToSin, appliesTo: 'per_person' },
      newSinToLhr: { amount: newReturn, appliesTo: 'per_person', isReplacement: true },
      sinToKul: { amount: flights.sinToKul, appliesTo: 'per_person' },
      kulToDps: { amount: flights.kulToDps, appliesTo: 'per_person' },
      dpsToSin: { amount: flights.dpsToSin, appliesTo: 'per_person', dateChanged: true },
      singaporeAccom: { amount: accommodation.singapore, appliesTo: 'per_couple' },
      kualaLumpurAccom: { amount: accommodation.kualaLumpur, appliesTo: 'per_couple' },
      baliAccom: { amount: accommodation.bali, appliesTo: 'per_couple' },
      extraBaliNights: { amount: extraBaliCost, appliesTo: 'per_couple', nights: baliExtraNights },
    },
  };
}

/**
 * Calculate Scenario 3: Qatar routing via Doha
 * @param {number} baliExtraNights - 0, 1, or 2 extra nights in Bali
 * Scenario 3.1 (0 extra): Fly DPS→SIN on 12th, 1 night SIN, then DOH
 * Scenario 3.2 (1 extra): Fly DPS→SIN on 13th, 1 night SIN, then DOH
 * Scenario 3.3 (2 extra): Fly DPS→SIN on 14th, 1 night SIN, then DOH
 */
export function calculateScenario3(assumptions, baliExtraNights, perNightCosts) {
  const { flights, accommodation, scenario3 } = assumptions;

  // Refund BA return
  const refund = flights.sinToLhr;

  // Flight costs per person (remove BA return, Jetstar stays, Qatar bundle added)
  const flightCostsPerPerson =
    flights.lhrToSin +
    flights.sinToKul +
    flights.kulToDps +
    flights.dpsToSin; // Date changes based on baliExtraNights

  const flightCostsForCouple = flightCostsPerPerson * 2;

  // Extra accommodation: baliExtraNights + 1 Singapore night
  const extraBaliCost = baliExtraNights * perNightCosts.bali;
  const extraSingaporeCost = 1 * perNightCosts.singapore; // Always 1 extra night in Singapore

  const accommodationTotal =
    accommodation.singapore +
    accommodation.kualaLumpur +
    accommodation.bali +
    extraBaliCost +
    extraSingaporeCost;

  // Qatar bundle (SIN→DOH + 2 nights Doha + DOH→LON) is per person
  const qatarBundlePerPerson = scenario3.qatarBundle;
  const qatarBundleForCouple = qatarBundlePerPerson * 2;

  const totalForCouple = flightCostsForCouple + accommodationTotal + qatarBundleForCouple;
  const totalPerPerson = flightCostsPerPerson + (accommodationTotal / 2) + qatarBundlePerPerson;

  return {
    flights: {
      perPerson: flightCostsPerPerson,
      forCouple: flightCostsForCouple,
    },
    accommodation: {
      forCouple: accommodationTotal,
      perPerson: accommodationTotal / 2,
    },
    other: {
      perPerson: qatarBundlePerPerson,
      forCouple: qatarBundleForCouple,
      label: 'Qatar Bundle (SIN→DOH, 2 nights Doha, DOH→LON)',
    },
    total: {
      perPerson: totalPerPerson,
      forCouple: totalForCouple,
    },
    refund: {
      perPerson: refund,
      forCouple: refund * 2,
    },
    extraNights: {
      bali: baliExtraNights,
      baliCost: extraBaliCost,
      singapore: 1,
      singaporeCost: extraSingaporeCost,
      doha: 2, // Informational (included in Qatar bundle)
    },
    breakdown: {
      lhrToSin: { amount: flights.lhrToSin, appliesTo: 'per_person' },
      sinToKul: { amount: flights.sinToKul, appliesTo: 'per_person' },
      kulToDps: { amount: flights.kulToDps, appliesTo: 'per_person' },
      dpsToSin: {
        amount: flights.dpsToSin,
        appliesTo: 'per_person',
        dateChanged: true,
        newDate: baliExtraNights === 0 ? '12 Apr' : baliExtraNights === 1 ? '13 Apr' : '14 Apr'
      },
      singaporeAccom: { amount: accommodation.singapore, appliesTo: 'per_couple' },
      kualaLumpurAccom: { amount: accommodation.kualaLumpur, appliesTo: 'per_couple' },
      baliAccom: { amount: accommodation.bali, appliesTo: 'per_couple' },
      extraBaliNights: { amount: extraBaliCost, appliesTo: 'per_couple', nights: baliExtraNights },
      extraSingaporeNight: { amount: extraSingaporeCost, appliesTo: 'per_couple', nights: 1 },
      qatarBundle: { amount: qatarBundlePerPerson, appliesTo: 'per_person' },
    },
  };
}

/**
 * Calculate delta vs Scenario 1
 */
export function calculateDelta(scenario, baseline) {
  return {
    perPerson: scenario.total.perPerson - baseline.total.perPerson,
    forCouple: scenario.total.forCouple - baseline.total.forCouple,
  };
}

/**
 * Generate narrative summary for a scenario
 */
export function generateNarrative(scenarioNumber, scenario, delta, baliExtraNights = 0) {
  if (scenarioNumber === 1) {
    return 'Keep the trip as currently planned with all existing flights and committed accommodation.';
  }

  if (scenarioNumber === 2) {
    const refundStr = `Refunded BA return (£${scenario.refund.perPerson} pp)`;
    const rebookStr = `rebooked later return flight (£${scenario.breakdown.newSinToLhr.amount} pp)`;
    const nightsStr = baliExtraNights > 0
      ? `, added ${baliExtraNights} extra Bali night${baliExtraNights > 1 ? 's' : ''} (£${scenario.extraNights.baliCost} total)`
      : '';
    const deltaStr = delta.perPerson > 0
      ? `costs £${Math.abs(delta.perPerson).toFixed(0)} more per person`
      : delta.perPerson < 0
      ? `saves £${Math.abs(delta.perPerson).toFixed(0)} per person`
      : 'costs the same';

    return `${refundStr}, ${rebookStr}${nightsStr}. This ${deltaStr} vs keeping the original plan.`;
  }

  if (scenarioNumber === 3) {
    const refundStr = `Refunded BA return (£${scenario.refund.perPerson} pp)`;
    const flyDate = scenario.breakdown.dpsToSin.newDate;
    const routeStr = `fly DPS→SIN on ${flyDate}, add 1 night in Singapore, then route via Doha (SIN→DOH→LON + 2 nights, £${scenario.other.perPerson} pp bundle)`;
    const baliNightsStr = baliExtraNights > 0
      ? `${baliExtraNights} extra Bali night${baliExtraNights > 1 ? 's' : ''} (£${scenario.extraNights.baliCost} total) and `
      : '';
    const nightsStr = `This adds ${baliNightsStr}1 extra Singapore night`;
    const deltaStr = delta.perPerson > 0
      ? `costs £${Math.abs(delta.perPerson).toFixed(0)} more per person`
      : delta.perPerson < 0
      ? `saves £${Math.abs(delta.perPerson).toFixed(0)} per person`
      : 'costs the same';

    return `${refundStr}, ${routeStr}. ${nightsStr}. This ${deltaStr} vs the original plan.`;
  }

  return '';
}

/**
 * Format currency for display
 */
export function formatCurrency(amount) {
  return `£${Math.round(amount)}`;
}
