/**
 * Pre-configured disruption scenarios
 * 
 * Each scenario represents a plausible geopolitical event
 * with associated supply impacts and duration estimates.
 * 
 * Probability assessments derived from:
 * - Geopolitical risk indices (GPR, ICRG)
 * - Military escalation patterns
 * - Historical precedent analysis
 */

export const SCENARIOS = {
  hormuz_mining: {
    id: 'hormuz_mining',
    name: 'Strait of Hormuz Mining Operation',
    description:
      'Iran deploys naval mines in shipping lanes following escalation with US/Israel. Similar to 1980s "Tanker War" tactics.',
    probability_annual: 0.15,
    onset_time_hours: 6, // How quickly disruption begins
    duration_days_range: [14, 90],
    expected_duration_days: 35,

    supply_impact: {
      hormuz_closure_pct: 85, // 85% of traffic halted
      bpd_disrupted: 17_500_000,
      lng_disrupted_mtpa: 90, // Million tonnes per annum equivalent
    },

    regional_impacts: {
      saudi_arabia: { exports_affected_pct: 78, bypass_capacity_utilized_pct: 95 },
      uae: { exports_affected_pct: 65, bypass_capacity_utilized_pct: 100 },
      iraq: { exports_affected_pct: 82, bypass_capacity_utilized_pct: 0 },
      kuwait: { exports_affected_pct: 95, bypass_capacity_utilized_pct: 0 },
      qatar: { lng_exports_affected_pct: 92 },
    },

    price_shock: {
      immediate_spike_pct: 18,
      peak_price_usd: 145,
      stabilization_days: 21,
    },

    insurance: {
      war_risk_premium_multiplier: 8, // 8x normal
      hull_insurance_premium_pct: 3.5,
      many_vessels_uninsurable: true,
    },

    geopolitical: {
      us_spr_release_likely: true,
      iea_coordinated_response_likely: true,
      un_security_council_engagement: true,
      military_convoy_system_likely: true, // Escorted tanker transits
    },

    notes:
      'Historical precedent: 1984-1988 Tanker War saw 546 vessels attacked. Modern anti-ship missiles (e.g., C-802) increase lethality. Mine clearance operations by US/Allied navies could take 2-4 weeks.',
  },

  abqaiq_redux: {
    id: 'abqaiq_redux',
    name: 'Repeat Abqaiq-Khurais Attack',
    description:
      'Drone/cruise missile strike on Saudi Aramco processing facilities, similar to September 2019 attack. 5.7M bpd offline.',
    probability_annual: 0.08,
    onset_time_hours: 2,
    duration_days_range: [10, 45],
    expected_duration_days: 18,

    supply_impact: {
      hormuz_closure_pct: 0, // Strait remains open
      bpd_disrupted: 5_700_000, // All from Saudi Arabia
      saudi_spare_capacity_utilized: true,
    },

    regional_impacts: {
      saudi_arabia: {
        processing_capacity_offline_pct: 52,
        exports_affected_pct: 28, // Partial; uses reserves and spare capacity
        repair_time_days_range: [7, 21],
      },
    },

    price_shock: {
      immediate_spike_pct: 15,
      peak_price_usd: 135,
      stabilization_days: 12,
    },

    notes:
      '2019 attack demonstrated vulnerability of centralized infrastructure. Aramco restored 70% capacity in 10 days; full restoration took 2+ weeks. Modern air defense improvements may reduce future attack success.',
  },

  iran_israel_escalation: {
    id: 'iran_israel_escalation',
    name: 'Iran-Israel Regional Conflict',
    description:
      'Major military exchange between Iran and Israel triggers closure of Strait of Hormuz and attacks on Gulf energy infrastructure.',
    probability_annual: 0.12,
    onset_time_hours: 12,
    duration_days_range: [30, 180],
    expected_duration_days: 65,

    supply_impact: {
      hormuz_closure_pct: 95,
      bpd_disrupted: 19_800_000,
      lng_disrupted_mtpa: 105,
      multiple_terminals_damaged: true,
    },

    regional_impacts: {
      saudi_arabia: { exports_affected_pct: 82, infrastructure_damage: 'moderate' },
      uae: { exports_affected_pct: 70, infrastructure_damage: 'minor' },
      iraq: { exports_affected_pct: 88, infrastructure_damage: 'minor' },
      kuwait: { exports_affected_pct: 98, infrastructure_damage: 'moderate' },
      qatar: { lng_exports_affected_pct: 95, infrastructure_damage: 'moderate' },
      iran: { exports_affected_pct: 100, under_expanded_sanctions: true },
    },

    price_shock: {
      immediate_spike_pct: 35,
      peak_price_usd: 185,
      stabilization_days: 45,
    },

    insurance: {
      war_risk_premium_multiplier: 15,
      hull_insurance_premium_pct: 5.0,
      many_vessels_uninsurable: true,
      lloyds_market_capacity_exhausted: true,
    },

    geopolitical: {
      us_military_intervention_likely: true,
      us_spr_release_certain: true,
      iea_coordinated_response_certain: true,
      nato_involvement_possible: true,
      global_recession_risk_high: true,
    },

    notes:
      'Worst-case scenario. Would trigger largest supply disruption since 1970s Arab Oil Embargo. Global spare capacity insufficient to offset losses. Major economic consequences globally.',
  },

  red_sea_prolonged: {
    id: 'red_sea_prolonged',
    name: 'Extended Red Sea / Bab el-Mandeb Closure',
    description:
      'Continuation and intensification of 2024-25 Houthi attacks. Suez Canal route becomes untenable; forces Cape routing.',
    probability_annual: 0.25,
    onset_time_hours: 0, // Already occurring (gradual escalation)
    duration_days_range: [90, 365],
    expected_duration_days: 180,

    supply_impact: {
      hormuz_closure_pct: 0, // Hormuz unaffected
      suez_route_utilization_pct: 35, // Down from 100%
      bpd_rerouted_via_cape: 4_200_000,
      lng_rerouted_mtpa: 35,
    },

    regional_impacts: {
      egypt: { suez_revenue_loss_pct: 62 }, // Major economic impact
      saudi_arabia: { yanbu_exports_affected: true, red_sea_route_disrupted: true },
    },

    price_shock: {
      immediate_spike_pct: 4, // Modest; rerouting possible
      sustained_premium_pct: 6, // Longer-term elevated prices due to freight
      peak_price_usd: 98,
    },

    freight_impact: {
      vlcc_charter_rate_increase_pct: 45,
      voyage_cost_increase_usd: 1_200_000,
      tanker_capacity_shortage: true,
      lng_carrier_shortage: true,
    },

    notes:
      'Less severe than Hormuz closure but longer duration. Freight and insurance costs become dominant factors. Refinery crude slate issues for Asian refiners optimized for Middle East grades.',
  },

  baseline_peacetime: {
    id: 'baseline_peacetime',
    name: 'Baseline (No Major Disruption)',
    description:
      'Normal operations with typical minor incidents (piracy, weather, occasional unrest) but no major chokepoint closures.',
    probability_annual: 0.40,
    onset_time_hours: null,
    duration_days_range: null,
    expected_duration_days: null,

    supply_impact: {
      hormuz_closure_pct: 0,
      bpd_disrupted: 0,
    },

    price_shock: {
      baseline_price_usd: 85,
      normal_volatility_range: [78, 94],
    },

    notes: 'Business as usual. Minor geopolitical risk premium already priced into baseline.',
  },
};

/**
 * Get scenario by ID
 */
export function getScenario(id) {
  return SCENARIOS[id] || null;
}

/**
 * List all scenarios sorted by probability
 */
export function listScenarios() {
  return Object.values(SCENARIOS).sort(
    (a, b) => (b.probability_annual || 0) - (a.probability_annual || 0)
  );
}

/**
 * Calculate weighted expected value across scenarios
 * Useful for portfolio risk assessment
 */
export function calculateExpectedImpact() {
  const scenarios = Object.values(SCENARIOS);

  let weighted_bpd = 0;
  let weighted_price = 0;
  let total_probability = 0;

  scenarios.forEach((s) => {
    const prob = s.probability_annual || 0;
    const bpd = s.supply_impact?.bpd_disrupted || 0;
    const price = s.price_shock?.peak_price_usd || 85;

    weighted_bpd += prob * bpd;
    weighted_price += prob * price;
    total_probability += prob;
  });

  return {
    expected_disruption_bpd: weighted_bpd,
    expected_price_usd: weighted_price / total_probability,
    total_probability,
  };
}
