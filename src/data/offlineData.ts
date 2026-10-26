// Pre-bundled offline dataset for Project Banwaan Mobile App
// Enables full functionality during typhoons / signal loss in Naga City

export interface OfflineBarangay {
  id: number;
  name: string;
  total_households: number;
  total_population: number;
  vulnerability_index: number;
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

export const SAMPLE_BARANGAYS_OFFLINE: OfflineBarangay[] = [
  {
    id: 1,
    name: "Barangay 1",
    total_households: 1065,
    total_population: 4478,
    vulnerability_index: 61.6,
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
    ],
    emergency_hotlines: NAGA_EMERGENCY_HOTLINES
  },
  {
    id: 3,
    name: "Barangay 3",
    total_households: 1508,
    total_population: 5916,
    vulnerability_index: 62.4,
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
    ],
    emergency_hotlines: NAGA_EMERGENCY_HOTLINES
  },
  {
    id: 16,
    name: "Barangay 16",
    total_households: 1820,
    total_population: 7420,
    vulnerability_index: 78.5,
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
    ],
    emergency_hotlines: NAGA_EMERGENCY_HOTLINES
  }
];
