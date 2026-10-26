"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  ShieldAlert,
  Building2,
  MapPin,
  Activity,
  HeartHandshake,
  Users,
  Compass,
  FileText,
  AlertTriangle,
  Send,
  Sliders,
  Eye,
  Bot,
  Sparkles,
  Flame,
  Droplets,
  Lock,
  Smartphone,
  RefreshCw,
  PlusCircle,
  Zap,
  Layers,
  CheckCircle2,
  BarChart3,
  Globe,
  Check,
  ChevronRight,
  ChevronLeft,
  TrendingUp,
  X,
  Search,
  Filter,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  Minimize2,
  Maximize2,
  LayoutDashboard,
  Shield,
  FileCheck,
  HeartPulse,
  Scale,
  Mountain,
  Store,
  Landmark,
  Hospital,
  Waves,
  Phone,
  PhoneCall,
  Copy,
  ExternalLink,
  Command,
  Target
} from "lucide-react";

import cbmsDataRaw from "../data/processed_cbms_data.json";
import sdgDataRaw from "../data/sdg_dataset.json";
import CesiumViewer, {
  SyncedFieldReport,
  CATEGORIES,
  BARANGAY_CATEGORY_LOOKUP,
  NAGA_BARANGAY_NAMES,
  NAGA_ADMIN_COLORS
} from "../components/CesiumViewer";

// Official 27 Barangays of Naga City, Camarines Sur with Category Classification
export interface BarangayCategoryMeta {
  id: string;
  name: string;
  short: string;
  color: string;
  icon: string;
  description: string;
}

export const BARANGAY_CATEGORIES: Record<number, BarangayCategoryMeta> = {
  // Upland Watershed & Agro-Forestry (5 Barangays - Isarog Slopes)
  18: { id: "upland", name: "Upland Watershed & Agro-Forestry", short: "Upland Watershed", color: "#b59410", icon: "⛰️", description: "Mt. Isarog slope, watershed recharge, hot springs eco-tourism, agro-forestry" },
  7:  { id: "upland", name: "Upland Watershed & Agro-Forestry", short: "Upland Watershed", color: "#b59410", icon: "⛰️", description: "Agro-industrial terrace, intermediate watershed buffer, low population density" },
  17: { id: "upland", name: "Upland Watershed & Agro-Forestry", short: "Upland Watershed", color: "#b59410", icon: "⛰️", description: "Northeast agricultural plateau, housing resettlement expansion, water recharge" },
  6:  { id: "upland", name: "Upland Watershed & Agro-Forestry", short: "Upland Watershed", color: "#b59410", icon: "⛰️", description: "Mid-valley agro-urban buffer, suburban residential sprawl, agricultural zoning" },
  23: { id: "upland", name: "Upland Watershed & Agro-Forestry", short: "Upland Watershed", color: "#b59410", icon: "⛰️", description: "Southeast agricultural greenbelt, farm-to-market linkage, rural settlement" },

  // Central Business District & Commercial Core (6 Barangays)
  27: { id: "cbd", name: "Central Business District (CBD Core)", short: "CBD Commercial", color: "#05389f", icon: "🏢", description: "CBD II, SM City Naga, Bicol Central Bus Terminal, major regional logistics artery" },
  25: { id: "cbd", name: "Central Business District (CBD Core)", short: "CBD Commercial", color: "#05389f", icon: "🏢", description: "CBD I, Naga City Public Market, Bicol River commercial trade & transport hub" },
  22: { id: "cbd", name: "Central Business District (CBD Core)", short: "CBD Commercial", color: "#05389f", icon: "🏢", description: "Centro Plaza Rizal, Plaza Quezon, historic financial district, government plaza" },
  12: { id: "cbd", name: "Central Business District (CBD Core)", short: "CBD Commercial", color: "#05389f", icon: "🏢", description: "Poblacion commercial core, commercial establishments, riverfront mercantile" },
  24: { id: "cbd", name: "Central Business District (CBD Core)", short: "CBD Commercial", color: "#05389f", icon: "🏢", description: "Urban commercial & institutional center, schools, private health clinics" },
  13: { id: "cbd", name: "Central Business District (CBD Core)", short: "CBD Commercial", color: "#05389f", icon: "🏢", description: "Compact market mercantile core, dense commercial trade, high daytime foot traffic" },

  // Suburban Growth & Institutional Expansion Corridor (4 Barangays)
  9:  { id: "growth", name: "Suburban Growth & Institutional Corridor", short: "Growth Corridor", color: "#0284c7", icon: "🏥", description: "Panganiban commercial strip, Bicol Medical Center, regional healthcare hub" },
  8:  { id: "growth", name: "Suburban Growth & Institutional Corridor", short: "Growth Corridor", color: "#0284c7", icon: "🏥", description: "Maharlika Highway southern growth spine, residential subdivisions, car dealerships" },
  11: { id: "growth", name: "Suburban Growth & Institutional Corridor", short: "Growth Corridor", color: "#0284c7", icon: "🏥", description: "Industrial & educational growth node, southern gateway towards Pili/Airport" },
  4:  { id: "growth", name: "Suburban Growth & Institutional Corridor", short: "Growth Corridor", color: "#0284c7", icon: "🏥", description: "Magsaysay Avenue tourism strip, BMC health expansion, new civic developments" },

  // Poblacion Urban & Heritage Core (8 Barangays)
  1:  { id: "poblacion", name: "Poblacion Urban & Heritage Core", short: "Poblacion Heritage", color: "#7c3aed", icon: "🏛️", description: "Dense historic poblacion, high residential density, compact commercial-residential" },
  26: { id: "poblacion", name: "Poblacion Urban & Heritage Core", short: "Poblacion Heritage", color: "#7c3aed", icon: "🏛️", description: "Central residential enclave, historic urban street grid, high social cohesion" },
  14: { id: "poblacion", name: "Poblacion Urban & Heritage Core", short: "Poblacion Heritage", color: "#7c3aed", icon: "🏛️", description: "Panganiban Drive gateway, mixed-use commercial & residential core" },
  15: { id: "poblacion", name: "Poblacion Urban & Heritage Core", short: "Poblacion Heritage", color: "#7c3aed", icon: "🏛️", description: "University & heritage belt, educational institutions, heritage residential" },
  10: { id: "poblacion", name: "Poblacion Urban & Heritage Core", short: "Poblacion Heritage", color: "#7c3aed", icon: "🏛️", description: "Compact riverbank residential core, community sports facilities, urban neighborhood" },
  19: { id: "poblacion", name: "Poblacion Urban & Heritage Core", short: "Poblacion Heritage", color: "#7c3aed", icon: "🏛️", description: "Our Lady of Peñafrancia National Shrine, sacred pilgrimage route, flashtide river" },
  2:  { id: "poblacion", name: "Poblacion Urban & Heritage Core", short: "Poblacion Heritage", color: "#7c3aed", icon: "🏛️", description: "North arterial residential belt, schools, local commercial and craft enterprises" },
  3:  { id: "poblacion", name: "Poblacion Urban & Heritage Core", short: "Poblacion Heritage", color: "#7c3aed", icon: "🏛️", description: "Naga River confluence, residential core, secondary school evacuation center" },

  // Riverine & High Flood-Hazard Delta (4 Barangays)
  16: { id: "riverine", name: "Riverine & High Flood-Hazard Delta", short: "Riverine Flood Delta", color: "#ea580c", icon: "🌊", description: "Southwest Bicol River basin, critical river surge hazard, informal riverbank homes" },
  20: { id: "riverine", name: "Riverine & High Flood-Hazard Delta", short: "Riverine Flood Delta", color: "#ea580c", icon: "🌊", description: "Riverside market perimeter, low-lying storm inundation basin, dense settlement" },
  5:  { id: "riverine", name: "Riverine & High Flood-Hazard Delta", short: "Riverine Flood Delta", color: "#ea580c", icon: "🌊", description: "Northwest riverine floodway, agricultural-urban interface, drainage catchment" },
  21: { id: "riverine", name: "Riverine & High Flood-Hazard Delta", short: "Riverine Flood Delta", color: "#ea580c", icon: "🌊", description: "Naga River upper tributary, riverbank flood hazard, expanding residential zones" }
};

// Official Emergency Hotlines for Naga City, Camarines Sur (Verified DOH/PNP/LGU/BFP)
export interface EmergencyHotline {
  id: string;
  agency: string;
  subtext: string;
  category: "rescue" | "police" | "medical" | "fire";
  icon: string;
  color: string;
  primaryPhone: string;
  altPhone: string;
  landline: string;
  location: string;
}

export const NAGA_EMERGENCY_HOTLINES: EmergencyHotline[] = [
  {
    id: "cdrrmo",
    agency: "CDRRMO NAGA CENTRAL 911",
    subtext: "City Disaster Risk Reduction & Management Office (ComCen)",
    category: "rescue",
    icon: "🚨",
    color: "#dc2626",
    primaryPhone: "911",
    altPhone: "0908-525-3000 / 0963-220-9700 / 0985-253-3000",
    landline: "(054) 472-3000 / (054) 205-2980",
    location: "City Hall Complex, J. Miranda Ave., Naga City"
  },
  {
    id: "pnp",
    agency: "PNP NAGA CITY POLICE",
    subtext: "Philippine National Police - NCPO Headquarters",
    category: "police",
    icon: "👮",
    color: "#1d4ed8",
    primaryPhone: "0908-325-4787",
    altPhone: "0908-737-4228 | Station 1: 0918-464-4371",
    landline: "(054) 881-0112",
    location: "Barlin St., Naga City"
  },
  {
    id: "bmc",
    agency: "BICOL MEDICAL CENTER",
    subtext: "DOH Tertiary Regional Training & Medical Center (ER Complex)",
    category: "medical",
    icon: "🏥",
    color: "#059669",
    primaryPhone: "0968-291-1125",
    altPhone: "0927-357-9967 (HEMS Disaster) / 0967-087-0155 (OB-ER)",
    landline: "(054) 472-6125 to 31",
    location: "J. Miranda Ave., Concepcion Pequeña, Naga City"
  },
  {
    id: "bfp",
    agency: "BFP FIRE OPERATIONS",
    subtext: "Bureau of Fire Protection - Naga City Central Fire Station",
    category: "fire",
    icon: "🚒",
    color: "#ea580c",
    primaryPhone: "0923-083-9429",
    altPhone: "(054) 473-8472 / (054) 473-2633",
    landline: "(054) 871-6454",
    location: "City Hall Compound, Naga City"
  }
];

export interface SearchableIndicator {
  id: string;
  name: string;
  dept: string;
  metric: string;
  summary: string;
  icon: string;
  category: "infrastructure" | "drrm" | "health" | "social";
  prompt: string;
}

export const SEARCHABLE_INDICATORS: SearchableIndicator[] = [
  {
    id: "sanitation",
    name: "Unimproved Sanitation & Toilet Deficit",
    dept: "City Engineer's Office (CEO)",
    metric: "15,920 HHs",
    summary: "Households without access to sanitary toilets or septic tanks",
    icon: "🚽",
    category: "infrastructure",
    prompt: "Audit unimproved sanitation deficit across all 27 Naga City barangays and synthesize CEO capital expenditure"
  },
  {
    id: "water_refilling",
    name: "Refilling Station Drinking Water Dependency",
    dept: "CEO / CPDO",
    metric: "12,850 HHs",
    summary: "Households dependent on commercial refilling stations rather than piped potable supply",
    icon: "💧",
    category: "infrastructure",
    prompt: "Analyze water dependency on commercial refilling stations and pipe network expansion needs"
  },
  {
    id: "weak_roof",
    name: "Weak Roof Structure & Typhoon Vulnerability",
    dept: "DRRMO",
    metric: "1,842 HHs",
    summary: "Houses with light or makeshift roofing vulnerable to severe wind damage",
    icon: "🏚️",
    category: "drrm",
    prompt: "Synthesize DRRMO typhoon vulnerability index for weak roof structures and evacuation staging"
  },
  {
    id: "food_insecurity",
    name: "Moderate-to-Severe Food Insecurity",
    dept: "City Health Office (CHO)",
    metric: "6,412 HHs",
    summary: "Households experiencing moderate to severe food rationing or dietary deficit",
    icon: "🍲",
    category: "health",
    prompt: "Audit food insecurity and childhood malnutrition clusters in Naga City for targeted CHO intervention"
  },
  {
    id: "informal_settlers",
    name: "Informal Riverbank Settlers & Flood Exposure",
    dept: "CPDO / DRRMO",
    metric: "3,120 HHs",
    summary: "Informal settlers along Bicol and Naga rivers subject to flash surge inundation",
    icon: "🌊",
    category: "drrm",
    prompt: "Evaluate informal riverbank settler vulnerability and calculate safe housing resettlement requirements"
  },
  {
    id: "unpaved_roads",
    name: "Unpaved Access Roads & Upland Isolation",
    dept: "CEO",
    metric: "42.5 km",
    summary: "Unpaved and dirt roads in upland agricultural zones restricting farm-to-market logistics",
    icon: "🚜",
    category: "infrastructure",
    prompt: "Review CEO road concreting backlog for upland watershed barangays"
  }
];


type UserRole =
  | "super_admin"
  | "ceo"
  | "cpdo"
  | "drrmo"
  | "cho"
  | "swo"
  | "barangay_captain"
  | "citizen";

interface Proposal {
  id: string;
  barangay: string;
  office: string;
  title: string;
  problem: string;
  statute: string;
  section: string;
  sdgs: string[];
  budget: number;
  status: "PENDING" | "APPROVED" | "FUNDED" | "REJECTED";
  confidence: number;
  createdBy?: string;
}

interface ChatMessage {
  sender: "user" | "ai";
  text: string;
  citation?: string;
  sdgs?: string[];
  suggestedActions?: string[];
  proposalDraft?: any;
}

const API_BASE = "http://localhost:8000";

export default function ModernCategorizedCommandCenter() {
  const [role, setRole] = useState<UserRole>("super_admin");
  const [selectedBarangayId, setSelectedBarangayId] = useState<number>(16); // Default: Mabolo (hotspot)
  const [isAiOpen, setIsAiOpen] = useState<boolean>(false);
  const [activeNavTab, setActiveNavTab] = useState<string>("dashboard");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all");
  const [searchFilterQuery, setSearchFilterQuery] = useState<string>("");
  const [isDigitalTwinSectionMinimized, setIsDigitalTwinSectionMinimized] = useState<boolean>(false);
  const [isMatrixMinimized, setIsMatrixMinimized] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<"id" | "name" | "mvi" | "households" | "category">("id");
  const [sortDesc, setSortDesc] = useState<boolean>(false);
  const [selectedDeptTab, setSelectedDeptTab] = useState<"cpdo" | "drrmo" | "ceo" | "cho" | "swo">("cpdo");
  const [tablePage, setTablePage] = useState<number>(1);
  const [tablePageSize, setTablePageSize] = useState<number>(8);

  // Smart Barangay Selection that ensures category filter never hides the selected barangay
  const handleSelectBarangay = useCallback(
    (id: number) => {
      setSelectedBarangayId(id);
      const targetCat = BARANGAY_CATEGORIES[id]?.id;
      if (selectedCategoryFilter !== "all" && targetCat && targetCat !== selectedCategoryFilter) {
        setSelectedCategoryFilter("all");
      }
    },
    [selectedCategoryFilter]
  );

  // Smart Category Selection that ensures selectedBarangayId belongs to the chosen category
  const handleSelectCategory = useCallback(
    (category: string) => {
      setSelectedCategoryFilter(category);
      if (category === "all") return;
      const currentCat = BARANGAY_CATEGORIES[selectedBarangayId]?.id;
      if (currentCat !== category) {
        const defaultRepresentative: Record<string, number> = {
          upland: 18,
          cbd: 27,
          poblacion: 3,
          growth: 9,
          riverine: 16
        };
        if (defaultRepresentative[category]) {
          setSelectedBarangayId(defaultRepresentative[category]);
        }
      }
    },
    [selectedBarangayId]
  );

  // CEO Costing simulator state
  const [sanitationUnitCost, setSanitationUnitCost] = useState<number>(25000);
  const [ceoPipeLength, setCeoPipeLength] = useState<number>(250);
  const ceoCostPerHousehold = 8500;
  const [drrmoAlertDispatched, setDrrmoAlertDispatched] = useState<boolean>(false);

  // Super Admin 5-Control Deck states
  const [crossOfficeSharing, setCrossOfficeSharing] = useState<boolean>(true);
  const [privacyCellThreshold, setPrivacyCellThreshold] = useState<number>(5);
  const [aipBudgetCeiling, setAipBudgetCeiling] = useState<number>(45000000);
  const [calamitySimActive, setCalamitySimActive] = useState<boolean>(false);
  const [sidePanelTab, setSidePanelTab] = useState<"intel" | "controls">("intel");
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchCategory, setSearchCategory] = useState<string>("all");
  const [copiedHotline, setCopiedHotline] = useState<string | null>(null);
  const [intelSubTab, setIntelSubTab] = useState<"overview" | "next_steps" | "detected">("overview");

  const copyToClipboard = (text: string, id: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setCopiedHotline(id);
    setTimeout(() => setCopiedHotline(null), 2000);
  };

  // Keyboard shortcut listener for Omnisearch (Cmd+K / Ctrl+K / Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        if (isSearchOpen) setIsSearchOpen(false);
        if (isProfileOpen) setIsProfileOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen, isProfileOpen]);

  // Backend & Mobile Sync States
  const [backendConnected, setBackendConnected] = useState<boolean>(true);
  const [fieldReports, setFieldReports] = useState<SyncedFieldReport[]>([
    {
      id: "RPT-NAGA-0001",
      barangay_id: 16,
      barangay_name: "Mabolo",
      report_type: "Shelter Inspection",
      description: "Inspected secondary school evacuation facility. Roof flashing intact, generator fuel refilled.",
      latitude: 13.6202,
      longitude: 123.1808,
      offline_created_at: "14:30 PHT",
      reporter_role: "Barangay Captain"
    },
    {
      id: "RPT-NAGA-0002",
      barangay_id: 3,
      barangay_name: "Bagumbayan Sur",
      report_type: "Flood Clearance",
      description: "Naga River tributary overflow clearance verified. Culvert clearing crew deployed.",
      latitude: 13.6235,
      longitude: 123.1905,
      offline_created_at: "15:15 PHT",
      reporter_role: "DRRMO Field Unit"
    }
  ]);

  const [proposals, setProposals] = useState<Proposal[]>([
    {
      id: "PROP-NAGA-2026-DRRMO-001",
      barangay: "Bagumbayan Sur (Brgy 3)",
      office: "DRRMO",
      title: "Comprehensive BDRRM Plan Formulation & 24/7 Hotline Activation",
      problem: "Barangay has 1,508 households but lacks a written DRRM plan and emergency hotline, exposing residents to river surge.",
      statute: "RA 10121",
      section: "Section 12 (c) (6)",
      sdgs: ["SDG 11 Sustainable Cities", "SDG 13 Climate Action"],
      budget: 185000,
      status: "APPROVED",
      confidence: 0.96,
      createdBy: "DRRMO Statutory Agent"
    },
    {
      id: "PROP-NAGA-2026-CEO-002",
      barangay: "Mabolo (Brgy 16)",
      office: "CEO",
      title: "Piped Water Reticulation Mainline Extension & Communal Sanitation Block",
      problem: "High refilling station dependency and unimproved toilet facilities across 1,779 responding households.",
      statute: "RA 7160 (Local Government Code)",
      section: "Section 17 (b) (1)",
      sdgs: ["SDG 6 Clean Water & Sanitation", "SDG 9 Industry & Infrastructure"],
      budget: 1250000,
      status: "PENDING",
      confidence: 0.93,
      createdBy: "CEO Infrastructure Agent"
    },
    {
      id: "PROP-NAGA-2026-CHO-003",
      barangay: "Mabolo (Brgy 16)",
      office: "CHO",
      title: "Food Insecurity Verification Mission & Water Bacteriological Testing",
      problem: "Extreme food-insecurity reading outlier (1,459 worried households) and water quality risk requires clinical validation.",
      statute: "RA 11223 (Universal Health Care Act)",
      section: "Section 19",
      sdgs: ["SDG 2 Zero Hunger", "SDG 3 Good Health"],
      budget: 280000,
      status: "PENDING",
      confidence: 0.91,
      createdBy: "CHO Health Agent"
    },
    {
      id: "PROP-NAGA-2026-SWO-004",
      barangay: "Abella (Brgy 1)",
      office: "SWO",
      title: "Digital Cash-Aid Payout Enrollment & NEET Youth Skills Placement",
      problem: "33.4% unbanked households (356 HHs) and 137 NEET youth requiring targeted social safety net integration.",
      statute: "RA 11310 (4Ps Act)",
      section: "Section 13",
      sdgs: ["SDG 1 No Poverty", "SDG 8 Decent Work"],
      budget: 340000,
      status: "PENDING",
      confidence: 0.94,
      createdBy: "SWO Social Welfare Agent"
    }
  ]);

  const [chatInput, setChatInput] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      sender: "ai",
      text: "Statutory & CBMS Decision Support is online. Analyzing 44,892 households and 181,197 residents across all 27 Naga City barangays categorized across Upland Watershed, CBD Core, Growth Corridor, Poblacion Heritage, and Riverine Delta. Every intervention cites exact statutory authorities (RA 10121, RA 7160, RA 9003, RA 11223, PD 1096, RA 11310, RA 10173) and maps to the 17 UN Sustainable Development Goals.",
      citation: "RA 7160 Sec. 17 & RA 10121 Sec. 12",
      sdgs: ["SDG 11 Sustainable Cities", "SDG 17 Partnerships for the Goals"],
      suggestedActions: [
        "Synthesize Priority Budget for Mabolo (Hotspot)",
        "Audit 17 UN SDG Compliance for Naga",
        "Inspect 3D Building Heights in Downtown Core"
      ]
    }
  ]);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  const barangays = cbmsDataRaw.barangays;
  const summary = cbmsDataRaw.summary;
  const citywideSanitationDeficit = useMemo(
    () =>
      barangays.reduce(
        (total: number, b: any) => total + (b.infrastructure_ceo?.households_needing_sanitation || 0),
        0
      ),
    [barangays]
  );

  const selectedBarangay = useMemo(() => {
    const b = barangays.find((item: any) => item.id === selectedBarangayId) || barangays[0];
    const realName = NAGA_BARANGAY_NAMES[b.id] || b.name;
    const cat = BARANGAY_CATEGORIES[b.id] || {
      id: "poblacion",
      name: "Poblacion Urban Core",
      short: "Poblacion Core",
      color: "#05389f",
      icon: "🏛️",
      description: "Urban settlement"
    };
    return { ...b, realName, displayName: `${realName} (Brgy ${b.id})`, category: cat };
  }, [barangays, selectedBarangayId]);

  const cycleBarangay = useCallback(
    (direction: "next" | "prev") => {
      if (!barangays || barangays.length === 0) return;
      const currentIdx = barangays.findIndex((b: any) => b.id === selectedBarangayId);
      if (currentIdx === -1) return;
      if (direction === "next") {
        const nextIdx = (currentIdx + 1) % barangays.length;
        handleSelectBarangay(barangays[nextIdx].id);
      } else {
        const prevIdx = (currentIdx - 1 + barangays.length) % barangays.length;
        handleSelectBarangay(barangays[prevIdx].id);
      }
    },
    [barangays, selectedBarangayId, handleSelectBarangay]
  );

  const SDG_GOALS = useMemo(() => {
    const scores: Record<string, number> = selectedBarangay.sdg_scores || {};
    return (sdgDataRaw.sdgs as any[]).map((goal) => {
      const scoreKey = Object.keys(scores).find((key) => key.startsWith(`${goal.code} `));
      const score = scoreKey ? scores[scoreKey] : null;
      return {
        id: goal.code,
        goal: goal.code,
        title: goal.title,
        metric: score === null ? "No CBMS indicator mapped" : `CBMS score ${score}`,
        target: "Target ≤ 50",
        status: score === null ? "NO DATA" : score >= 70 ? "CRITICAL" : score >= 50 ? "HIGH PRIORITY" : "ON TRACK"
      };
    });
  }, [selectedBarangay.sdg_scores]);

  const drrmoSmsMessage = useMemo(() => {
    const roof = selectedBarangay.drrm?.weak_roof_pct ?? 0;
    const brgy = selectedBarangay.realName;
    if (calamitySimActive) {
      return `[BIKOL] Signal No. 3 sa ${brgy}. ${roof}% kan mga harong may maluyang bubong. Magbakwit na sa pinakamalapit na evacuation center. [FILIPINO] Signal No. 3 sa ${brgy}. ${roof}% ng bahay ay may mahinang bubong. Lumikas na sa pinakamalapit na evacuation center.`;
    }
    return `[STANDBY] ${brgy} is on monitoring status. Keep emergency hotlines open and prepare go-bags. [BIKOL] Permi bukas an hotline asin mag-andam nin go-bag.`;
  }, [selectedBarangay, calamitySimActive]);

  // Filter and sort barangays by search query, category, and column sort
  const filteredBarangays = useMemo(() => {
    const list = barangays.filter((b: any) => {
      const realName = (NAGA_BARANGAY_NAMES[b.id] || b.name).toLowerCase();
      const cat = BARANGAY_CATEGORIES[b.id];
      const matchesSearch =
        !searchFilterQuery.trim() ||
        realName.includes(searchFilterQuery.toLowerCase()) ||
        String(b.id).includes(searchFilterQuery) ||
        (cat && cat.name.toLowerCase().includes(searchFilterQuery.toLowerCase())) ||
        (cat && cat.short.toLowerCase().includes(searchFilterQuery.toLowerCase()));

      const matchesCat =
        selectedCategoryFilter === "all" ||
        (cat && cat.id === selectedCategoryFilter);

      return matchesSearch && matchesCat;
    });

    return [...list].sort((a: any, b: any) => {
      let cmp = 0;
      if (sortBy === "id") {
        cmp = a.id - b.id;
      } else if (sortBy === "name") {
        const nameA = NAGA_BARANGAY_NAMES[a.id] || a.name;
        const nameB = NAGA_BARANGAY_NAMES[b.id] || b.name;
        cmp = nameA.localeCompare(nameB);
      } else if (sortBy === "mvi") {
        cmp = (a.vulnerability_index || 0) - (b.vulnerability_index || 0);
      } else if (sortBy === "households") {
        cmp = (a.total_households || 0) - (b.total_households || 0);
      } else if (sortBy === "category") {
        const catA = BARANGAY_CATEGORIES[a.id]?.short || "";
        const catB = BARANGAY_CATEGORIES[b.id]?.short || "";
        cmp = catA.localeCompare(catB);
      }
      return sortDesc ? -cmp : cmp;
    });
  }, [barangays, searchFilterQuery, selectedCategoryFilter, sortBy, sortDesc]);

  const totalTablePages = Math.max(1, Math.ceil(filteredBarangays.length / tablePageSize));
  const currentTablePage = Math.min(tablePage, totalTablePages);

  const paginatedBarangays = useMemo(() => {
    const start = (currentTablePage - 1) * tablePageSize;
    return filteredBarangays.slice(start, start + tablePageSize);
  }, [filteredBarangays, currentTablePage, tablePageSize]);

  const vulnerabilityExtremes = useMemo(() => {
    const sorted = [...barangays].sort((a: any, b: any) => a.vulnerability_index - b.vulnerability_index);
    return { lowest: sorted[0], highest: sorted[sorted.length - 1] };
  }, [barangays]);

  const fetchLiveSyncData = useCallback(async () => {
    try {
      const [rptsRes, propsRes] = await Promise.all([
        fetch(`${API_BASE}/api/mobile/field-reports`),
        fetch(`${API_BASE}/api/proposals`)
      ]);
      if (rptsRes.ok) {
        const rptsData = await rptsRes.json();
        if (Array.isArray(rptsData) && rptsData.length > 0) {
          setFieldReports(rptsData);
        }
      }
      if (propsRes.ok) {
        const propsData = await propsRes.json();
        if (Array.isArray(propsData) && propsData.length > 0) {
          setProposals(
            propsData.map((p: any) => ({
              id: p.id,
              barangay: p.barangay,
              office: p.office,
              title: p.title,
              problem: p.problem_statement || p.problem || "",
              statute: p.statutory_basis?.law || p.statute || "RA 7160",
              section: p.statutory_basis?.section || p.section || "Section 17",
              sdgs: p.sdgs || ["SDG 11 Sustainable Cities"],
              budget: p.estimated_budget_php || p.budget || 250000,
              status: p.status === "PROPOSED" ? "PENDING" : p.status,
              confidence: p.confidence_score || p.confidence || 0.94,
              createdBy: p.created_by
            }))
          );
        }
      }
      setBackendConnected(true);
    } catch {
      setBackendConnected(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveSyncData();
    const interval = setInterval(fetchLiveSyncData, 6000);
    return () => clearInterval(interval);
  }, [fetchLiveSyncData]);

  const handleProposalAction = async (id: string, action: "approve" | "fund" | "reject") => {
    const statusMap = {
      approve: "APPROVED" as const,
      fund: "FUNDED" as const,
      reject: "REJECTED" as const
    };
    setProposals((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: statusMap[action] } : p))
    );
    try {
      await fetch(`${API_BASE}/api/proposals/${id}/review?role=super_admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      });
    } catch {
      // Local state updated
    }
  };

  const handleQueueDraftProposal = async (draft: any) => {
    if (!draft) return;
    const newProp: Proposal = {
      id: draft.id || draft.proposal_id || `PROP-AI-${Date.now().toString().slice(-3)}`,
      barangay: draft.target_barangay || draft.barangay || selectedBarangay.displayName,
      office: (draft.target_office || draft.office || "CPDO").toUpperCase(),
      title: draft.project_title || draft.title || "Targeted CBMS Capital Program",
      problem: draft.problem_statement || "Identified physical deficit from 2024 CBMS indicators.",
      statute: draft.statutory_basis?.law || "RA 7160 (Local Government Code)",
      section: draft.statutory_basis?.section || "Section 17",
      sdgs: draft.sdgs || ["SDG 11 Sustainable Cities"],
      budget: draft.estimated_budget_php || 450000,
      status: "PENDING",
      confidence: draft.confidence_score || 0.95,
      createdBy: "LGU Statutory Agent"
    };

    setProposals((prev) => [newProp, ...prev.filter((p) => p.id !== newProp.id)]);
    setIsAiOpen(false);

    try {
      const res = await fetch(`${API_BASE}/api/proposals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: newProp.id,
          barangay: newProp.barangay,
          office: newProp.office,
          title: newProp.title,
          problem_statement: newProp.problem,
          statutory_basis: {
            law: newProp.statute,
            section: newProp.section,
            citation: draft.statutory_basis?.citation || ""
          },
          sdgs: newProp.sdgs,
          estimated_budget_php: newProp.budget,
          confidence_score: newProp.confidence,
          created_by: newProp.createdBy
        })
      });
      if (!res.ok) throw new Error("Proposal queue rejected");
      await fetchLiveSyncData();
    } catch {
      // Keep the optimistic local proposal when the API is unavailable.
    }
  };

  const handleDispatchFieldReport = async () => {
    const center: number[] = selectedBarangay.center || [123.1948, 13.6218];
    const report: SyncedFieldReport = {
      id: `RPT-WEB-${Date.now().toString().slice(-6)}`,
      barangay_id: selectedBarangay.id,
      barangay_name: selectedBarangay.realName,
      report_type: calamitySimActive ? "Calamity Damage Assessment" : "Field Inspection",
      description: calamitySimActive
        ? `Rapid damage assessment requested for ${selectedBarangay.realName} after simulated Signal No. 3.`
        : `Routine field validation of CBMS indicators for ${selectedBarangay.realName}.`,
      latitude: center[1] ?? 13.6218,
      longitude: center[0] ?? 123.1948,
      offline_created_at: `${new Date().toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" })} PHT`,
      reporter_role: "DRRMO Field Unit"
    };

    setFieldReports((prev) => [report, ...prev]);

    try {
      const res = await fetch(`${API_BASE}/api/mobile/field-report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(report)
      });
      if (!res.ok) throw new Error("Field report sync rejected");
      await fetchLiveSyncData();
    } catch {
      // Keep the optimistic local report when the backend is unreachable.
    }
  };

  const executeAiQuery = async (queryText: string) => {
    if (!queryText.trim() || isAiLoading) return;

    setChatMessages((prev) => [...prev, { sender: "user", text: queryText }]);
    setChatInput("");
    setIsAiLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/agent/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: queryText,
          user_role: role,
          barangay_id: selectedBarangayId,
          target_office: role === "super_admin" ? "cpdo" : role
        })
      });

      if (res.ok) {
        const data = await res.json();
        const draft = data.proposal_draft || data.drafted_proposal;
        const basis = data.statutory_basis || draft?.statutory_basis;
        setChatMessages((prev) => [
          ...prev,
          {
            sender: "ai",
            text: data.response_text || data.ai_synthesis || "Statutory synthesis completed.",
            citation: basis ? `${basis.law} - ${basis.section}` : undefined,
            sdgs: data.sdgs || draft?.sdgs,
            suggestedActions: data.suggested_actions || draft?.suggested_actions,
            proposalDraft: draft
          }
        ]);
      } else {
        throw new Error("Fallback local synthesis");
      }
    } catch {
      // Offline fallback
      setTimeout(() => {
        setChatMessages((prev) => [
          ...prev,
          {
            sender: "ai",
            text: `Empirical synthesis for ${selectedBarangay.displayName} (${selectedBarangay.category.name}): With ${selectedBarangay.total_households?.toLocaleString()} households and Master Vulnerability Index ${selectedBarangay.vulnerability_index}, the primary recommended intervention addresses the ${selectedBarangay.infrastructure_ceo?.drinking_refilling_pct}% refilling reliance and ${selectedBarangay.drrm?.weak_roof_pct}% weak roof vulnerability under RA 7160 Sec. 17 and RA 10121 Sec. 12.`,
            citation: "RA 7160 Sec. 17 / RA 10121",
            sdgs: ["SDG 6 Clean Water", "SDG 11 Sustainable Cities"],
            suggestedActions: [
              "Review Draft Proposal in AIP Queue",
              "Inspect 3D Building Extrusions"
            ],
            proposalDraft: {
              id: `PROP-OFFLINE-${Date.now().toString().slice(-4)}`,
              target_barangay: selectedBarangay.displayName,
              target_office: "CEO",
              project_title: `Communal Water & Drainage Upgrade (${selectedBarangay.displayName})`,
              problem_statement: `Immediate municipal intervention required for ${selectedBarangay.total_households} households in ${selectedBarangay.category.name}.`,
              statutory_basis: {
                law: "RA 7160 (Local Government Code)",
                section: "Section 17 (b)"
              },
              sdgs: ["SDG 6 Clean Water & Sanitation", "SDG 11 Sustainable Cities"],
              estimated_budget_php: 750000,
              confidence_score: 0.94
            }
          }
        ]);
      }, 700);
    } finally {
      setIsAiLoading(false);
    }
  };

  const getRoleBadge = (r: UserRole) => {
    switch (r) {
      case "super_admin":
        return { label: "City Mayor / Super Admin", icon: ShieldAlert, color: "text-[#05389f] bg-[#edf3fc]" };
      case "ceo":
        return { label: "City Engineer (CEO)", icon: Building2, color: "text-[#05389f] bg-[#edf3fc]" };
      case "cpdo":
        return { label: "Planning Office (CPDO)", icon: Compass, color: "text-[#05389f] bg-[#edf3fc]" };
      case "drrmo":
        return { label: "Disaster Risk (DRRMO)", icon: Flame, color: "text-[#d9ab04] bg-[#fef9e7]" };
      case "cho":
        return { label: "City Health (CHO)", icon: Activity, color: "text-emerald-700 bg-emerald-50" };
      case "swo":
        return { label: "Social Welfare (SWO)", icon: HeartHandshake, color: "text-[#05389f] bg-[#edf3fc]" };
      case "barangay_captain":
        return { label: "Barangay Captain Desk", icon: Users, color: "text-[#d9ab04] bg-[#fef9e7]" };
      case "citizen":
      default:
        return { label: "Citizen Transparency", icon: Eye, color: "text-[#05389f] bg-[#edf3fc]" };
    }
  };

  const currentRole = getRoleBadge(role);
  const CurrentIcon = currentRole.icon;

  return (
    <div className="w-full min-h-screen bg-white text-[#0f172a] flex flex-col font-sans antialiased selection:bg-[#05389f] selection:text-white">
      {/* ─────────────────────────────────────────────────────────────
          FULL BROWSER EXECUTIVE APP SHELL
         ───────────────────────────────────────────────────────────── */}
      <div className="w-full flex-1 flex flex-col bg-white">
        {/* Top Header Bar (Brand + Live Badge + Cycle Pill + Avatar) */}
        <header className="border-b border-[#eef0f6] px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4 bg-white select-none shrink-0">
          {/* Left: Brand with Logo */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-[#05389f] text-white flex items-center justify-center font-black text-sm shadow-sm">
              <div className="flex items-end space-x-0.5">
                <span className="w-1 h-3.5 bg-white rounded-full inline-block" />
                <span className="w-1 h-5 bg-[#facc15] rounded-full inline-block" />
                <span className="w-1 h-2.5 bg-white rounded-full inline-block" />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-base tracking-tight text-[#0f172a]">Project Banwaan</span>
              <span className="text-[10px] font-bold text-slate-400 font-mono hidden sm:inline-block">v2.6</span>
            </div>
          </div>

          {/* Right: Controls & Avatar */}
          <div className="flex items-center space-x-2.5 shrink-0">
            {/* Header Omnisearch Pill (Opens Dedicated Spotlight Modal) */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center space-x-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-[#05389f]/40 rounded-full px-3.5 py-1.5 text-xs text-slate-500 transition-all cursor-pointer shadow-2xs group"
              title="Search indicators, hotlines, barangays & commands (⌘K)"
            >
              <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#05389f] transition-colors" />
              <span className="hidden sm:inline-block text-slate-600 font-medium">Search indicators, hotlines, barangays...</span>
              <kbd className="hidden md:inline-block text-[9px] font-mono text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200 shadow-2xs">
                ⌘K
              </kbd>
            </button>

            {/* Notifications Circular Button */}
            <button
              onClick={() => setActiveNavTab("executive_command")}
              className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors relative cursor-pointer"
              title="Field Alerts"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 absolute top-1.5 right-1.5" />
            </button>

            {/* Mayor Avatar Pill (Pure Executive Status & Department Switcher Popover) */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className={`flex items-center space-x-2 pl-1 pr-3 py-1 rounded-full border transition-all cursor-pointer select-none ${
                  isProfileOpen ? "bg-blue-50 border-[#05389f]" : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                }`}
                title="Executive Mayor Profile & System Status"
              >
                <div className="w-7 h-7 rounded-full bg-[#f87171] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                  NM
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-[11px] font-bold text-slate-900 leading-tight">Hon. Mayor</div>
                  <div className="text-[9px] text-slate-400 leading-tight">Executive Status</div>
                </div>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isProfileOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Backdrop to close modal when clicking outside */}
              {isProfileOpen && (
                <div
                  className="fixed inset-0 z-40 bg-black/10 backdrop-blur-2xs"
                  onClick={() => setIsProfileOpen(false)}
                />
              )}

              {/* Profile Dropdown Modal (Executive Status, Roles & Verified Hotlines - NO barangay list) */}
              {isProfileOpen && (
                <div className="absolute right-0 top-12 z-50 w-88 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 space-y-3.5 animate-in fade-in zoom-in-95 duration-150 text-left">
                  {/* Executive Header */}
                  <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
                    <div className="w-10 h-10 rounded-2xl bg-[#f87171] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                      NM
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-extrabold text-sm text-slate-900 leading-tight truncate">Hon. Mayor Nelson Legacion</h4>
                        <span className="text-[9px] font-mono font-bold bg-blue-50 text-[#05389f] px-2 py-0.5 rounded-full border border-blue-200">
                          RA 7160
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium mt-0.5 truncate">City Mayor • Naga City LGU (Camarines Sur)</p>
                      <div className="flex items-center space-x-1.5 mt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                        <span className="text-[9px] font-bold text-emerald-700">Executive Master Authority Active</span>
                      </div>
                    </div>
                  </div>

                  {/* Switch Department Domain Role */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <span>Switch Department Role</span>
                      <span className="text-[9px] font-mono text-slate-400">Current: {role}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                      {[
                        { id: "super_admin", label: "Executive Mayor" },
                        { id: "ceo", label: "CEO Engineering" },
                        { id: "cpdo", label: "CPDO Planning" },
                        { id: "drrmo", label: "DRRMO Disaster" },
                        { id: "cho", label: "CHO Health" },
                        { id: "swo", label: "CSWDO Social" },
                      ].map((r) => (
                        <button
                          key={r.id}
                          onClick={() => {
                            setRole(r.id as any);
                            setIsProfileOpen(false);
                          }}
                          className={`p-2 rounded-xl text-left font-bold transition-all cursor-pointer ${
                            role === r.id
                              ? "bg-[#05389f] text-white shadow-2xs"
                              : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-100"
                          }`}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Verified Naga City Emergency Hotlines (Research Verified) */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <span>Naga City Emergency Hotlines</span>
                      <span className="text-[9px] font-semibold text-rose-600">24/7 ComCen</span>
                    </div>
                    <div className="space-y-1.5">
                      {NAGA_EMERGENCY_HOTLINES.map((hotline) => (
                        <div
                          key={hotline.id}
                          className="bg-slate-50 p-2 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center space-x-2 min-w-0">
                            <span className="text-base shrink-0">{hotline.icon}</span>
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 text-[11px] truncate">{hotline.agency}</div>
                              <div className="font-mono text-[#05389f] text-[10px] font-bold truncate">
                                {hotline.primaryPhone} <span className="text-slate-400 font-normal">| {hotline.landline}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 shrink-0 ml-2">
                            <a
                              href={`tel:${hotline.primaryPhone.replace(/[^0-9]/g, "")}`}
                              className="px-2 py-1 bg-white hover:bg-[#edf3fc] border border-slate-200 rounded-lg text-[10px] font-bold text-[#05389f] transition-all cursor-pointer flex items-center space-x-1"
                              title={`Call ${hotline.agency}`}
                            >
                              <PhoneCall className="w-2.5 h-2.5" />
                              <span>Call</span>
                            </a>
                            <button
                              onClick={() => copyToClipboard(hotline.primaryPhone, hotline.id)}
                              className="p-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 cursor-pointer transition-all"
                              title="Copy number"
                            >
                              {copiedHotline === hotline.id ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3 text-slate-400" />
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* System Telemetry & Data Verification */}
                  <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
                    <span>PSA CBMS 2024–2026 • 44,892 HHs</span>
                    <span className="font-mono text-emerald-700 font-bold">✓ Synced</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Body Split: Left Vertical Icon Rail + Main Content Area */}
        <div className="flex flex-1 min-h-[820px] overflow-hidden">
          {/* Left Icon Rail (Upper Positioned Alignment) */}
          <aside className="w-16 lg:w-18 bg-[#fbfcfe] border-r border-[#eef0f6] flex flex-col items-center py-6 px-2 shrink-0 select-none gap-5">
            {/* Top Brand Mark */}
            <div className="w-9 h-9 rounded-2xl bg-[#05389f]/10 border border-[#05389f]/20 flex items-center justify-center text-[#05389f]">
              <Globe className="w-4 h-4" />
            </div>

            {/* Upper Icon Dock */}
            <div className="flex flex-col items-center space-y-3">
              <button
                onClick={() => {
                  setActiveNavTab("dashboard");
                  setRole("super_admin");
                }}
                className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
                  activeNavTab === "dashboard"
                    ? "bg-[#05389f] text-white shadow-md shadow-blue-900/25"
                    : "text-slate-400 hover:text-slate-800 hover:bg-slate-100"
                }`}
                title="Overview 3D Twin"
              >
                <LayoutDashboard className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setActiveNavTab("departments");
                  if (role === "super_admin") setRole("cpdo");
                }}
                className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
                  activeNavTab === "departments"
                    ? "bg-[#05389f] text-white shadow-md shadow-blue-900/25"
                    : "text-slate-400 hover:text-slate-800 hover:bg-slate-100"
                }`}
                title="Managing 5 Departments"
              >
                <Building2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setActiveNavTab("proposals");
                  setRole("super_admin");
                }}
                className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
                  activeNavTab === "proposals"
                    ? "bg-[#05389f] text-white shadow-md shadow-blue-900/25"
                    : "text-slate-400 hover:text-slate-800 hover:bg-slate-100"
                }`}
                title="AIP 2026 Proposals"
              >
                <FileCheck className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setActiveNavTab("executive_command");
                  setRole("super_admin");
                }}
                className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
                  activeNavTab === "executive_command"
                    ? "bg-[#05389f] text-white shadow-md shadow-blue-900/25"
                    : "text-slate-400 hover:text-slate-800 hover:bg-slate-100"
                }`}
                title="Executive Command"
              >
                <ShieldAlert className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsAiOpen(true)}
                className="w-10 h-10 rounded-2xl text-slate-400 hover:text-[#05389f] hover:bg-blue-50 flex items-center justify-center transition-all cursor-pointer"
                title="Open Statutory Assistant"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
              </button>
            </div>

            {/* Bottom: Help pinned to bottom with mt-auto */}
            <div className="mt-auto flex flex-col items-center space-y-2">
              <button
                onClick={() => setIsAiOpen(true)}
                className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer text-xs font-bold"
                title="Statutory Guidance"
              >
                ?
              </button>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-[#ffffff] space-y-7">
            {/* Big Headline Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1">
              <div>
                <h1 className="text-2xl lg:text-3xl font-extrabold text-[#0f172a] tracking-tight font-sans">
                  {activeNavTab === "dashboard"
                    ? "We mapped your 27 Barangays"
                    : activeNavTab === "departments"
                    ? "Managing 5 Key City Departments"
                    : activeNavTab === "proposals"
                    ? "Annual Investment Program (AIP 2026)"
                    : "Executive Command & Live Field Telemetry"}
                </h1>
                <p className="text-xs lg:text-sm text-slate-500 mt-1 font-medium">
                  {activeNavTab === "dashboard"
                    ? "Everything below was inferred from 44,892 PSA CBMS households across 5 planning sectors. Evidence-based statutory governance."
                    : activeNavTab === "departments"
                    ? "Cross-departmental budget synthesis, statutory mandate verification, and LDF allocation control."
                    : activeNavTab === "proposals"
                    ? "Statutory ceiling compliance (RA 7160 Sec. 287 20% LDF), AI evidence citations, and council approval queue."
                    : "Direct telemetry from mobile field officers, rapid dispatch alerts, and emergency asset tracking."}
                </p>
              </div>

              {/* Right Headline Actions: Functional Search & Validated CBMS Badge */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="bg-white border border-slate-200 hover:border-[#05389f] rounded-full px-3.5 py-1.5 text-xs font-semibold text-slate-700 flex items-center space-x-2 shadow-2xs hover:bg-slate-50 transition-all cursor-pointer"
                  title="Search 27 Barangays & Datasets (Cmd+K / Ctrl+K)"
                >
                  <Search className="w-3.5 h-3.5 text-slate-400" />
                  <span>Search Datasets</span>
                  <kbd className="text-[10px] font-mono bg-slate-100 border border-slate-300 rounded px-1.5 py-0.2 text-slate-500">⌘K</kbd>
                </button>
                <div className="bg-[#eaf8ee] text-[#16a34a] border border-emerald-200/80 rounded-full px-3.5 py-1.5 text-xs font-semibold flex items-center space-x-1.5 shadow-2xs">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>27 Barangays Mapped</span>
                </div>
              </div>
            </div>

            {/* ─────────────────────────────────────────────────────────────
                WORKSPACE 1: GENERAL DASHBOARD (ALL 3D & 27 BARANGAYS MATRIX)
               ───────────────────────────────────────────────────────────── */}
            {activeNavTab === "dashboard" && (
              <div className="space-y-7 animate-in fade-in duration-200">

          {/* ─────────────────────────────────────────────────────────────
              4. 3D GEOSPATIAL ENGINE VIEWPORT (CESIUMJS 3D GLOBE ONLY)
             ───────────────────────────────────────────────────────────── */}
          <div id="cesium-3d-viewport" className="coolors-card p-2 overflow-hidden shadow-sm">
            {/* Simple Top Filter Bar (Title Removed - Minimalist) */}
            <div className="px-4 py-2 bg-white rounded-t-xl flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 select-none">
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => handleSelectCategory("all")}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    selectedCategoryFilter === "all"
                      ? "bg-[#05389f] text-white shadow-xs"
                      : "bg-[#f2f2f2] text-slate-600 hover:text-slate-900"
                  }`}
                >
                  All 27
                </button>
                <button
                  onClick={() => handleSelectCategory("upland")}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                    selectedCategoryFilter === "upland"
                      ? "bg-[#b59410] text-white shadow-xs"
                      : "bg-[#fef9e7] text-[#b59410] hover:bg-[#fee573]"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-[#b59410] inline-block" />
                  <span>Upland (5)</span>
                </button>
                <button
                  onClick={() => handleSelectCategory("cbd")}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                    selectedCategoryFilter === "cbd"
                      ? "bg-[#05389f] text-white shadow-xs"
                      : "bg-[#edf3fc] text-[#05389f] hover:bg-[#dbeafe]"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-[#05389f] inline-block" />
                  <span>CBD Core (6)</span>
                </button>
                <button
                  onClick={() => handleSelectCategory("poblacion")}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                    selectedCategoryFilter === "poblacion"
                      ? "bg-[#7c3aed] text-white shadow-xs"
                      : "bg-purple-50 text-[#7c3aed] hover:bg-purple-100"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-[#7c3aed] inline-block" />
                  <span>Poblacion (8)</span>
                </button>
                <button
                  onClick={() => handleSelectCategory("riverine")}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                    selectedCategoryFilter === "riverine"
                      ? "bg-[#ea580c] text-white shadow-xs"
                      : "bg-[#fff1f2] text-[#ea580c] hover:bg-[#fee2e2]"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-[#ea580c] inline-block" />
                  <span>Riverine (4)</span>
                </button>
                <button
                  onClick={() => handleSelectCategory("growth")}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                    selectedCategoryFilter === "growth"
                      ? "bg-[#0d9488] text-white shadow-xs"
                      : "bg-teal-50 text-[#0d9488] hover:bg-teal-100"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-[#0d9488] inline-block" />
                  <span>Growth Corridor (4)</span>
                </button>
              </div>

              <button
                onClick={() => setIsDigitalTwinSectionMinimized(!isDigitalTwinSectionMinimized)}
                className="flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all cursor-pointer border border-slate-200 shadow-2xs"
                title={isDigitalTwinSectionMinimized ? "Expand Map View" : "Minimize Map View"}
              >
                {isDigitalTwinSectionMinimized ? (
                  <>
                    <ChevronDown className="w-3.5 h-3.5 text-[#05389f]" />
                    <span>Expand Map</span>
                  </>
                ) : (
                  <>
                    <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                    <span>Minimize</span>
                  </>
                )}
              </button>
            </div>

            {!isDigitalTwinSectionMinimized && (
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 p-3 bg-[#f7f8fa] rounded-b-xl items-stretch">
                {/* 3D GIS Map (7 Cols on Desktop) */}
                <div className="xl:col-span-7 flex flex-col h-full min-h-[660px]">
                  <CesiumViewer
                    selectedBarangayId={selectedBarangayId}
                    onSelectBarangay={handleSelectBarangay}
                    activeRole={role}
                    calamitySimActive={calamitySimActive}
                    fieldReports={fieldReports}
                    selectedCategoryFilter={selectedCategoryFilter}
                    onSelectCategory={handleSelectCategory}
                  />
                </div>

                {/* Right Side: Barangay Diagnostic & Executive Intelligence Deck (5 Cols on Desktop) */}
                <div className="xl:col-span-5 bg-white rounded-2xl p-4 border border-[#e5e7eb] shadow-sm flex flex-col h-full min-h-[660px]">
                  {/* Top Row: Barangay Cycler & Tab Switcher (Intel vs Controls) */}
                  <div className="space-y-2 pb-2 border-b border-slate-100 shrink-0">
                    {/* Barangay Cycler Header */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white font-black text-xs shadow-xs"
                          style={{ backgroundColor: selectedBarangay.category.color }}
                        >
                          {selectedBarangay.category.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center space-x-1.5">
                            <h3 className="font-extrabold text-[#0a1128] text-base leading-tight truncate">
                              {selectedBarangay.realName}
                            </h3>
                            <span className="text-slate-400 text-xs font-mono">#{selectedBarangayId}</span>
                          </div>
                          <span
                            className="text-[10px] font-black uppercase tracking-wider block"
                            style={{ color: selectedBarangay.category.color }}
                          >
                            {selectedBarangay.category.name}
                          </span>
                        </div>
                      </div>

                      {/* Prev / Next Barangay Stepper */}
                      <div className="flex items-center space-x-1 shrink-0">
                        <button
                          onClick={() => cycleBarangay("prev")}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                          title="Previous Barangay"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-[11px] font-mono font-bold text-slate-500 px-1">
                          {selectedBarangayId} / 27
                        </span>
                        <button
                          onClick={() => cycleBarangay("next")}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                          title="Next Barangay"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Segmented Switcher: Barangay Intel & AI vs Merged Executive Master Controls */}
                    <div className="flex items-center bg-[#f1f3f9] p-0.5 rounded-xl border border-slate-200/60 text-xs font-bold">
                      <button
                        onClick={() => setSidePanelTab("intel")}
                        className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer text-[11px] flex items-center justify-center space-x-1.5 ${
                          sidePanelTab === "intel"
                            ? "bg-[#05389f] text-white shadow-xs font-extrabold"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        <Compass className="w-3.5 h-3.5" />
                        <span>Barangay Intel &amp; AI</span>
                      </button>
                      <button
                        onClick={() => setSidePanelTab("controls")}
                        className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer text-[11px] flex items-center justify-center space-x-1.5 ${
                          sidePanelTab === "controls"
                            ? "bg-[#05389f] text-white shadow-xs font-extrabold"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        <Sliders className="w-3.5 h-3.5" />
                        <span>Master Controls</span>
                      </button>
                    </div>
                  </div>

                  {/* Scrollable Container with Smooth Scrollbar matching 3D GIS frame */}
                  <div className="flex-1 overflow-y-auto pr-1 space-y-3 min-h-0 pt-2">
                    {/* TAB 1: BARANGAY INTEL (OVERVIEW, NEXT STEPS, DETECTED) */}
                    {sidePanelTab === "intel" && (
                      <div className="space-y-3 animate-in fade-in duration-150">
                        {/* Sub-tab segmented pill bar (Overview, Next Steps, Detected) */}
                        <div className="flex items-center space-x-1 bg-[#f3f5f9] p-1 rounded-xl border border-slate-200/70 text-[11px] font-bold shrink-0">
                          <button
                            onClick={() => setIntelSubTab("overview")}
                            className={`flex-1 py-1.5 rounded-lg transition-all text-center cursor-pointer ${
                              intelSubTab === "overview"
                                ? "bg-white text-[#05389f] shadow-xs font-black"
                                : "text-slate-600 hover:text-slate-900"
                            }`}
                          >
                            Overview
                          </button>
                          <button
                            onClick={() => setIntelSubTab("next_steps")}
                            className={`flex-1 py-1.5 rounded-lg transition-all text-center cursor-pointer ${
                              intelSubTab === "next_steps"
                                ? "bg-white text-[#05389f] shadow-xs font-black"
                                : "text-slate-600 hover:text-slate-900"
                            }`}
                          >
                            Next Steps
                          </button>
                          <button
                            onClick={() => setIntelSubTab("detected")}
                            className={`flex-1 py-1.5 rounded-lg transition-all text-center cursor-pointer ${
                              intelSubTab === "detected"
                                ? "bg-white text-[#05389f] shadow-xs font-black"
                                : "text-slate-600 hover:text-slate-900"
                            }`}
                          >
                            Detected Signals
                          </button>
                        </div>

                        {/* ── SUB-SECTION: OVERVIEW ── */}
                        {intelSubTab === "overview" && (
                          <div className="space-y-3 animate-in fade-in duration-150">
                            {/* Risk Badge & MVI Row */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                {(() => {
                                  const mvi = selectedBarangay.vulnerability_index || 50;
                                  if (mvi >= 70) {
                                    return (
                                      <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold flex items-center space-x-1.5">
                                        <span className="w-2 h-2 rounded-full bg-rose-500 inline-block animate-pulse" />
                                        <span>High Risk Level</span>
                                      </span>
                                    );
                                  }
                                  if (mvi >= 50) {
                                    return (
                                      <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold flex items-center space-x-1.5">
                                        <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                                        <span>Medium Risk Level</span>
                                      </span>
                                    );
                                  }
                                  return (
                                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center space-x-1.5">
                                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                                      <span>Low Risk Level</span>
                                    </span>
                                  );
                                })()}
                              </div>
                              <span className="px-3 py-0.5 rounded-full text-xs font-mono font-extrabold bg-[#edf3fc] text-[#05389f] border border-[#05389f]/25 shadow-2xs">
                                Empirical MVI: {selectedBarangay.vulnerability_index}
                              </span>
                            </div>

                            <p className="text-xs text-slate-500 leading-relaxed font-medium">
                              {selectedBarangay.category.description}
                            </p>

                            {/* Twin Rounded Stats: Households & Population */}
                            <div className="grid grid-cols-2 gap-2.5">
                              <div className="bg-[#f7f8fa] p-2.5 rounded-xl border border-slate-200">
                                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">
                                  HOUSEHOLDS
                                </span>
                                <div className="font-extrabold text-slate-900 text-sm sm:text-base mt-0.5 font-mono">
                                  {selectedBarangay.total_households?.toLocaleString()} HHs
                                </div>
                              </div>
                              <div className="bg-[#f7f8fa] p-2.5 rounded-xl border border-slate-200">
                                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">
                                  POPULATION
                                </span>
                                <div className="font-extrabold text-slate-900 text-sm sm:text-base mt-0.5 font-mono">
                                  {selectedBarangay.total_population?.toLocaleString()} Pop
                                </div>
                              </div>
                            </div>

                            {/* 3 Hotspot Indicators */}
                            <div className="space-y-1.5 text-xs bg-[#f7f8fa] p-2.5 rounded-xl border border-slate-200">
                              <div className="flex justify-between items-center">
                                <span className="text-slate-600 font-medium">Weak Roof Structure:</span>
                                <span className="font-bold text-rose-700 font-mono text-xs">
                                  {selectedBarangay.drrm?.weak_roof_pct}%
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-slate-600 font-medium">Refilling Station Dependency:</span>
                                <span className="font-bold text-[#05389f] font-mono text-xs">
                                  {selectedBarangay.infrastructure_ceo?.drinking_refilling_pct}%
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-slate-600 font-medium">Sanitation Deficit (Unimproved):</span>
                                <span className="font-bold text-amber-700 font-mono text-xs">
                                  {selectedBarangay.infrastructure_ceo?.unimproved_toilet_pct}%
                                </span>
                              </div>
                            </div>

                            {/* GROQ SDG & STATUTORY POLICY AI COPILOT FRAME (EXACT SCREENSHOT UI) */}
                            <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-3 flex flex-col justify-between">
                              {/* Card Header: Icon + Title + LIVE Badge + Synthesize Policy Button */}
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center space-x-2.5 min-w-0">
                                  <div className="w-8 h-8 rounded-full bg-[#05389f] text-white flex items-center justify-center shrink-0 shadow-xs">
                                    <Sparkles className="w-4 h-4 text-[#facc15]" />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center space-x-1.5">
                                      <h4 className="text-xs font-bold text-slate-900 truncate">
                                        Groq SDG &amp; Policy Copilot
                                      </h4>
                                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                        LIVE
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 font-medium truncate">
                                      Grounded in 17 UN SDGs, RA Corpus &amp; POLICY_KNOWLEDGE.md
                                    </p>
                                  </div>
                                </div>

                                <button
                                  onClick={() =>
                                    executeAiQuery(
                                      `Synthesize an SDG-aligned policy brief and statutory AIP intervention for ${selectedBarangay.displayName} (${selectedBarangay.category.name}) based on its CBMS indicators.`
                                    )
                                  }
                                  disabled={isAiLoading}
                                  className="px-3.5 py-1.5 rounded-full bg-[#05389f] hover:bg-[#042d82] disabled:opacity-60 text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-all cursor-pointer shrink-0"
                                >
                                  <Sparkles className={`w-3.5 h-3.5 text-[#facc15] ${isAiLoading ? "animate-spin" : ""}`} />
                                  <span>{isAiLoading ? "Synthesizing..." : "Synthesize Policy"}</span>
                                </button>
                              </div>

                              {/* Suggestion Chips */}
                              <div className="flex flex-wrap items-center gap-1.5">
                                <button
                                  onClick={() =>
                                    executeAiQuery(
                                      `Audit ${selectedBarangay.realName} CBMS deficits against the 17 UN SDGs and recommend top statutory priorities.`
                                    )
                                  }
                                  className="px-3 py-1 rounded-full bg-white border border-slate-200 hover:border-[#05389f] text-slate-700 hover:text-[#05389f] text-[11px] font-semibold transition-all cursor-pointer shadow-2xs flex items-center space-x-1.5"
                                >
                                  <Target className="w-3.5 h-3.5 text-[#05389f]" />
                                  <span>SDG Gap Audit ({selectedBarangay.realName})</span>
                                </button>
                                <button
                                  onClick={() =>
                                    executeAiQuery(
                                      `Cite exact RA 7160, RA 10121, and RA 11223 statutory mandates applicable to ${selectedBarangay.realName}'s highest household deficits.`
                                    )
                                  }
                                  className="px-3 py-1 rounded-full bg-white border border-slate-200 hover:border-[#05389f] text-slate-700 hover:text-[#05389f] text-[11px] font-semibold transition-all cursor-pointer shadow-2xs flex items-center space-x-1.5"
                                >
                                  <FileText className="w-3.5 h-3.5 text-[#05389f]" />
                                  <span>Statutory Policy Basis</span>
                                </button>
                                <button
                                  onClick={() =>
                                    executeAiQuery(
                                      `Draft a 2026 AIP 20% Local Development Fund project ordinance for ${selectedBarangay.realName} with budget and SDG targets.`
                                    )
                                  }
                                  className="px-3 py-1 rounded-full bg-white border border-slate-200 hover:border-[#05389f] text-slate-700 hover:text-[#05389f] text-[11px] font-semibold transition-all cursor-pointer shadow-2xs flex items-center space-x-1.5"
                                >
                                  <Scale className="w-3.5 h-3.5 text-[#05389f]" />
                                  <span>Draft AIP Proposal</span>
                                </button>
                              </div>

                              {/* LATEST POLICY & SDG SYNTHESIS Output Box */}
                              {(() => {
                                const latestAiMsg = [...chatMessages].reverse().find((m) => m.sender === "ai") || chatMessages[0];
                                return (
                                  <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 space-y-2.5 text-xs shadow-2xs">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#05389f]">
                                        LATEST POLICY &amp; SDG SYNTHESIS
                                      </span>
                                      <button
                                        onClick={() => setIsAiOpen(true)}
                                        className="text-[10px] font-bold text-slate-500 hover:text-[#05389f] flex items-center space-x-0.5 cursor-pointer"
                                      >
                                        <span>Open Full History</span>
                                        <ArrowUpRight className="w-3 h-3" />
                                      </button>
                                    </div>

                                    <p className="text-[11px] text-slate-700 leading-relaxed max-h-48 overflow-y-auto">
                                      {latestAiMsg?.text}
                                    </p>

                                    {/* Statutory Citation + SDG Pills */}
                                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                      {latestAiMsg?.citation && (
                                        <span className="px-2.5 py-0.5 rounded-md bg-[#edf3fc] text-[#05389f] font-mono font-bold text-[10px] border border-[#05389f]/20 flex items-center space-x-1">
                                          <Scale className="w-3 h-3 text-[#05389f]" />
                                          <span>{latestAiMsg.citation}</span>
                                        </span>
                                      )}
                                      {latestAiMsg?.sdgs?.map((sdg: string, idx: number) => (
                                        <span
                                          key={idx}
                                          className="px-2.5 py-0.5 rounded-md bg-[#fef9e7] text-[#92400e] font-bold text-[10px] border border-[#fccf17]/50"
                                        >
                                          {sdg}
                                        </span>
                                      ))}
                                    </div>

                                    {/* One-Click Queue Draft Proposal if present (Matching Image 1) */}
                                    {latestAiMsg?.proposalDraft && (
                                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                                        <div className="truncate text-[10px] font-semibold text-slate-600">
                                          Draft: <strong className="text-slate-900">{latestAiMsg.proposalDraft.project_title}</strong> (₱{latestAiMsg.proposalDraft.estimated_budget_php?.toLocaleString()})
                                        </div>
                                        <button
                                          onClick={() => handleQueueDraftProposal(latestAiMsg.proposalDraft)}
                                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold shrink-0 cursor-pointer transition-colors shadow-2xs"
                                        >
                                          + Queue to AIP
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                );
                              })()}

                              {/* Inset Ask AI Input Bar */}
                              <div className="pt-0.5">
                                <div className="flex items-center bg-[#f8fafd] border border-slate-200 rounded-full pl-3.5 pr-1 py-1 focus-within:border-[#05389f] focus-within:bg-white transition-all shadow-2xs">
                                  <input
                                    type="text"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter" && chatInput.trim()) {
                                        executeAiQuery(chatInput);
                                      }
                                    }}
                                    placeholder={`Ask SDG or policy question for ${selectedBarangay.realName}...`}
                                    className="flex-1 bg-transparent text-xs text-slate-800 outline-none placeholder:text-slate-400"
                                  />
                                  <button
                                    onClick={() => {
                                      if (chatInput.trim()) {
                                        executeAiQuery(chatInput);
                                      } else {
                                        executeAiQuery(`Synthesize SDG priorities and statutory policies for ${selectedBarangay.realName}`);
                                      }
                                    }}
                                    className="px-3.5 py-1.5 rounded-full bg-[#05389f] hover:bg-[#042d82] text-white text-xs font-bold transition-all cursor-pointer flex items-center space-x-1 shrink-0 shadow-xs"
                                  >
                                    <span>Ask AI</span>
                                    <Send className="w-3 h-3 text-[#facc15]" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* ── SUB-SECTION: NEXT STEPS (STABLE, ROCK-SOLID) ── */}
                        {intelSubTab === "next_steps" && (
                          <div className="space-y-3 animate-in fade-in duration-150">
                            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                              <div className="flex items-center space-x-1.5">
                                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                                  Next steps
                                </h4>
                                <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                  1 priority
                                </span>
                              </div>
                              <button
                                onClick={() => {
                                  setIsAiOpen(true);
                                  executeAiQuery(`Synthesize all immediate statutory next steps for ${selectedBarangay.realName}`);
                                }}
                                className="text-[10px] text-[#05389f] font-bold hover:underline flex items-center space-x-0.5 cursor-pointer"
                              >
                                <span>Audit All</span>
                                <span>↗</span>
                              </button>
                            </div>

                            {/* Sunshine Yellow Hero Card */}
                            <div className="yellow-feature-card p-4 relative overflow-hidden flex flex-col justify-between rounded-2xl shadow-sm">
                              <div>
                                <div className="flex items-center justify-between">
                                  <h4 className="font-extrabold text-sm text-[#0f172a]">
                                    Prioritize {selectedBarangay.realName} Dredging
                                  </h4>
                                  <span className="bg-white/95 text-[#0f172a] font-black px-2 py-0.5 rounded-full text-[10px] shadow-2xs">
                                    • Priority
                                  </span>
                                </div>
                                <p className="text-xs text-[#0f172a]/85 mt-1 font-medium leading-relaxed">
                                  CBMS flood vulnerability {selectedBarangay.vulnerability_index}% with {selectedBarangay.infrastructure_ceo?.unimproved_toilet_pct || 14.2}% deficit in drainage sanitation.
                                </p>
                              </div>

                              <div className="mt-3 pt-2.5 border-t border-black/10 flex items-center justify-between">
                                <div className="flex items-center space-x-1.5">
                                  <span className="px-2 py-0.5 rounded-full bg-white/90 text-[#0f172a] text-[10px] font-bold shadow-2xs">
                                    2 Projects
                                  </span>
                                  <span className="px-2 py-0.5 rounded-full bg-white/90 text-[#0f172a] text-[10px] font-bold shadow-2xs">
                                    ~2 min SLA
                                  </span>
                                </div>
                                <div className="flex -space-x-1">
                                  <span className="w-5 h-5 rounded-full bg-[#05389f] text-white text-[9px] font-bold flex items-center justify-center border border-white">
                                    B
                                  </span>
                                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[9px] font-bold flex items-center justify-center border border-white">
                                    {selectedBarangayId}
                                  </span>
                                </div>
                              </div>

                              <button
                                onClick={() => {
                                  setIsAiOpen(true);
                                  executeAiQuery(`Draft comprehensive capital investment proposal for ${selectedBarangay.realName} drainage dredging under RA 7160`);
                                }}
                                className="mt-3 w-full py-2 rounded-xl bg-[#0f172a] hover:bg-[#1e293b] text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5 shadow-2xs"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-[#facc15]" />
                                <span>Synthesize {selectedBarangay.realName} Proposal</span>
                              </button>
                            </div>

                            {/* Sub-card 1: Set LDF Statutory Ceiling */}
                            <div className="bg-[#f7f8fa] p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                              <div>
                                <div className="text-xs font-bold text-slate-900">Set LDF Statutory Ceiling</div>
                                <div className="text-[10px] text-slate-500 mt-0.5">RA 7160 Sec. 287 minimum 20% dev fund baseline</div>
                                <div className="flex items-center space-x-2.5 mt-1.5 text-[10px] text-slate-600 font-medium">
                                  <span>₱{(aipBudgetCeiling / 1000000).toFixed(1)}M Ceiling</span>
                                  <span>2026 Mandate</span>
                                </div>
                              </div>
                              <button
                                onClick={() => setSidePanelTab("controls")}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
                                title="Go to Master Controls"
                              >
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Sub-card 2: Field Inspection Telemetry */}
                            <div className="bg-[#f7f8fa] p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                              <div>
                                <div className="text-xs font-bold text-slate-900">Field Inspection Telemetry</div>
                                <div className="text-[10px] text-slate-500 mt-0.5">{fieldReports.length} live reports synced from mobile officers</div>
                              </div>
                              <button
                                onClick={() => setActiveNavTab("executive_command")}
                                className="px-2.5 py-1 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-800 text-[10px] font-bold transition-colors cursor-pointer"
                              >
                                Verify →
                              </button>
                            </div>

                            {/* Sub-card 3: Emergency Command Telemetry */}
                            <div className="bg-rose-50/50 p-3 rounded-xl border border-rose-200/80 flex items-center justify-between">
                              <div>
                                <div className="text-xs font-bold text-rose-950 flex items-center space-x-1.5">
                                  <ShieldAlert className="w-3.5 h-3.5 text-rose-700" />
                                  <span>CDRRMO Emergency Dispatch</span>
                                </div>
                                <div className="text-[10px] text-rose-700 mt-0.5">Command Center (0908-525-3000)</div>
                              </div>
                              <a
                                href="tel:09085253000"
                                className="px-2.5 py-1 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold transition-colors cursor-pointer"
                              >
                                Dispatch
                              </a>
                            </div>
                          </div>
                        )}

                        {/* ── SUB-SECTION: DETECTED SIGNALS ── */}
                        {intelSubTab === "detected" && (
                          <div className="space-y-3 animate-in fade-in duration-150">
                            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                              <div className="flex items-center space-x-1.5">
                                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                                  Detected
                                </h4>
                                <span className="px-2 py-0.2 rounded-full text-[9px] font-mono font-bold bg-blue-50 text-[#05389f] border border-blue-200">
                                  Citywide &amp; Brgy
                                </span>
                              </div>
                              <button
                                onClick={() => {
                                  setIsAiOpen(true);
                                  executeAiQuery("Audit all detected anomaly clusters across Naga City 27 barangays");
                                }}
                                className="text-[10px] text-[#05389f] font-bold hover:underline flex items-center space-x-0.5 cursor-pointer"
                              >
                                <span>Audit All</span>
                                <span>↗</span>
                              </button>
                            </div>

                            {/* 2x2 Grid of Cards */}
                            <div className="grid grid-cols-2 gap-2.5">
                              <div className="bg-[#f7f8fa] p-3 rounded-2xl border border-slate-200 flex flex-col justify-between min-h-[92px]">
                                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                  <Globe className="w-3.5 h-3.5" />
                                </div>
                                <div className="mt-2">
                                  <div className="text-base font-extrabold text-slate-900 font-mono">27</div>
                                  <div className="text-[11px] font-bold text-slate-700">Barangays</div>
                                  <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">PSA CBMS mapped</div>
                                </div>
                              </div>

                              <div className="bg-[#f7f8fa] p-3 rounded-2xl border border-slate-200 flex flex-col justify-between min-h-[92px]">
                                <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                                  <Layers className="w-3.5 h-3.5" />
                                </div>
                                <div className="mt-2">
                                  <div className="text-base font-extrabold text-slate-900 font-mono">5</div>
                                  <div className="text-[11px] font-bold text-slate-700">Planning Sectors</div>
                                  <div className="text-[10px] text-purple-600 font-semibold mt-0.5">Statutory audit</div>
                                </div>
                              </div>

                              <div className="bg-[#f7f8fa] p-3 rounded-2xl border border-slate-200 flex flex-col justify-between min-h-[92px]">
                                <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#05389f] flex items-center justify-center">
                                  <Users className="w-3.5 h-3.5" />
                                </div>
                                <div className="mt-2">
                                  <div className="text-base font-extrabold text-slate-900 font-mono">44,892</div>
                                  <div className="text-[11px] font-bold text-slate-700">Households</div>
                                  <div className="text-[10px] text-blue-600 font-semibold mt-0.5">PSA validated</div>
                                </div>
                              </div>

                              <div className="bg-[#f7f8fa] p-3 rounded-2xl border border-slate-200 flex flex-col justify-between min-h-[92px]">
                                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                                  <Zap className="w-3.5 h-3.5" />
                                </div>
                                <div className="mt-2">
                                  <div className="text-base font-extrabold text-slate-900 font-mono">₱112.5M</div>
                                  <div className="text-[11px] font-bold text-slate-700">Hotspot Deficit</div>
                                  <div className="text-[10px] text-amber-600 font-semibold mt-0.5">4 High Priority Hotspots</div>
                                </div>
                              </div>
                            </div>

                            {/* Barangay-Specific Detected Metrics */}
                            <div className="bg-[#f7f8fa] p-3 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                                Detected for {selectedBarangay.realName}
                              </span>
                              <div className="grid grid-cols-2 gap-2 text-slate-700">
                                <div className="bg-white p-2 rounded-lg border border-slate-200">
                                  <span className="text-[10px] text-slate-400 block font-medium">Unimproved Sanitation</span>
                                  <span className="font-mono font-bold text-amber-700 text-xs">
                                    {selectedBarangay.infrastructure_ceo?.households_needing_sanitation || 0} HHs
                                  </span>
                                </div>
                                <div className="bg-white p-2 rounded-lg border border-slate-200">
                                  <span className="text-[10px] text-slate-400 block font-medium">Food Insecurity</span>
                                  <span className="font-mono font-bold text-rose-700 text-xs">
                                    {selectedBarangay.health_cho?.food_insecurity_count || 0} HHs
                                  </span>
                                </div>
                              </div>
                              <button
                                onClick={() => {
                                  setIsAiOpen(true);
                                  executeAiQuery(`Analyze detected risk anomalies for ${selectedBarangay.realName}`);
                                }}
                                className="w-full mt-1.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-[#05389f] text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center space-x-1"
                              >
                                <Bot className="w-3.5 h-3.5" />
                                <span>Audit Detected Anomalies with Copilot</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                  {/* TAB 2: MERGED EXECUTIVE MASTER CONTROLS */}
                  {sidePanelTab === "controls" && (
                    <div className="space-y-3 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                        <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                          Executive Master Controls
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#05389f] border border-blue-200 font-mono">
                          Mayor Authority
                        </span>
                      </div>

                      <div className="space-y-2 text-xs">
                        {/* Control 1: Cross-Office Data Federation */}
                        <div className="bg-[#f7f8fa] p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                          <div>
                            <div className="font-bold text-slate-900 text-xs">1. Cross-Office Data Federation</div>
                            <div className="text-[10px] text-slate-500">Unlocks DRRMO queries into CEO & CHO datasets</div>
                          </div>
                          <button
                            onClick={() => setCrossOfficeSharing(!crossOfficeSharing)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                              crossOfficeSharing
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                : "bg-slate-200 text-slate-600"
                            }`}
                          >
                            {crossOfficeSharing ? "ENABLED" : "LOCKED"}
                          </button>
                        </div>

                        {/* Control 2: AIP 20% Dev Fund Ceiling */}
                        <div className="bg-[#f7f8fa] p-2.5 rounded-xl border border-slate-200 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 text-xs">2. AIP 20% Dev Fund Ceiling</span>
                            <span className="font-mono font-bold text-[#05389f]">₱{(aipBudgetCeiling / 1000000).toFixed(1)}M</span>
                          </div>
                          <input
                            type="range"
                            min="20000000"
                            max="80000000"
                            step="5000000"
                            value={aipBudgetCeiling}
                            onChange={(e) => setAipBudgetCeiling(Number(e.target.value))}
                            className="w-full accent-[#05389f] cursor-pointer h-1.5"
                          />
                        </div>

                        {/* Control 3: Executive Sign-off Queue */}
                        <div className="bg-[#f7f8fa] p-2.5 rounded-xl border border-slate-200 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 text-xs">3. Executive Sign-Off Queue</span>
                            <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-[#fccf17] text-[#0a1128] font-mono">
                              {proposals.filter((p) => p.status === "PENDING").length} Pending
                            </span>
                          </div>
                          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                            {proposals.map((prop) => (
                              <div key={prop.id} className="p-2 bg-white rounded-lg border border-slate-200 space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-bold text-[#05389f]">{prop.office} • {prop.barangay}</span>
                                  <span className="font-mono text-[10px] font-bold text-slate-900">₱{prop.budget.toLocaleString()}</span>
                                </div>
                                <div className="text-[11px] font-bold text-slate-900 leading-tight">{prop.title}</div>
                                <div className="text-[9px] text-slate-400 font-mono">{prop.statute} ({prop.section})</div>
                                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                                  <span
                                    className={`text-[9px] font-bold px-2 py-0.2 rounded-full ${
                                      prop.status === "APPROVED"
                                        ? "bg-emerald-100 text-emerald-800"
                                        : prop.status === "FUNDED"
                                        ? "bg-blue-100 text-blue-800"
                                        : prop.status === "REJECTED"
                                        ? "bg-rose-100 text-rose-800"
                                        : "bg-amber-100 text-amber-800"
                                    }`}
                                  >
                                    {prop.status}
                                  </span>
                                  {prop.status === "PENDING" && (
                                    <div className="flex space-x-1">
                                      <button
                                        onClick={() => handleProposalAction(prop.id, "approve")}
                                        className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-[9px] font-bold cursor-pointer"
                                      >
                                        Approve
                                      </button>
                                      <button
                                        onClick={() => handleProposalAction(prop.id, "reject")}
                                        className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-[9px] font-bold cursor-pointer"
                                      >
                                        Reject
                                      </button>
                                    </div>
                                  )}
                                  {prop.status === "APPROVED" && (
                                    <button
                                      onClick={() => handleProposalAction(prop.id, "fund")}
                                      className="px-2 py-0.5 bg-[#05389f] text-white rounded-full text-[9px] font-bold cursor-pointer"
                                    >
                                      Allot Budget
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Control 4: RA 10173 Privacy Shield */}
                        <div className="bg-[#f7f8fa] p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                          <div>
                            <div className="font-bold text-slate-900 text-xs">4. RA 10173 Privacy Shield</div>
                            <div className="text-[10px] text-slate-500">Suppresses cells &lt; {privacyCellThreshold} households</div>
                          </div>
                          <div className="flex items-center space-x-1">
                            {[3, 5, 10].map((val) => (
                              <button
                                key={val}
                                onClick={() => setPrivacyCellThreshold(val)}
                                className={`w-6 h-6 rounded-md text-[10px] font-bold cursor-pointer transition-all ${
                                  privacyCellThreshold === val
                                    ? "bg-[#05389f] text-white"
                                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                                }`}
                              >
                                {val}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Control 5: 3D Flood Surge Simulation */}
                        <div className="bg-[#f7f8fa] p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                          <div>
                            <div className="font-bold text-slate-900 text-xs">5. 3D Flood Surge Simulation</div>
                            <div className="text-[10px] text-slate-500">Renders Level 3 inundation hazard</div>
                          </div>
                          <button
                            onClick={() => setCalamitySimActive(!calamitySimActive)}
                            className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                              calamitySimActive
                                ? "bg-rose-600 text-white animate-pulse"
                                : "bg-rose-100 text-rose-700 hover:bg-rose-200"
                            }`}
                          >
                            {calamitySimActive ? "Surge Active" : "Simulate"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ─────────────────────────────────────────────────────────────
              5. LOWER SPLIT SECTION: ROLE WORKBENCH & 27 BARANGAYS MATRIX
             ───────────────────────────────────────────────────────────── */}
          <div id="lower-split-section" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column (5 Cols): Department Domain-Isolated Control Deck (Non-super_admin roles) */}
            {role !== "super_admin" && (
              <section className="lg:col-span-5 space-y-5">
                {/* Active Role Banner */}
                <div className="coolors-card p-4 border border-[#e5e7eb]">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2.5 rounded-xl ${currentRole.color}`}>
                      <CurrentIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#0a1128]">
                        {currentRole.label}
                      </h3>
                      <p className="text-[11px] text-[#4b5563] mt-0.5 font-medium">
                        {role === "ceo"
                          ? "Infrastructure Sizer & Capital Costing Simulator"
                          : role === "cpdo"
                          ? "17 UN SDG Auditor & Survey Anomaly Log"
                          : role === "drrmo"
                          ? "Disaster Inundation & Bikol Emergency Dispatch"
                          : role === "cho"
                          ? "Epidemiological & WASH Surveillance"
                          : role === "swo"
                          ? "4Ps Safety Net & Youth NEET Placement"
                          : "Department Operations"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* DEPARTMENT ROLE WORKBENCHES (CEO, CPDO, DRRMO, CHO, SWO, BRGY CAPTAIN, CITIZEN) */}
                {role === "ceo" && (
                  <div className="coolors-card p-5 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-[#f2f2f2]">
                      <h4 className="text-xs font-bold text-[#0a1128] uppercase tracking-wider">
                        CEO Infrastructure & WASH Sizer
                      </h4>
                      <span className="text-[10px] font-bold text-[#05389f] bg-[#edf3fc] px-2.5 py-0.5 rounded-full">
                        {selectedBarangay.realName}
                      </span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[#0a1128]">Sanitation Unit Cost per HH</span>
                        <span className="font-mono font-bold text-[#05389f]">₱{sanitationUnitCost.toLocaleString()}</span>
                      </div>
                      <input
                        type="range"
                        min={10000}
                        max={50000}
                        step={2500}
                        value={sanitationUnitCost}
                        onChange={(e) => setSanitationUnitCost(Number(e.target.value))}
                        className="w-full accent-[#05389f] h-1.5 cursor-pointer"
                      />
                      <div className="p-3 rounded-xl bg-[#f2f2f2] border border-[#e5e7eb] space-y-1">
                        <div className="flex justify-between">
                          <span className="text-[#6b7280]">Unimproved Sanitation HHs:</span>
                          <span className="font-mono font-bold text-[#0a1128]">
                            {selectedBarangay.infrastructure_ceo?.households_needing_sanitation || 0} HHs
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#6b7280]">Estimated Capital Cost:</span>
                          <span className="font-mono font-bold text-emerald-700">
                            ₱{((selectedBarangay.infrastructure_ceo?.households_needing_sanitation || 0) * sanitationUnitCost).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {role === "cpdo" && (
                  <div className="coolors-card p-5 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-[#f2f2f2]">
                      <h4 className="text-xs font-bold text-[#0a1128] uppercase tracking-wider">
                        17 UN SDG Localization Matrix
                      </h4>
                      <span className="text-[10px] font-bold text-[#05389f] bg-[#edf3fc] px-2.5 py-0.5 rounded-full">
                        {selectedBarangay.realName} • RA 11315
                      </span>
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1 text-xs">
                      {Object.entries(selectedBarangay.sdg_scores || {}).map(([goalName, scoreVal]: [string, any]) => {
                        const numScore = Number(scoreVal) || 0;
                        const status = numScore < 50 ? "CRITICAL" : numScore < 75 ? "HIGH PRIORITY" : "ON TRACK";
                        return (
                          <div key={goalName} className="p-2.5 rounded-xl bg-[#f2f2f2] border border-[#e5e7eb] flex items-center justify-between">
                            <div>
                              <div className="font-bold text-[#0a1128]">{goalName}</div>
                              <div className="text-[10px] text-[#4b5563]">Empirical Index Score: {numScore} / 100</div>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              status === "CRITICAL" ? "bg-rose-100 text-rose-800" : status === "HIGH PRIORITY" ? "bg-[#fef9e7] text-[#b45309]" : "bg-emerald-100 text-emerald-800"
                            }`}>
                              {status}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {role === "drrmo" && (
                  <div className="coolors-card p-5 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-[#f2f2f2]">
                      <h4 className="text-xs font-bold text-[#0a1128] uppercase tracking-wider">
                        DRRMO Bikol SMS Early Warning
                      </h4>
                      <button
                        onClick={() => setCalamitySimActive(!calamitySimActive)}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer ${
                          calamitySimActive ? "bg-rose-600 text-white animate-pulse" : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {calamitySimActive ? "Surge Active" : "Trigger Surge"}
                      </button>
                    </div>
                    <p className="text-xs text-[#4b5563] bg-[#fef9e7] p-3 rounded-xl border border-[#fccf17]">
                      [NAGA-DRRMO] Patanid sa Brgy {selectedBarangay.realName}: Mag-andam sa posibleng pagbaha asin ebakwasyon. Weak Roof: {selectedBarangay.drrm?.weak_roof_pct}%.
                    </p>
                    <button
                      onClick={() => {
                        setIsAiOpen(true);
                        executeAiQuery(`Formulate RA 10121 BDRRM evacuation and shelter reinforcement plan for ${selectedBarangay.displayName}`);
                      }}
                      className="pill-btn-blue w-full py-2 text-xs font-bold cursor-pointer"
                    >
                      Synthesize RA 10121 Dispatch for {selectedBarangay.realName}
                    </button>
                  </div>
                )}

                {(role === "cho" || role === "swo") && (
                  <div className="coolors-card p-5 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-[#f2f2f2]">
                      <h4 className="text-xs font-bold text-[#0a1128] uppercase tracking-wider">
                        {role === "cho"
                          ? "CHO Health & Nutrition Surveillance"
                          : "CSWDO 4Ps & Youth NEET Registry"}
                      </h4>
                      <span className="text-[10px] font-bold text-[#05389f] bg-[#edf3fc] px-2.5 py-0.5 rounded-full">
                        {selectedBarangay.realName}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-[#f2f2f2] border border-[#e5e7eb]">
                        <span className="text-[10px] text-[#6b7280] font-bold block">Food Insecure HHs</span>
                        <span className="font-mono font-bold text-rose-700 text-sm">
                          {selectedBarangay.health_cho?.food_insecurity_count} ({selectedBarangay.health_cho?.food_insecurity_pct}%)
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#f2f2f2] border border-[#e5e7eb]">
                        <span className="text-[10px] text-[#6b7280] font-bold block">Youth NEET / Unbanked</span>
                        <span className="font-mono font-bold text-[#05389f] text-sm">
                          {selectedBarangay.social_swo?.neet_youth_pct}% / {selectedBarangay.social_swo?.unbanked_pct}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* Right Column: 27 Barangays Interactive Matrix & Category Filters (Expands to 12 Cols for super_admin) */}
            <section className={role === "super_admin" ? "lg:col-span-12 space-y-5" : "lg:col-span-7 space-y-5"}>
              <div className="coolors-card p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#f2f2f2]">
                  <div>
                    <h3 className="text-sm font-bold text-[#0a1128]">
                      All 27 Naga City Barangays Diagnostic Matrix
                    </h3>
                    <p className="text-xs text-[#4b5563] mt-0.5">
                      Categorized by CLUP functional and ecological planning sectors • Click column headers to sort
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 rounded-full bg-[#edf3fc] text-[#05389f] text-xs font-bold font-mono border border-[#05389f]/20">
                      {filteredBarangays.length} / 27 Displayed
                    </span>
                    <button
                      onClick={() => setIsMatrixMinimized(!isMatrixMinimized)}
                      className="flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#f2f2f2] text-[#0a1128] hover:bg-slate-200 transition-colors cursor-pointer border border-[#e5e7eb]"
                      title={isMatrixMinimized ? "Expand 27 Barangays Matrix" : "Minimize 27 Barangays Matrix"}
                    >
                      {isMatrixMinimized ? (
                        <>
                          <ChevronDown className="w-3.5 h-3.5 text-[#05389f]" />
                          <span>Expand</span>
                        </>
                      ) : (
                        <>
                          <ChevronUp className="w-3.5 h-3.5 text-[#05389f]" />
                          <span>Minimize</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Category Filter Chips (All 5 Categories + All 27) */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const isActive = selectedCategoryFilter === cat.id;

                    return (
                      <button
                        key={cat.id}
                        onClick={() => handleSelectCategory(cat.id)}
                        className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          isActive
                            ? "bg-[#05389f] text-white shadow-xs"
                            : "bg-[#f2f2f2] text-[#4b5563] hover:text-[#0a1128] hover:bg-slate-200"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" style={{ color: isActive ? "#fccf17" : cat.color }} />
                        <span>{cat.short}</span>
                        <span className="text-[10px] px-1 rounded-full font-mono" style={{ backgroundColor: isActive ? "rgba(255,255,255,0.2)" : "#e5e7eb" }}>
                          {cat.count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Barangay Rows Table */}
                {!isMatrixMinimized && (
                  <>
                    <div className="overflow-x-auto max-h-[460px] overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#f2f2f2] text-[#4b5563] uppercase text-[10px] font-bold sticky top-0 z-10 border-b border-[#e5e7eb]">
                        <tr>
                          <th
                            onClick={() => {
                              if (sortBy === "name") setSortDesc(!sortDesc);
                              else { setSortBy("name"); setSortDesc(false); }
                            }}
                            className="py-2.5 px-3 cursor-pointer hover:text-[#05389f] select-none"
                          >
                            Barangay {sortBy === "name" ? (sortDesc ? "↓" : "↑") : ""}
                          </th>
                          <th
                            onClick={() => {
                              if (sortBy === "category") setSortDesc(!sortDesc);
                              else { setSortBy("category"); setSortDesc(false); }
                            }}
                            className="py-2.5 px-3 cursor-pointer hover:text-[#05389f] select-none"
                          >
                            Category / District {sortBy === "category" ? (sortDesc ? "↓" : "↑") : ""}
                          </th>
                          <th
                            onClick={() => {
                              if (sortBy === "mvi") setSortDesc(!sortDesc);
                              else { setSortBy("mvi"); setSortDesc(true); }
                            }}
                            className="py-2.5 px-3 cursor-pointer hover:text-[#05389f] select-none"
                          >
                            MVI Score {sortBy === "mvi" ? (sortDesc ? "↓" : "↑") : ""}
                          </th>
                          <th
                            onClick={() => {
                              if (sortBy === "households") setSortDesc(!sortDesc);
                              else { setSortBy("households"); setSortDesc(true); }
                            }}
                            className="py-2.5 px-3 cursor-pointer hover:text-[#05389f] select-none"
                          >
                            Households {sortBy === "households" ? (sortDesc ? "↓" : "↑") : ""}
                          </th>
                          <th className="py-2.5 px-3">
                            {role === "drrmo"
                              ? "Weak Roof %"
                              : role === "cho"
                              ? "Food Insecure %"
                              : role === "swo"
                              ? "Youth NEET %"
                              : "Refilling %"}
                          </th>
                          <th className="py-2.5 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#f2f2f2]">
                        {paginatedBarangays.map((b: any) => {
                          const rName = NAGA_BARANGAY_NAMES[b.id] || b.name;
                          const cat = BARANGAY_CATEGORIES[b.id];
                          const isSelected = b.id === selectedBarangayId;

                          return (
                            <tr
                              key={b.id}
                              onClick={() => handleSelectBarangay(b.id)}
                              className={`cursor-pointer transition-colors ${
                                isSelected
                                  ? "bg-[#edf3fc] font-bold border-l-4 border-[#05389f]"
                                  : "hover:bg-[#f2f2f2]"
                              }`}
                            >
                              <td className="py-2.5 px-3">
                                <div className="flex items-center space-x-2">
                                  <span
                                    className="w-3 h-3 rounded-xs shrink-0 border border-black/20 shadow-xs"
                                    style={{ backgroundColor: NAGA_ADMIN_COLORS[b.id]?.hex || "#05389f" }}
                                  />
                                  <span className="font-mono text-[#6b7280] text-[10px]">#{b.id}</span>
                                  <span className="text-[#0a1128] font-bold">{rName}</span>
                                </div>
                              </td>
                              <td className="py-2.5 px-3">
                                {cat && (
                                  <span
                                    className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                                    style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                                  >
                                    <span>{cat.icon}</span>
                                    <span>{cat.short}</span>
                                  </span>
                                )}
                              </td>
                              <td className="py-2.5 px-3">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                                    b.vulnerability_index > 70
                                      ? "bg-rose-100 text-rose-800"
                                      : b.vulnerability_index > 50
                                      ? "bg-[#fef9e7] text-[#b45309]"
                                      : "bg-emerald-100 text-emerald-800"
                                  }`}
                                >
                                  {b.vulnerability_index}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 font-mono text-[#4b5563]">
                                {b.total_households?.toLocaleString()}
                              </td>
                              <td className="py-2.5 px-3 font-mono text-[#4b5563]">
                                {role === "drrmo"
                                  ? `${b.drrm?.weak_roof_pct}%`
                                  : role === "cho"
                                  ? `${b.health_cho?.food_insecurity_pct}%`
                                  : role === "swo"
                                  ? `${b.social_swo?.neet_youth_pct}%`
                                  : `${b.infrastructure_ceo?.drinking_refilling_pct}%`}
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                <span className="text-[11px] text-[#05389f] font-bold hover:underline">
                                  {isSelected ? "Active" : "Focus →"}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Sleek Modern Pill Pagination Bar (Matches User Screenshot) */}
                  <div className="pt-3.5 border-t border-[#f2f2f2] flex flex-wrap items-center justify-between gap-3 text-xs">
                    {/* Left: Previous Button & Circular Numeric Badges */}
                    <div className="flex items-center space-x-1 bg-[#f7f8fa] p-1 rounded-full border border-[#e5e7eb] shadow-2xs">
                      <button
                        onClick={() => setTablePage(Math.max(1, currentTablePage - 1))}
                        disabled={currentTablePage <= 1}
                        className="flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-semibold text-[#4b5563] hover:text-[#0a1128] hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Previous</span>
                      </button>

                      {/* Numbered Circle Badges */}
                      {Array.from({ length: totalTablePages }, (_, i) => i + 1).map((pageNum) => {
                        const isCurrent = pageNum === currentTablePage;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setTablePage(pageNum)}
                            className={`w-7 h-7 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                              isCurrent
                                ? "bg-[#05389f] text-white shadow-sm"
                                : "text-[#4b5563] hover:bg-white hover:text-[#0a1128]"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                      <button
                        onClick={() => setTablePage(Math.min(totalTablePages, currentTablePage + 1))}
                        disabled={currentTablePage >= totalTablePages}
                        className="flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-semibold text-[#4b5563] hover:text-[#0a1128] hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
                      >
                        <span className="hidden sm:inline">Next</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Right: Showing X of Y results + Page Size Toggle */}
                    <div className="flex items-center space-x-3 text-xs text-[#6b7280]">
                      <span>
                        Showing <strong className="text-[#0a1128] font-mono">{filteredBarangays.length === 0 ? 0 : (currentTablePage - 1) * tablePageSize + 1}</strong>–<strong className="text-[#0a1128] font-mono">{Math.min(currentTablePage * tablePageSize, filteredBarangays.length)}</strong> of <strong className="text-[#0a1128] font-mono">{filteredBarangays.length}</strong> results
                      </span>

                      <div className="flex items-center space-x-1 bg-[#f2f2f2] p-0.5 rounded-lg border border-[#e5e7eb]">
                        {[6, 8, 9, 27].map((size) => (
                          <button
                            key={size}
                            onClick={() => {
                              setTablePageSize(size);
                              setTablePage(1);
                            }}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold font-mono transition-colors cursor-pointer ${
                              tablePageSize === size
                                ? "bg-white text-[#05389f] shadow-2xs"
                                : "text-[#6b7280] hover:text-[#0a1128]"
                            }`}
                          >
                            {size === 27 ? "All" : size}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
              </div>
            </section>
          </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════
              WORKSPACE 2: MANAGING 5 DEPARTMENTS (CPDO, DRRMO, CEO, CHO, SWO)
             ═════════════════════════════════════════════════════════════ */}
          {activeNavTab === "departments" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Department Header & Selector */}
              <div className="coolors-card p-5">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#f2f2f2]">
                  <div>
                    <h2 className="text-lg font-black text-[#0a1128] flex items-center space-x-2">
                      <Building2 className="w-5 h-5 text-[#05389f]" />
                      <span>LGU Department Intelligence & Data Management Hub</span>
                    </h2>
                    <p className="text-xs text-[#4b5563] mt-0.5">
                      Direct executive data access, statutory indicators, anomaly audits & gap-costing simulators for Naga City&apos;s 5 line departments.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {[
                      { id: "cpdo", name: "CPDO Planning", icon: Compass, color: "#05389f" },
                      { id: "drrmo", name: "DRRMO Disaster", icon: Flame, color: "#d97706" },
                      { id: "ceo", name: "CEO Engineering", icon: Building2, color: "#0284c7" },
                      { id: "cho", name: "CHO Health", icon: Activity, color: "#10b981" },
                      { id: "swo", name: "CSWDO Welfare", icon: HeartHandshake, color: "#7c3aed" }
                    ].map((dept) => {
                      const Icon = dept.icon;
                      const isActive = selectedDeptTab === dept.id;
                      return (
                        <button
                          key={dept.id}
                          onClick={() => {
                            setSelectedDeptTab(dept.id as any);
                            setRole(dept.id as any);
                          }}
                          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isActive
                              ? "bg-[#05389f] text-white shadow-md shadow-blue-900/20"
                              : "bg-[#f2f2f2] text-[#4b5563] hover:text-[#0a1128] hover:bg-slate-200"
                          }`}
                        >
                          <Icon className="w-4 h-4" style={{ color: isActive ? "#fccf17" : dept.color }} />
                          <span>{dept.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Department Overview Banner */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="bg-[#f7f8fa] p-3.5 rounded-xl border border-[#e5e7eb]">
                    <span className="text-[10px] uppercase font-bold text-[#6b7280]">Target Statutory Mandates</span>
                    <div className="font-bold text-[#0a1128] mt-1">
                      {selectedDeptTab === "cpdo" && "RA 7160 (Sec. 106 - CDP/CLUP) • RA 11315 (CBMS Act)"}
                      {selectedDeptTab === "drrmo" && "RA 10121 (DRRM Act Sec. 12) • NDRRMC Framework"}
                      {selectedDeptTab === "ceo" && "PD 1096 (National Building Code) • RA 7160 (Sec. 17)"}
                      {selectedDeptTab === "cho" && "RA 11223 (Universal Health Care Act Sec. 19)"}
                      {selectedDeptTab === "swo" && "RA 11310 (4Ps Act) • Magna Carta of Women (GAD 5%)"}
                    </div>
                  </div>
                  <div className="bg-[#f7f8fa] p-3.5 rounded-xl border border-[#e5e7eb]">
                    <span className="text-[10px] uppercase font-bold text-[#6b7280]">Active CBMS Focus</span>
                    <div className="font-bold text-[#0a1128] mt-1 font-mono">
                      {selectedDeptTab === "cpdo" && "17 SDGs Gaps • 27 Barangays Typology Clusters"}
                      {selectedDeptTab === "drrmo" && "Weak Roof Ratio • Evacuation Capacity • Food Rations"}
                      {selectedDeptTab === "ceo" && "Water Connections • Unimproved Toilets • Gap Costing"}
                      {selectedDeptTab === "cho" && "WASH Disease Index • 1,459 Food Insecurity Outliers"}
                      {selectedDeptTab === "swo" && "Youth NEET (15-24) • Unbanked Households • AICS"}
                    </div>
                  </div>
                  <div className="bg-[#f7f8fa] p-3.5 rounded-xl border border-[#e5e7eb] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#6b7280]">Focus Barangay</span>
                      <div className="font-bold text-[#05389f] mt-1">{selectedBarangay.realName} (#{selectedBarangay.id})</div>
                    </div>
                    <button
                      onClick={() => {
                        setIsAiOpen(true);
                        executeAiQuery(`Synthesize ${selectedDeptTab.toUpperCase()} evidence-based intervention for ${selectedBarangay.realName}`);
                      }}
                      className="pill-btn-blue px-3 py-1 text-xs font-bold flex items-center space-x-1 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#fccf17]" />
                      <span>Synthesize</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* CPDO View */}
              {selectedDeptTab === "cpdo" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="coolors-card p-5 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-[#f2f2f2]">
                      <div>
                        <h3 className="text-sm font-bold text-[#0a1128]">17 UN Sustainable Development Goals Localization Scorecard</h3>
                        <p className="text-[11px] text-[#4b5563]">Computed across 67 CBMS indicators for {selectedBarangay.realName}</p>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-[#edf3fc] text-[#05389f]">
                        RA 11315
                      </span>
                    </div>

                    <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1 text-xs">
                      {Object.entries(selectedBarangay.sdg_scores || {}).map(([goalName, scoreVal]: [string, any]) => {
                        const score = Number(scoreVal) || 0;
                        const status = score < 50 ? "CRITICAL GAP" : score < 75 ? "NEEDS ACCELERATION" : "ON TRACK";
                        return (
                          <div key={goalName} className="p-3 rounded-xl bg-[#f7f8fa] border border-[#e5e7eb] space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[#0a1128]">{goalName}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                score < 50 ? "bg-rose-100 text-rose-800" : score < 75 ? "bg-[#fef9e7] text-[#b45309]" : "bg-emerald-100 text-emerald-800"
                              }`}>
                                {status} ({score} / 100)
                              </span>
                            </div>
                            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${score < 50 ? "bg-rose-600" : score < 75 ? "bg-amber-500" : "bg-emerald-500"}`}
                                style={{ width: `${score}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="coolors-card p-5 space-y-3">
                    <h3 className="text-sm font-bold text-[#0a1128] pb-2 border-b border-[#f2f2f2]">
                      Barangay Soft-Clustering Typology (CLUP Sector Alignment)
                    </h3>
                    <p className="text-xs text-[#4b5563]">
                      Classifies 27 barangays into 5 functional planning typologies to prevent rigid single-sector zoning.
                    </p>
                    <div className="space-y-2 pt-1 text-xs">
                      {CATEGORIES.filter((c) => c.id !== "all").map((cat) => (
                        <div key={cat.id} className="p-3 rounded-xl bg-[#f7f8fa] border border-[#e5e7eb] flex items-center justify-between">
                          <div className="flex items-center space-x-2.5">
                            <span className="text-base">{cat.id === "upland" ? "⛰️" : cat.id === "cbd" ? "🏢" : cat.id === "poblacion" ? "🏛️" : cat.id === "riverine" ? "🌊" : "🏥"}</span>
                            <div>
                              <div className="font-bold text-[#0a1128]">{cat.name}</div>
                              <div className="text-[10px] text-[#6b7280]">{cat.description}</div>
                            </div>
                          </div>
                          <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-white border border-[#e5e7eb] text-[#05389f]">
                            {cat.count} Brgys
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* CEO View */}
              {selectedDeptTab === "ceo" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="coolors-card p-5 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-[#f2f2f2]">
                      <div>
                        <h3 className="text-sm font-bold text-[#0a1128]">City Engineer&apos;s Gap-Costing Simulator</h3>
                        <p className="text-[11px] text-[#4b5563]">Simulate capital budget required to close infrastructure deficits</p>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-[#edf3fc] text-[#05389f]">
                        PD 1096
                      </span>
                    </div>

                    <div className="space-y-4 text-xs">
                      <div className="p-3.5 rounded-xl bg-[#f7f8fa] border border-[#e5e7eb] space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-[#0a1128]">Unit Cost per Sanitary Toilet Facility</span>
                          <span className="font-mono text-[#05389f] font-bold text-sm">₱{sanitationUnitCost.toLocaleString()}</span>
                        </div>
                        <input
                          type="range"
                          min={15000}
                          max={50000}
                          step={2500}
                          value={sanitationUnitCost}
                          onChange={(e) => setSanitationUnitCost(Number(e.target.value))}
                          className="w-full accent-[#05389f] h-2 cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-[#6b7280]">
                          <span>₱15,000 (Basic Pit)</span>
                          <span>₱30,000 (Water-Sealed)</span>
                          <span>₱50,000 (Septic Tank Vault)</span>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-[#edf3fc] border border-[#05389f]/20 space-y-2">
                        <div className="text-xs font-bold text-[#05389f]">Citywide Sanitation Budget Required</div>
                        <div className="text-2xl font-black text-[#0a1128] font-mono">
                          ₱{(citywideSanitationDeficit * sanitationUnitCost).toLocaleString()}
                        </div>
                        <p className="text-[11px] text-[#4b5563]">
                          To provide improved individual sanitary toilets to all {citywideSanitationDeficit.toLocaleString()} deficit households across Naga City.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-[#f7f8fa] border border-[#e5e7eb] space-y-2">
                        <span className="font-bold text-[#0a1128] block">Focus: {selectedBarangay.realName} Infrastructure Needs</span>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-white p-2.5 rounded-lg border border-[#e5e7eb]">
                            <span className="text-[10px] text-[#6b7280] block">Toilets Needed</span>
                            <span className="text-sm font-bold text-[#0a1128] font-mono">
                              {selectedBarangay.infrastructure_ceo?.households_needing_sanitation || 0} HHs
                            </span>
                          </div>
                          <div className="bg-white p-2.5 rounded-lg border border-[#e5e7eb]">
                            <span className="text-[10px] text-[#6b7280] block">Barangay Budget</span>
                            <span className="text-sm font-bold text-emerald-700 font-mono">
                              ₱{((selectedBarangay.infrastructure_ceo?.households_needing_sanitation || 0) * sanitationUnitCost).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="coolors-card p-5 space-y-4">
                    <h3 className="text-sm font-bold text-[#0a1128] pb-2 border-b border-[#f2f2f2]">
                      Water Source Transition Advisor (Piped vs Commercial Refilling)
                    </h3>
                    <p className="text-xs text-[#4b5563]">
                      Identifies barangays overly reliant on commercial refilling stations vs Level III piped municipal water.
                    </p>
                    <div className="space-y-2.5 text-xs">
                      {barangays.slice(0, 7).map((b: any) => (
                        <div key={b.id} className="p-3 rounded-xl bg-[#f7f8fa] border border-[#e5e7eb] flex items-center justify-between">
                          <div>
                            <div className="font-bold text-[#0a1128]">{NAGA_BARANGAY_NAMES[b.id]}</div>
                            <div className="text-[10px] text-[#6b7280]">
                              Refilling: {b.infrastructure_ceo?.drinking_refilling_pct}% • Piped: {100 - (b.infrastructure_ceo?.drinking_refilling_pct || 50)}%
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            b.infrastructure_ceo?.drinking_refilling_pct > 75 ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"
                          }`}>
                            {b.infrastructure_ceo?.drinking_refilling_pct > 75 ? "Pipeline Priority" : "Acceptable"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* DRRMO View */}
              {selectedDeptTab === "drrmo" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="coolors-card p-5 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-[#f2f2f2]">
                      <div>
                        <h3 className="text-sm font-bold text-[#0a1128]">DRRMO Disaster Rations & Relief Calculator</h3>
                        <p className="text-[11px] text-[#4b5563]">Computes emergency relief supplies for 3-day and 7-day typhoon response</p>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-[#fef9e7] text-[#b45309]">
                        RA 10121
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-[#fef9e7] border border-[#fccf17] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#0a1128] text-xs">Emergency Target: {selectedBarangay.realName}</span>
                        <button
                          onClick={() => setCalamitySimActive(!calamitySimActive)}
                          className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                            calamitySimActive ? "bg-rose-600 text-white animate-pulse" : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {calamitySimActive ? "Storm Surge Simulated" : "Trigger Surge Mode"}
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="bg-white p-2.5 rounded-lg border border-[#e5e7eb] text-center">
                          <span className="text-[10px] text-[#6b7280] block">Family Food Packs</span>
                          <span className="text-sm font-bold text-[#0a1128] font-mono">
                            {((selectedBarangay.total_households || 1000) * (calamitySimActive ? 1.5 : 1)).toFixed(0)} packs
                          </span>
                        </div>
                        <div className="bg-white p-2.5 rounded-lg border border-[#e5e7eb] text-center">
                          <span className="text-[10px] text-[#6b7280] block">Water Jerrycans</span>
                          <span className="text-sm font-bold text-[#05389f] font-mono">
                            {((selectedBarangay.total_households || 1000) * 2).toLocaleString()} jugs
                          </span>
                        </div>
                        <div className="bg-white p-2.5 rounded-lg border border-[#e5e7eb] text-center">
                          <span className="text-[10px] text-[#6b7280] block">Fuel Gallons</span>
                          <span className="text-sm font-bold text-amber-800 font-mono">
                            {((selectedBarangay.total_households || 1000) * 0.4).toFixed(0)} gals
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#f7f8fa] border border-[#e5e7eb] space-y-2 text-xs">
                      <span className="font-bold text-[#0a1128] block">Contextual Broadcast Warning in Bikol (Camarines Sur Dialect)</span>
                      <p className="text-xs text-[#4b5563] bg-white p-3 rounded-lg border border-[#e5e7eb] font-sans italic">
                        &quot;Patanid sa Gabos na Residente kan Brgy {selectedBarangay.realName}: Ihanda an mga pamilya para sa posibleng pagbaha kan salog asin makusog na uran. Mag-ebakwar tulos sa opisyal na evacuation shelter.&quot;
                      </p>
                    </div>
                  </div>

                  <div className="coolors-card p-5 space-y-4">
                    <h3 className="text-sm font-bold text-[#0a1128] pb-2 border-b border-[#f2f2f2]">
                      Housing Structural Ranking (Makeshift / Weak Roof Materials)
                    </h3>
                    <p className="text-xs text-[#4b5563]">
                      Ranks barangays with highest percentage of light or salvaged roofing vulnerable to typhoon winds.
                    </p>
                    <div className="space-y-2 text-xs">
                      {barangays.slice(0, 7).map((b: any) => (
                        <div key={b.id} className="p-3 rounded-xl bg-[#f7f8fa] border border-[#e5e7eb] flex items-center justify-between">
                          <div>
                            <div className="font-bold text-[#0a1128]">{NAGA_BARANGAY_NAMES[b.id]}</div>
                            <div className="text-[10px] text-[#6b7280]">
                              Weak Roof: {b.drrm?.weak_roof_pct}% • Evacuation Shelter: {b.drrm?.evacuation_capacity_pct}%
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            b.drrm?.weak_roof_pct > 30 ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"
                          }`}>
                            {b.drrm?.weak_roof_pct > 30 ? "High Hazard" : "Moderate"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* CHO View */}
              {selectedDeptTab === "cho" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="coolors-card p-5 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-[#f2f2f2]">
                      <div>
                        <h3 className="text-sm font-bold text-[#0a1128]">City Health Office WASH Disease Surveillance</h3>
                        <p className="text-[11px] text-[#4b5563]">Water quality, open defecation risk & refilling station bacteriological sampling</p>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-emerald-100 text-emerald-800">
                        RA 11223
                      </span>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="p-3.5 rounded-xl bg-[#f7f8fa] border border-[#e5e7eb] flex justify-between items-center">
                        <div>
                          <span className="font-bold text-[#0a1128]">Water Testing Priority: {selectedBarangay.realName}</span>
                          <span className="text-[10px] text-[#6b7280] block">Commercial refilling station dependence: {selectedBarangay.infrastructure_ceo?.drinking_refilling_pct}%</span>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#edf3fc] text-[#05389f]">
                          Schedule Test
                        </span>
                      </div>

                      <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 space-y-1">
                        <span className="text-xs font-bold text-rose-800">Verified Statistical Food Insecurity Reading</span>
                        <p className="text-xs text-rose-700">
                          Brgy Mabolo recorded 1,459 households expressing moderate-to-severe food insecurity. Requires nutritional intervention mission.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="coolors-card p-5 space-y-4">
                    <h3 className="text-sm font-bold text-[#0a1128] pb-2 border-b border-[#f2f2f2]">
                      Senior Citizen Health & PhilHealth Outreach Planner
                    </h3>
                    <p className="text-xs text-[#4b5563]">
                      Deploys mobile medical missions to barangays with elevated senior population clusters and lower coverage.
                    </p>
                    <div className="space-y-2 text-xs">
                      {barangays.slice(0, 7).map((b: any) => (
                        <div key={b.id} className="p-3 rounded-xl bg-[#f7f8fa] border border-[#e5e7eb] flex items-center justify-between">
                          <div>
                            <div className="font-bold text-[#0a1128]">{NAGA_BARANGAY_NAMES[b.id]}</div>
                            <div className="text-[10px] text-[#6b7280]">
                              Seniors: {Math.round((b.total_population || 5000) * 0.08)} • Children &lt;5: {Math.round((b.total_population || 5000) * 0.11)}
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white border border-[#e5e7eb] text-[#05389f]">
                            Clinic Ready
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* CSWDO View */}
              {selectedDeptTab === "swo" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="coolors-card p-5 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-[#f2f2f2]">
                      <div>
                        <h3 className="text-sm font-bold text-[#0a1128]">CSWDO 4Ps & Social Protection Targeting</h3>
                        <p className="text-[11px] text-[#4b5563]">Targeting vulnerable households, unbanked residents, and out-of-school youth</p>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-purple-100 text-purple-800">
                        RA 11310
                      </span>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="p-3.5 rounded-xl bg-[#f7f8fa] border border-[#e5e7eb] space-y-2">
                        <span className="font-bold text-[#0a1128] block">NEET Youth (Not in Education, Employment or Training)</span>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-[#6b7280]">{selectedBarangay.realName} Youth NEET Rate:</span>
                          <span className="font-mono font-bold text-[#05389f]">{selectedBarangay.social_swo?.neet_youth_pct || 14.2}%</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-[#6b7280]">Unbanked Households (Requiring Cash-in-Hand):</span>
                          <span className="font-mono font-bold text-amber-800">{selectedBarangay.social_swo?.unbanked_pct || 28.5}%</span>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200">
                        <span className="text-xs font-bold text-purple-800 block">Gender & Development (GAD) 5% Mandatory Utilization</span>
                        <p className="text-xs text-purple-700 mt-1">
                          Ensures statutory 5% allocation for women-led livelihood enterprises, maternal support, and daycare centers per RA 9710.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="coolors-card p-5 space-y-4">
                    <h3 className="text-sm font-bold text-[#0a1128] pb-2 border-b border-[#f2f2f2]">
                      Cash-Aid Payout Channel Advisor
                    </h3>
                    <p className="text-xs text-[#4b5563]">
                      Determines which barangays are ready for GCash/Maya digital transfers vs requiring physical cash disbursement teams.
                    </p>
                    <div className="space-y-2 text-xs">
                      {barangays.slice(0, 7).map((b: any) => (
                        <div key={b.id} className="p-3 rounded-xl bg-[#f7f8fa] border border-[#e5e7eb] flex items-center justify-between">
                          <div>
                            <div className="font-bold text-[#0a1128]">{NAGA_BARANGAY_NAMES[b.id]}</div>
                            <div className="text-[10px] text-[#6b7280]">
                              Unbanked: {b.social_swo?.unbanked_pct}% • Banked: {100 - (b.social_swo?.unbanked_pct || 30)}%
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            b.social_swo?.unbanked_pct > 35 ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                          }`}>
                            {b.social_swo?.unbanked_pct > 35 ? "Physical Cash Team" : "Digital Payout"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════
              WORKSPACE 3: AIP PROPOSALS (ANNUAL INVESTMENT PROGRAM)
             ═════════════════════════════════════════════════════════════ */}
          {activeNavTab === "proposals" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="coolors-card p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#f2f2f2]">
                  <div>
                    <h2 className="text-lg font-black text-[#0a1128] flex items-center space-x-2">
                      <FileCheck className="w-5 h-5 text-[#05389f]" />
                      <span>Annual Investment Program (AIP) Proposals Desk</span>
                    </h2>
                    <p className="text-xs text-[#4b5563] mt-0.5">
                      Statutory justifications, SDG linkages, budget allocations & Sangguniang Panlungsod approval pipeline.
                    </p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-bold text-[#05389f] bg-[#edf3fc] px-3 py-1.5 rounded-xl border border-[#05389f]/20 font-mono">
                      Ceiling: ₱{(aipBudgetCeiling / 1000000).toFixed(1)}M
                    </span>
                    <button
                      onClick={() => {
                        setIsAiOpen(true);
                        executeAiQuery("Synthesize new AIP capital project proposal for high-vulnerability barangay");
                      }}
                      className="pill-btn-blue px-4 py-2 text-xs font-bold flex items-center space-x-2 cursor-pointer shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#fccf17]" />
                      <span>Draft New Proposal</span>
                    </button>
                  </div>
                </div>

                {/* Proposals Cards Feed */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {proposals.map((prop) => (
                    <div key={prop.id} className="p-4 rounded-2xl bg-[#f7f8fa] border border-[#e5e7eb] space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#05389f] text-white">
                          {prop.office}
                        </span>
                        <span className="font-mono font-bold text-sm text-[#0a1128]">
                          ₱{prop.budget.toLocaleString()}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-[#0a1128]">{prop.title}</h4>
                      <p className="text-xs text-[#4b5563]">{prop.problem}</p>
                      <div className="flex items-center justify-between text-[11px] text-[#6b7280] font-mono pt-1">
                        <span>{prop.barangay}</span>
                        <span>{prop.statute} ({prop.section})</span>
                      </div>
                      <div className="pt-2 border-t border-[#e5e7eb] flex items-center justify-between">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          prop.status === "APPROVED" ? "bg-emerald-100 text-emerald-800" : prop.status === "FUNDED" ? "bg-[#edf3fc] text-[#05389f]" : prop.status === "REJECTED" ? "bg-rose-100 text-rose-800" : "bg-[#fef9e7] text-[#b45309]"
                        }`}>
                          {prop.status}
                        </span>

                        {prop.status === "PENDING" && (
                          <div className="flex space-x-1.5">
                            <button
                              onClick={() => handleProposalAction(prop.id, "approve")}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-[10px] font-bold cursor-pointer"
                            >
                              Approve for SP
                            </button>
                            <button
                              onClick={() => handleProposalAction(prop.id, "reject")}
                              className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-[10px] font-bold cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        {prop.status === "APPROVED" && (
                          <button
                            onClick={() => handleProposalAction(prop.id, "fund")}
                            className="px-3 py-1 bg-[#05389f] hover:bg-[#032770] text-white rounded-full text-[10px] font-bold cursor-pointer"
                          >
                            Allot Budget
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════
              WORKSPACE 4: EXECUTIVE COMMAND & FIELD SYNC
             ═════════════════════════════════════════════════════════════ */}
          {activeNavTab === "executive_command" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="coolors-card p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#f2f2f2]">
                  <div>
                    <h2 className="text-lg font-black text-[#0a1128] flex items-center space-x-2">
                      <ShieldAlert className="w-5 h-5 text-rose-600" />
                      <span>Executive Incident Command & Real-Time Citizen Sync</span>
                    </h2>
                    <p className="text-xs text-[#4b5563] mt-0.5">
                      Live mobile field reports, disaster crisis coordinator, emergency hotline dispatch & data privacy guardrails.
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-emerald-700">Mobile Sync Queue Online</span>
                  </div>
                </div>

                {/* Emergency Hotlines Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  {[
                    { name: "CDRRMO Naga Central 911", num: "(054) 472-3000", color: "#05389f" },
                    { name: "BFP Fire Operations", num: "(054) 811-1000", color: "#d97706" },
                    { name: "PNP Naga City Police", num: "166 / (054) 473-2222", color: "#0284c7" },
                    { name: "Bicol Medical Center (BMC)", num: "(054) 472-0125", color: "#10b981" }
                  ].map((hotline, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-[#f7f8fa] border border-[#e5e7eb] space-y-1">
                      <span className="text-[10px] uppercase font-bold text-[#6b7280]">{hotline.name}</span>
                      <div className="font-bold text-sm text-[#0a1128] font-mono">{hotline.num}</div>
                      <span className="text-[10px] text-emerald-600 font-bold block">● 24/7 Dispatch Ready</span>
                    </div>
                  ))}
                </div>

                {/* Live Field Reports Feed */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[#0a1128]">
                      Recent Geotagged Field Reports (Mobile App Sync)
                    </h3>
                    <span className="text-xs font-bold text-[#05389f] bg-[#edf3fc] px-2.5 py-0.5 rounded-full font-mono">
                      {fieldReports.length} Reports Logged
                    </span>
                  </div>

                  <div className="space-y-2">
                    {fieldReports.map((rpt) => (
                      <div key={rpt.id} className="p-3 rounded-xl bg-[#f7f8fa] border border-[#e5e7eb] flex items-center justify-between text-xs">
                        <div className="space-y-0.5">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-[#05389f]">{rpt.report_type}</span>
                            <span className="text-[10px] text-[#6b7280]">• {rpt.barangay_name}</span>
                            <span className="text-[10px] text-[#6b7280]">({rpt.offline_created_at})</span>
                          </div>
                          <p className="text-xs text-[#0a1128]">{rpt.description}</p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white border border-[#e5e7eb] text-[#0a1128]">
                          {rpt.reporter_role || "Field Inspector"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Privacy & Federation Guardrails */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-3.5 rounded-xl bg-[#f7f8fa] border border-[#e5e7eb] flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-[#0a1128]">Cross-Office Data Federation</div>
                      <div className="text-[10px] text-[#6b7280]">Allows DRRMO to query CEO and CHO vulnerable senior clusters</div>
                    </div>
                    <button
                      onClick={() => setCrossOfficeSharing(!crossOfficeSharing)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        crossOfficeSharing ? "bg-emerald-100 text-emerald-800 border border-emerald-300" : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {crossOfficeSharing ? "ENABLED" : "LOCKED"}
                    </button>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#f7f8fa] border border-[#e5e7eb] flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-[#0a1128]">RA 10173 Micro-Cell Suppression</div>
                      <div className="text-[10px] text-[#6b7280]">Suppresses queries where sample &lt;{privacyCellThreshold} households</div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {[3, 5, 10].map((num) => (
                        <button
                          key={num}
                          onClick={() => setPrivacyCellThreshold(num)}
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold cursor-pointer transition-colors ${
                            privacyCellThreshold === num ? "bg-[#05389f] text-white" : "bg-white text-[#4b5563] border border-[#bebcbc]"
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          </main>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          6. DEDICATED OMNISEARCH SPOTLIGHT COMMAND PALETTE MODAL (⌘K)
         ───────────────────────────────────────────────────────────── */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-start justify-center pt-16 sm:pt-24 px-4 animate-in fade-in duration-150">
          {/* Backdrop click to close */}
          <div className="fixed inset-0" onClick={() => setIsSearchOpen(false)} />

          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[82vh] z-10 animate-in zoom-in-95 duration-150 font-sans">
            {/* Top Search Input Bar */}
            <div className="p-4 border-b border-slate-100 flex items-center space-x-3 bg-[#fbfcfe]">
              <Search className="w-5 h-5 text-[#05389f] shrink-0" />
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchQuery.trim()) {
                    setIsSearchOpen(false);
                    setIsAiOpen(true);
                    executeAiQuery(searchQuery);
                  }
                }}
                placeholder="Search hotlines (911/police/fire/hospital), indicators (sanitation/water/roof), barangays..."
                className="flex-1 bg-transparent text-sm sm:text-base text-slate-900 outline-none placeholder:text-slate-400 font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-slate-400 hover:text-slate-600 text-xs px-2 py-1 rounded-full hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  Clear
                </button>
              )}
              <kbd className="hidden sm:inline-block text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                ESC
              </kbd>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center space-x-1.5 px-4 py-2.5 border-b border-slate-100 bg-[#f8f9fc] overflow-x-auto text-xs shrink-0">
              {[
                { id: "all", label: "All" },
                { id: "hotlines", label: "🚨 Hotlines (911)" },
                { id: "indicators", label: "📊 CBMS Indicators" },
                { id: "barangays", label: "📍 27 Barangays" },
                { id: "statutory", label: "⚖️ Statutory RA 7160" }
              ].map((chip) => (
                <button
                  key={chip.id}
                  onClick={() => setSearchCategory(chip.id)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    searchCategory === chip.id
                      ? "bg-[#05389f] text-white shadow-xs"
                      : "bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200/80"
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Real-time Filtered Results Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* 1. NAGA EMERGENCY HOTLINES SECTION */}
              {(searchCategory === "all" || searchCategory === "hotlines") && (() => {
                const q = searchQuery.toLowerCase().trim();
                const matchedHotlines = NAGA_EMERGENCY_HOTLINES.filter((h) => {
                  if (!q) return searchCategory === "hotlines";
                  return (
                    h.agency.toLowerCase().includes(q) ||
                    h.subtext.toLowerCase().includes(q) ||
                    h.primaryPhone.includes(q) ||
                    h.landline.includes(q) ||
                    h.altPhone.toLowerCase().includes(q) ||
                    (q.includes("911") && h.id === "cdrrmo") ||
                    (q.includes("police") && h.id === "pnp") ||
                    (q.includes("fire") && h.id === "bfp") ||
                    (q.includes("hospital") && h.id === "bmc") ||
                    (q.includes("doctor") && h.id === "bmc") ||
                    (q.includes("emergency") && (h.id === "cdrrmo" || h.id === "bmc"))
                  );
                });

                if (matchedHotlines.length === 0) return null;

                return (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <span>🚨 Official Naga City Emergency Hotlines (Verified)</span>
                      <span className="text-rose-600 font-semibold font-mono text-[10px]">24/7 ComCen Active</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {matchedHotlines.map((h) => (
                        <div
                          key={h.id}
                          className="bg-slate-50 hover:bg-blue-50/40 p-3 rounded-2xl border border-slate-200 transition-all flex flex-col justify-between space-y-2"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="text-xl shrink-0">{h.icon}</span>
                              <div>
                                <h4 className="font-extrabold text-xs text-slate-900 leading-tight">{h.agency}</h4>
                                <p className="text-[10px] text-slate-500 leading-tight mt-0.5 line-clamp-1">{h.subtext}</p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-white p-2 rounded-xl border border-slate-200/80 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-slate-400 font-semibold">Primary:</span>
                              <span className="font-mono font-extrabold text-[#05389f] text-xs">{h.primaryPhone}</span>
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-slate-500">
                              <span>Landline:</span>
                              <span className="font-mono">{h.landline}</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-1.5 pt-1">
                            <a
                              href={`tel:${h.primaryPhone.replace(/[^0-9]/g, "")}`}
                              className="flex-1 py-1.5 bg-[#05389f] hover:bg-[#042d82] text-white rounded-xl text-xs font-bold text-center transition-colors flex items-center justify-center space-x-1"
                            >
                              <PhoneCall className="w-3 h-3" />
                              <span>Call Agency</span>
                            </a>
                            <button
                              onClick={() => copyToClipboard(h.primaryPhone, h.id)}
                              className="px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1"
                              title="Copy number"
                            >
                              {copiedHotline === h.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                              <span>{copiedHotline === h.id ? "Copied" : "Copy"}</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* 2. CBMS INDICATORS & URBAN DEFICITS SECTION */}
              {(searchCategory === "all" || searchCategory === "indicators") && (() => {
                const q = searchQuery.toLowerCase().trim();
                const matchedIndicators = SEARCHABLE_INDICATORS.filter((ind) => {
                  if (!q) return searchCategory === "indicators";
                  return (
                    ind.name.toLowerCase().includes(q) ||
                    ind.dept.toLowerCase().includes(q) ||
                    ind.summary.toLowerCase().includes(q) ||
                    ind.id.includes(q)
                  );
                });

                if (matchedIndicators.length === 0) return null;

                return (
                  <div className="space-y-2">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <span>📊 PSA CBMS Vulnerability Indicators</span>
                    </div>
                    <div className="space-y-1.5">
                      {matchedIndicators.map((ind) => (
                        <div
                          key={ind.id}
                          className="bg-white p-3 rounded-2xl border border-slate-200 hover:border-[#05389f]/40 hover:bg-slate-50 transition-all flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-3 min-w-0">
                            <span className="text-xl shrink-0">{ind.icon}</span>
                            <div className="min-w-0">
                              <div className="flex items-center space-x-2">
                                <h4 className="font-extrabold text-xs text-slate-900 truncate">{ind.name}</h4>
                                <span className="font-mono text-xs font-black text-[#05389f] bg-blue-50 px-2 py-0.2 rounded-full border border-blue-200">
                                  {ind.metric}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500 mt-0.5 truncate">{ind.summary}</p>
                              <span className="text-[9px] font-bold text-slate-400 block mt-0.5">{ind.dept}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setIsSearchOpen(false);
                              setIsAiOpen(true);
                              executeAiQuery(ind.prompt);
                            }}
                            className="px-3 py-1.5 bg-[#05389f] hover:bg-[#042d82] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 ml-3 flex items-center space-x-1"
                          >
                            <Sparkles className="w-3 h-3 text-[#facc15]" />
                            <span>Audit Indicator</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* 3. NAGA 27 BARANGAYS SECTION */}
              {(searchCategory === "all" || searchCategory === "barangays") && (() => {
                const q = searchQuery.toLowerCase().trim();
                const matchedBarangays = barangays.filter((b) => {
                  if (!q) return searchCategory === "barangays";
                  const rName = (NAGA_BARANGAY_NAMES[b.id] || b.name).toLowerCase();
                  const cat = BARANGAY_CATEGORIES[b.id]?.id || "";
                  return (
                    rName.includes(q) ||
                    `#${b.id}`.includes(q) ||
                    cat.includes(q)
                  );
                });

                if (matchedBarangays.length === 0) return null;

                return (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <span>📍 Naga City 27 Barangays (Select to Pan 3D Map)</span>
                      <span className="text-slate-400 font-mono text-[10px]">{matchedBarangays.length} found</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {matchedBarangays.slice(0, 10).map((b) => {
                        const rName = NAGA_BARANGAY_NAMES[b.id] || b.name;
                        const cat = BARANGAY_CATEGORIES[b.id];
                        const isCurrent = b.id === selectedBarangayId;

                        return (
                          <button
                            key={b.id}
                            onClick={() => {
                              handleSelectBarangay(b.id);
                              setIsSearchOpen(false);
                            }}
                            className={`w-full text-left p-2.5 rounded-2xl transition-all flex items-center justify-between text-xs cursor-pointer border ${
                              isCurrent
                                ? "bg-blue-50 border-[#05389f] font-bold shadow-2xs"
                                : "bg-white hover:bg-slate-50 border-slate-200"
                            }`}
                          >
                            <div className="flex items-center space-x-2.5 min-w-0">
                              <span
                                className="w-3 h-3 rounded-md shrink-0 shadow-2xs"
                                style={{ backgroundColor: NAGA_ADMIN_COLORS[b.id]?.hex || "#05389f" }}
                              />
                              <div className="min-w-0">
                                <div className="flex items-center space-x-1.5">
                                  <span className="font-mono text-slate-400 text-[10px]">#{b.id}</span>
                                  <span className="text-slate-900 font-extrabold truncate">{rName}</span>
                                </div>
                                {cat && (
                                  <span className="text-[10px] text-slate-500 truncate block">{cat.short}</span>
                                )}
                              </div>
                            </div>
                            <div className="shrink-0 ml-2">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                                  b.vulnerability_index >= 70
                                    ? "bg-rose-100 text-rose-800"
                                    : b.vulnerability_index >= 50
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-emerald-100 text-emerald-800"
                                }`}
                              >
                                MVI {b.vulnerability_index}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* 4. STATUTORY POLICIES & MASTER CONTROLS SECTION */}
              {(searchCategory === "all" || searchCategory === "statutory") && (() => {
                const q = searchQuery.toLowerCase().trim();
                const statutoryItems = [
                  {
                    title: "RA 7160 Local Government Code (Section 287)",
                    desc: "Statutory baseline requiring minimum 20% of NTA/IRA earmarked for development fund.",
                    action: () => {
                      setIsSearchOpen(false);
                      setIsAiOpen(true);
                      executeAiQuery("Explain RA 7160 Section 287 statutory requirement for 20% development fund baseline");
                    }
                  },
                  {
                    title: "AIP 2026 Dev Fund Statutory Ceiling (₱45.0M)",
                    desc: "Executive threshold slider capping annual capital project disbursements.",
                    action: () => {
                      setIsSearchOpen(false);
                      setSidePanelTab("controls");
                    }
                  },
                  {
                    title: "3D Bicol River Flood Surge Simulation",
                    desc: "Level 3 inundation overlay modeling flash tidal surge across low-lying barangays.",
                    action: () => {
                      setIsSearchOpen(false);
                      setCalamitySimActive(true);
                    }
                  },
                  {
                    title: "Cross-Office Data Federation (CEO + CHO + DRRMO)",
                    desc: "Inter-agency data pipeline integrating infrastructure, health, and disaster telemetry.",
                    action: () => {
                      setIsSearchOpen(false);
                      setSidePanelTab("controls");
                    }
                  }
                ];

                const filtered = statutoryItems.filter((s) => !q || s.title.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q));
                if (filtered.length === 0) return null;

                return (
                  <div className="space-y-2">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <span>⚖️ Statutory Commands & Controls</span>
                    </div>
                    <div className="space-y-1.5">
                      {filtered.map((item, idx) => (
                        <div
                          key={idx}
                          onClick={item.action}
                          className="bg-white p-3 rounded-2xl border border-slate-200 hover:border-[#05389f]/40 hover:bg-slate-50 transition-all flex items-center justify-between cursor-pointer"
                        >
                          <div>
                            <h4 className="font-extrabold text-xs text-slate-900">{item.title}</h4>
                            <p className="text-[10px] text-slate-500 mt-0.5">{item.desc}</p>
                          </div>
                          <span className="text-[#05389f] font-bold text-xs shrink-0 ml-2">Execute →</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* 5. DIRECT ASK COPILOT ACTION */}
              {searchQuery.trim() && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#05389f] text-white flex items-center justify-center font-bold shadow-xs">
                      <Sparkles className="w-4 h-4 text-[#facc15]" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        Ask Statutory Copilot: &quot;{searchQuery}&quot;
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium">
                        Run full legal corpus & CBMS synthesis on this prompt
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsSearchOpen(false);
                      setIsAiOpen(true);
                      executeAiQuery(searchQuery);
                    }}
                    className="px-3.5 py-1.5 bg-[#05389f] hover:bg-[#042d82] text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-xs"
                  >
                    Ask Copilot ↵
                  </button>
                </div>
              )}
            </div>

            {/* Footer Keyboard Navigation Tips */}
            <div className="px-4 py-2.5 border-t border-slate-100 bg-[#f8f9fc] flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <div className="flex items-center space-x-3">
                <span>↵ to select / ask Copilot</span>
                <span>•</span>
                <span>Esc to close</span>
              </div>
              <span className="font-mono text-[#05389f] font-bold">Project Banwaan Omnisearch</span>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          7. ULTRA-MODERN STATUTORY COPILOT DRAWER (APPLE / ORCHESTRATEIQ)
         ───────────────────────────────────────────────────────────── */}
      {isAiOpen && (
        <>
          {/* Glassmorphic Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsAiOpen(false)}
          />

          {/* Slide-over Drawer Panel */}
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-250 ease-out font-sans">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-[#fbfcfe]">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-[#05389f] text-white flex items-center justify-center font-bold shadow-md shadow-blue-900/20 shrink-0">
                  <Sparkles className="w-5 h-5 text-[#facc15]" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-black text-slate-900">
                      Statutory Decision Copilot
                    </h3>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium">
                    CBMS Local Inference + Legal Corpus (RA 7160, RA 10121, RA 11223)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAiOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer transition-colors"
                title="Close Copilot"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs bg-[#fbfcfe]">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`p-3.5 rounded-2xl max-w-[90%] leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-[#05389f] text-white shadow-xs rounded-tr-xs"
                        : "bg-white text-slate-900 border border-slate-200/80 shadow-2xs rounded-tl-xs"
                    }`}
                  >
                    <p className="font-medium text-xs sm:text-[13px] leading-relaxed">{msg.text}</p>

                    {/* Legal Citation Badge */}
                    {msg.citation && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-[10px]">
                        <span className="font-bold text-slate-500">Statutory Citation:</span>
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#05389f] font-mono font-bold border border-blue-200/80">
                          {msg.citation}
                        </span>
                      </div>
                    )}

                    {/* SDG Badges */}
                    {msg.sdgs && (
                      <div className="mt-1.5 flex flex-wrap gap-1 text-[10px]">
                        {msg.sdgs.map((sdg, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200/60"
                          >
                            {sdg}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Drafted Proposal Card (Sunshine Yellow Card matching OrchestrateIQ) */}
                  {msg.proposalDraft && (
                    <div className="mt-2.5 p-3.5 w-full bg-[#fefce8] border border-amber-300/80 rounded-2xl space-y-2 text-xs shadow-2xs">
                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <div className="flex items-center space-x-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                          <span className="text-[#05389f] font-black">Drafted Statutory Proposal</span>
                        </div>
                        <span className="font-mono text-emerald-800 font-extrabold text-xs sm:text-sm">
                          ₱{msg.proposalDraft.estimated_budget_php?.toLocaleString()}
                        </span>
                      </div>
                      <div className="font-extrabold text-slate-900 text-xs sm:text-[13px]">
                        {msg.proposalDraft.project_title}
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                        {msg.proposalDraft.problem_statement}
                      </p>
                      <button
                        onClick={() => handleQueueDraftProposal(msg.proposalDraft)}
                        className="w-full mt-1.5 py-2 rounded-xl bg-[#05389f] hover:bg-[#042d82] text-white text-xs font-bold cursor-pointer transition-colors shadow-xs flex items-center justify-center space-x-1.5"
                      >
                        <Check className="w-3.5 h-3.5 text-[#facc15]" />
                        <span>Queue to Mayor&apos;s Review Deck</span>
                      </button>
                    </div>
                  )}

                  {/* Suggested Actions */}
                  {msg.suggestedActions && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {msg.suggestedActions.map((action, aIdx) => (
                        <button
                          key={aIdx}
                          onClick={() => executeAiQuery(action)}
                          className="px-3 py-1 bg-white hover:bg-[#edf3fc] border border-slate-200 hover:border-[#05389f]/40 rounded-full text-[10px] text-[#05389f] font-bold cursor-pointer shadow-2xs transition-all"
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isAiLoading && (
                <div className="flex items-center space-x-2 text-slate-600 text-xs p-3 bg-white rounded-2xl border border-slate-100 shadow-2xs">
                  <Sparkles className="w-4 h-4 animate-spin text-[#05389f]" />
                  <span className="font-medium">Analyzing CBMS datasets & statutory mandates...</span>
                </div>
              )}
            </div>

            {/* Chat Input Bar */}
            <div className="p-3 border-t border-slate-100 bg-white">
              <div className="flex items-center space-x-2 bg-[#f4f5f9] border border-slate-200 rounded-full px-3.5 py-2 focus-within:bg-white focus-within:border-[#05389f] transition-all shadow-2xs">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && chatInput.trim()) executeAiQuery(chatInput);
                  }}
                  placeholder="Ask statutory synthesis, RA 7160 basis, or budget..."
                  className="flex-1 bg-transparent text-xs sm:text-[13px] text-slate-900 outline-none placeholder:text-slate-400 font-medium"
                />
                <button
                  onClick={() => executeAiQuery(chatInput)}
                  disabled={isAiLoading || !chatInput.trim()}
                  className="w-7 h-7 rounded-full bg-[#05389f] disabled:opacity-40 text-white flex items-center justify-center cursor-pointer shadow-xs hover:bg-[#042d82] transition-colors shrink-0"
                >
                  <Send className="w-3.5 h-3.5 text-[#facc15]" />
                </button>
              </div>
              <p className="text-[9px] text-center text-slate-400 font-medium mt-1.5">
                Direct statutory AI reasoning grounded in 44,892 PSA CBMS households across 27 Barangays.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
