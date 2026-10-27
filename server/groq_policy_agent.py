"""
Project Banwaan — Groq SDG & Statutory Policy Intelligence Engine
=================================================================
Reads the Groq API Key from `GROQ_API_KEY.md` (or `data/POLICY_KNOWLEDGE.md` / environment)
and synthesizes evidence-based LGU policy recommendations grounded in:
  1. `data/POLICY_KNOWLEDGE.md` (Custom Policy & SDG Markdown Knowledge Base)
  2. `data/processed_cbms_data.json` (2024 PSA CBMS 27 Barangays Empirical Dataset)
  3. `data/sdg_dataset.json` (17 UN Sustainable Development Goals Localization Matrix)
  4. `data/legal_corpus.json` (Philippine Statutory Mandates: RA 10121, RA 7160, RA 11223, etc.)

Usage (CLI test):
  python server/groq_policy_agent.py "Synthesize water and flood policy for Mabolo"
"""

import json
import os
import re
import sys
import urllib.request
import urllib.error
from typing import Dict, Any, Optional, Tuple

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DATA_DIR = os.path.join(ROOT_DIR, "data")

GROQ_KEY_MD_PATH = os.path.join(ROOT_DIR, "GROQ_API_KEY.md")
POLICY_MD_PATH = os.path.join(DATA_DIR, "POLICY_KNOWLEDGE.md")
CBMS_DATA_PATH = os.path.join(DATA_DIR, "processed_cbms_data.json")
SDG_DATA_PATH = os.path.join(DATA_DIR, "sdg_dataset.json")
LEGAL_DATA_PATH = os.path.join(DATA_DIR, "legal_corpus.json")

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
DEFAULT_GROQ_MODEL = "qwen/qwen3.8-27b"
FALLBACK_GROQ_MODELS = ["qwen/qwen3.8-27b", "openai/gpt-oss-20b", "openai/gpt-oss-120b", "llama-3.3-70b-versatile"]


def load_text_file(filepath: str) -> str:
    if os.path.exists(filepath):
        with open(filepath, "r", encoding="utf-8") as f:
            return f.read()
    return ""


def load_json_file(filepath: str) -> Dict[str, Any]:
    if os.path.exists(filepath):
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}


def safe_parse_budget(val: Any, default: float = 450000.0) -> float:
    if val is None:
        return default
    if isinstance(val, (int, float)):
        return float(val)
    if isinstance(val, str):
        cleaned = re.sub(r"[^\d.]", "", val)
        try:
            return float(cleaned)
        except Exception:
            return default
    return default


def safe_parse_confidence(val: Any, default: float = 0.96) -> float:
    if val is None:
        return default
    if isinstance(val, (int, float)):
        return float(val)
    if isinstance(val, str):
        cleaned = re.sub(r"[^\d.]", "", val)
        try:
            score = float(cleaned)
            return score if score <= 1.0 else score / 100.0
        except Exception:
            return default
    return default


def extract_json_from_llm(content_str: str) -> Dict[str, Any]:
    text = (content_str or "").strip()
    if "```" in text:
        match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text, flags=re.IGNORECASE)
        if match:
            text = match.group(1).strip()
    try:
        return json.loads(text)
    except Exception:
        match = re.search(r"(\{[\s\S]*\})", text)
        if match:
            return json.loads(match.group(1))
        raise


def resolve_groq_credentials() -> Tuple[Optional[str], str]:
    """
    Extracts GROQ_API_KEY and GROQ_MODEL from:
      1. Environment variable `GROQ_API_KEY`
      2. Root `.env` or `web/.env.local`
      3. `GROQ_API_KEY.md` in project root
      4. `data/POLICY_KNOWLEDGE.md`
    Supports either `GROQ_API_KEY=gsk_...` or pasting a raw `gsk_...` token anywhere in the file.
    """
    env_key = os.environ.get("GROQ_API_KEY", "").strip()
    env_model = os.environ.get("GROQ_MODEL", "").strip()

    dot_env_path = os.path.join(ROOT_DIR, ".env")
    web_env_path = os.path.join(ROOT_DIR, "web", ".env.local")

    combined_sources = "\n".join([
        load_text_file(dot_env_path),
        load_text_file(web_env_path),
        load_text_file(GROQ_KEY_MD_PATH),
        load_text_file(POLICY_MD_PATH),
    ])

    # Extract model if specified
    model = env_model or DEFAULT_GROQ_MODEL
    model_match = re.search(r"GROQ_MODEL\s*=\s*([A-Za-z0-9._/-]+)", combined_sources)
    if model_match and not env_model:
        model = model_match.group(1).strip()

    if env_key and env_key.startswith("gsk_"):
        return env_key, model

    # Look for explicit GROQ_API_KEY=gsk_... or any raw gsk_... key in the source files
    key_match = re.search(r"(gsk_[A-Za-z0-9_-]{20,})", combined_sources)
    if key_match:
        return key_match.group(1).strip(), model

    return None, model


def verify_groq_key(api_key: str) -> Tuple[bool, str]:
    """
    Validates a Groq API Key against the official Groq Models API endpoint.
    """
    clean_key = (api_key or "").strip()
    if not clean_key or not clean_key.startswith("gsk_"):
        return False, "Groq API key must begin with 'gsk_'"

    req = urllib.request.Request(
        "https://api.groq.com/openai/v1/models",
        headers={
            "Authorization": f"Bearer {clean_key}",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) ProjectBanwaan/2.6",
        },
        method="GET",
    )
    try:
        with urllib.request.urlopen(req, timeout=12) as resp:
            if resp.status == 200:
                return True, "Key is valid and active"
            return False, f"Groq returned HTTP status {resp.status}"
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode("utf-8", errors="ignore")
        return False, f"Groq authorization failed ({e.code}): {err_msg[:120]}"
    except Exception as e:
        return False, f"Connection error: {str(e)}"


def save_groq_key(api_key: str, model: str = DEFAULT_GROQ_MODEL) -> bool:
    """
    Saves the key to `GROQ_API_KEY.md` and applies to the current OS process environment.
    """
    clean_key = api_key.strip()
    clean_model = model.strip() or DEFAULT_GROQ_MODEL
    os.environ["GROQ_API_KEY"] = clean_key
    os.environ["GROQ_MODEL"] = clean_model
    content = f"""# Groq API Configuration — Project Banwaan

Paste your Groq API Key below (starts with `gsk_...`).
The Python backend (`server/groq_policy_agent.py`) automatically reads this file on every query—no server restart required.

```env
GROQ_API_KEY={clean_key}
GROQ_MODEL={clean_model}
```

> **Note:** This file (`GROQ_API_KEY.md`) is listed in `.gitignore` so your secret key will never be leaked when pushing to GitHub.
> For the AI's SDG & Statutory Policy Knowledge Base (which IS tracked in GitHub), see [`data/POLICY_KNOWLEDGE.md`](data/POLICY_KNOWLEDGE.md).
"""
    try:
        with open(GROQ_KEY_MD_PATH, "w", encoding="utf-8") as f:
            f.write(content)
        return True
    except Exception:
        return False


def query_chroma_legal_kb(query: str, limit: int = 4) -> str:
    """
    Directly queries the 33,377 legal and statutory document chunks stored in
    `Policy Dataset feed to LLM/chroma.sqlite3` via SQLite Full-Text Search (FTS).
    """
    chroma_path = os.path.join(ROOT_DIR, "Policy Dataset feed to LLM", "chroma.sqlite3")
    if not os.path.exists(chroma_path):
        return ""
    try:
        import sqlite3
        words = re.findall(r"[A-Za-z0-9]+", query)
        meaningful = [
            w for w in words
            if len(w) > 3 and w.lower() not in {"what", "which", "about", "with", "from", "this", "that", "explain", "audit"}
        ]
        if not meaningful:
            return ""
        search_terms = " OR ".join(meaningful[:6])
        conn = sqlite3.connect(chroma_path)
        cur = conn.cursor()
        rows = cur.execute(
            "SELECT string_value FROM embedding_fulltext_search WHERE string_value MATCH ? LIMIT ?",
            (search_terms, limit),
        ).fetchall()
        conn.close()
        snippets = []
        for r in rows:
            text = (r[0] or "").strip()
            if text and len(text) > 40:
                snippets.append(text[:350].strip() + "...")
        if snippets:
            return "\n\n".join(snippets)
    except Exception:
        pass
    return ""


def build_barangay_policy_context(
    barangay: Dict[str, Any],
    barangay_display_name: str,
    domain: str,
    sdg_data: Dict[str, Any],
    legal_data: Dict[str, Any],
    policy_markdown: str,
    user_query: str = "",
) -> str:
    """
    Constructs a compact, high-density empirical + statutory + SDG context block
    for the target barangay so the Groq LLM speaks with exact CBMS figures and statutory citations.
    """
    sdg_scores = barangay.get("sdg_scores", {})
    critical_sdgs = [
        f"{k}: {v}/100"
        for k, v in sdg_scores.items()
        if isinstance(v, (int, float))
    ]

    statutes_summary = []
    for st in legal_data.get("statutes", []):
        secs = ", ".join(
            f"{s['section']} ({s['title']}): {s['summary']}"
            for s in st.get("key_sections", [])
        )
        statutes_summary.append(f"- {st['code']} ({st['title']}): {secs}")

    sdg_targets_summary = []
    for g in sdg_data.get("sdgs", []):
        indicators = ", ".join(g.get("cbms_indicators", []))
        sdg_targets_summary.append(
            f"- {g['code']} ({g['title']}): Primary Offices={g.get('primary_offices', [])} | CBMS Indicators=[{indicators}]"
        )

    # Strip any raw gsk_ key from policy markdown before sending as system prompt context
    sanitized_policy_md = re.sub(r"gsk_[A-Za-z0-9_-]{20,}", "[REDACTED_KEY]", policy_markdown)

    chroma_excerpts = query_chroma_legal_kb(f"{user_query} {barangay_display_name} {domain}")

    context = f"""
=== TARGET BARANGAY EMPIRICAL CBMS PROFILE ===
Barangay: {barangay_display_name} (ID #{barangay.get('id')})
Target LGU Department / Domain: {domain}
Total Households: {barangay.get('total_households')}
Total Population: {barangay.get('total_population')}
Master Vulnerability Index (PCA MVI): {barangay.get('vulnerability_index')} / 100
Sector Deficit Scores: {json.dumps(barangay.get('sector_scores', {}))}
PCA Dimensions: {json.dumps(barangay.get('pca_dimensions', {}))}
DRRMO Disaster Indicators: {json.dumps(barangay.get('drrm', {}))}
CEO Infrastructure & WASH Indicators: {json.dumps(barangay.get('infrastructure_ceo', {}))}
CHO Health & Nutrition Indicators: {json.dumps(barangay.get('health_cho', {}))}
CSWDO / SWO Social Protection Indicators: {json.dumps(barangay.get('social_swo', {}))}
CPDO Planning Indicators: {json.dumps(barangay.get('planning_cpdo', {}))}
Localized Barangay SDG Scores: {', '.join(critical_sdgs)}

=== PHILIPPINE STATUTORY CORPUS (data/legal_corpus.json) ===
{chr(10).join(statutes_summary)}

=== UN SDG LOCALIZATION MATRIX (data/sdg_dataset.json) ===
{chr(10).join(sdg_targets_summary)}

=== POLICY KNOWLEDGE BASE (data/POLICY_KNOWLEDGE.md) ===
{sanitized_policy_md}
"""
    if chroma_excerpts:
        context += f"""
=== STATUTORY PROVISIONS RETRIEVED FROM POLICY DATASET (Policy Dataset feed to LLM / chroma.sqlite3) ===
{chroma_excerpts}
"""
    return context.strip()


def query_groq_policy_llm(
    user_query: str,
    barangay: Dict[str, Any],
    barangay_display_name: str,
    domain: str,
    fallback_proposal: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Calls the Groq Chat Completions API (`https://api.groq.com/openai/v1/chat/completions`)
    with the SDG + Statutory Policy Knowledge Base and the barangay's exact CBMS dataset.
    Returns a dictionary matching the `/api/agent/query` schema, or None if no API key is configured.
    """
    api_key, model = resolve_groq_credentials()
    if not api_key:
        return {
            "groq_active": False,
            "reason": "No Groq API key found in GROQ_API_KEY.md or data/POLICY_KNOWLEDGE.md",
        }

    sdg_data = load_json_file(SDG_DATA_PATH)
    legal_data = load_json_file(LEGAL_DATA_PATH)
    policy_md = load_text_file(POLICY_MD_PATH)

    context_block = build_barangay_policy_context(
        barangay=barangay,
        barangay_display_name=barangay_display_name,
        domain=domain,
        sdg_data=sdg_data,
        legal_data=legal_data,
        policy_markdown=policy_md,
        user_query=user_query,
    )

    system_prompt = f"""You are the Project Banwaan Statutory & SDG Policy AI Copilot for Naga City, Camarines Sur.
Your role is to synthesize executive policy briefs, SDG gap audits, and Annual Investment Program (AIP) project proposals strictly grounded in:
1. The exact 2024 PSA CBMS household metrics for the target barangay.
2. The UN Sustainable Development Goals (SDG 1 to SDG 17) and their localized CBMS indicators.
3. Philippine Republic Acts and Presidential Decrees (RA 10121, RA 7160, RA 11223, RA 11310, RA 9003, PD 1096, RA 10173, RA 11315) and the rules in POLICY_KNOWLEDGE.md.

{context_block}

Respond ONLY with a valid JSON object matching this exact schema:
{{
  "response_text": "Detailed 3-4 sentence executive policy synthesis citing exact household counts/percentages from {barangay_display_name}, specific UN SDG targets, and exact Philippine statutory sections.",
  "statutory_basis": {{
    "law": "e.g. RA 7160 (Local Government Code)",
    "section": "e.g. Section 17 & Section 287",
    "title": "Short statutory section title",
    "citation": "1-sentence statutory mandate justification"
  }},
  "sdgs": [
    "SDG 6 Clean Water & Sanitation",
    "SDG 11 Sustainable Cities"
  ],
  "suggested_actions": [
    "Concrete policy/engineering action 1 with target household count",
    "Concrete policy/surveillance action 2 with statutory mandate",
    "Concrete LGU budget/governance action 3 aligned with SDGs"
  ],
  "proposal_draft": {{
    "project_title": "Specific AIP capital/policy project title for {barangay_display_name}",
    "office": "{domain}",
    "barangay": "{barangay_display_name}",
    "problem_statement": "Empirical problem statement citing exact CBMS figures for {barangay_display_name}",
    "estimated_budget_php": {int(fallback_proposal.get('estimated_budget_php', 450000))},
    "confidence_score": 0.96
  }}
}}"""

    # Candidate model queue (gracefully tries requested model first, then auto-fallbacks)
    models_to_try = [model] + [m for m in FALLBACK_GROQ_MODELS if m != model]
    last_error = ""

    for target_model in models_to_try:
        payload = {
            "model": target_model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_query},
            ],
            "temperature": 0.25,
            "max_tokens": 2048,
            "response_format": {"type": "json_object"},
        }

        req = urllib.request.Request(
            GROQ_API_URL,
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) ProjectBanwaan/2.6",
            },
            method="POST",
        )

        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                resp_body = json.loads(resp.read().decode("utf-8"))
                content_str = (
                    resp_body.get("choices", [{}])[0]
                    .get("message", {})
                    .get("content", "{}")
                )
                parsed = extract_json_from_llm(content_str)

                draft_raw = parsed.get("proposal_draft", {})
                statutory = parsed.get("statutory_basis") or fallback_proposal["statutory_basis"]
                sdgs = parsed.get("sdgs") or fallback_proposal["sdgs"]
                actions = parsed.get("suggested_actions") or fallback_proposal["suggested_actions"]

                merged_proposal = {
                    **fallback_proposal,
                    "title": draft_raw.get("project_title") or fallback_proposal["title"],
                    "project_title": draft_raw.get("project_title") or fallback_proposal["title"],
                    "office": (draft_raw.get("office") or domain).upper(),
                    "barangay": draft_raw.get("barangay") or barangay_display_name,
                    "problem_statement": draft_raw.get("problem_statement") or fallback_proposal["problem_statement"],
                    "statutory_basis": statutory,
                    "sdgs": sdgs,
                    "suggested_actions": actions,
                    "estimated_budget_php": safe_parse_budget(
                        draft_raw.get("estimated_budget_php"),
                        fallback_proposal["estimated_budget_php"]
                    ),
                    "confidence_score": safe_parse_confidence(
                        draft_raw.get("confidence_score"),
                        0.96
                    ),
                    "created_by": f"Groq Policy Agent ({target_model})",
                }

                return {
                    "groq_active": True,
                    "model": f"groq/{target_model}",
                    "response_text": parsed.get("response_text") or fallback_proposal["problem_statement"],
                    "statutory_basis": statutory,
                    "sdgs": sdgs,
                    "suggested_actions": actions,
                    "proposal_draft": merged_proposal,
                }
        except urllib.error.HTTPError as e:
            err_text = e.read().decode("utf-8", errors="ignore")
            last_error = f"Groq HTTP {e.code} on {target_model}: {err_text[:180]}"
            # If model not found (404) or rate limited (429), try next model in queue
            if e.code in (404, 429, 400):
                continue
            break
        except Exception as e:
            last_error = f"Groq connection error: {str(e)}"
            break

    return {
        "groq_active": False,
        "reason": last_error or "Groq failed to return a response.",
    }


if __name__ == "__main__":
    # Standalone CLI test runner
    sample_query = (
        " ".join(sys.argv[1:])
        if len(sys.argv) > 1
        else "Synthesize SDG and statutory water/flood policy intervention for Mabolo (Barangay 16)"
    )
    api_key, model_name = resolve_groq_credentials()
    cbms = load_json_file(CBMS_DATA_PATH)
    brgy_16 = next(
        (b for b in cbms.get("barangays", []) if b.get("id") == 16),
        (cbms.get("barangays") or [{}])[0],
    )

    print("=================================================================")
    print(" Project Banwaan — Groq SDG & Policy Knowledge Agent CLI")
    print("=================================================================")
    print(f" Policy Knowledge File : {POLICY_MD_PATH}")
    print(f" Groq Key File         : {GROQ_KEY_MD_PATH}")
    print(f" Groq API Key Detected : {'YES (' + api_key[:8] + '...)' if api_key else 'NO (Paste your gsk_... key in GROQ_API_KEY.md)'}")
    print(f" Target Model          : {model_name}")
    print(f" Query                 : {sample_query}")
    print("-----------------------------------------------------------------")

    dummy_fallback = {
        "id": "PROP-NAGA-2026-CEO-099",
        "proposal_id": "PROP-NAGA-2026-CEO-099",
        "barangay": "Mabolo (Barangay 16)",
        "office": "CEO",
        "title": "MNWD Piped Water & Flood Drainage Upgrade for Mabolo",
        "project_title": "MNWD Piped Water & Flood Drainage Upgrade for Mabolo",
        "problem_statement": "Mabolo records high refilling station reliance and flood surge exposure across 1,779 households.",
        "statutory_basis": {
            "law": "RA 7160 & RA 10121",
            "section": "Section 17 & Section 12",
            "title": "Basic Services & Disaster Risk Reduction",
            "citation": "Provision of basic water/drainage infrastructure and barangay flood preparedness.",
        },
        "sdgs": ["SDG 6 Clean Water & Sanitation", "SDG 11 Sustainable Cities", "SDG 13 Climate Action"],
        "suggested_actions": [
            "Extend Level III piped water reticulation to reduce commercial refilling dependency",
            "Construct bio-digester sanitary toilet facilities for underserved households",
            "Allocate 20% Local Development Fund (RA 7160 Sec. 287) for riverine flood drainage",
        ],
        "estimated_budget_php": 1250000.0,
        "confidence_score": 0.95,
        "status": "PENDING",
        "created_by": "Banwaan Policy Engine",
    }

    result = query_groq_policy_llm(
        user_query=sample_query,
        barangay=brgy_16,
        barangay_display_name="Mabolo (Barangay 16)",
        domain="CEO",
        fallback_proposal=dummy_fallback,
    )
    print(json.dumps(result, indent=2, ensure_ascii=False))
