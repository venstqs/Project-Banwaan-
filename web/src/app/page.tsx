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
  TrendingUp,
  X,
  Search,
  Filter,
  ArrowUpRight,
  ChevronDown,
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
import CesiumViewer, { SyncedFieldReport } from "../components/CesiumViewer";
import Naga3DMap, { CATEGORIES } from "../components/Naga3DMap";

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

export const NAGA_BARANGAY_NAMES: Record<number, string> = {
  1: "Abella",
  2: "Bagumbayan Norte",
  3: "Bagumbayan Sur",
  4: "Balatas",
  5: "Calauag",
  6: "Cararayan",
  7: "Carolina",
  8: "Concepcion Grande",
  9: "Concepcion Pequeña",
  10: "Dayangdang",
  11: "Del Rosario",
  12: "Dinaga",
  13: "Igualdad Interior",
  14: "Lerma",
  15: "Liboton",
  16: "Mabolo",
  17: "Pacol",
  18: "Panicuason",
  19: "Peñafrancia",
  20: "Sabang",
  21: "San Felipe",
  22: "San Francisco",
  23: "San Isidro",
  24: "Santa Cruz",
  25: "Tabuco",
  26: "Tinago",
  27: "Triangulo"
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
  const [mapEngineMode, setMapEngineMode] = useState<"osm_3d" | "cesium_globe">("osm_3d");
  const [activeNavTab, setActiveNavTab] = useState<string>("dashboard");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all");
  const [searchFilterQuery, setSearchFilterQuery] = useState<string>("");

  // CEO Costing simulator state
  const [sanitationUnitCost, setSanitationUnitCost] = useState<number>(25000);

  // Super Admin 5-Control Deck states
  const [crossOfficeSharing, setCrossOfficeSharing] = useState<boolean>(true);
  const [privacyCellThreshold, setPrivacyCellThreshold] = useState<number>(5);
  const [aipBudgetCeiling, setAipBudgetCeiling] = useState<number>(45000000);
  const [calamitySimActive, setCalamitySimActive] = useState<boolean>(false);

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
      createdBy: "Gemini 3.8 Flash • DRRMO Agent"
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
      createdBy: "Gemini 3.8 Flash • CEO Agent"
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
      createdBy: "Gemini 3.8 Flash • CHO Agent"
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
      createdBy: "Gemini 3.8 Flash • SWO Agent"
    }
  ]);

  const [chatInput, setChatInput] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      sender: "ai",
      text: "Gemini 3.8 Flash (Statutory & CBMS Decision Engine) is online. Analyzing 44,892 households and 181,197 residents across all 27 Naga City barangays categorized across Upland Watershed, CBD Core, Growth Corridor, Poblacion Heritage, and Riverine Delta. Every intervention cites exact statutory authorities (RA 10121, RA 7160, RA 9003, RA 11223, PD 1096, RA 11310, RA 10173) and maps to the 17 UN Sustainable Development Goals.",
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

  // Filter barangays by search query and category
  const filteredBarangays = useMemo(() => {
    return barangays.filter((b: any) => {
      const realName = (NAGA_BARANGAY_NAMES[b.id] || b.name).toLowerCase();
      const cat = BARANGAY_CATEGORIES[b.id];
      const matchesSearch =
        !searchFilterQuery.trim() ||
        realName.includes(searchFilterQuery.toLowerCase()) ||
        String(b.id).includes(searchFilterQuery) ||
        (cat && cat.name.toLowerCase().includes(searchFilterQuery.toLowerCase()));

      const matchesCat =
        selectedCategoryFilter === "all" ||
        (cat && cat.id === selectedCategoryFilter);

      return matchesSearch && matchesCat;
    });
  }, [barangays, searchFilterQuery, selectedCategoryFilter]);

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

  const handleQueueDraftProposal = (draft: any) => {
    if (!draft) return;
    const newProp: Proposal = {
      id: draft.id || draft.proposal_id || `PROP-AI-${Date.now().toString().slice(-3)}`,
      barangay: draft.target_barangay || selectedBarangay.displayName,
      office: (draft.target_office || "CPDO").toUpperCase(),
      title: draft.project_title || draft.title || "Targeted CBMS Capital Program",
      problem: draft.problem_statement || "Identified physical deficit from 2024 CBMS indicators.",
      statute: draft.statutory_basis?.law || "RA 7160 (Local Government Code)",
      section: draft.statutory_basis?.section || "Section 17",
      sdgs: draft.sdgs || ["SDG 11 Sustainable Cities"],
      budget: draft.estimated_budget_php || 450000,
      status: "PENDING",
      confidence: draft.confidence_score || 0.95,
      createdBy: "Gemini 3.8 Flash • AI Agent"
    };

    setProposals((prev) => [newProp, ...prev]);
    setIsAiOpen(false);
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
        setChatMessages((prev) => [
          ...prev,
          {
            sender: "ai",
            text: data.response_text,
            citation: data.statutory_basis?.citation,
            sdgs: data.sdgs,
            suggestedActions: data.suggested_actions,
            proposalDraft: data.drafted_proposal
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
        return { label: "Citizen Transparency", icon: Eye, color: "text-[#05389f] bg-[#edf3fc]" };
    }
  };

  const currentRole = getRoleBadge(role);
  const CurrentIcon = currentRole.icon;

  return (
    <div className="flex min-h-screen bg-[#f7f8fa] text-[#0a1128] font-sans antialiased">
      {/* ─────────────────────────────────────────────────────────────
          1. MODERN LEFT SIDEBAR NAVIGATION (WIDTH 260px)
         ───────────────────────────────────────────────────────────── */}
      <aside className="w-64 bg-white border-r border-[#e5e7eb] flex flex-col justify-between shrink-0 hidden lg:flex sticky top-0 h-screen p-5 z-20">
        <div>
          {/* Brand Mark with User's Royal Blue & Gold Palette */}
          <div className="flex items-center space-x-3 pb-6 border-b border-[#f2f2f2]">
            <div className="w-10 h-10 rounded-2xl bg-[#05389f] flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-blue-900/20 border-2 border-[#fccf17]">
              B
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#0a1128] tracking-tight">Project Banwaan</h2>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-[#fccf17] animate-pulse" />
                <span className="text-[11px] text-[#6b7280] font-semibold">Naga City • 2024 CBMS</span>
              </div>
            </div>
          </div>

          {/* Role Switcher Pill in Sidebar */}
          <div className="mt-5 p-3 rounded-2xl bg-[#f2f2f2] border border-[#e5e7eb]">
            <span className="text-[10px] font-bold text-[#6b7280] uppercase tracking-wider block mb-1.5">
              Active Control Deck
            </span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full bg-white border border-[#bebcbc]/60 rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#05389f] outline-none shadow-2xs cursor-pointer focus:border-[#05389f]"
            >
              <option value="super_admin">City Mayor / Super Admin</option>
              <option value="ceo">City Engineer (CEO)</option>
              <option value="cpdo">Planning Office (CPDO)</option>
              <option value="drrmo">Disaster Risk (DRRMO)</option>
              <option value="cho">City Health (CHO)</option>
              <option value="swo">Social Welfare (SWO)</option>
              <option value="barangay_captain">Barangay Captain</option>
              <option value="citizen">Citizen Transparency</option>
            </select>
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 space-y-1.5">
            <span className="text-[10px] font-bold text-[#6b7280] uppercase tracking-wider block px-3 mb-2">
              Workspace
            </span>

            <button
              onClick={() => setActiveNavTab("dashboard")}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeNavTab === "dashboard"
                  ? "bg-[#05389f] text-white shadow-md shadow-blue-900/20"
                  : "text-[#4b5563] hover:text-[#0a1128] hover:bg-[#f2f2f2]"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => {
                setActiveNavTab("map");
                setMapEngineMode("osm_3d");
              }}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeNavTab === "map" && mapEngineMode === "osm_3d"
                  ? "bg-[#05389f] text-white shadow-md shadow-blue-900/20"
                  : "text-[#4b5563] hover:text-[#0a1128] hover:bg-[#f2f2f2]"
              }`}
            >
              <Building2 className="w-4 h-4 text-[#fccf17]" />
              <span>OSM 3D Downtown</span>
            </button>

            <button
              onClick={() => {
                setActiveNavTab("map");
                setMapEngineMode("cesium_globe");
              }}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeNavTab === "map" && mapEngineMode === "cesium_globe"
                  ? "bg-[#05389f] text-white shadow-md shadow-blue-900/20"
                  : "text-[#4b5563] hover:text-[#0a1128] hover:bg-[#f2f2f2]"
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Cesium 3D Globe</span>
            </button>

            <button
              onClick={() => setActiveNavTab("proposals")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeNavTab === "proposals"
                  ? "bg-[#05389f] text-white shadow-md shadow-blue-900/20"
                  : "text-[#4b5563] hover:text-[#0a1128] hover:bg-[#f2f2f2]"
              }`}
            >
              <div className="flex items-center space-x-3">
                <FileCheck className="w-4 h-4" />
                <span>AIP Proposals</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#fccf17] text-[#0a1128] font-extrabold font-mono">
                {proposals.filter((p) => p.status === "PENDING").length}
              </span>
            </button>

            <button
              onClick={() => setActiveNavTab("sdg")}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeNavTab === "sdg"
                  ? "bg-[#05389f] text-white shadow-md shadow-blue-900/20"
                  : "text-[#4b5563] hover:text-[#0a1128] hover:bg-[#f2f2f2]"
              }`}
            >
              <Scale className="w-4 h-4" />
              <span>17 UN SDG Audit</span>
            </button>

            <button
              onClick={() => setActiveNavTab("mobile")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeNavTab === "mobile"
                  ? "bg-[#05389f] text-white shadow-md shadow-blue-900/20"
                  : "text-[#4b5563] hover:text-[#0a1128] hover:bg-[#f2f2f2]"
              }`}
            >
              <div className="flex items-center space-x-3">
                <Smartphone className="w-4 h-4" />
                <span>Mobile Telemetry</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </button>
          </nav>
        </div>

        {/* Bottom Profile Card */}
        <div className="pt-4 border-t border-[#f2f2f2]">
          <div className="flex items-center space-x-3 p-2.5 rounded-2xl bg-[#f2f2f2] border border-[#e5e7eb]">
            <div className="w-9 h-9 rounded-full bg-[#05389f] text-white flex items-center justify-center font-bold text-xs border border-[#fccf17]">
              NM
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-[#0a1128] truncate">Hon. City Mayor</div>
              <div className="text-[10px] text-emerald-600 font-semibold flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>FastAPI Port 8000</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ─────────────────────────────────────────────────────────────
          2. MAIN CANVAS AREA
         ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#e5e7eb] px-6 py-3.5 flex items-center justify-between gap-4">
          {/* Search Pill */}
          <div className="flex-1 max-w-md relative">
            <Search className="w-4 h-4 text-[#bebcbc] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFilterQuery}
              onChange={(e) => setSearchFilterQuery(e.target.value)}
              placeholder="Search 27 Naga Barangays, categories, or statutes..."
              className="w-full bg-[#f2f2f2] border border-transparent focus:border-[#05389f] focus:bg-white rounded-full pl-9 pr-4 py-2 text-xs text-[#0a1128] outline-none transition-all placeholder:text-[#6b7280]"
            />
          </div>

          {/* Quick Filter Chips */}
          <div className="hidden md:flex items-center space-x-2">
            <button
              onClick={() => setSelectedBarangayId(16)}
              className="px-3.5 py-1 rounded-full bg-[#fef9e7] border border-[#fccf17] text-[#0a1128] text-xs font-bold hover:bg-[#fee573] transition-all cursor-pointer"
            >
              🌊 Mabolo (Hotspot)
            </button>
            <button
              onClick={() => setSelectedBarangayId(18)}
              className="px-3.5 py-1 rounded-full bg-[#f2f2f2] text-[#4b5563] text-xs font-bold hover:bg-slate-200 transition-colors cursor-pointer"
            >
              ⛰️ Panicuason (Upland)
            </button>
            <button
              onClick={() => setSelectedBarangayId(27)}
              className="px-3.5 py-1 rounded-full bg-[#f2f2f2] text-[#4b5563] text-xs font-bold hover:bg-slate-200 transition-colors cursor-pointer"
            >
              🏢 Triangulo (CBD)
            </button>
          </div>

          {/* AI Trigger Pill Button */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsAiOpen(true)}
              className="pill-btn-blue flex items-center space-x-2 px-4 py-2 text-xs font-bold cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#fccf17]" />
              <span>Gemini 3.8 Copilot</span>
            </button>
          </div>
        </header>

        {/* Dashboard Main Body */}
        <main className="p-6 max-w-[1520px] mx-auto w-full space-y-6">
          {/* Main Title Header */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2.5">
                <h1 className="text-2xl font-black tracking-tight text-[#0a1128] font-heading">
                  Dashboard
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#edf3fc] text-[#05389f] border border-[#05389f]/20">
                  Naga City • 27 Categorized Barangays
                </span>
              </div>
              <p className="text-xs text-[#4b5563] mt-0.5 font-medium">
                Dual 3D Geospatial Intelligence & Statutory Decision Support System • 2024 PSA CBMS
              </p>
            </div>

            {/* Department Quick Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 bg-white p-1 rounded-full border border-[#e5e7eb] shadow-2xs text-xs">
              {(["super_admin", "ceo", "cpdo", "drrmo", "cho", "swo"] as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    role === r
                      ? "bg-[#05389f] text-white shadow-xs"
                      : "text-[#4b5563] hover:text-[#0a1128] hover:bg-[#f2f2f2]"
                  }`}
                >
                  {r === "super_admin"
                    ? "Mayor"
                    : r === "ceo"
                    ? "CEO"
                    : r === "cpdo"
                    ? "CPDO"
                    : r === "drrmo"
                    ? "DRRMO"
                    : r === "cho"
                    ? "CHO"
                    : "SWO"}
                </button>
              ))}
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              3. HERO METRIC ROW (COOLORS PALETTE: ROYAL BLUE + SUN GOLD)
             ───────────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {/* Focal Big Metric Box */}
            <div className="coolors-card p-5 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-[#6b7280] uppercase tracking-wider">
                  Total Covered Population
                </span>
                <div className="text-3xl font-black text-[#0a1128] mt-1 font-mono tracking-tight">
                  {summary.total_population?.toLocaleString()}
                </div>
                <div className="text-xs text-[#4b5563] mt-0.5 font-medium">
                  {summary.total_households?.toLocaleString()} households • 4.04 avg size
                </div>
              </div>

              {/* Category Breakdown Chips */}
              <div className="grid grid-cols-3 gap-1.5 mt-4 pt-3 border-t border-[#f2f2f2]">
                <div className="bg-[#fef9e7] p-1.5 rounded-xl text-center border border-[#b59410]/30">
                  <span className="text-[9px] font-bold text-[#b59410] block">⛰️ Upland</span>
                  <span className="text-[11px] font-bold text-[#0a1128] font-mono">5 Brgys</span>
                </div>
                <div className="bg-[#edf3fc] p-1.5 rounded-xl text-center border border-[#05389f]/20">
                  <span className="text-[9px] font-bold text-[#05389f] block">🏢 CBD Core</span>
                  <span className="text-[11px] font-bold text-[#0a1128] font-mono">6 Brgys</span>
                </div>
                <div className="bg-[#fff1f2] p-1.5 rounded-xl text-center border border-[#ea580c]/30">
                  <span className="text-[9px] font-bold text-[#ea580c] block">🌊 Riverine</span>
                  <span className="text-[11px] font-bold text-[#0a1128] font-mono">4 Brgys</span>
                </div>
              </div>
            </div>

            {/* HERO CARD 1: ROYAL BLUE GRADIENT (#05389f) */}
            <div className="gradient-royal-blue p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold tracking-wider uppercase text-white/80">
                    AIP 2026 Dev Fund
                  </span>
                  <Building2 className="w-4 h-4 text-[#fccf17]" />
                </div>
                <div className="text-3xl font-black mt-2 font-mono">
                  ₱{(aipBudgetCeiling / 1000000).toFixed(1)}M
                </div>
                <p className="text-xs text-white/80 mt-1 leading-relaxed">
                  RA 7160 Sec. 287 (20% Local Development Fund) Statutory Ceiling
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between">
                <span className="text-[11px] text-white/90 font-medium">4 Proposals Queued</span>
                <button
                  onClick={() => setActiveNavTab("proposals")}
                  className="pill-btn-glass px-3 py-1 text-xs font-bold cursor-pointer"
                >
                  Manage Queue →
                </button>
              </div>
            </div>

            {/* HERO CARD 2: SUN GOLD GRADIENT (#fccf17) */}
            <div className="gradient-sun-gold p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold tracking-wider uppercase text-[#0a1128]/80">
                    Critical Hotspot Zone
                  </span>
                  <Flame className="w-4 h-4 text-[#05389f]" />
                </div>
                <div className="text-3xl font-black mt-2 tracking-tight text-[#0a1128]">
                  Mabolo (Brgy 16)
                </div>
                <p className="text-xs text-[#0a1128]/80 mt-1 leading-relaxed font-medium">
                  Riverine Delta • MVI 95.0 • 1,459 Food Insecure HHs • Refilling 82%
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-black/10 flex items-center justify-between">
                <span className="text-[11px] text-[#0a1128] font-bold">RA 11223 Sec. 19</span>
                <button
                  onClick={() => setSelectedBarangayId(16)}
                  className="bg-[#05389f] text-white px-3 py-1 rounded-full text-xs font-bold hover:bg-[#032770] transition-colors cursor-pointer shadow-xs"
                >
                  Inspect Hotspot →
                </button>
              </div>
            </div>

            {/* Hero Card 4: Citywide MVI Diagnostic */}
            <div className="coolors-card p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#6b7280] uppercase tracking-wider">
                    Citywide MVI Score
                  </span>
                  <BarChart3 className="w-4 h-4 text-[#05389f]" />
                </div>
                <div className="text-3xl font-black text-[#05389f] mt-2 font-mono">
                  {summary.avg_citywide_vulnerability}{" "}
                  <span className="text-xs text-[#6b7280] font-normal">/ 100</span>
                </div>
                <p className="text-xs text-[#4b5563] mt-1 font-medium">
                  PCA Dimensional Reduction (77.7% variance across 27 barangays)
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#f2f2f2] flex items-center justify-between text-xs text-[#4b5563]">
                <span>Lowest: Brgy 24 (12.4)</span>
                <span className="font-bold text-rose-700">Peak: Brgy 16 (95.0)</span>
              </div>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              4. 3D GEOSPATIAL ENGINE VIEWPORT WITH BARANGAY LABELS
             ───────────────────────────────────────────────────────────── */}
          <div className="coolors-card p-2 overflow-hidden shadow-sm">
            <div className="p-3 bg-white rounded-t-xl flex flex-wrap items-center justify-between gap-3 border-b border-[#f2f2f2]">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#05389f] text-white flex items-center justify-center font-bold text-xs border border-[#fccf17]">
                  3D
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#0a1128]">
                    {mapEngineMode === "osm_3d"
                      ? "Naga City Administrative Map 3D (All 27 Categorized Barangays Labeled)"
                      : "Naga City Digital Twin (CesiumJS 3D Satellite)"}
                  </h3>
                  <p className="text-[10px] text-[#6b7280]">
                    Interactive spatial boundaries, official category zoning & real-time telemetry
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setMapEngineMode("osm_3d")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    mapEngineMode === "osm_3d"
                      ? "bg-[#05389f] text-white shadow-xs"
                      : "bg-[#f2f2f2] text-[#4b5563] hover:text-[#0a1128] hover:bg-slate-200"
                  }`}
                >
                  🏢 OSM 3D Vector
                </button>
                <button
                  onClick={() => setMapEngineMode("cesium_globe")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    mapEngineMode === "cesium_globe"
                      ? "bg-[#05389f] text-white shadow-xs"
                      : "bg-[#f2f2f2] text-[#4b5563] hover:text-[#0a1128] hover:bg-slate-200"
                  }`}
                >
                  🌐 CesiumJS 3D Globe
                </button>
              </div>
            </div>

            {mapEngineMode === "osm_3d" ? (
              <Naga3DMap
                selectedBarangayId={selectedBarangayId}
                onSelectBarangay={(id) => setSelectedBarangayId(id)}
                activeRole={role}
                onToggleCesium={() => setMapEngineMode("cesium_globe")}
                isCesiumMode={false}
              />
            ) : (
              <div className="relative">
                <CesiumViewer
                  selectedBarangayId={selectedBarangayId}
                  onSelectBarangay={(id) => setSelectedBarangayId(id)}
                  activeRole={role}
                  calamitySimActive={calamitySimActive}
                  fieldReports={fieldReports}
                />
              </div>
            )}
          </div>

          {/* ─────────────────────────────────────────────────────────────
              5. LOWER SPLIT SECTION: ROLE WORKBENCH & 27 BARANGAYS MATRIX
             ───────────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
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
                        : role === "barangay_captain"
                        ? "Localized Council Needs & Statutory Endorsement"
                        : "Public Verified LGU Project Tracker"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Selected Barangay Diagnostic Card */}
              <div className="coolors-card p-5 space-y-3.5 border-2 border-[#05389f]/20">
                <div className="flex items-center justify-between pb-2 border-b border-[#f2f2f2]">
                  <div className="flex items-center space-x-2">
                    <span className="text-base">{selectedBarangay.category.icon}</span>
                    <div>
                      <h4 className="font-extrabold text-[#0a1128] text-sm leading-tight">
                        {selectedBarangay.realName}
                      </h4>
                      <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: selectedBarangay.category.color }}>
                        {selectedBarangay.category.name}
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-extrabold bg-[#edf3fc] text-[#05389f] border border-[#05389f]/20">
                    MVI {selectedBarangay.vulnerability_index}
                  </span>
                </div>

                <p className="text-xs text-[#4b5563] leading-relaxed">
                  {selectedBarangay.category.description}
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-[#f2f2f2] p-2.5 rounded-xl border border-[#e5e7eb]">
                    <span className="text-[10px] text-[#6b7280] uppercase font-bold">Households</span>
                    <div className="font-bold text-[#0a1128] text-sm mt-0.5 font-mono">
                      {selectedBarangay.total_households?.toLocaleString()} HHs
                    </div>
                  </div>
                  <div className="bg-[#f2f2f2] p-2.5 rounded-xl border border-[#e5e7eb]">
                    <span className="text-[10px] text-[#6b7280] uppercase font-bold">Population</span>
                    <div className="font-bold text-[#0a1128] text-sm mt-0.5 font-mono">
                      {selectedBarangay.total_population?.toLocaleString()} Pop
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs bg-[#f7f8fa] p-3 rounded-xl border border-[#e5e7eb]">
                  <div className="flex justify-between">
                    <span className="text-[#6b7280]">Weak Roof Structure:</span>
                    <span className="font-bold text-rose-700 font-mono">{selectedBarangay.drrm?.weak_roof_pct}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6b7280]">Refilling Station Dependency:</span>
                    <span className="font-bold text-[#05389f] font-mono">{selectedBarangay.infrastructure_ceo?.drinking_refilling_pct}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6b7280]">Sanitation Deficit (Unimproved):</span>
                    <span className="font-bold text-amber-800 font-mono">{selectedBarangay.infrastructure_ceo?.unimproved_toilet_pct}%</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsAiOpen(true);
                    executeAiQuery(`Synthesize priority statutory intervention for ${selectedBarangay.displayName} (${selectedBarangay.category.name})`);
                  }}
                  className="pill-btn-blue w-full py-2 text-xs font-bold flex items-center justify-center space-x-2 cursor-pointer shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#fccf17]" />
                  <span>Synthesize {selectedBarangay.realName} Capital Proposal</span>
                </button>
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
                      Categorized by CLUP functional and ecological planning sectors
                    </p>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-[#edf3fc] text-[#05389f] text-xs font-bold font-mono border border-[#05389f]/20">
                    {filteredBarangays.length} / 27 Displayed
                  </span>
                </div>

                {/* Category Filter Chips (Requested by User) */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const isActive = selectedCategoryFilter === cat.id;

                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategoryFilter(cat.id)}
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
                <div className="overflow-x-auto max-h-96 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#f2f2f2] text-[#4b5563] uppercase text-[10px] font-bold sticky top-0 border-b border-[#e5e7eb]">
                      <tr>
                        <th className="py-2.5 px-3">Barangay Name</th>
                        <th className="py-2.5 px-3">Category / District</th>
                        <th className="py-2.5 px-3">MVI Score</th>
                        <th className="py-2.5 px-3">Households</th>
                        <th className="py-2.5 px-3">Refilling %</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f2f2f2]">
                      {filteredBarangays.map((b: any) => {
                        const rName = NAGA_BARANGAY_NAMES[b.id] || b.name;
                        const cat = BARANGAY_CATEGORIES[b.id];
                        const isSelected = b.id === selectedBarangayId;

                        return (
                          <tr
                            key={b.id}
                            onClick={() => setSelectedBarangayId(b.id)}
                            className={`cursor-pointer transition-colors ${
                              isSelected
                                ? "bg-[#edf3fc] font-bold border-l-4 border-[#05389f]"
                                : "hover:bg-[#f2f2f2]"
                            }`}
                          >
                            <td className="py-2.5 px-3">
                              <div className="flex items-center space-x-2">
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
                              {b.infrastructure_ceo?.drinking_refilling_pct}%
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <span className="text-[11px] text-[#05389f] font-bold hover:underline">
                                Focus →
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          6. GEMINI 3.8 FLASH COPILOT DRAWER (COOLORS DESIGN)
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
                  Gemini 3.8 Flash • Statutory Copilot
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
                <span>Gemini 3.8 is analyzing CBMS datasets & statutory mandates...</span>
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
