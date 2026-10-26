# 🏛️ Project Banwaan: CBMS-Driven Agentic AI Ecosystem
**Urban Vulnerability Analysis, 17 UN SDG Alignment, and Evidence-Based Barangay Program Generation for Naga City (27 Barangays)**

---

## 🌟 Overview & Architecture

Project Banwaan operationalizes raw CBMS data (44,892 households and 181,197 residents across 27 Naga City barangays) into a multi-tiered decision intelligence platform:

1. **Web Command Center (`web/`)**: Built on Next.js 16 (App Router), TypeScript, and Tailwind CSS. Features an interactive Geo-Vulnerability map, Super Admin 5-Control Deck, isolated department portals for 5 city offices, and an embedded Agentic AI synthesis drawer.
2. **React Native Mobile App (`mobile/`)**: Built for typhoon-resilient field operations (offline-first with a bundled 27-barangay dataset and local outbox). Tailored for Barangay Captains (local needs & law availment), field inspectors (geotagged proof updates), and residents (Bikol/Filipino calamity alerts & 1-tap offline hotlines). Includes an offline centroid spatial profile for all 27 barangays.
3. **Intelligence API & PCA Engine (`server/`)**: FastAPI backend performing PCA dimensionality reduction (explaining ~77.7% variance across 4 core dimensions), role-based row-level data isolation, and Agentic AI statutory drafting.
4. **Data & Knowledge Store (`data/`)**: Curated datasets for the 17 UN Sustainable Development Goals (`sdg_dataset.json`), Philippine statutory corpus (`legal_corpus.json`), and parsed CBMS metrics (`processed_cbms_data.json`).

---

## 👥 Hierarchy of User Roles & Perspectives

| Role | Access Level & Scope | Key Capabilities |
| :--- | :--- | :--- |
| **👑 City Mayor / Super Admin** | Full panoramic citywide view | **The 5 Master Controls**: Cross-Department Collaboration Override, AIP 20% Dev Fund Allocator, Mayoral Executive Sign-off Queue, RA 10173 Micro-Cell Suppression Shield, and 3D Calamity Scenario Drilldown. |
| **🏗️ CEO (City Engineer)** | CEO Sector Domain Isolated | Households-in-need physical sizer (toilet, power, water gaps converted from % to raw counts), water refilling vs piped shift advisor, and interactive gap-costing simulator. |
| **🗺️ CPDO (City Planning)** | CPDO Planning Isolated | 17 UN SDG baseline scorecard with target-gap calculator, soft-clustering barangay typology, disparity detector, and data quality issue log (flags B16 outlier & TVET survey anomalies). |
| **🚨 DRRMO (Disaster Risk)** | DRRMO Emergency Isolated | Preparedness gap rankings (15/27 lacking hotline, B3 lacking written plan), shelter vulnerability counts, weak roof/wall structural rankings, and bilingual warning drafter (Bikol & Filipino). |
| **🩺 CHO (City Health)** | CHO Health Isolated | WASH disease exposure risk scoring, commercial refilling station bacteriological testing priorities, food insecurity hot-spot tracking, respiratory proxy screening, and senior citizen ID outreach. |
| **🤝 SWO (Social Welfare)** | SWO Welfare Isolated | 4Ps/AICS targeting, NEET youth (15-24) livelihood placement, out-of-school dropout driver diagnostics, digital vs cash-in-hand payout channel advisor, and GAD gender gap ratios. |
| **🏛️ Barangay Captain** | Localized Barangay Level (B1–27) | Inspects specific barangay needs & deficits, reviews recommended city programs, and officially endorses programs to the Mayor's Office. |
| **👥 Citizen / Public** | Aggregate Transparency Portal | Visually appealing community progress tracking, on-time completion rates, verified GPS field photo updates, and disaster advisories. |

---

## 🤖 Agentic AI: Strict SDG Alignment & Statutory Citations

The Agentic AI is bounded by hard guardrails:
- **Zero Legal Hallucination**: Every drafted solution must cite exact sections from its curated Philippine legal corpus:
  - **RA 10121**: Philippine Disaster Risk Reduction & Management Act (Sec. 12 BDRRMP, Sec. 21 LDRRMF).
  - **RA 7160**: Local Government Code of 1991 (Sec. 17 Basic Services, Sec. 287 AIP 20% Dev Fund, Sec. 389 Punong Barangay).
  - **RA 9003**: Ecological Solid Waste Management Act (Sec. 10 & 32 MRF).
  - **RA 11223**: Universal Health Care Act (Sec. 19 Primary Care Networks).
  - **PD 1096**: National Building Code (Sec. 214 Ruinous Buildings, Sec. 301 Structural Integrity).
  - **RA 11310**: 4Ps Act (Sec. 4 Beneficiary Selection, Sec. 13 Convergence).
  - **RA 10173**: Data Privacy Act of 2012 (Sec. 12 & 20 Anonymization and Access Control).
- **Mandatory SDG Alignment**: Outputs are tagged with corresponding UN Sustainable Development Goals (e.g., *SDG 1 No Poverty, SDG 3 Good Health, SDG 6 Clean Water & Sanitation, SDG 11 Sustainable Cities, SDG 13 Climate Action*).

---

## 🚀 Running the Project Locally

### 1. Web Command Center (Next.js)
```bash
cd web
npm install
npm run dev -- -p 3000
```
Open [http://localhost:3000](http://localhost:3000) to view the Command Center.

### 2. Core Intelligence Backend (FastAPI)
```bash
cd ..
python -m uvicorn server.main:app --host 127.0.0.1 --port 8000 --reload
```
Open [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) for the interactive Swagger API documentation.

### 3. Mobile App (React Native)
```bash
cd mobile
npm start
# or npx expo start
```

### 4. Re-running the CBMS Pipeline
If your teammate provides an updated or compressed Excel file, simply replace `PSA Dataset.xlsx` and run:
```bash
python data/scripts/process_cbms.py
```
This automatically updates `data/processed_cbms_data.json` and copies it to `web/src/data/`.
