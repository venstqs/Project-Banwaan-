// Pre-bundled offline dataset for Project Banwaan Mobile App
// Synchronized with the Web Command Center (27 Naga City Barangays, 5 CLUP Categories, 17 UN SDGs, Verified 911 Hotlines)

import cbmsData from './processed_cbms_data.json';

export interface BarangayCategoryMeta {
  id: string;
  name: string;
  short: string;
  color: string;
  icon: string;
  description: string;
}

export const NAGA_BARANGAY_NAMES: Record<number, string> = {
  1: 'Abella',
  2: 'Bagumbayan Norte',
  3: 'Bagumbayan Sur',
  4: 'Balatas',
  5: 'Calauag',
  6: 'Cararayan',
  7: 'Carolina',
  8: 'Concepcion Grande',
  9: 'Concepcion Pequeña',
  10: 'Dayangdang',
  11: 'Del Rosario',
  12: 'Dinaga',
  13: 'Igualdad Interior',
  14: 'Lerma',
  15: 'Liboton',
  16: 'Mabolo',
  17: 'Pacol',
  18: 'Panicuason',
  19: 'Peñafrancia',
  20: 'Sabang',
  21: 'San Felipe',
  22: 'San Francisco',
  23: 'San Isidro',
  24: 'Santa Cruz',
  25: 'Tabuco',
  26: 'Tinago',
  27: 'Triangulo',
};

export const CATEGORY_FILTERS = [
  { id: 'all', label: '🌐 All 27', short: 'All 27', count: 27, color: '#05389f' },
  { id: 'upland', label: '⛰️ Upland (5)', short: 'Upland', count: 5, color: '#b59410' },
  { id: 'cbd', label: '🏢 CBD Core (6)', short: 'CBD Core', count: 6, color: '#05389f' },
  { id: 'poblacion', label: '🏛️ Poblacion (8)', short: 'Poblacion', count: 8, color: '#7c3aed' },
  { id: 'riverine', label: '🌊 Riverine (4)', short: 'Riverine', count: 4, color: '#ea580c' },
  { id: 'growth', label: '🏥 Growth (4)', short: 'Growth', count: 4, color: '#0284c7' },
];

export const BARANGAY_CATEGORIES: Record<number, BarangayCategoryMeta> = {
  // Upland Watershed & Agro-Forestry (5 Barangays - Isarog Slopes)
  18: { id: 'upland', name: 'Upland Watershed & Agro-Forestry', short: 'Upland Watershed', color: '#b59410', icon: '⛰️', description: 'Mt. Isarog slope, watershed recharge, hot springs eco-tourism, agro-forestry' },
  7:  { id: 'upland', name: 'Upland Watershed & Agro-Forestry', short: 'Upland Watershed', color: '#b59410', icon: '⛰️', description: 'Agro-industrial terrace, intermediate watershed buffer, low population density' },
  17: { id: 'upland', name: 'Upland Watershed & Agro-Forestry', short: 'Upland Watershed', color: '#b59410', icon: '⛰️', description: 'Northeast agricultural plateau, housing resettlement expansion, water recharge' },
  6:  { id: 'upland', name: 'Upland Watershed & Agro-Forestry', short: 'Upland Watershed', color: '#b59410', icon: '⛰️', description: 'Mid-valley agro-urban buffer, suburban residential sprawl, agricultural zoning' },
  23: { id: 'upland', name: 'Upland Watershed & Agro-Forestry', short: 'Upland Watershed', color: '#b59410', icon: '⛰️', description: 'Southeast agricultural greenbelt, farm-to-market linkage, rural settlement' },

  // Central Business District & Commercial Core (6 Barangays)
  27: { id: 'cbd', name: 'Central Business District (CBD Core)', short: 'CBD Commercial', color: '#05389f', icon: '🏢', description: 'CBD II, SM City Naga, Bicol Central Bus Terminal, major regional logistics artery' },
  25: { id: 'cbd', name: 'Central Business District (CBD Core)', short: 'CBD Commercial', color: '#05389f', icon: '🏢', description: 'CBD I, Naga City Public Market, Bicol River commercial trade & transport hub' },
  22: { id: 'cbd', name: 'Central Business District (CBD Core)', short: 'CBD Commercial', color: '#05389f', icon: '🏢', description: 'Centro Plaza Rizal, Plaza Quezon, historic financial district, government plaza' },
  12: { id: 'cbd', name: 'Central Business District (CBD Core)', short: 'CBD Commercial', color: '#05389f', icon: '🏢', description: 'Poblacion commercial core, commercial establishments, riverfront mercantile' },
  24: { id: 'cbd', name: 'Central Business District (CBD Core)', short: 'CBD Commercial', color: '#05389f', icon: '🏢', description: 'Urban commercial & institutional center, schools, private health clinics' },
  13: { id: 'cbd', name: 'Central Business District (CBD Core)', short: 'CBD Commercial', color: '#05389f', icon: '🏢', description: 'Compact market mercantile core, dense commercial trade, high daytime foot traffic' },

  // Suburban Growth & Institutional Expansion Corridor (4 Barangays)
  9:  { id: 'growth', name: 'Suburban Growth & Institutional Corridor', short: 'Growth Corridor', color: '#0284c7', icon: '🏥', description: 'Panganiban commercial strip, Bicol Medical Center, regional healthcare hub' },
  8:  { id: 'growth', name: 'Suburban Growth & Institutional Corridor', short: 'Growth Corridor', color: '#0284c7', icon: '🏥', description: 'Maharlika Highway southern growth spine, residential subdivisions, car dealerships' },
  11: { id: 'growth', name: 'Suburban Growth & Institutional Corridor', short: 'Growth Corridor', color: '#0284c7', icon: '🏥', description: 'Industrial & educational growth node, southern gateway towards Pili/Airport' },
  4:  { id: 'growth', name: 'Suburban Growth & Institutional Corridor', short: 'Growth Corridor', color: '#0284c7', icon: '🏥', description: 'Magsaysay Avenue tourism strip, BMC health expansion, new civic developments' },

  // Poblacion Urban & Heritage Core (8 Barangays)
  1:  { id: 'poblacion', name: 'Poblacion Urban & Heritage Core', short: 'Poblacion Heritage', color: '#7c3aed', icon: '🏛️', description: 'Dense historic poblacion, high residential density, compact commercial-residential' },
  26: { id: 'poblacion', name: 'Poblacion Urban & Heritage Core', short: 'Poblacion Heritage', color: '#7c3aed', icon: '🏛️', description: 'Central residential enclave, historic urban street grid, high social cohesion' },
  14: { id: 'poblacion', name: 'Poblacion Urban & Heritage Core', short: 'Poblacion Heritage', color: '#7c3aed', icon: '🏛️', description: 'Panganiban Drive gateway, mixed-use commercial & residential core' },
  15: { id: 'poblacion', name: 'Poblacion Urban & Heritage Core', short: 'Poblacion Heritage', color: '#7c3aed', icon: '🏛️', description: 'University & heritage belt, educational institutions, heritage residential' },
  10: { id: 'poblacion', name: 'Poblacion Urban & Heritage Core', short: 'Poblacion Heritage', color: '#7c3aed', icon: '🏛️', description: 'Compact riverbank residential core, community sports facilities, urban neighborhood' },
  19: { id: 'poblacion', name: 'Poblacion Urban & Heritage Core', short: 'Poblacion Heritage', color: '#7c3aed', icon: '🏛️', description: 'Our Lady of Peñafrancia National Shrine, sacred pilgrimage route, flashtide river' },
  2:  { id: 'poblacion', name: 'Poblacion Urban & Heritage Core', short: 'Poblacion Heritage', color: '#7c3aed', icon: '🏛️', description: 'North arterial residential belt, schools, local commercial and craft enterprises' },
  3:  { id: 'poblacion', name: 'Poblacion Urban & Heritage Core', short: 'Poblacion Heritage', color: '#7c3aed', icon: '🏛️', description: 'Naga River confluence, residential core, secondary school evacuation center' },

  // Riverine & High Flood-Hazard Delta (4 Barangays)
  16: { id: 'riverine', name: 'Riverine & High Flood-Hazard Delta', short: 'Riverine Flood Delta', color: '#ea580c', icon: '🌊', description: 'Southwest Bicol River basin, critical river surge hazard, informal riverbank homes' },
  20: { id: 'riverine', name: 'Riverine & High Flood-Hazard Delta', short: 'Riverine Flood Delta', color: '#ea580c', icon: '🌊', description: 'Riverside market perimeter, low-lying storm inundation basin, dense settlement' },
  5:  { id: 'riverine', name: 'Riverine & High Flood-Hazard Delta', short: 'Riverine Flood Delta', color: '#ea580c', icon: '🌊', description: 'Northwest riverine floodway, agricultural-urban interface, drainage catchment' },
  21: { id: 'riverine', name: 'Riverine & High Flood-Hazard Delta', short: 'Riverine Flood Delta', color: '#ea580c', icon: '🌊', description: 'Naga River upper tributary, riverbank flood hazard, expanding residential zones' },
};

export interface VerifiedEmergencyHotline {
  id: string;
  agency: string;
  subtext: string;
  category: 'rescue' | 'police' | 'medical' | 'fire' | 'social';
  icon: string;
  color: string;
  primaryPhone: string;
  altPhone: string;
  landline: string;
  location: string;
}

export const VERIFIED_HOTLINES_DETAILED: VerifiedEmergencyHotline[] = [
  {
    id: 'cdrrmo',
    agency: 'CDRRMO NAGA CENTRAL 911',
    subtext: 'City Disaster Risk Reduction & Management Office (24/7 ComCen)',
    category: 'rescue',
    icon: '🚨',
    color: '#dc2626',
    primaryPhone: '0908-525-3000',
    altPhone: '911 / 0963-220-9700 / 0985-253-3000',
    landline: '(054) 472-3000 / (054) 205-2980',
    location: 'City Hall Complex, J. Miranda Ave., Naga City',
  },
  {
    id: 'pnp',
    agency: 'PNP NAGA CITY POLICE',
    subtext: 'Philippine National Police - NCPO Headquarters',
    category: 'police',
    icon: '👮',
    color: '#1d4ed8',
    primaryPhone: '0908-325-4787',
    altPhone: '0908-737-4228 | Station 1: 0918-464-4371',
    landline: '(054) 881-0112',
    location: 'Barlin St., Naga City',
  },
  {
    id: 'bmc',
    agency: 'BICOL MEDICAL CENTER (BMC)',
    subtext: 'DOH Tertiary Regional Training & Medical Center (ER Complex)',
    category: 'medical',
    icon: '🏥',
    color: '#059669',
    primaryPhone: '0968-291-1125',
    altPhone: '0927-357-9967 (HEMS Disaster) / 0967-087-0155 (OB-ER)',
    landline: '(054) 472-6125 to 31',
    location: 'J. Miranda Ave., Concepcion Pequeña, Naga City',
  },
  {
    id: 'bfp',
    agency: 'BFP FIRE OPERATIONS',
    subtext: 'Bureau of Fire Protection - Naga City Central Fire Station',
    category: 'fire',
    icon: '🚒',
    color: '#ea580c',
    primaryPhone: '0923-083-9429',
    altPhone: '(054) 473-8472 / (054) 473-2633',
    landline: '(054) 871-6454',
    location: 'City Hall Compound, Naga City',
  },
  {
    id: 'cho',
    agency: 'CITY HEALTH OFFICE (CHO)',
    subtext: 'Naga City Primary Care, WASH & Epidemiological Desk',
    category: 'medical',
    icon: '🩺',
    color: '#0d9488',
    primaryPhone: '(054) 205-2980',
    altPhone: 'Local 2060 (Health Emergency)',
    landline: '(054) 473-9099',
    location: 'City Hall Compound, J. Miranda Ave., Naga City',
  },
  {
    id: 'cswdo',
    agency: 'CSWDO SOCIAL WELFARE DESK',
    subtext: '4Ps, AICS Crisis Intervention & Evacuation Relief',
    category: 'social',
    icon: '🤝',
    color: '#7c3aed',
    primaryPhone: '(054) 205-2980',
    altPhone: 'Local 2040 (Relief & Social Protection)',
    landline: '(054) 472-3000',
    location: 'City Hall Compound, J. Miranda Ave., Naga City',
  },
];

export const NAGA_EMERGENCY_HOTLINES = VERIFIED_HOTLINES_DETAILED.map((h) => ({
  service: h.agency,
  number: `${h.primaryPhone} | ${h.landline}`,
}));

export interface SearchableIndicator {
  id: string;
  name: string;
  dept: string;
  metric: string;
  summary: string;
  icon: string;
  category: 'infrastructure' | 'drrm' | 'health' | 'social';
  prompt: string;
}

export const SEARCHABLE_INDICATORS: SearchableIndicator[] = [
  {
    id: 'sanitation',
    name: 'Unimproved Sanitation & Toilet Deficit',
    dept: "City Engineer's Office (CEO)",
    metric: '15,920 HHs',
    summary: 'Households without access to sanitary toilets or septic tanks',
    icon: '🚽',
    category: 'infrastructure',
    prompt: 'Audit unimproved sanitation deficit for my barangay and synthesize CEO capital expenditure under RA 7160',
  },
  {
    id: 'water_refilling',
    name: 'Refilling Station Drinking Water Dependency',
    dept: 'CEO / CPDO',
    metric: '12,850 HHs',
    summary: 'Households dependent on commercial refilling stations rather than piped potable supply',
    icon: '💧',
    category: 'infrastructure',
    prompt: 'Analyze water dependency on commercial refilling stations and pipe network expansion needs',
  },
  {
    id: 'weak_roof',
    name: 'Weak Roof Structure & Typhoon Vulnerability',
    dept: 'DRRMO',
    metric: '1,842 HHs',
    summary: 'Houses with light or makeshift roofing vulnerable to severe wind damage',
    icon: '🏚️',
    category: 'drrm',
    prompt: 'Synthesize DRRMO typhoon vulnerability index for weak roof structures and evacuation staging under RA 10121',
  },
  {
    id: 'food_insecurity',
    name: 'Moderate-to-Severe Food Insecurity',
    dept: 'City Health Office (CHO)',
    metric: '6,412 HHs',
    summary: 'Households experiencing moderate to severe food rationing or dietary deficit',
    icon: '🍲',
    category: 'health',
    prompt: 'Audit food insecurity and childhood malnutrition clusters for targeted CHO intervention under RA 11223',
  },
  {
    id: 'informal_settlers',
    name: 'Informal Riverbank Settlers & Flood Exposure',
    dept: 'CPDO / DRRMO',
    metric: '3,120 HHs',
    summary: 'Informal settlers along Bicol and Naga rivers subject to flash surge inundation',
    icon: '🌊',
    category: 'drrm',
    prompt: 'Evaluate informal riverbank settler vulnerability and calculate safe housing resettlement requirements',
  },
  {
    id: 'youth_neet',
    name: 'NEET Youth & Unbanked Cash-Aid Inclusion',
    dept: 'CSWDO (SWO)',
    metric: '33.4% Unbanked',
    summary: 'Out-of-school/unemployed youth and unbanked families needing digital payout onboarding',
    icon: '💼',
    category: 'social',
    prompt: 'Formulate CSWDO 4Ps digital payout enrollment and TESDA youth livelihood placement under RA 11310',
  },
];

export const STATUTORY_MANDATES = [
  { code: 'RA 7160 Sec. 17 & 287', title: 'Local Government Code (Basic Services & 20% LDF)', office: 'CPDO / CEO / Barangay', sdg: 'SDG 6 & SDG 11' },
  { code: 'RA 7160 Sec. 389', title: 'Punong Barangay Executive & AIP Endorsement Authority', office: 'Barangay Captain', sdg: 'SDG 16 & SDG 17' },
  { code: 'RA 10121 Sec. 12 & 21', title: 'Philippine DRRM Act (BDRRM Plan & 5% LDRRMF)', office: 'DRRMO / Barangay', sdg: 'SDG 11 & SDG 13' },
  { code: 'RA 11223 Sec. 19', title: 'Universal Health Care Act (Primary Care & WASH)', office: 'CHO', sdg: 'SDG 2 & SDG 3' },
  { code: 'RA 11310 Sec. 4 & 13', title: '4Ps Institutionalization & Livelihood Convergence', office: 'CSWDO (SWO)', sdg: 'SDG 1 & SDG 8' },
  { code: 'RA 9003 Sec. 10 & 32', title: 'Ecological Solid Waste Management (Barangay MRF)', office: 'CEO / Barangay', sdg: 'SDG 11 & SDG 12' },
  { code: 'PD 1096 Sec. 214 & 301', title: 'National Building Code (Structural & Roof Integrity)', office: 'CEO / DRRMO', sdg: 'SDG 9 & SDG 11' },
  { code: 'RA 10173 Sec. 12 & 20', title: 'Data Privacy Act (CBMS Micro-Cell Anonymization)', office: 'Citizen Portal / CPDO', sdg: 'SDG 16' },
];

export const TYPHOON_ADVISORIES_MULTILINGUAL = [
  {
    level: 'SIGNAL 2 - TROPICAL CYCLONE ALERT',
    time: 'Latest Update: 24/7 ComCen Active',
    english: 'Expect moderate to heavy rainfall within 24 hours. Low-lying and riverine barangays are advised to prepare pre-emptive evacuation to designated school shelters.',
    filipino: 'Inaasahan ang katamtaman hanggang sa malalakas na pag-ulan sa loob ng 24 oras. Pinapayuhan ang mga mabababang barangay na maghanda sa maagang paglikas sa mga evacuation center.',
    bikol: 'Lalaoman an makukusog na uran sa laog nin 24 oras. Pinapagirumdoman an mga barangay sa may kababaan na mag-andam na sa amay na pagbakwit sa mga itinalaan na evacuation center.',
  },
];

export interface OfflineBarangay {
  id: number;
  name: string;
  realName: string;
  displayName: string;
  district: string;
  total_households: number;
  total_population: number;
  avg_household_size: number;
  vulnerability_index: number;
  center: [number, number];
  category: BarangayCategoryMeta;
  category_name: string;
  category_color: string;
  admin_color: string;
  drrm: {
    has_hotline: boolean;
    has_written_plan: boolean;
    has_response_team: boolean;
    preparedness_gap_score: number;
    pct_without_internet: number;
    weak_roof_pct: number;
    weak_wall_pct: number;
  };
  health_cho: {
    food_insecurity_pct: number;
    food_insecurity_count: number;
    food_insecurity_flag_outlier?: boolean;
    wash_risk_score: number;
    refilling_station_dependency_pct: number;
    seniors_count: number;
    seniors_without_id_pct: number;
    pct_overcrowded: number;
  };
  infrastructure_ceo: {
    drinking_refilling_pct: number;
    piped_water_pct: number;
    unimproved_toilet_pct: number;
    households_needing_sanitation: number;
    without_electricity_pct: number;
    households_needing_electricity: number;
    weak_roof_pct: number;
    weak_wall_pct: number;
  };
  social_swo: {
    unbanked_pct: number;
    digital_wallet_pct: number;
    neet_youth_pct: number;
    neet_youth_count: number;
    seniors_without_id_count: number;
    food_insecurity_pct: number;
  };
  sector_scores: {
    cpdo_planning_gap: number;
    drrmo_disaster_risk: number;
    ceo_infrastructure_deficit: number;
    cho_health_risk: number;
    swo_social_vulnerability: number;
  };
  sdg_scores: Record<string, number>;
  pca_dimensions: {
    dim1_economic_insecurity: number;
    dim2_disaster_shelter_frailty: number;
    dim3_basic_utilities_deficit: number;
    dim4_demographic_pressure: number;
  };
  top_needs: string[];
  recommended_programs: {
    office: string;
    program: string;
    statute: string;
    sdg: string;
    estimated_budget: string;
    budget_numeric: number;
  }[];
  emergency_hotlines: {
    service: string;
    number: string;
  }[];
}

type OfflineProfile = Pick<OfflineBarangay, 'top_needs' | 'recommended_programs'>;

const peso = (value: number) => `₱${Math.round(value).toLocaleString()}`;

const CURATED_PROFILES: Record<number, OfflineProfile> = {
  1: {
    top_needs: ['Digital Payout Enrollment (33.4% Unbanked)', 'Communal Sanitation Upgrade (316 HHs)', 'NEET Youth Livelihood Placement (137 Youth)'],
    recommended_programs: [
      {
        office: 'SWO',
        program: 'GCash/Maya Cash-Aid Distribution & NEET Youth TESDA Placement',
        statute: 'RA 11310 Sec. 13 (4Ps Act)',
        sdg: 'SDG 1 No Poverty & SDG 8 Decent Work',
        estimated_budget: '₱340,000',
        budget_numeric: 340000,
      },
      {
        office: 'CEO',
        program: 'Urban Poblacion Sanitary Bio-Digester & Drainage Upgrade',
        statute: 'RA 7160 Sec. 17 (b)',
        sdg: 'SDG 6 Clean Water & Sanitation',
        estimated_budget: '₱480,000',
        budget_numeric: 480000,
      },
    ],
  },
  3: {
    top_needs: ['Formal Written BDRRM Plan (Missing)', '24/7 Emergency Operations Hotline', 'Shelter Light Roof Reinforcement (8.8% Weak Roofs)'],
    recommended_programs: [
      {
        office: 'DRRMO',
        program: 'Comprehensive BDRRM Plan Formulation & 24/7 Hotline Activation',
        statute: 'RA 10121 Sec. 12 (c) (6)',
        sdg: 'SDG 11 Sustainable Cities & SDG 13 Climate Action',
        estimated_budget: '₱185,000',
        budget_numeric: 185000,
      },
      {
        office: 'CEO',
        program: 'Light Roofing Disaster Mitigation & Evacuation Retrofit',
        statute: 'PD 1096 National Building Code',
        sdg: 'SDG 11 Sustainable Cities',
        estimated_budget: '₱450,000',
        budget_numeric: 450000,
      },
    ],
  },
  7: {
    top_needs: ['Upland Roof Structural Reinforcement', 'Communal Sanitation Block', 'Agro-Forestry Youth Livelihood Placement'],
    recommended_programs: [
      {
        office: 'DRRMO',
        program: 'Typhoon Shelter & Light Roof Reinforcement Grant',
        statute: 'RA 10121 Sec. 21 (LDRRMF)',
        sdg: 'SDG 11 & SDG 13 Climate Action',
        estimated_budget: '₱420,000',
        budget_numeric: 420000,
      },
      {
        office: 'CEO',
        program: 'Upland Sanitary Bio-Digester Toilet & Spring Box Units',
        statute: 'RA 7160 Sec. 17',
        sdg: 'SDG 6 Clean Water & Sanitation',
        estimated_budget: '₱680,000',
        budget_numeric: 680000,
      },
    ],
  },
  9: {
    top_needs: ['High-Capacity Evacuation Shelter', 'Digital Cash-Aid Onboarding', 'MRF Solid Waste Expansion'],
    recommended_programs: [
      {
        office: 'SWO',
        program: 'Digital Financial Inclusion & TESDA Youth Training',
        statute: 'RA 11310 Sec. 13',
        sdg: 'SDG 1 No Poverty & SDG 8',
        estimated_budget: '₱540,000',
        budget_numeric: 540000,
      },
      {
        office: 'CEO',
        program: 'Cluster Materials Recovery Facility (MRF)',
        statute: 'RA 9003 Sec. 32',
        sdg: 'SDG 11 & SDG 12',
        estimated_budget: '₱750,000',
        budget_numeric: 750000,
      },
    ],
  },
  16: {
    top_needs: ['Food Insecurity Verification & Relief (1,459 HHs)', 'Sanitary Toilet Blocks (429 HHs)', 'Piped Water Reticulation Mainline'],
    recommended_programs: [
      {
        office: 'CEO',
        program: 'Piped Water Reticulation Mainline Extension & Communal Sanitation Block',
        statute: 'RA 7160 Sec. 17 (b) (1)',
        sdg: 'SDG 6 Clean Water & Sanitation & SDG 9',
        estimated_budget: '₱1,250,000',
        budget_numeric: 1250000,
      },
      {
        office: 'CHO',
        program: 'Food Insecurity Verification Mission & Water Bacteriological Testing',
        statute: 'RA 11223 Sec. 19 (UHC Act)',
        sdg: 'SDG 2 Zero Hunger & SDG 3 Good Health',
        estimated_budget: '₱280,000',
        budget_numeric: 280000,
      },
    ],
  },
};

function deriveProfile(b: any): OfflineProfile {
  const ceo = b.infrastructure_ceo || {};
  const drrm = b.drrm || {};
  const health = b.health_cho || {};
  const social = b.social_swo || {};
  const sectors = b.sector_scores || {};
  const households = b.total_households || 0;

  const candidates: { severity: number; need: string; office: string; program: string; statute: string; sdg: string; budget: number }[] = [];

  if ((health.food_insecurity_pct || 0) >= 35) {
    candidates.push({
      severity: health.food_insecurity_pct,
      need: `Food Insecurity Verification & Relief (${health.food_insecurity_count || 0} HHs)`,
      office: 'CHO',
      program: 'Targeted Nutrition Intervention & Water Quality Testing',
      statute: 'RA 11223 Sec. 19 (UHC Act)',
      sdg: 'SDG 2 Zero Hunger & SDG 3',
      budget: 180000 + households * 110,
    });
  }
  if ((ceo.unimproved_toilet_pct || 0) >= 20 || (ceo.households_needing_sanitation || 0) > 100) {
    candidates.push({
      severity: ceo.unimproved_toilet_pct || 0,
      need: `Sanitary Toilet Blocks (${ceo.households_needing_sanitation || 0} HHs Deficit)`,
      office: 'CEO',
      program: 'Communal Sanitary Bio-Digester Toilet Blocks',
      statute: 'RA 7160 Sec. 17',
      sdg: 'SDG 6 Clean Water & Sanitation',
      budget: Math.max(250000, (ceo.households_needing_sanitation || 0) * 3200),
    });
  }
  if ((ceo.piped_water_pct || 0) < 65 || (ceo.drinking_refilling_pct || 0) >= 45) {
    candidates.push({
      severity: ceo.drinking_refilling_pct || 50,
      need: `Piped Water Reticulation (${ceo.drinking_refilling_pct || 50}% Refilling Reliance)`,
      office: 'CEO',
      program: 'MNWD Level III Piped Water Reticulation Extension',
      statute: 'RA 7160 Sec. 17 (b)',
      sdg: 'SDG 6 Clean Water & Sanitation',
      budget: 650000 + households * 140,
    });
  }
  if ((drrm.weak_roof_pct || 0) >= 4 || !drrm.has_hotline) {
    candidates.push({
      severity: (drrm.weak_roof_pct || 4) + (!drrm.has_hotline ? 30 : 0),
      need: !drrm.has_hotline
        ? `24/7 Emergency Hotline & Roof Retrofit (${drrm.weak_roof_pct || 0}% Weak Roof)`
        : `Roof Structural Reinforcement (${drrm.weak_roof_pct || 0}% Weak Roof)`,
      office: 'DRRMO',
      program: 'Light Roof Reinforcement, BDRRM Hotline & Shelter Retrofit',
      statute: 'RA 10121 Sec. 12 & 21',
      sdg: 'SDG 11 & SDG 13 Climate Action',
      budget: 220000 + households * 85,
    });
  }
  if ((social.unbanked_pct || 0) >= 30) {
    candidates.push({
      severity: social.unbanked_pct,
      need: `Digital Cash-Aid Enrollment (${social.unbanked_pct}% Unbanked HHs)`,
      office: 'SWO',
      program: 'Digital Cash-Aid Enrollment & Financial Inclusion',
      statute: 'RA 11310 Sec. 13',
      sdg: 'SDG 1 No Poverty & SDG 8',
      budget: 140000 + households * 65,
    });
  }
  if ((social.neet_youth_pct || 0) >= 12) {
    candidates.push({
      severity: social.neet_youth_pct,
      need: `NEET Youth Skills Placement (${social.neet_youth_count || 0} Youth)`,
      office: 'SWO',
      program: 'NEET Youth Skills Placement (TESDA/DOLE Livelihood)',
      statute: 'RA 11310 Sec. 13',
      sdg: 'SDG 8 Decent Work',
      budget: 110000 + (social.neet_youth_count || 0) * 1500,
    });
  }
  if ((sectors.cpdo_planning_gap || 0) >= 55) {
    candidates.push({
      severity: sectors.cpdo_planning_gap,
      need: 'BDRRM / AIP Multi-Sector Convergence',
      office: 'CPDO',
      program: '20% Local Development Fund Multi-Sector Convergence',
      statute: 'RA 7160 Sec. 287',
      sdg: 'SDG 11 & SDG 17',
      budget: 250000 + households * 50,
    });
  }

  const top = candidates.sort((a, b) => b.severity - a.severity).slice(0, 3);
  const needs = top.length
    ? top.map((item) => item.need)
    : ['CBMS Data Validation', 'AIP Project Prioritization', 'Community Consultation'];

  const programs = top.slice(0, 2).map((item) => {
    const rounded = Math.round(item.budget / 5000) * 5000;
    return {
      office: item.office,
      program: item.program,
      statute: item.statute,
      sdg: item.sdg,
      estimated_budget: peso(rounded),
      budget_numeric: rounded,
    };
  });

  if (programs.length < 2) {
    const fallbackBudget = Math.round((150000 + households * 35) / 5000) * 5000;
    programs.push({
      office: 'CPDO',
      program: 'CBMS-Based AIP Prioritization & Monitoring',
      statute: 'RA 7160 Sec. 106',
      sdg: 'SDG 16 & SDG 17',
      estimated_budget: peso(fallbackBudget),
      budget_numeric: fallbackBudget,
    });
  }

  return { top_needs: needs, recommended_programs: programs };
}

export const SAMPLE_BARANGAYS_OFFLINE: OfflineBarangay[] = (cbmsData as any).barangays
  .map((b: any) => {
    const profile = CURATED_PROFILES[b.id] || deriveProfile(b);
    const realName = NAGA_BARANGAY_NAMES[b.id] || b.real_name || b.name;
    const displayName = `${realName} (Brgy ${b.id})`;
    const catMeta = BARANGAY_CATEGORIES[b.id] || {
      id: 'poblacion',
      name: b.category_name || 'Poblacion Urban & Heritage Core',
      short: b.category_short || 'Poblacion Heritage',
      color: b.category_color || '#7c3aed',
      icon: '🏛️',
      description: 'Urban settlement and community center',
    };

    return {
      id: b.id,
      name: displayName,
      realName,
      displayName,
      district: b.district || catMeta.short,
      total_households: b.total_households || 0,
      total_population: b.total_population || 0,
      avg_household_size: b.avg_household_size || 4.1,
      vulnerability_index: b.vulnerability_index || 0,
      center: (b.center || [123.1948, 13.6218]) as [number, number],
      category: catMeta,
      category_name: catMeta.name,
      category_color: catMeta.color,
      admin_color: b.admin_color || catMeta.color,
      drrm: {
        has_hotline: Boolean(b.drrm?.has_hotline),
        has_written_plan: Boolean(b.drrm?.has_written_plan),
        has_response_team: Boolean(b.drrm?.has_response_team),
        preparedness_gap_score: b.drrm?.preparedness_gap_score ?? 20,
        pct_without_internet: b.drrm?.pct_without_internet ?? 20.0,
        weak_roof_pct: b.drrm?.weak_roof_pct ?? 4.5,
        weak_wall_pct: b.drrm?.weak_wall_pct ?? 15.0,
      },
      health_cho: {
        food_insecurity_pct: b.health_cho?.food_insecurity_pct ?? 18.0,
        food_insecurity_count: b.health_cho?.food_insecurity_count ?? 180,
        food_insecurity_flag_outlier: Boolean(b.health_cho?.food_insecurity_flag_outlier),
        wash_risk_score: b.health_cho?.wash_risk_score ?? 20.0,
        refilling_station_dependency_pct: b.health_cho?.refilling_station_dependency_pct ?? 45.0,
        seniors_count: b.health_cho?.seniors_count ?? 300,
        seniors_without_id_pct: b.health_cho?.seniors_without_id_pct ?? 10.0,
        pct_overcrowded: b.health_cho?.pct_overcrowded ?? 8.5,
      },
      infrastructure_ceo: {
        drinking_refilling_pct: b.infrastructure_ceo?.drinking_refilling_pct ?? 50.0,
        piped_water_pct: b.infrastructure_ceo?.piped_water_pct ?? 50.0,
        unimproved_toilet_pct: b.infrastructure_ceo?.unimproved_toilet_pct ?? 15.0,
        households_needing_sanitation: b.infrastructure_ceo?.households_needing_sanitation ?? 120,
        without_electricity_pct: b.infrastructure_ceo?.without_electricity_pct ?? 2.0,
        households_needing_electricity: b.infrastructure_ceo?.households_needing_electricity ?? 15,
        weak_roof_pct: b.infrastructure_ceo?.weak_roof_pct ?? 4.5,
        weak_wall_pct: b.infrastructure_ceo?.weak_wall_pct ?? 15.0,
      },
      social_swo: {
        unbanked_pct: b.social_swo?.unbanked_pct ?? 30.0,
        digital_wallet_pct: b.social_swo?.digital_wallet_pct ?? 40.0,
        neet_youth_pct: b.social_swo?.neet_youth_pct ?? 14.0,
        neet_youth_count: b.social_swo?.neet_youth_count ?? 110,
        seniors_without_id_count: b.social_swo?.seniors_without_id_count ?? 30,
        food_insecurity_pct: b.social_swo?.food_insecurity_pct ?? 18.0,
      },
      sector_scores: {
        cpdo_planning_gap: b.sector_scores?.cpdo_planning_gap ?? 50.0,
        drrmo_disaster_risk: b.sector_scores?.drrmo_disaster_risk ?? 45.0,
        ceo_infrastructure_deficit: b.sector_scores?.ceo_infrastructure_deficit ?? 45.0,
        cho_health_risk: b.sector_scores?.cho_health_risk ?? 45.0,
        swo_social_vulnerability: b.sector_scores?.swo_social_vulnerability ?? 45.0,
      },
      sdg_scores: b.sdg_scores || {
        'SDG 1 No Poverty': 68.0,
        'SDG 2 Zero Hunger': 64.0,
        'SDG 3 Good Health': 60.0,
        'SDG 6 Clean Water & Sanitation': 52.0,
        'SDG 7 Clean Energy': 92.0,
        'SDG 8 Decent Work': 74.0,
        'SDG 11 Sustainable Cities': 55.0,
        'SDG 13 Climate Action': 70.0,
      },
      pca_dimensions: {
        dim1_economic_insecurity: b.pca_dimensions?.dim1_economic_insecurity ?? 0,
        dim2_disaster_shelter_frailty: b.pca_dimensions?.dim2_disaster_shelter_frailty ?? 0,
        dim3_basic_utilities_deficit: b.pca_dimensions?.dim3_basic_utilities_deficit ?? 0,
        dim4_demographic_pressure: b.pca_dimensions?.dim4_demographic_pressure ?? 0,
      },
      top_needs: profile.top_needs,
      recommended_programs: profile.recommended_programs,
      emergency_hotlines: NAGA_EMERGENCY_HOTLINES,
    };
  })
  .sort((a: OfflineBarangay, b: OfflineBarangay) => a.id - b.id);
