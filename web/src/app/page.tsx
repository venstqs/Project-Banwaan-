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
  Waves
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
  const [sidePanelPage, setSidePanelPage] = useState<number>(1);

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
            {/* Live Status Pill */}
            <div className="bg-[#eaf8ee] text-[#16a34a] border border-emerald-200/80 rounded-full px-3 py-1 text-xs font-bold flex items-center space-x-1.5 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 pulse-live" />
              <span>Live</span>
            </div>

            {/* Cycle Pill */}
            <div className="hidden md:flex items-center space-x-1.5 bg-white border border-slate-200 rounded-full px-3 py-1 text-xs font-semibold text-slate-700 shadow-2xs">
              <Activity className="w-3.5 h-3.5 text-slate-400" />
              <span>2026 AIP Cycle</span>
              <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
            </div>

            {/* Search Circular Button */}
            <button
              onClick={() => {
                const el = document.getElementById("diagnostic-matrix-table");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors cursor-pointer"
              title="Search 27 Barangays"
            >
              <Search className="w-3.5 h-3.5" />
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

            {/* Mayor Avatar Pill */}
            <div className="flex items-center space-x-2 pl-1 pr-3 py-1 rounded-full bg-slate-50 border border-slate-200 select-none">
              <div className="w-7 h-7 rounded-full bg-[#f87171] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                NM
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-[11px] font-bold text-slate-900 leading-tight">Hon. Mayor</div>
                <div className="text-[9px] text-slate-400 leading-tight">Naga City • LGU</div>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </div>
          </div>
        </header>

        {/* Body Split: Left Vertical Icon Rail + Main Content Area */}
        <div className="flex flex-1 min-h-[820px] overflow-hidden">
          {/* Left Icon Rail */}
          <aside className="w-16 lg:w-18 bg-[#fbfcfe] border-r border-[#eef0f6] flex flex-col items-center justify-between py-6 px-2 shrink-0 select-none">
            {/* Top Brand Mark */}
            <div className="w-9 h-9 rounded-2xl bg-[#05389f]/10 border border-[#05389f]/20 flex items-center justify-center text-[#05389f]">
              <Globe className="w-4 h-4" />
            </div>

            {/* Middle Icon Dock */}
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

            {/* Bottom: Help */}
            <div className="flex flex-col items-center space-y-2">
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

              {/* Right Headline Pills */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <div className="bg-[#eaf8ee] text-[#16a34a] border border-emerald-200/80 rounded-full px-3.5 py-1.5 text-xs font-semibold flex items-center space-x-1.5 shadow-2xs">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Setup complete • 27 of 27</span>
                </div>
                <div className="bg-white border border-slate-200 rounded-full px-3.5 py-1.5 text-xs font-semibold text-slate-700 flex items-center space-x-1 shadow-2xs">
                  <span>📅 FY 2026 AIP Cycle</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </div>
                <div className="bg-white border border-slate-200 rounded-full px-3.5 py-1.5 text-xs font-semibold text-slate-700 flex items-center space-x-1 shadow-2xs">
                  <Sliders className="w-3.5 h-3.5 text-slate-400" />
                  <span>Filter</span>
                </div>
                <button
                  onClick={() => {
                    const el = document.getElementById("cesium-3d-viewport");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="bg-white border border-slate-200 rounded-full px-3.5 py-1.5 text-xs font-semibold text-slate-700 flex items-center space-x-1 shadow-2xs hover:bg-slate-50 cursor-pointer"
                >
                  <span>↗ Live Map</span>
                </button>
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
            <div className="p-3 bg-white rounded-t-xl flex flex-wrap items-center justify-between gap-3 border-b border-[#f2f2f2]">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#05389f] text-white flex items-center justify-center font-bold text-xs border border-[#fccf17]">
                  2D
                </div>
                <div>
                  <h3 className="text-xs font-black text-[#0a1128] font-heading flex items-center space-x-2">
                    <span>Naga City Digital Twin • Esri World Imagery (2D Satellite Map)</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#edf3fc] text-[#05389f] border border-[#05389f]/20 font-mono">
                      All 27 Categorized Barangays
                    </span>
                  </h3>
                  <p className="text-[10px] text-[#6b7280]">
                    Esri World Imagery Satellite • Flat 2D Contiguous CLUP Zoning & Synchronized Centroid Labels
                  </p>
                </div>
              </div>

              {/* Quick Preset Buttons (All 5 Categories + All 27) & Minimize Toggle */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => handleSelectCategory("all")}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    selectedCategoryFilter === "all"
                      ? "bg-[#05389f] text-white shadow-xs"
                      : "bg-[#f2f2f2] text-[#4b5563] hover:text-[#0a1128]"
                  }`}
                >
                  🌐 All 27
                </button>
                <button
                  onClick={() => handleSelectCategory("upland")}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    selectedCategoryFilter === "upland"
                      ? "bg-[#b59410] text-white shadow-xs"
                      : "bg-[#fef9e7] text-[#b59410] hover:bg-[#fee573]"
                  }`}
                >
                  ⛰️ Upland (5)
                </button>
                <button
                  onClick={() => handleSelectCategory("cbd")}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    selectedCategoryFilter === "cbd"
                      ? "bg-[#05389f] text-white shadow-xs"
                      : "bg-[#edf3fc] text-[#05389f] hover:bg-[#dbeafe]"
                  }`}
                >
                  🏢 CBD Core (6)
                </button>
                <button
                  onClick={() => handleSelectCategory("poblacion")}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    selectedCategoryFilter === "poblacion"
                      ? "bg-[#7c3aed] text-white shadow-xs"
                      : "bg-purple-50 text-[#7c3aed] hover:bg-purple-100"
                  }`}
                >
                  🏛️ Poblacion (8)
                </button>
                <button
                  onClick={() => handleSelectCategory("riverine")}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    selectedCategoryFilter === "riverine"
                      ? "bg-[#ea580c] text-white shadow-xs"
                      : "bg-[#fff1f2] text-[#ea580c] hover:bg-[#fee2e2]"
                  }`}
                >
                  🌊 Riverine (4)
                </button>
                <button
                  onClick={() => handleSelectCategory("growth")}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    selectedCategoryFilter === "growth"
                      ? "bg-[#0d9488] text-white shadow-xs"
                      : "bg-teal-50 text-[#0d9488] hover:bg-teal-100"
                  }`}
                >
                  🏥 Growth (4)
                </button>
                <button
                  onClick={() => setIsDigitalTwinSectionMinimized(!isDigitalTwinSectionMinimized)}
                  className="flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-[#f2f2f2] text-[#0a1128] hover:bg-slate-200 transition-all cursor-pointer border border-[#e5e7eb]"
                  title={isDigitalTwinSectionMinimized ? "Expand 3D Digital Twin" : "Minimize 3D Digital Twin"}
                >
                  {isDigitalTwinSectionMinimized ? (
                    <>
                      <ChevronDown className="w-3.5 h-3.5 text-[#05389f]" />
                      <span>Expand 3D Twin</span>
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

            {!isDigitalTwinSectionMinimized && (
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 p-3 bg-[#f7f8fa] rounded-b-xl items-stretch">
                {/* Shortened Geo Map (7 Cols on Desktop) */}
                <div className="xl:col-span-7 rounded-2xl overflow-hidden border border-[#e5e7eb] shadow-xs relative bg-white">
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

                {/* Right Side: Paginated Barangay Diagnostic & Intelligence Deck (5 Cols on Desktop) */}
                <div className="xl:col-span-5 bg-white rounded-2xl p-4.5 border border-[#e5e7eb] shadow-sm flex flex-col justify-between space-y-3.5">
                  {/* Top Row: Barangay Cycler & Page Segmented Pill Switcher */}
                  <div className="space-y-2.5 pb-2 border-b border-slate-100">
                    {/* Barangay Cycler Header */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <span className="text-2xl shrink-0">{selectedBarangay.category.icon}</span>
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

                    {/* Information Pagination Segmented Pills */}
                    <div className="flex items-center bg-[#f1f3f9] p-0.5 rounded-xl border border-slate-200/60 text-xs font-bold">
                      {[
                        { id: 1, label: "1. Intel", title: "Barangay Profile & Indicators" },
                        { id: 2, label: "2. Next Steps", title: "Actionable Priorities" },
                        { id: 3, label: "3. Detected", title: "Detected Signals & Metrics" },
                        { id: 4, label: "4. Controls", title: "Mayor Master Controls" }
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setSidePanelPage(tab.id)}
                          className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer text-[11px] ${
                            sidePanelPage === tab.id
                              ? "bg-[#05389f] text-white shadow-xs font-extrabold"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                          title={tab.title}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* PAGE 1: BARANGAY INTEL & AI POLICY */}
                  {sidePanelPage === 1 && (
                    <div className="space-y-3 animate-in fade-in duration-150">
                      {/* Risk Badge & MVI Row */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {(() => {
                            const mvi = selectedBarangay.vulnerability_index || 50;
                            if (mvi >= 70) {
                              return (
                                <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold flex items-center space-x-1">
                                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse inline-block" />
                                  <span>🔴 High Risk Level</span>
                                </span>
                              );
                            }
                            if (mvi >= 50) {
                              return (
                                <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold flex items-center space-x-1">
                                  <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                                  <span>🟡 Medium Risk Level</span>
                                </span>
                              );
                            }
                            return (
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center space-x-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                                <span>🟢 Low Risk Level</span>
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
                        <div className="bg-[#f7f8fa] p-3 rounded-xl border border-slate-200">
                          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">
                            HOUSEHOLDS
                          </span>
                          <div className="font-extrabold text-slate-900 text-base mt-0.5 font-mono">
                            {selectedBarangay.total_households?.toLocaleString()} HHs
                          </div>
                        </div>
                        <div className="bg-[#f7f8fa] p-3 rounded-xl border border-slate-200">
                          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">
                            POPULATION
                          </span>
                          <div className="font-extrabold text-slate-900 text-base mt-0.5 font-mono">
                            {selectedBarangay.total_population?.toLocaleString()} Pop
                          </div>
                        </div>
                      </div>

                      {/* 3 Hotspot Indicators */}
                      <div className="space-y-2 text-xs bg-[#f7f8fa] p-3 rounded-xl border border-slate-200">
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

                      {/* Framed AI Analysis & Policy Generation */}
                      <div className="p-3 bg-[#edf3fc] border border-[#05389f]/20 rounded-xl flex items-center justify-between gap-3 shadow-2xs">
                        <div className="flex items-center space-x-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-[#05389f] text-white flex items-center justify-center shrink-0 shadow-xs">
                            <Sparkles className="w-4 h-4 text-[#facc15]" />
                          </div>
                          <div className="truncate">
                            <div className="text-xs font-bold text-[#05389f] leading-tight truncate">
                              AI Analysis & Policy Generation
                            </div>
                            <div className="text-[10px] text-slate-500 leading-tight truncate">
                              Synthesize {selectedBarangay.realName} intervention
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setIsAiOpen(true);
                            executeAiQuery(`Synthesize priority statutory policy and AIP capital intervention for ${selectedBarangay.displayName} (${selectedBarangay.category.name})`);
                          }}
                          className="px-3 py-1.5 rounded-full bg-[#05389f] hover:bg-[#1e40af] text-white text-[11px] font-bold transition-all shadow-xs cursor-pointer shrink-0"
                        >
                          Generate →
                        </button>
                      </div>
                    </div>
                  )}

                  {/* PAGE 2: NEXT STEPS (ACTIONABLE PRIORITIES - MATCHES USER SCREENSHOT 1) */}
                  {sidePanelPage === 2 && (
                    <div className="space-y-3 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Next steps</h4>
                        <span className="text-[10px] text-slate-400 font-mono">1 priority action</span>
                      </div>

                      {/* Sunshine Yellow Hero Card */}
                      <div className="yellow-feature-card p-4 relative overflow-hidden flex flex-col justify-between rounded-2xl shadow-sm">
                        <div>
                          <div className="flex items-center justify-between">
                            <h4 className="font-extrabold text-sm text-[#0f172a]">
                              Prioritize {selectedBarangay.realName} Dredging
                            </h4>
                            <span className="bg-white/95 text-[#0f172a] font-black px-2 py-0.5 rounded-full text-[10px] shadow-2xs">
                              • Do first
                            </span>
                          </div>
                          <p className="text-xs text-[#0f172a]/85 mt-1 font-medium leading-relaxed">
                            CBMS flood vulnerability {selectedBarangay.vulnerability_index}% with {selectedBarangay.infrastructure_ceo?.unimproved_toilet_pct || 14.2}% deficit in drainage sanitation.
                          </p>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-black/10 flex items-center justify-between">
                          <div className="flex items-center space-x-1.5">
                            <span className="px-2 py-0.5 rounded-full bg-white/90 text-[#0f172a] text-[10px] font-bold shadow-2xs">
                              🌊 2 projects
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-white/90 text-[#0f172a] text-[10px] font-bold shadow-2xs">
                              ⏱️ ~2 min
                            </span>
                          </div>
                          <div className="flex -space-x-1">
                            <span className="w-5 h-5 rounded-full bg-[#05389f] text-white text-[9px] font-bold flex items-center justify-center border border-white">B</span>
                            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[9px] font-bold flex items-center justify-center border border-white">{selectedBarangayId}</span>
                          </div>
                        </div>
                      </div>

                      {/* Sub-card A: Set LDF Statutory Ceiling */}
                      <div className="bg-[#f7f8fa] p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-slate-900">Set LDF Statutory Ceiling</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">RA 7160 Sec. 287 minimum 20% dev fund baseline</div>
                          <div className="flex items-center space-x-2.5 mt-1.5 text-[10px] text-slate-600 font-medium">
                            <span>💰 ₱{(aipBudgetCeiling / 1000000).toFixed(1)}M Ceiling</span>
                            <span>📅 2026 Cycle</span>
                          </div>
                        </div>
                        <button
                          onClick={() => setActiveNavTab("proposals")}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Sub-card B: Field Inspection Telemetry */}
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
                    </div>
                  )}

                  {/* PAGE 3: DETECTED SIGNALS & METRICS (MATCHES USER SCREENSHOT 1) */}
                  {sidePanelPage === 3 && (
                    <div className="space-y-3 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Detected Signals</h4>
                        <span className="text-[10px] text-slate-400 font-mono">Citywide & Brgy</span>
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
                            <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">✓ 100% CBMS mapped</div>
                          </div>
                        </div>

                        <div className="bg-[#f7f8fa] p-3 rounded-2xl border border-slate-200 flex flex-col justify-between min-h-[92px]">
                          <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                            <Layers className="w-3.5 h-3.5" />
                          </div>
                          <div className="mt-2">
                            <div className="text-base font-extrabold text-slate-900 font-mono">5</div>
                            <div className="text-[11px] font-bold text-slate-700">Planning Sectors</div>
                            <div className="text-[10px] text-purple-600 font-semibold mt-0.5">✓ 92% statutory audit</div>
                          </div>
                        </div>

                        <div className="bg-[#f7f8fa] p-3 rounded-2xl border border-slate-200 flex flex-col justify-between min-h-[92px]">
                          <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#05389f] flex items-center justify-center">
                            <Users className="w-3.5 h-3.5" />
                          </div>
                          <div className="mt-2">
                            <div className="text-base font-extrabold text-slate-900 font-mono">44,892</div>
                            <div className="text-[11px] font-bold text-slate-700">Households</div>
                            <div className="text-[10px] text-blue-600 font-semibold mt-0.5">✓ PSA validated</div>
                          </div>
                        </div>

                        <div className="bg-[#f7f8fa] p-3 rounded-2xl border border-slate-200 flex flex-col justify-between min-h-[92px]">
                          <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                            <Zap className="w-3.5 h-3.5" />
                          </div>
                          <div className="mt-2">
                            <div className="text-base font-extrabold text-slate-900 font-mono">₱112.5M</div>
                            <div className="text-[11px] font-bold text-slate-700">Hotspot Deficit</div>
                            <div className="text-[10px] text-amber-600 font-semibold mt-0.5">🔥 4 high priority</div>
                          </div>
                        </div>
                      </div>

                      {/* Selected Barangay Quick Context */}
                      <div className="bg-[#edf3fc] p-3 rounded-xl border border-[#05389f]/20 text-xs">
                        <span className="text-[10px] uppercase font-bold text-[#05389f]">Local Barangay Footprint</span>
                        <div className="font-bold text-slate-800 mt-1">
                          {selectedBarangay.realName} has {selectedBarangay.total_households?.toLocaleString()} HHs • {((selectedBarangay.total_population / 181197) * 100).toFixed(1)}% of Naga City population
                        </div>
                      </div>
                    </div>
                  )}

                  {/* PAGE 4: EXECUTIVE MASTER CONTROLS (MATCHES USER SCREENSHOT 2) */}
                  {sidePanelPage === 4 && (
                    <div className="space-y-3 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Executive Master Controls</h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#05389f] border border-blue-200">
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
                            {crossOfficeSharing ? "ENABLED" : "DISABLED"}
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
                            max="100000000"
                            step="1000000"
                            value={aipBudgetCeiling}
                            onChange={(e) => setAipBudgetCeiling(Number(e.target.value))}
                            className="w-full accent-[#05389f] cursor-pointer"
                          />
                        </div>

                        {/* Control 3: Executive Sign-off Queue */}
                        <div className="bg-[#f7f8fa] p-2.5 rounded-xl border border-slate-200 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 text-xs">3. Executive Sign-Off Queue</span>
                            <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800">
                              {proposals.filter(p => p.status === "PENDING").length} Pending
                            </span>
                          </div>
                          {proposals.slice(0, 2).map((prop) => (
                            <div key={prop.id} className="p-2 bg-white rounded-lg border border-slate-200 flex items-center justify-between gap-2">
                              <div className="truncate">
                                <div className="font-bold text-[11px] text-slate-900 truncate">{prop.title}</div>
                                <div className="text-[10px] text-slate-500 font-mono">₱{prop.budget.toLocaleString()} • {prop.office}</div>
                              </div>
                              <div className="flex items-center space-x-1 shrink-0">
                                {prop.status === "APPROVED" ? (
                                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">Approved</span>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => handleProposalAction(prop.id, "approve")}
                                      className="px-2 py-0.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold cursor-pointer"
                                    >
                                      Approve
                                    </button>
                                    <button
                                      onClick={() => handleProposalAction(prop.id, "reject")}
                                      className="px-2 py-0.5 rounded-md bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold cursor-pointer"
                                    >
                                      Reject
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          ))}
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
                            {calamitySimActive ? "Active" : "Simulate"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Pagination Footer Controls */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => setSidePanelPage((p) => Math.max(1, p - 1))}
                      disabled={sidePanelPage === 1}
                      className={`px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1 transition-all ${
                        sidePanelPage === 1
                          ? "opacity-40 cursor-not-allowed text-slate-400"
                          : "hover:bg-slate-100 text-slate-700 cursor-pointer"
                      }`}
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Previous</span>
                    </button>

                    <div className="flex items-center space-x-1.5">
                      {[1, 2, 3, 4].map((p) => (
                        <span
                          key={p}
                          onClick={() => setSidePanelPage(p)}
                          className={`cursor-pointer transition-all rounded-full ${
                            sidePanelPage === p
                              ? "w-4 h-1.5 bg-[#05389f]"
                              : "w-1.5 h-1.5 bg-slate-300 hover:bg-slate-400"
                          }`}
                        />
                      ))}
                      <span cla          {/* ═════════════════════════════════════════════════════════════
              STATUTORY ASSISTANT BANNER (ORCHESTRATE-IQ GLOWING BLUE ORB + SIRI CARD)
             ═════════════════════════════════════════════════════════════ */}
          <div className="coolors-card p-5 relative overflow-hidden bg-gradient-to-r from-white via-[#fbfcfe] to-[#f4f7fc] border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-5">
            {/* Left: 3D Glowing Blue Orb + Greeting */}
            <div className="flex items-center space-x-4 shrink-0">
              <div className="blue-orb flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6 text-white/90 animate-pulse" />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-[#0f172a] tracking-tight">
                  Welcome, Mayor. What can I help with today?
                </h4>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Direct statutory AI reasoning on 44,892 PSA CBMS households across 27 Barangays.
                </p>
              </div>
            </div>

            {/* Middle: Quick Action Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => {
                  setIsAiOpen(true);
                  executeAiQuery(`Audit ${selectedBarangay.realName} infrastructure deficit against RA 7160`);
                }}
                className="px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:border-[#05389f] hover:text-[#05389f] transition-all cursor-pointer shadow-2xs"
              >
                🏷️ Check {selectedBarangay.realName} Deficit
              </button>
              <button
                onClick={() => {
                  setIsAiOpen(true);
                  executeAiQuery("Explain RA 7160 Section 287 statutory requirement for 20% development fund");
                }}
                className="px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:border-[#05389f] hover:text-[#05389f] transition-all cursor-pointer shadow-2xs"
              >
                📜 RA 7160 Sec. 287 20% LDF
              </button>
            </div>

            {/* Right: Inset Prompt Bar */}
            <div className="w-full md:w-80 shrink-0">
              <div className="flex items-center space-x-2 bg-white border border-slate-200 rounded-full px-3 py-2 focus-within:border-[#05389f] transition-all shadow-2xs">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setIsAiOpen(true);
                      executeAiQuery(chatInput);
                    }
                  }}
                  placeholder="Ask statutory copilot..."
                  className="flex-1 bg-transparent text-xs text-slate-800 outline-none placeholder:text-slate-400"
                />
                <button
                  onClick={() => {
                    setIsAiOpen(true);
                    executeAiQuery(chatInput || `Analyze ${selectedBarangay.realName}`);
                  }}
                  className="w-7 h-7 rounded-full bg-[#05389f] text-white flex items-center justify-center hover:bg-[#1e40af] transition-all cursor-pointer shadow-2xs shrink-0"
                >
                  <Send className="w-3.5 h-3.5 text-[#facc15]" />
                </button>
              </div>
            </div>
          </div>s-within:border-[#05389f] transition-all shadow-2xs">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setIsAiOpen(true);
                        executeAiQuery(chatInput);
                      }
                    }}
                    placeholder="Ask me anything..."
                    className="flex-1 bg-transparent text-xs text-slate-800 outline-none placeholder:text-slate-400"
                  />
                  <button
                    onClick={() => {
                      setIsAiOpen(true);
                      executeAiQuery(chatInput || `Analyze ${selectedBarangay.realName}`);
                    }}
                    className="w-6 h-6 rounded-full bg-[#05389f] text-white flex items-center justify-center hover:bg-[#1e40af] transition-all cursor-pointer shadow-2xs"
                  >
                    <Send className="w-3 h-3 text-[#facc15]" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              5. LOWER SPLIT SECTION: ROLE WORKBENCH & 27 BARANGAYS MATRIX
             ───────────────────────────────────────────────────────────── */}
          <div id="lower-split-section" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column (5 Cols): Department Domain-Isolated Control Deck */}
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
                      {role === "super_admin"
                        ? "5 Executive Master Controls Active"
                        : role === "ceo"
                        ? "Infrastructure Sizer & Capital Costing Simulator"
                        : role === "cpdo"
                        ? "17 UN SDG Auditor & Survey Anomaly Log"
                        : role === "drrmo"
                        ? "Disaster Inundation & Bikol Emergency Dispatch"
                        : role === "cho"
                        ? "Epidemiological & WASH Surveillance"
                        : role === "swo"
                        ? "4Ps Safety Net & Youth NEET Placement"
                        : "Executive Statutory Intelligence"}
                    </p>
                  </div>
                </div>
              </div>



              {/* SUPER ADMIN 5-CONTROLS DECK */}
              {role === "super_admin" && (
                <div className="coolors-card p-5 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#f2f2f2]">
                    <h4 className="text-xs font-bold text-[#0a1128] uppercase tracking-wider">
                      Executive Master Controls
                    </h4>
                    <span className="text-[10px] font-bold text-[#05389f] bg-[#edf3fc] px-2.5 py-0.5 rounded-full border border-[#05389f]/20">
                      Mayor Authority
                    </span>
                  </div>

                  {/* Control 1 */}
                  <div className="p-3 rounded-xl bg-[#f2f2f2] border border-[#e5e7eb] flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-[#0a1128]">1. Cross-Office Data Federation</div>
                      <div className="text-[11px] text-[#4b5563]">Unlocks DRRMO queries into CEO & CHO datasets</div>
                    </div>
                    <button
                      onClick={() => setCrossOfficeSharing(!crossOfficeSharing)}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                        crossOfficeSharing
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {crossOfficeSharing ? "ENABLED" : "LOCKED"}
                    </button>
                  </div>

                  {/* Control 2 */}
                  <div className="p-3 rounded-xl bg-[#f2f2f2] border border-[#e5e7eb] space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-[#0a1128]">2. AIP 20% Dev Fund Ceiling</span>
                      <span className="font-mono text-[#05389f] font-bold">
                        ₱{(aipBudgetCeiling / 1000000).toFixed(1)}M
                      </span>
                    </div>
                    <input
                      type="range"
                      min={20000000}
                      max={80000000}
                      step={5000000}
                      value={aipBudgetCeiling}
                      onChange={(e) => setAipBudgetCeiling(Number(e.target.value))}
                      className="w-full accent-[#05389f] h-1.5 cursor-pointer"
                    />
                  </div>

                  {/* Control 3: Sign-Off Queue */}
                  <div className="p-3 rounded-xl bg-[#f2f2f2] border border-[#e5e7eb] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#0a1128]">3. Executive Sign-Off Queue</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#fccf17] text-[#0a1128] font-mono">
                        {proposals.filter((p) => p.status === "PENDING").length} Pending
                      </span>
                    </div>

                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {proposals.map((prop) => (
                        <div
                          key={prop.id}
                          className="p-3 rounded-xl bg-white border border-[#e5e7eb] text-xs shadow-2xs space-y-1"
                        >
                          <div className="flex items-center justify-between font-bold">
                            <span className="text-[11px] text-[#05389f]">{prop.office} • {prop.barangay}</span>
                            <span className="font-mono text-[#0a1128] font-bold">₱{prop.budget.toLocaleString()}</span>
                          </div>
                          <p className="text-xs text-[#0a1128] font-semibold">{prop.title}</p>
                          <div className="text-[10px] text-[#6b7280] font-mono">
                            {prop.statute} ({prop.section})
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-[#f2f2f2]">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                prop.status === "APPROVED"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : prop.status === "FUNDED"
                                  ? "bg-[#edf3fc] text-[#05389f]"
                                  : prop.status === "REJECTED"
                                  ? "bg-rose-100 text-rose-800"
                                  : "bg-[#fef9e7] text-[#b45309]"
                              }`}
                            >
                              {prop.status}
                            </span>

                            {prop.status === "PENDING" && (
                              <div className="flex space-x-1.5">
                                <button
                                  onClick={() => handleProposalAction(prop.id, "approve")}
                                  className="px-2.5 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-[10px] font-bold cursor-pointer"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleProposalAction(prop.id, "reject")}
                                  className="px-2.5 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-[10px] font-bold cursor-pointer"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                            {prop.status === "APPROVED" && (
                              <button
                                onClick={() => handleProposalAction(prop.id, "fund")}
                                className="px-2.5 py-0.5 bg-[#05389f] hover:bg-[#032770] text-white rounded-full text-[10px] font-bold cursor-pointer"
                              >
                                Allot Budget
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Control 4: RA 10173 */}
                  <div className="p-3 rounded-xl bg-[#f2f2f2] border border-[#e5e7eb] flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-[#0a1128]">4. RA 10173 Privacy Shield</div>
                      <div className="text-[11px] text-[#4b5563]">
                        Suppresses cells &lt;{privacyCellThreshold} households
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {[3, 5, 10].map((num) => (
                        <button
                          key={num}
                          onClick={() => setPrivacyCellThreshold(num)}
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold cursor-pointer transition-colors ${
                            privacyCellThreshold === num
                              ? "bg-[#05389f] text-white"
                              : "bg-white text-[#4b5563] border border-[#bebcbc]"
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Control 5: 3D Calamity Scenario */}
                  <div className="p-3 rounded-xl bg-[#f2f2f2] border border-[#e5e7eb] flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-[#0a1128]">5. 3D Flood Surge Simulation</div>
                      <div className="text-[11px] text-[#4b5563]">Renders Level 3 inundation hazard</div>
                    </div>
                    <button
                      onClick={() => setCalamitySimActive(!calamitySimActive)}
                      className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-all ${
                        calamitySimActive
                          ? "bg-rose-600 text-white animate-pulse"
                          : "bg-rose-100 text-rose-800 hover:bg-rose-200"
                      }`}
                    >
                      {calamitySimActive ? "Stop Surge" : "Simulate"}
                    </button>
                  </div>
                </div>
              )}

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

            {/* Right Column (7 Cols): 27 Barangays Interactive Matrix & Category Filters */}
            <section className="lg:col-span-7 space-y-5">
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
          6. STATUTORY COPILOT DRAWER (COOLORS DESIGN)
         ───────────────────────────────────────────────────────────── */}
      {isAiOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white shadow-2xl border-l border-[#e5e7eb] flex flex-col animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="p-4 border-b border-[#f2f2f2] flex items-center justify-between bg-[#f2f2f2]">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-2xl bg-[#05389f] text-white flex items-center justify-center font-bold shadow-md shadow-blue-900/20 border border-[#fccf17]">
                <Sparkles className="w-4 h-4 text-[#fccf17]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0a1128]">
                  Statutory Decision Support Copilot
                </h3>
                <p className="text-[10px] text-[#4b5563] font-medium">
                  CBMS Local Inference + Legal Corpus (RA 10121, RA 7160, RA 11223)
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsAiOpen(false)}
              className="p-1 rounded-full text-[#6b7280] hover:text-[#0a1128] hover:bg-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`p-3.5 rounded-2xl max-w-[90%] leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-[#05389f] text-white shadow-xs"
                      : "bg-[#f2f2f2] text-[#0a1128] border border-[#e5e7eb]"
                  }`}
                >
                  <p>{msg.text}</p>

                  {/* Legal Citation Badge */}
                  {msg.citation && (
                    <div className="mt-2.5 pt-2 border-t border-[#bebcbc]/40 flex flex-wrap items-center gap-1.5 text-[10px]">
                      <span className="font-bold text-[#0a1128]">Statutory Citation:</span>
                      <span className="px-2 py-0.5 rounded-full bg-white text-[#05389f] font-mono font-bold border border-[#05389f]/20">
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
                          className="px-2 py-0.5 rounded-full bg-[#fef9e7] text-[#0a1128] font-bold border border-[#fccf17]/40"
                        >
                          {sdg}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Drafted Proposal Card */}
                {msg.proposalDraft && (
                  <div className="mt-2 p-3.5 w-full bg-[#fef9e7] border border-[#fccf17] rounded-2xl space-y-2 text-xs shadow-2xs">
                    <div className="flex items-center justify-between font-bold text-[#0a1128]">
                      <span className="text-[#05389f]">Drafted Statutory Proposal</span>
                      <span className="font-mono text-emerald-800">
                        ₱{msg.proposalDraft.estimated_budget_php?.toLocaleString()}
                      </span>
                    </div>
                    <div className="font-bold text-[#0a1128]">
                      {msg.proposalDraft.project_title}
                    </div>
                    <p className="text-[11px] text-[#4b5563] leading-relaxed">
                      {msg.proposalDraft.problem_statement}
                    </p>
                    <button
                      onClick={() => handleQueueDraftProposal(msg.proposalDraft)}
                      className="pill-btn-blue w-full mt-1 py-2 text-xs font-bold cursor-pointer transition-colors shadow-xs"
                    >
                      Queue to Mayor&apos;s Review Deck
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
                        className="px-3 py-1 bg-white hover:bg-slate-50 border border-[#bebcbc]/50 rounded-full text-[10px] text-[#05389f] font-bold cursor-pointer shadow-2xs"
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isAiLoading && (
              <div className="flex items-center space-x-2 text-[#4b5563] text-xs p-2">
                <Sparkles className="w-4 h-4 animate-spin text-[#05389f]" />
                <span>Analyzing CBMS datasets & statutory mandates...</span>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="p-3.5 border-t border-[#f2f2f2] bg-[#f2f2f2] flex items-center space-x-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") executeAiQuery(chatInput);
              }}
              placeholder="Ask CBMS synthesis, statutory basis, or budget..."
              className="flex-1 bg-white border border-[#bebcbc] rounded-full px-4 py-2 text-xs text-[#0a1128] outline-none focus:border-[#05389f] shadow-2xs"
            />
            <button
              onClick={() => executeAiQuery(chatInput)}
              disabled={isAiLoading || !chatInput.trim()}
              className="pill-btn-blue p-2.5 disabled:opacity-50 text-white rounded-full cursor-pointer shadow-xs"
            >
              <Send className="w-4 h-4 text-[#fccf17]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
