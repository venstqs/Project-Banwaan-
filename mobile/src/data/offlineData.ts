// Pre-bundled offline dataset for Project Banwaan Mobile App
// Enables full functionality during typhoons / signal loss in Naga City

import cbmsData from './processed_cbms_data.json';

export interface OfflineBarangay {
  id: number;
  name: string;
  total_households: number;
  total_population: number;
  vulnerability_index: number;
  center: [number, number];
  category?: string | {
    id: string;
    name: string;
    short: string;
    color: string;
  };
  category_name?: string;
  category_color?: string;
  health_cho?: {
    food_insecurity_pct: number;
    food_insecurity_count: number;
  };
  infrastructure_ceo?: {
    drinking_refilling_pct: number;
  };
  social_swo?: {
    unbanked_pct: number;
    neet_youth_pct: number;
  };
  top_needs: string[];
  recommended_programs: {
    office: string;
    program: string;
    statute: string;
    sdg: string;
    estimated_budget: string;
  }[];
  emergency_hotlines: {
    service: string;
    number: string;
  }[];
}

export const NAGA_EMERGENCY_HOTLINES = [
  { service: "Naga City DRRMO Operations Center", number: "(054) 205-2980 / 0917-578-8888" },
  { service: "Bureau of Fire Protection (BFP Naga)", number: "(054) 473-8444 / 0929-123-4567" },
  { service: "Naga City Police Station", number: "(054) 811-6577 / 117" },
  { service: "City Health Office (CHO) Emergency Desk", number: "(054) 881-2345" },
  { service: "Naga Red Cross Chapter", number: "(054) 473-9099" },
  { service: "City Social Welfare and Development (CSWDO)", number: "(054) 881-5678" }
];

export const TYPHOON_ADVISORIES_MULTILINGUAL = [
  {
    level: "SIGNAL 2 - TROPICAL CYCLONE ALERT",
    time: "Latest Update: 18:00 PHT",
    english: "Expect moderate to heavy rainfall within 24 hours. Low-lying barangays are advised to prepare pre-emptive evacuation to designated school shelters.",
    filipino: "Inaasahan ang katamtaman hanggang sa malalakas na pag-ulan sa loob ng 24 oras. Pinapayuhan ang mga mabababang barangay na maghanda sa maagang paglikas sa mga evacuation center.",
    bikol: "Lalaoman an makukusog na uran sa laog nin 24 oras. Pinapagirumdoman an mga barangay sa may kababaan na mag-andam na sa amay na pagbakwit sa mga itinalaan na evacuation center."
  }
];

type OfflineProfile = Pick<OfflineBarangay, "top_needs" | "recommended_programs">;

const peso = (value: number) => `₱${Math.round(value).toLocaleString()}`;

const CURATED_PROFILES: Record<number, OfflineProfile> = {
  1: {
    top_needs: ["Digital Payout Enrollment", "Senior Citizen ID Coverage", "Drainage Maintenance"],
    recommended_programs: [
      {
        office: "SWO",
        program: "GCash/Maya Cash-Aid Distribution Integration",
        statute: "RA 11310 (4Ps Act)",
        sdg: "SDG 1 No Poverty",
        estimated_budget: "₱150,000"
      },
      {
        office: "DRRMO",
        program: "BDRRMC Early Warning Channel Upgrades",
        statute: "RA 10121 Sec 12",
        sdg: "SDG 11 Sustainable Cities",
        estimated_budget: "₱220,000"
      }
    ]
  },
  3: {
    top_needs: ["Formal Written BDRRM Plan", "Emergency Operations Center Hotline", "Shelter Roof Reinforcement"],
    recommended_programs: [
      {
        office: "DRRMO",
        program: "Comprehensive BDRRMP Workshop & 24/7 Hotline Installation",
        statute: "RA 10121 Sec 12(c)(6)",
        sdg: "SDG 11 & SDG 13",
        estimated_budget: "₱185,000"
      },
      {
        office: "CEO",
        program: "Light Roofing Disaster Mitigation Subsidy",
        statute: "PD 1096 National Building Code",
        sdg: "SDG 11 Sustainable Cities",
        estimated_budget: "₱450,000"
      }
    ]
  },
  7: {
    top_needs: ["Roof Structural Reinforcement", "Communal Sanitation Block", "Youth Livelihood Placement"],
    recommended_programs: [
      {
        office: "DRRMO",
        program: "Typhoon Shelter & Light Roof Reinforcement Grant",
        statute: "RA 10121 Sec 21",
        sdg: "SDG 11 & SDG 13",
        estimated_budget: "₱420,000"
      },
      {
        office: "CEO",
        program: "Sanitary Bio-Digester Toilet Units",
        statute: "RA 7160 Sec 17",
        sdg: "SDG 6 Clean Water & Sanitation",
        estimated_budget: "₱680,000"
      }
    ]
  },
  9: {
    top_needs: ["High-Capacity Evacuation Shelter", "Digital Cash-Aid Onboarding", "MRF Solid Waste Expansion"],
    recommended_programs: [
      {
        office: "SWO",
        program: "Digital Financial Inclusion & TESDA Youth Training",
        statute: "RA 11310 Sec 13",
        sdg: "SDG 1 No Poverty & SDG 8",
        estimated_budget: "₱540,000"
      },
      {
        office: "CEO",
        program: "Cluster Materials Recovery Facility (MRF)",
        statute: "RA 9003 Sec 32",
        sdg: "SDG 11 & SDG 12",
        estimated_budget: "₱750,000"
      }
    ]
  },
  16: {
    top_needs: ["Food Insecurity Verification & Relief", "Sanitary Toilet Blocks", "Piped Water Reticulation"],
    recommended_programs: [
      {
        office: "CHO",
        program: "Targeted Nutrition Intervention & Water Quality Testing",
        statute: "RA 11223 UHC Act",
        sdg: "SDG 2 Zero Hunger & SDG 3",
        estimated_budget: "₱380,000"
      },
      {
        office: "CEO",
        program: "Communal Piped Water Mains Expansion",
        statute: "RA 7160 Sec 17",
        sdg: "SDG 6 Clean Water & Sanitation",
        estimated_budget: "₱1,200,000"
      }
    ]
  }
};

function deriveProfile(b: any): OfflineProfile {
  const ceo = b.infrastructure_ceo || {};
  const drrm = b.drrm || {};
  const health = b.health_cho || {};
  const social = b.social_swo || {};
  const sectors = b.sector_scores || {};
  const households = b.total_households || 0;

  const candidates: { severity: number; need: string; office: string; program: string; statute: string; sdg: string; budget: number }[] = [];

  if ((health.food_insecurity_pct || 0) >= 50) {
    candidates.push({
      severity: health.food_insecurity_pct,
      need: "Food Insecurity Verification & Relief",
      office: "CHO",
      program: "Targeted Nutrition Intervention & Water Quality Testing",
      statute: "RA 11223 UHC Act",
      sdg: "SDG 2 Zero Hunger & SDG 3",
      budget: 180000 + households * 110
    });
  }
  if ((ceo.unimproved_toilet_pct || 0) >= 30 || (ceo.households_needing_sanitation || 0) > 100) {
    candidates.push({
      severity: ceo.unimproved_toilet_pct || 0,
      need: "Sanitary Toilet Blocks",
      office: "CEO",
      program: "Communal Sanitary Toilet Blocks",
      statute: "RA 7160 Sec 17",
      sdg: "SDG 6 Clean Water & Sanitation",
      budget: (ceo.households_needing_sanitation || 0) * 25000
    });
  }
  if ((ceo.piped_water_pct || 0) < 65) {
    candidates.push({
      severity: 65 - (ceo.piped_water_pct || 0),
      need: "Piped Water Reticulation",
      office: "CEO",
      program: "Piped Water Reticulation Extension",
      statute: "RA 7160 Sec 17",
      sdg: "SDG 6 Clean Water & Sanitation",
      budget: 900000 + households * 160
    });
  }
  if ((drrm.weak_roof_pct || 0) >= 5) {
    candidates.push({
      severity: drrm.weak_roof_pct,
      need: "Roof Structural Reinforcement",
      office: "DRRMO",
      program: "Light Roof Reinforcement & Shelter Retrofit",
      statute: "RA 10121 Sec 21",
      sdg: "SDG 11 & SDG 13",
      budget: 250000 + households * 95
    });
  }
  if ((social.unbanked_pct || 0) >= 40) {
    candidates.push({
      severity: social.unbanked_pct,
      need: "Digital Cash-Aid Enrollment",
      office: "SWO",
      program: "Digital Cash-Aid Enrollment & Financial Inclusion",
      statute: "RA 11310 Sec 13",
      sdg: "SDG 1 No Poverty & SDG 8",
      budget: 120000 + households * 65
    });
  }
  if ((social.neet_youth_pct || 0) >= 15) {
    candidates.push({
      severity: social.neet_youth_pct,
      need: "NEET Youth Skills Placement",
      office: "SWO",
      program: "NEET Youth Skills Placement (TESDA/DOLE)",
      statute: "RA 11310 Sec 13",
      sdg: "SDG 8 Decent Work",
      budget: 90000 + (social.neet_youth_count || 0) * 1500
    });
  }
  if ((sectors.cpdo_planning_gap || 0) >= 60) {
    candidates.push({
      severity: sectors.cpdo_planning_gap,
      need: "BDRRM / AIP Planning",
      office: "DRRMO",
      program: "BDRRM Plan Formulation & 24/7 Hotline",
      statute: "RA 10121 Sec 12",
      sdg: "SDG 11 & SDG 13",
      budget: 120000 + households * 40
    });
  }
  if ((ceo.without_electricity_pct || 0) >= 5) {
    candidates.push({
      severity: ceo.without_electricity_pct,
      need: "Household Electrification",
      office: "CEO",
      program: "Household Electrification Assistance",
      statute: "RA 7160 Sec 17",
      sdg: "SDG 7 Clean Energy",
      budget: (ceo.households_needing_electricity || 0) * 4500
    });
  }

  const top = candidates.sort((a, b) => b.severity - a.severity).slice(0, 3);
  const needs = top.length
    ? top.map((item) => item.need)
    : ["CBMS Data Validation", "AIP Project Prioritization", "Community Consultation"];

  const programs = top.slice(0, 2).map((item) => ({
    office: item.office,
    program: item.program,
    statute: item.statute,
    sdg: item.sdg,
    estimated_budget: peso(item.budget)
  }));

  if (programs.length < 2) {
    programs.push({
      office: "CPDO",
      program: "CBMS-Based AIP Prioritization & Monitoring",
      statute: "RA 7160 Sec 106",
      sdg: "SDG 16 & SDG 17",
      estimated_budget: peso(150000 + households * 30)
    });
  }

  return { top_needs: needs, recommended_programs: programs };
}

export const SAMPLE_BARANGAYS_OFFLINE: OfflineBarangay[] = (cbmsData as any).barangays
  .map((b: any) => {
    const profile = CURATED_PROFILES[b.id] || deriveProfile(b);
    return {
      id: b.id,
      name: b.display_name || b.real_name || b.name,
      total_households: b.total_households || 0,
      total_population: b.total_population || 0,
      vulnerability_index: b.vulnerability_index || 0,
      center: (b.center || [123.1948, 13.6218]) as [number, number],
      category: b.category
        ? {
            id: b.category,
            name: b.category_name || b.category,
            short: b.category_short || b.category_name || b.category,
            color: b.category_color || '#05389f'
          }
        : undefined,
      category_name: b.category_name,
      category_color: b.category_color,
      health_cho: b.health_cho
        ? {
            food_insecurity_pct: b.health_cho.food_insecurity_pct || 0,
            food_insecurity_count: b.health_cho.food_insecurity_count || 0
          }
        : undefined,
      infrastructure_ceo: b.infrastructure_ceo
        ? {
            drinking_refilling_pct: b.infrastructure_ceo.drinking_refilling_pct || 0
          }
        : undefined,
      social_swo: b.social_swo
        ? {
            unbanked_pct: b.social_swo.unbanked_pct || 0,
            neet_youth_pct: b.social_swo.neet_youth_pct || 0
          }
        : undefined,
      top_needs: profile.top_needs,
      recommended_programs: profile.recommended_programs,
      emergency_hotlines: NAGA_EMERGENCY_HOTLINES
    };
  })
  .sort((a: OfflineBarangay, b: OfflineBarangay) => a.id - b.id);
