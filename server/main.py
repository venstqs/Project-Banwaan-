import json
import os
from datetime import datetime
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(
    title="Project Banwaan Core Intelligence API (Gemini 3.8 Flash Engine)",
    description="Backend engine for Naga City CBMS Analytics, PCA Vulnerability, SDG Alignment, and Gemini 3.8 Flash Algorithmic Synthesis",
    version="3.8.0"
)

# Enable CORS for Next.js web portal and React Native mobile app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load datasets
DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data"))
CBMS_DATA_FILE = os.path.join(DATA_DIR, "processed_cbms_data.json")
SDG_DATA_FILE = os.path.join(DATA_DIR, "sdg_dataset.json")
LEGAL_DATA_FILE = os.path.join(DATA_DIR, "legal_corpus.json")

def load_json(filepath):
    if os.path.exists(filepath):
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}

cbms_cache = load_json(CBMS_DATA_FILE)
sdg_cache = load_json(SDG_DATA_FILE)
legal_cache = load_json(LEGAL_DATA_FILE)

# In-memory proposal and project tracker storage
proposals_db = [
    {
        "id": "PROP-NAGA-2026-DRRMO-001",
        "barangay": "Barangay 3",
        "office": "DRRMO",
        "title": "Barangay 3 Contingency Planning & Emergency Operations Activation",
        "problem_statement": "Barangay 3 lacks a written DRRM plan and emergency hotline despite high shelter fragility (weak roof 8.8%, weak walls 18.3%).",
        "evidence": {
            "has_written_plan": False,
            "has_hotline": False,
            "total_households": 1508,
            "vulnerability_index": 54.2
        },
        "statutory_basis": {
            "law": "RA 10121",
            "section": "Section 12 (c) (6)",
            "citation": "Formulation and implementation of a comprehensive Barangay Disaster Risk Reduction and Management Plan (BDRRMP)."
        },
        "sdgs": ["SDG 11 Sustainable Cities", "SDG 13 Climate Action"],
        "estimated_budget_php": 185000,
        "expected_indicator_delta": "Establish written plan and hotline within 45 days",
        "confidence_score": 0.96,
        "status": "APPROVED",
        "created_by": "Gemini 3.8 Flash • DRRMO Agent"
    },
    {
        "id": "PROP-NAGA-2026-CEO-002",
        "barangay": "Barangay 16",
        "office": "CEO",
        "title": "Piped Water Reticulation & Communal Sanitary Toilet Upgrade",
        "problem_statement": "High reliance on commercial refilling stations and unimproved sanitation gaps across 1,779 responding households.",
        "evidence": {
            "drinking_refilling_pct": 68.4,
            "unimproved_toilet_pct": 24.1,
            "total_households": 1779
        },
        "statutory_basis": {
            "law": "RA 7160",
            "section": "Section 17",
            "citation": "Provision of basic sanitation, water supply systems, and public hygiene facilities."
        },
        "sdgs": ["SDG 6 Clean Water & Sanitation", "SDG 9 Industry & Infrastructure"],
        "estimated_budget_php": 1250000,
        "expected_indicator_delta": "Reduce refilling station dependency by 30% and eliminate open defecation",
        "confidence_score": 0.93,
        "status": "PENDING",
        "created_by": "Gemini 3.8 Flash • CEO Agent"
    },
    {
        "id": "PROP-NAGA-2026-CHO-003",
        "barangay": "Barangay 16",
        "office": "CHO",
        "title": "Food Insecurity Verification Mission & Water Bacteriological Testing",
        "problem_statement": "Extreme food-insecurity reading outlier (PDF Table 21: 1,459 worried households) and water quality risk requires clinical validation.",
        "evidence": {
            "food_insecurity_count": 1459,
            "total_households": 1779
        },
        "statutory_basis": {
            "law": "RA 11223",
            "section": "Section 19",
            "citation": "Integration of primary care networks and community disease surveillance."
        },
        "sdgs": ["SDG 2 Zero Hunger", "SDG 3 Good Health"],
        "estimated_budget_php": 280000,
        "expected_indicator_delta": "Verify 100% of flagged households and test all refilling stations",
        "confidence_score": 0.91,
        "status": "PENDING",
        "created_by": "Gemini 3.8 Flash • CHO Agent"
    },
    {
        "id": "PROP-NAGA-2026-SWO-004",
        "barangay": "Barangay 1",
        "office": "SWO",
        "title": "Digital Cash-Aid Payout Enrollment & NEET Youth Skills Placement",
        "problem_statement": "33.4% unbanked households and 137 NEET youth in Barangay 1 requiring targeted social safety net integration.",
        "evidence": {
            "unbanked_pct": 33.4,
            "neet_youth_count": 137,
            "total_households": 1065
        },
        "statutory_basis": {
            "law": "RA 11310",
            "section": "Section 13",
            "citation": "Convergence of social protection, digital cash grants, and livelihood placement."
        },
        "sdgs": ["SDG 1 No Poverty", "SDG 8 Decent Work"],
        "estimated_budget_php": 340000,
        "expected_indicator_delta": "Onboard 350+ unbanked households to e-money accounts and train 137 NEET youth",
        "confidence_score": 0.94,
        "status": "PENDING",
        "created_by": "Gemini 3.8 Flash • SWO Agent"
    }
]

# Field reports submitted via Mobile App (seeded with initial verified field inspection)
field_reports_db = [
    {
        "id": "RPT-NAGA-0001",
        "barangay_id": 3,
        "barangay_name": "Barangay 3",
        "report_type": "Shelter Inspection",
        "description": "Inspected secondary school evacuation facility. Roof flashing intact, generator fuel refilled.",
        "latitude": 13.6202,
        "longitude": 123.1808,
        "offline_created_at": "14:30 PHT",
        "reporter_role": "Barangay Captain",
        "server_synced_at": "2026-10-26T14:35:00Z"
    }
]

# Official 27 Naga City Barangay Names mapped to CBMS Barangay 1-27
NAGA_BARANGAY_NAMES = {
    1: "Abella (Barangay 1)",
    2: "Bagumbayan Norte (Barangay 2)",
    3: "Bagumbayan Sur (Barangay 3)",
    4: "Balatas (Barangay 4)",
    5: "Calauag (Barangay 5)",
    6: "Cararayan (Barangay 6)",
    7: "Carolina (Barangay 7)",
    8: "Concepcion Grande (Barangay 8)",
    9: "Concepcion Pequeña (Barangay 9)",
    10: "Dayangdang (Barangay 10)",
    11: "Del Rosario (Barangay 11)",
    12: "Dinaga (Barangay 12)",
    13: "Igualdad Interior (Barangay 13)",
    14: "Lerma (Barangay 14)",
    15: "Liboton (Barangay 15)",
    16: "Mabolo (Barangay 16)",
    17: "Pacol (Barangay 17)",
    18: "Panicuason (Barangay 18)",
    19: "Peñafrancia (Barangay 19)",
    20: "Sabang (Barangay 20)",
    21: "San Felipe (Barangay 21)",
    22: "San Francisco (Barangay 22)",
    23: "San Isidro (Barangay 23)",
    24: "Santa Cruz (Barangay 24)",
    25: "Tabuco (Barangay 25)",
    26: "Tinago (Barangay 26)",
    27: "Triangulo (Barangay 27)",
}

# --- Request Models ---
class AgentQueryRequest(BaseModel):
    role: Optional[str] = "super_admin" # "super_admin", "ceo", "cpdo", "drrmo", "cho", "swo", "barangay_captain", "citizen"
    user_role: Optional[str] = None
    query: str
    barangay_id: Optional[int] = None
    target_office: Optional[str] = None
    auto_queue_proposal: Optional[bool] = False

class ProposalCreateRequest(BaseModel):
    id: Optional[str] = None
    barangay: str
    office: str
    title: str
    problem_statement: str
    statutory_basis: Dict[str, Any]
    sdgs: List[str]
    estimated_budget_php: float
    confidence_score: Optional[float] = 0.95
    created_by: Optional[str] = "Gemini 3.8 Flash • Statutory Copilot"

class ProposalActionRequest(BaseModel):
    action: str # "approve", "reject", "fund"
    reviewer_comments: Optional[str] = None

class MobileFieldReport(BaseModel):
    barangay_id: int
    barangay_name: str
    report_type: str
    description: str
    latitude: float
    longitude: float
    offline_created_at: str
    image_base64: Optional[str] = None
    reporter_role: str = "Barangay Captain"

# --- Endpoints ---

@app.get("/api/health")
def health_check():
    cbms_cache_fresh = load_json(CBMS_DATA_FILE)
    return {
        "status": "healthy",
        "city": "Naga City",
        "model_engine": "Gemini 3.8 Flash (Local Algorithmic CBMS + Statutory Synthesis)",
        "total_barangays": len(cbms_cache_fresh.get("barangays", [])),
        "total_households": cbms_cache_fresh.get("summary", {}).get("total_households", 44892),
        "total_population": cbms_cache_fresh.get("summary", {}).get("total_population", 181197),
        "synced_mobile_reports": len(field_reports_db),
        "active_proposals": len(proposals_db)
    }

@app.get("/api/summary")
def get_city_summary():
    """Get high level city statistics for Mayor and Public transparency"""
    fresh = load_json(CBMS_DATA_FILE)
    return fresh.get("summary", {})

@app.get("/api/barangays")
def get_all_barangays(role: str = Query("citizen")):
    """
    Get all 27 barangays.
    Applies RA 10173 data privacy: suppresses micro-cells if role is citizen.
    """
    fresh = load_json(CBMS_DATA_FILE)
    brgy_list = fresh.get("barangays", [])
    if role == "citizen":
        sanitized = []
        for b in brgy_list:
            sanitized.append({
                "id": b["id"],
                "name": b["name"],
                "total_households": b["total_households"],
                "total_population": b["total_population"],
                "vulnerability_index": b["vulnerability_index"],
                "sector_scores": b["sector_scores"],
                "sdg_scores": b["sdg_scores"]
            })
        return sanitized
    return brgy_list

@app.get("/api/barangays/{brgy_id}")
def get_barangay_detail(brgy_id: int):
    fresh = load_json(CBMS_DATA_FILE)
    brgy_list = fresh.get("barangays", [])
    for b in brgy_list:
        if b["id"] == brgy_id:
            return b
    raise HTTPException(status_code=404, detail="Barangay not found")

@app.get("/api/departments/{dept_code}")
def get_department_data(dept_code: str, role: str = Query(...)):
    dept_code = dept_code.lower()
    allowed = (role == "super_admin") or (role == dept_code)
    if not allowed:
        raise HTTPException(
            status_code=403, 
            detail=f"Access Denied: Role '{role}' is not authorized to inspect {dept_code.upper()} proprietary sector datasets."
        )
        
    fresh = load_json(CBMS_DATA_FILE)
    brgys = fresh.get("barangays", [])
    dept_records = []
    for b in brgys:
        record = {
            "id": b["id"],
            "name": b["name"],
            "total_households": b["total_households"],
            "vulnerability_index": b["vulnerability_index"]
        }
        if dept_code == "ceo":
            record.update(b.get("infrastructure_ceo", {}))
            record["sector_score"] = b["sector_scores"]["ceo_infrastructure_deficit"]
        elif dept_code == "cpdo":
            record.update(b.get("planning_cpdo", {}))
            record["pca_dimensions"] = b.get("pca_dimensions", {})
            record["sdg_scores"] = b.get("sdg_scores", {})
            record["sector_score"] = b["sector_scores"]["cpdo_planning_gap"]
        elif dept_code == "drrmo":
            record.update(b.get("drrm", {}))
            record["sector_score"] = b["sector_scores"]["drrmo_disaster_risk"]
        elif dept_code == "cho":
            record.update(b.get("health_cho", {}))
            record["sector_score"] = b["sector_scores"]["cho_health_risk"]
        elif dept_code == "swo":
            record.update(b.get("social_swo", {}))
            record["sector_score"] = b["sector_scores"]["swo_social_vulnerability"]
            
        dept_records.append(record)
        
    return {
        "department": dept_code.upper(),
        "total_barangays": len(dept_records),
        "data": dept_records
    }

@app.get("/api/sdgs")
def get_sdgs():
    return sdg_cache.get("sdgs", [])

@app.get("/api/statutes")
def get_statutes():
    return legal_cache.get("statutes", [])

@app.get("/api/proposals")
def get_proposals(office: Optional[str] = None):
    if office:
        return [p for p in proposals_db if p["office"].lower() == office.lower()]
    return proposals_db

@app.post("/api/proposals")
def create_proposal(req: ProposalCreateRequest):
    new_prop = {
        "id": req.id or f"PROP-NAGA-2026-{req.office.upper()}-{len(proposals_db)+1:03d}",
        "barangay": req.barangay,
        "office": req.office.upper(),
        "title": req.title,
        "problem_statement": req.problem_statement,
        "statutory_basis": req.statutory_basis,
        "sdgs": req.sdgs,
        "estimated_budget_php": req.estimated_budget_php,
        "confidence_score": req.confidence_score or 0.95,
        "status": "PENDING",
        "created_by": req.created_by or "Gemini 3.8 Flash • Statutory Copilot"
    }
    proposals_db.insert(0, new_prop)
    return {"message": "Proposal queued to Mayor's Review Deck", "proposal": new_prop}

@app.post("/api/proposals/{prop_id}/review")
def review_proposal(prop_id: str, req: ProposalActionRequest, role: str = Query("super_admin")):
    for p in proposals_db:
        if p["id"] == prop_id:
            if req.action == "approve":
                p["status"] = "APPROVED"
            elif req.action == "reject":
                p["status"] = "REJECTED"
            elif req.action == "fund":
                p["status"] = "FUNDED"
            p["reviewer_notes"] = req.reviewer_comments
            return {"message": f"Proposal {prop_id} successfully updated to {p['status']}", "proposal": p}
            
    raise HTTPException(status_code=404, detail="Proposal not found")

@app.post("/api/agent/query")
def agent_query(req: AgentQueryRequest):
    """
    Gemini 3.8 Flash Algorithmic Multi-Factor Synthesis Engine (Zero External API Dependency):
    - Dynamically inspects exact household counts, PCA dimensions, and sector deficits for any Barangay 1-27
    - Computes empirical engineering/social costings from exact household deficits
    - Cites exact statutory articles from legal_corpus.json
    - Maps all proposed programs strictly to UN SDGs
    """
    fresh = load_json(CBMS_DATA_FILE)
    brgys = fresh.get("barangays", [])

    # Check if user mentioned a specific barangay number or real Naga barangay name in their query text
    detected_brgy_id = req.barangay_id or 3
    q_low = req.query.lower()
    for i in range(27, 0, -1):
        real_label = NAGA_BARANGAY_NAMES.get(i, "").split(" (")[0].lower()
        if (
            f"barangay {i}" in q_low
            or f"brgy {i}" in q_low
            or f"b{i}" in q_low.split()
            or (real_label and real_label in q_low)
        ):
            detected_brgy_id = i
            break

    brgy_name = NAGA_BARANGAY_NAMES.get(detected_brgy_id, f"Barangay {detected_brgy_id}")
    brgy = next((b for b in brgys if b["id"] == detected_brgy_id), brgys[0] if brgys else {})

    hh = brgy.get("total_households", 1200)
    pop = brgy.get("total_population", 4800)
    mvi = brgy.get("vulnerability_index", 58.0)
    drrm = brgy.get("drrm", {})
    ceo = brgy.get("infrastructure_ceo", {})
    cho = brgy.get("health_cho", {})
    swo = brgy.get("social_swo", {})
    pca = brgy.get("pca_dimensions", {})

    # Determine primary domain from query keywords OR user role
    effective_role = req.user_role or req.role or "super_admin"
    office = (req.target_office or effective_role).upper()
    if any(k in q_low for k in ["flood", "typhoon", "disaster", "hotline", "evac", "roof", "storm", "bikol", "warning", "drrm"]):
        domain = "DRRMO"
    elif any(k in q_low for k in ["water", "toilet", "sanitation", "pipe", "electric", "power", "road", "infra", "building"]):
        domain = "CEO"
    elif any(k in q_low for k in ["health", "food", "hunger", "nutrition", "wash", "senior", "clinic", "medical", "disease"]):
        domain = "CHO"
    elif any(k in q_low for k in ["youth", "neet", "unbanked", "gcash", "payout", "4ps", "poverty", "livelihood", "welfare", "cash"]):
        domain = "SWO"
    elif office in ["DRRMO", "CEO", "CHO", "SWO", "CPDO"]:
        domain = office
    else:
        # Auto-pick the highest deficit sector in that barangay!
        sec = brgy.get("sector_scores", {})
        best_sec = max(
            [
                ("CEO", sec.get("ceo_infrastructure_deficit", 40)),
                ("CHO", sec.get("cho_health_risk", 40)),
                ("SWO", sec.get("swo_social_vulnerability", 40)),
                ("DRRMO", sec.get("drrmo_disaster_risk", 40)),
            ],
            key=lambda x: x[1]
        )
        domain = best_sec[0]

    if domain == "DRRMO":
        statute = legal_cache["statutes"][0] # RA 10121
        section = statute["key_sections"][0]
        weak_roof_hh = max(12, int(round((drrm.get("weak_roof_pct", 5.0) / 100.0) * hh)))
        no_net_hh = int(round((drrm.get("pct_without_internet", 25.0) / 100.0) * hh))
        plan_status = "lacks a written BDRRM plan" if not drrm.get("has_written_plan") else "has an adopted BDRRM plan"
        hotline_status = "no active 24/7 hotline" if not drrm.get("has_hotline") else "an active emergency hotline"
        calc_budget = round((120000 + weak_roof_hh * 1800) / 5000) * 5000

        proposal = {
            "id": f"PROP-NAGA-2026-DRRMO-{len(proposals_db)+1:03d}",
            "proposal_id": f"PROP-NAGA-2026-DRRMO-{len(proposals_db)+1:03d}",
            "barangay": brgy_name,
            "office": "DRRMO",
            "title": f"Typhoon Shelter Reinforcement & Early Warning System for {brgy_name}",
            "problem_statement": f"{brgy_name} ({hh:,} HHs, {pop:,} residents) {plan_status} with {hotline_status}. {weak_roof_hh:,} households ({drrm.get('weak_roof_pct', 5)}%) have light/salvaged roofs and {no_net_hh:,} HHs lack internet for online advisories.",
            "statutory_basis": {
                "law": statute["code"],
                "section": section["section"],
                "title": section["title"],
                "citation": section["summary"]
            },
            "sdgs": ["SDG 11 Sustainable Cities", "SDG 13 Climate Action"],
            "suggested_actions": [
                f"Reinforce {weak_roof_hh:,} vulnerable light-roof dwellings in {brgy_name} prior to typhoon season",
                f"Deploy acoustic siren & Bikol SMS broadcast to reach {no_net_hh:,} offline households",
                "Mandate Sangguniang Barangay adoption of localized flood evacuation protocols under RA 10121"
            ],
            "estimated_budget_php": float(calc_budget),
            "confidence_score": 0.96,
            "status": "PENDING",
            "created_by": "Gemini 3.8 Flash • DRRMO Engine"
        }
    elif domain == "CEO":
        statute = legal_cache["statutes"][1] # RA 7160
        section = statute["key_sections"][0]
        san_hh = ceo.get("households_needing_sanitation", 150)
        elec_hh = ceo.get("households_needing_electricity", 20)
        refill_pct = ceo.get("drinking_refilling_pct", 50.0)
        calc_budget = round((san_hh * 3200 + elec_hh * 4500 + 250000) / 10000) * 10000

        proposal = {
            "id": f"PROP-NAGA-2026-CEO-{len(proposals_db)+1:03d}",
            "proposal_id": f"PROP-NAGA-2026-CEO-{len(proposals_db)+1:03d}",
            "barangay": brgy_name,
            "office": "CEO",
            "title": f"MNWD Piped Water Reticulation & Sanitary Toilet Block for {brgy_name}",
            "problem_statement": f"{brgy_name} records {san_hh:,} households ({ceo.get('unimproved_toilet_pct', 18)}%) with unimproved/limited sanitation, {elec_hh:,} households without electricity, and {refill_pct}% reliance on commercial water refilling stations.",
            "statutory_basis": {
                "law": statute["code"],
                "section": section["section"],
                "title": section["title"],
                "citation": section["summary"]
            },
            "sdgs": ["SDG 6 Clean Water & Sanitation", "SDG 7 Clean Energy", "SDG 9 Resilient Infrastructure"],
            "suggested_actions": [
                f"Construct sanitary bio-digester toilet units for {san_hh:,} underserved households in {brgy_name}",
                f"Extend MNWD Level III piped water mainline to reduce {refill_pct}% refilling station dependency",
                f"Install solar streetlighting and subsidize grid connection for {elec_hh:,} off-grid homes"
            ],
            "estimated_budget_php": float(calc_budget),
            "confidence_score": 0.94,
            "status": "PENDING",
            "created_by": "Gemini 3.8 Flash • CEO Engine"
        }
    elif domain == "CHO":
        statute = legal_cache["statutes"][3] # RA 11223
        section = statute["key_sections"][0]
        food_hh = cho.get("food_insecurity_count", 250)
        food_pct = cho.get("food_insecurity_pct", 28.0)
        sr_count = cho.get("seniors_count", 350)
        sr_no_id_pct = cho.get("seniors_without_id_pct", 12.0)
        calc_budget = round((160000 + food_hh * 450) / 5000) * 5000

        proposal = {
            "id": f"PROP-NAGA-2026-CHO-{len(proposals_db)+1:03d}",
            "proposal_id": f"PROP-NAGA-2026-CHO-{len(proposals_db)+1:03d}",
            "barangay": brgy_name,
            "office": "CHO",
            "title": f"Primary Care Surveillance, Nutrition & WASH Testing in {brgy_name}",
            "problem_statement": f"CBMS health telemetry in {brgy_name} identifies {food_hh:,} food-insecure households ({food_pct}%), a WASH risk score of {cho.get('wash_risk_score', 22)}, and {sr_no_id_pct}% of {sr_count:,} senior citizens lacking Senior IDs.",
            "statutory_basis": {
                "law": statute["code"],
                "section": section["section"],
                "title": section["title"],
                "citation": section["summary"]
            },
            "sdgs": ["SDG 2 Zero Hunger", "SDG 3 Good Health and Well-Being"],
            "suggested_actions": [
                f"Deploy Barangay Health Workers (BHWs) to validate and enroll {food_hh:,} food-insecure families in nutritional supplementation",
                f"Conduct mandatory bacteriological water testing across commercial refilling stations serving {cho.get('refilling_station_dependency_pct', 45)}% of {brgy_name}",
                f"Run mobile PhilHealth Yakap & Senior Citizen ID registration for {sr_count:,} seniors"
            ],
            "estimated_budget_php": float(calc_budget),
            "confidence_score": 0.93,
            "status": "PENDING",
            "created_by": "Gemini 3.8 Flash • CHO Engine"
        }
    elif domain == "SWO":
        statute = legal_cache["statutes"][5] # RA 11310
        section = statute["key_sections"][0]
        unbanked_pct = swo.get("unbanked_pct", 35.0)
        unbanked_hh = int(round((unbanked_pct / 100.0) * hh))
        neet_count = swo.get("neet_youth_count", 110)
        neet_pct = swo.get("neet_youth_pct", 16.0)
        calc_budget = round((140000 + neet_count * 1600) / 5000) * 5000

        proposal = {
            "id": f"PROP-NAGA-2026-SWO-{len(proposals_db)+1:03d}",
            "proposal_id": f"PROP-NAGA-2026-SWO-{len(proposals_db)+1:03d}",
            "barangay": brgy_name,
            "office": "SWO",
            "title": f"4Ps/AICS Digital Financial Inclusion & NEET Youth Livelihood in {brgy_name}",
            "problem_statement": f"In {brgy_name}, {unbanked_hh:,} households ({unbanked_pct}%) lack formal financial accounts and {neet_count:,} youth ({neet_pct}%) are Not in Employment, Education, or Training (NEET).",
            "statutory_basis": {
                "law": statute["code"],
                "section": section["section"],
                "title": section["title"],
                "citation": section["summary"]
            },
            "sdgs": ["SDG 1 No Poverty", "SDG 8 Decent Work and Economic Growth", "SDG 10 Reduced Inequalities"],
            "suggested_actions": [
                f"Set up hybrid GCash/Maya digital onboarding & barangay cash payout windows for {unbanked_hh:,} unbanked households",
                f"Enroll {neet_count:,} NEET youth in DOLE/TESDA skills scholarships and LGU livelihood placement",
                f"Prioritize {swo.get('seniors_without_id_count', 35)} unregistered seniors for social pension inclusion"
            ],
            "estimated_budget_php": float(calc_budget),
            "confidence_score": 0.95,
            "status": "PENDING",
            "created_by": "Gemini 3.8 Flash • SWO Engine"
        }
    else:
        statute = legal_cache["statutes"][1] # RA 7160 Sec 287
        section = statute["key_sections"][1]
        calc_budget = round((350000 + mvi * 4500) / 10000) * 10000
        proposal = {
            "id": f"PROP-NAGA-2026-CPDO-{len(proposals_db)+1:03d}",
            "proposal_id": f"PROP-NAGA-2026-CPDO-{len(proposals_db)+1:03d}",
            "barangay": brgy_name,
            "office": "CPDO",
            "title": f"AIP 20% Local Development Fund Multi-Sector Convergence for {brgy_name}",
            "problem_statement": f"PCA composite vulnerability index reaches {mvi}/100 across {hh:,} households ({pop:,} residents) in {brgy_name} (Dim1 Econ: {pca.get('dim1_economic_insecurity', 0)}, Dim2 Shelter: {pca.get('dim2_disaster_shelter_frailty', 0)}).",
            "statutory_basis": {
                "law": statute["code"],
                "section": section["section"],
                "title": section["title"],
                "citation": section["summary"]
            },
            "sdgs": ["SDG 11 Sustainable Cities", "SDG 17 Partnerships for the Goals"],
            "suggested_actions": [
                f"Ear-mark ₱{calc_budget:,.0f} from the 20% Local Development Fund for {brgy_name} priority deficits",
                "Synchronize CEO sanitation upgrades with CHO WASH surveillance and SWO livelihood grants",
                "Enforce RA 10173 micro-cell privacy suppression on public transparency scorecards"
            ],
            "estimated_budget_php": float(calc_budget),
            "confidence_score": 0.97,
            "status": "PENDING",
            "created_by": "Gemini 3.8 Flash • CPDO Engine"
        }

    proposal["project_title"] = proposal["title"]

    if req.auto_queue_proposal:
        proposals_db.insert(0, {
            "id": proposal["id"],
            "barangay": proposal["barangay"],
            "office": proposal["office"],
            "title": proposal["title"],
            "problem_statement": proposal["problem_statement"],
            "statutory_basis": proposal["statutory_basis"],
            "sdgs": proposal["sdgs"],
            "estimated_budget_php": proposal["estimated_budget_php"],
            "confidence_score": proposal["confidence_score"],
            "status": "PENDING",
            "created_by": proposal["created_by"]
        })

    ai_synthesis = (
        f"[Gemini 3.8 Flash • PCA & Statutory Synthesis] Analyzing {brgy_name} ({hh:,} households, {pop:,} residents, PCA Vulnerability Index: {mvi}/100). "
        f"{proposal['problem_statement']} Pursuant to {proposal['statutory_basis']['law']} ({proposal['statutory_basis']['section']}), "
        f"an evidence-based {domain} intervention of ₱{proposal['estimated_budget_php']:,.0f} is formulated to advance {', '.join(proposal['sdgs'])}."
    )

    return {
        "model": "gemini-3.8-flash-algorithmic",
        "query": req.query,
        "target_office": domain,
        "barangay": brgy_name,
        "barangay_id": detected_brgy_id,
        "ai_synthesis": ai_synthesis,
        "response_text": ai_synthesis,
        "proposal_draft": proposal,
        "drafted_proposal": proposal
    }

@app.post("/api/mobile/field-report")
def submit_field_report(report: MobileFieldReport):
    """
    Endpoint for syncing offline-generated mobile reports from Barangay Captains
    and field workers once connectivity is regained. Also auto-generates an executive item if it's a Program Endorsement.
    """
    record = report.dict() if hasattr(report, "dict") else report.model_dump()
    record["id"] = f"RPT-NAGA-{len(field_reports_db)+1:04d}"
    record["server_synced_at"] = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
    field_reports_db.insert(0, record)

    # If a Barangay Captain endorsed a program from the Mobile App, add it to the Mayor's Sign-Off Queue!
    if "endorsement" in report.report_type.lower():
        proposals_db.insert(0, {
            "id": f"PROP-MOBILE-{len(proposals_db)+1:03d}",
            "barangay": report.barangay_name,
            "office": "BARANGAY",
            "title": f"[Captain Endorsed] {report.description.replace('Barangay Council formally endorses LGU program: ', '')}",
            "problem_statement": f"Officially endorsed via Banwaan Mobile App by {report.reporter_role} of {report.barangay_name}.",
            "statutory_basis": {
                "law": "RA 7160",
                "section": "Section 389",
                "citation": "Punong Barangay council endorsement for Annual Investment Program (AIP) inclusion."
            },
            "sdgs": ["SDG 11 Sustainable Cities", "SDG 17 Partnerships"],
            "estimated_budget_php": 250000,
            "confidence_score": 0.98,
            "status": "PENDING",
            "created_by": f"Mobile Sync ({report.barangay_name})"
        })

    return {
        "status": "synced",
        "report_id": record["id"],
        "message": f"Field report for {report.barangay_name} successfully synced with Naga City Command Center."
    }

@app.get("/api/mobile/field-reports")
def get_field_reports():
    return field_reports_db

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
