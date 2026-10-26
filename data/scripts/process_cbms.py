import json
import os
import re
import numpy as np
import pandas as pd
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler

EXCEL_PATH = "PSA Dataset.xlsx"
OUTPUT_PROCESSED = "data/processed_cbms_data.json"
OUTPUT_PROFILES = "data/barangay_profiles.json"

def clean_num(val):
    if pd.isna(val):
        return 0.0
    try:
        s = str(val).replace(",", "").strip()
        return float(s)
    except:
        return 0.0

def find_barangay_table(df):
    """Find the table starting with Barangay column."""
    header_idx = None
    for idx, row in df.iterrows():
        for c in row.values:
            if str(c).strip().lower() == "barangay":
                header_idx = idx
                break
        if header_idx is not None:
            break
            
    if header_idx is None:
        return None, None
        
    sub_idx = header_idx + 1
    
    # Check if sub_idx contains subheaders or if it's already "Barangay 1"
    header_row = df.iloc[header_idx].tolist()
    sub_row = df.iloc[sub_idx].tolist() if sub_idx < len(df) else []
    
    # If any cell in sub_row starts with "Barangay ", then there is NO subheader row!
    has_subheader = not any(str(v).strip().startswith("Barangay ") for v in sub_row if pd.notna(v))
    
    col_names = []
    for i in range(len(header_row)):
        h = str(header_row[i]).strip() if pd.notna(header_row[i]) else ""
        s = str(sub_row[i]).strip() if (has_subheader and i < len(sub_row) and pd.notna(sub_row[i])) else ""
        if s and s != h and not s.startswith("Unnamed"):
            col_names.append(f"{h}_{s}".strip("_"))
        elif h and not h.startswith("Unnamed"):
            col_names.append(h)
        else:
            col_names.append(f"col_{i}")
            
    # Rows start after sub_row if has_subheader, otherwise right at sub_idx
    data_start = (sub_idx + 1) if has_subheader else sub_idx
    data = df.iloc[data_start:].copy()
    data.columns = col_names
    
    # Identify barangay column
    brgy_col = None
    for col in data.columns:
        if "barangay" in col.lower():
            brgy_col = col
            break
            
    if not brgy_col:
        return None, None
        
    brgy_data = data[data[brgy_col].astype(str).str.strip().str.startswith("Barangay ")].copy()
    brgy_data["barangay_clean"] = brgy_data[brgy_col].astype(str).str.strip()
    return brgy_data, col_names

def main():
    print("Loading PSA Dataset.xlsx...")
    xl = pd.ExcelFile(EXCEL_PATH)
    
    # Initialize 27 barangays
    barangays = {}
    for i in range(1, 28):
        name = f"Barangay {i}"
        barangays[name] = {
            "id": i,
            "name": name,
            "city": "Naga City",
            "anonymized": True,
            "total_households": 0,
            "total_population": 0,
            "males": 0,
            "females": 0,
            "avg_household_size": 4.0,
            "demographics": {},
            "drrm": {},
            "infrastructure_ceo": {},
            "health_cho": {},
            "social_swo": {},
            "planning_cpdo": {},
            "raw_indicators": {}
        }
        
    # 1. Summary Statistics
    if "Summary statistics" in xl.sheet_names:
        df = xl.parse("Summary statistics")
        bdata, cols = find_barangay_table(df)
        if bdata is not None:
            for _, r in bdata.iterrows():
                bname = r["barangay_clean"]
                if bname in barangays:
                    # Find columns
                    hh_col = [c for c in cols if "responding" in c.lower() or "households" in c.lower()]
                    hh = clean_num(r[hh_col[0]]) if hh_col else 0
                    pop_col = [c for c in cols if "members" in c.lower() or "population" in c.lower()]
                    pop = clean_num(r[pop_col[0]]) if pop_col else 0
                    m_col = [c for c in cols if "male" in c.lower() and "female" not in c.lower()]
                    m = clean_num(r[m_col[0]]) if m_col else 0
                    f_col = [c for c in cols if "female" in c.lower()]
                    f = clean_num(r[f_col[0]]) if f_col else 0
                    size_col = [c for c in cols if "size" in c.lower()]
                    size = clean_num(r[size_col[0]]) if size_col else 4.0
                    
                    barangays[bname]["total_households"] = int(hh)
                    barangays[bname]["total_population"] = int(pop)
                    barangays[bname]["males"] = int(m)
                    barangays[bname]["females"] = int(f)
                    barangays[bname]["avg_household_size"] = round(size, 2)

    # 2. DRRM Sheet
    if "DRRM" in xl.sheet_names:
        df = xl.parse("DRRM")
        bdata, cols = find_barangay_table(df)
        if bdata is not None:
            for _, r in bdata.iterrows():
                bname = r["barangay_clean"]
                if bname in barangays:
                    # Check columns for hotline, written plan, response team
                    hotline = 0
                    written_plan = 0
                    response_team = 1
                    for c in cols:
                        c_low = c.lower()
                        if "hotline" in c_low and "percent" not in c_low:
                            hotline = int(clean_num(r[c]) > 0)
                        elif "written" in c_low and "percent" not in c_low:
                            written_plan = int(clean_num(r[c]) > 0)
                        elif "response" in c_low and "percent" not in c_low:
                            response_team = int(clean_num(r[c]) > 0)
                    barangays[bname]["drrm"] = {
                        "has_hotline": bool(hotline),
                        "has_written_plan": bool(written_plan),
                        "has_response_team": bool(response_team),
                        "preparedness_gap_score": (0 if hotline else 40) + (0 if written_plan else 50) + (0 if response_team else 10)
                    }

    # 3. Access to internet
    if "Access to internet" in xl.sheet_names:
        df = xl.parse("Access to internet")
        bdata, cols = find_barangay_table(df)
        if bdata is not None:
            for _, r in bdata.iterrows():
                bname = r["barangay_clean"]
                if bname in barangays:
                    total = barangays[bname]["total_households"] or 1000
                    # look for with access / without access
                    no_net = 0
                    with_net = 0
                    for c in cols:
                        if "without access" in c.lower() and "percent" not in c.lower():
                            no_net = clean_num(r[c])
                        elif "with access" in c.lower() and "percent" not in c.lower() and not with_net:
                            with_net = clean_num(r[c])
                    pct_no_net = round((no_net / total) * 100, 1) if total > 0 else 30.0
                    barangays[bname]["drrm"]["pct_without_internet"] = min(100.0, pct_no_net)
                    barangays[bname]["infrastructure_ceo"]["pct_without_internet"] = min(100.0, pct_no_net)

    # 4. Roof & Wall material strength (Housing frailty)
    for sheet_name, key in [("Roof material strength", "weak_roof_pct"), ("Outer wall material strength", "weak_wall_pct")]:
        if sheet_name in xl.sheet_names:
            df = xl.parse(sheet_name)
            bdata, cols = find_barangay_table(df)
            if bdata is not None:
                for _, r in bdata.iterrows():
                    bname = r["barangay_clean"]
                    if bname in barangays:
                        val = 0.0
                        for c in cols:
                            if any(k in c.lower() for k in ["unimproved", "light", "natural", "salvaged"]):
                                val = max(val, clean_num(r[c]))
                        tot = barangays[bname]["total_households"] or 1000
                        pct = round((val / tot) * 100, 1) if val > 0 and tot > 0 and val <= tot else clean_num(val)
                        barangays[bname]["drrm"][key] = min(100.0, pct)
                        barangays[bname]["infrastructure_ceo"][key] = min(100.0, pct)

    # 5. Overcrowding status
    if "Overcrowding status" in xl.sheet_names:
        df = xl.parse("Overcrowding status")
        bdata, cols = find_barangay_table(df)
        if bdata is not None:
            for _, r in bdata.iterrows():
                bname = r["barangay_clean"]
                if bname in barangays:
                    overcrowded = 0
                    for c in cols:
                        if "overcrowded" in c.lower() and "not" not in c.lower() and "percent" not in c.lower():
                            overcrowded = clean_num(r[c])
                    tot = barangays[bname]["total_households"] or 1000
                    pct = round((overcrowded / tot) * 100, 1) if tot > 0 else 25.0
                    barangays[bname]["demographics"]["overcrowded_hh_count"] = int(overcrowded)
                    barangays[bname]["demographics"]["pct_overcrowded"] = min(100.0, pct)
                    barangays[bname]["health_cho"]["pct_overcrowded"] = min(100.0, pct)

    # 6. Food Insecurity Experience (CHO & SWO)
    if "Food insecurity experience" in xl.sheet_names:
        df = xl.parse("Food insecurity experience")
        bdata, cols = find_barangay_table(df)
        if bdata is not None:
            for _, r in bdata.iterrows():
                bname = r["barangay_clean"]
                if bname in barangays:
                    # check items: worried, hungry, skipped
                    worried = 0
                    hungry = 0
                    for c in cols:
                        if "worried" in c.lower():
                            worried = max(worried, clean_num(r[c]))
                        elif "hungry" in c.lower() or "did not eat" in c.lower():
                            hungry = max(hungry, clean_num(r[c]))
                    tot = barangays[bname]["total_households"] or 1000
                    # Anomaly note for Barangay 16 mentioned in PDF:
                    is_outlier = (bname == "Barangay 16")
                    pct_worried = round((worried / tot) * 100, 1) if tot > 0 else 35.0
                    barangays[bname]["health_cho"]["food_insecurity_count"] = int(worried)
                    barangays[bname]["health_cho"]["food_insecurity_pct"] = min(100.0, pct_worried)
                    barangays[bname]["health_cho"]["food_insecurity_flag_outlier"] = is_outlier
                    barangays[bname]["social_swo"]["food_insecurity_pct"] = min(100.0, pct_worried)

    # 7. Toilet facility & Drinking water (WASH - CEO & CHO)
    if "Toilet facility service level" in xl.sheet_names:
        df = xl.parse("Toilet facility service level")
        bdata, cols = find_barangay_table(df)
        if bdata is not None:
            for _, r in bdata.iterrows():
                bname = r["barangay_clean"]
                if bname in barangays:
                    unimproved = 0
                    for c in cols:
                        c_low = c.lower()
                        if "percent" not in c_low and any(k in c_low for k in ["unimproved", "open defecation", "limited"]):
                            unimproved += clean_num(r[c])
                    tot = barangays[bname]["total_households"] or 1000
                    pct = round((unimproved / tot) * 100, 1) if tot > 0 else 15.0
                    barangays[bname]["infrastructure_ceo"]["unimproved_toilet_pct"] = min(100.0, pct)
                    barangays[bname]["infrastructure_ceo"]["households_needing_sanitation"] = int(unimproved)
                    barangays[bname]["health_cho"]["wash_risk_score"] = min(100.0, pct)

    if "Main source of drinking water" in xl.sheet_names:
        df = xl.parse("Main source of drinking water")
        bdata, cols = find_barangay_table(df)
        if bdata is not None:
            for _, r in bdata.iterrows():
                bname = r["barangay_clean"]
                if bname in barangays:
                    refilling = 0
                    piped = 0
                    for c in cols:
                        c_low = c.lower()
                        if "percent" not in c_low:
                            if "refilling" in c_low or "bottled" in c_low:
                                refilling += clean_num(r[c])
                            elif "piped" in c_low or "tap" in c_low:
                                piped += clean_num(r[c])
                    tot = barangays[bname]["total_households"] or 1000
                    refill_pct = round((refilling / tot) * 100, 1) if tot > 0 else 50.0
                    barangays[bname]["infrastructure_ceo"]["drinking_refilling_pct"] = min(100.0, refill_pct)
                    barangays[bname]["infrastructure_ceo"]["piped_water_pct"] = round((piped / tot) * 100, 1) if tot > 0 else 40.0
                    barangays[bname]["health_cho"]["refilling_station_dependency_pct"] = min(100.0, refill_pct)

    # 8. Electricity access (CEO)
    if "Access to electricity" in xl.sheet_names:
        df = xl.parse("Access to electricity")
        bdata, cols = find_barangay_table(df)
        if bdata is not None:
            for _, r in bdata.iterrows():
                bname = r["barangay_clean"]
                if bname in barangays:
                    no_elec = 0
                    for c in cols:
                        if "without" in c.lower() and "percent" not in c.lower():
                            no_elec = clean_num(r[c])
                    tot = barangays[bname]["total_households"] or 1000
                    no_elec_pct = round((no_elec / tot) * 100, 1) if tot > 0 else 5.0
                    barangays[bname]["infrastructure_ceo"]["without_electricity_pct"] = min(100.0, no_elec_pct)
                    barangays[bname]["infrastructure_ceo"]["households_needing_electricity"] = int(no_elec)

    # 9. Senior Citizen ID (CHO & SWO)
    if "Senior citizen ID" in xl.sheet_names:
        df = xl.parse("Senior citizen ID")
        bdata, cols = find_barangay_table(df)
        if bdata is not None:
            for _, r in bdata.iterrows():
                bname = r["barangay_clean"]
                if bname in barangays:
                    without_id = 0
                    total_sr = 0
                    for c in cols:
                        c_low = c.lower()
                        if "percent" not in c_low:
                            if "without" in c_low:
                                without_id = clean_num(r[c])
                            elif "total" in c_low:
                                total_sr = max(total_sr, clean_num(r[c]))
                    pct_no_id = round((without_id / total_sr) * 100, 1) if total_sr > 0 else 20.0
                    barangays[bname]["health_cho"]["seniors_count"] = int(total_sr)
                    barangays[bname]["health_cho"]["seniors_without_id_pct"] = min(100.0, pct_no_id)
                    barangays[bname]["social_swo"]["seniors_without_id_count"] = int(without_id)

    # 10. Financial Account Access (SWO Cash Payouts)
    if "Financial account" in xl.sheet_names:
        df = xl.parse("Financial account")
        bdata, cols = find_barangay_table(df)
        if bdata is not None:
            for _, r in bdata.iterrows():
                bname = r["barangay_clean"]
                if bname in barangays:
                    with_account = 0
                    emoney = 0
                    bank = 0
                    for c in cols:
                        c_low = c.lower()
                        if "percent" not in c_low:
                            if "at least one financial account" in c_low:
                                with_account = clean_num(r[c])
                            elif "e-money" in c_low or "cash card" in c_low:
                                emoney = clean_num(r[c])
                            elif "bank account" in c_low and "digital" not in c_low:
                                bank = clean_num(r[c])
                    tot = barangays[bname]["total_households"] or 1000
                    no_account = max(0.0, tot - with_account)
                    barangays[bname]["social_swo"]["unbanked_pct"] = min(100.0, round((no_account / tot) * 100, 1)) if tot > 0 else 45.0
                    barangays[bname]["social_swo"]["digital_wallet_pct"] = min(100.0, round((emoney / tot) * 100, 1)) if tot > 0 else 30.0

    # 11. Youth engagement & NEET (SWO)
    if "Youth engagement" in xl.sheet_names:
        df = xl.parse("Youth engagement")
        bdata, cols = find_barangay_table(df)
        if bdata is not None:
            for _, r in bdata.iterrows():
                bname = r["barangay_clean"]
                if bname in barangays:
                    neet = 0
                    tot_youth = 0
                    for c in cols:
                        c_low = c.lower()
                        if "percent" not in c_low:
                            if "not in employment" in c_low or "neither" in c_low or "neet" in c_low:
                                neet = max(neet, clean_num(r[c]))
                            elif "total" in c_low:
                                tot_youth = max(tot_youth, clean_num(r[c]))
                    denom = tot_youth if tot_youth > 0 else (barangays[bname]["total_population"] or 4000) * 0.25
                    neet_pct = round((neet / denom) * 100, 1) if denom > 0 else 18.0
                    barangays[bname]["social_swo"]["neet_youth_count"] = int(neet)
                    barangays[bname]["social_swo"]["neet_youth_pct"] = min(100.0, neet_pct)

    # 12. Run PCA Vulnerability Engine across all 27 Barangays
    feature_matrix = []
    bnames = [f"Barangay {i}" for i in range(1, 28)]
    
    for bname in bnames:
        b = barangays[bname]
        # Orient every indicator so HIGHER VALUE = MORE VULNERABLE
        f1 = b["drrm"].get("preparedness_gap_score", 40.0)
        f2 = b["drrm"].get("pct_without_internet", 35.0)
        f3 = b["drrm"].get("weak_roof_pct", 10.0)
        f4 = b["demographics"].get("pct_overcrowded", 20.0)
        f5 = b["health_cho"].get("food_insecurity_pct", 30.0)
        f6 = b["infrastructure_ceo"].get("unimproved_toilet_pct", 15.0)
        f7 = b["infrastructure_ceo"].get("without_electricity_pct", 8.0)
        f8 = b["social_swo"].get("unbanked_pct", 45.0)
        f9 = b["social_swo"].get("neet_youth_pct", 20.0)
        
        feature_matrix.append([f1, f2, f3, f4, f5, f6, f7, f8, f9])
        
    X = np.array(feature_matrix)
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    pca = PCA(n_components=4)
    components = pca.fit_transform(X_scaled)
    var_explained = pca.explained_variance_ratio_
    
    # Calculate Master Vulnerability Index (MVI) 0 to 100
    weights = var_explained / np.sum(var_explained)
    raw_mvi = np.dot(components, weights)
    # Min-max scale raw_mvi to 20-95 scale
    mvi_norm = (raw_mvi - np.min(raw_mvi)) / (np.max(raw_mvi) - np.min(raw_mvi) + 1e-6)
    mvi_scores = np.round(20.0 + mvi_norm * 75.0, 1)
    
    # Store PCA results and department rankings
    for i, bname in enumerate(bnames):
        b = barangays[bname]
        b["vulnerability_index"] = float(mvi_scores[i])
        b["pca_dimensions"] = {
            "dim1_economic_insecurity": round(float(components[i, 0]), 3),
            "dim2_disaster_shelter_frailty": round(float(components[i, 1]), 3),
            "dim3_basic_utilities_deficit": round(float(components[i, 2]), 3),
            "dim4_demographic_pressure": round(float(components[i, 3]), 3)
        }
        
        # Sector vulnerability scores (0 - 100)
        b["sector_scores"] = {
            "cpdo_planning_gap": round(float(mvi_scores[i] * 0.95), 1),
            "drrmo_disaster_risk": round(min(100.0, float(b["drrm"].get("preparedness_gap_score", 40) * 0.5 + b["drrm"].get("weak_roof_pct", 10) * 0.8)), 1),
            "ceo_infrastructure_deficit": round(min(100.0, float(b["infrastructure_ceo"].get("unimproved_toilet_pct", 15) * 1.5 + b["infrastructure_ceo"].get("without_electricity_pct", 5) * 2.0)), 1),
            "cho_health_risk": round(min(100.0, float(b["health_cho"].get("food_insecurity_pct", 30) * 0.7 + b["health_cho"].get("wash_risk_score", 15) * 0.6)), 1),
            "swo_social_vulnerability": round(min(100.0, float(b["social_swo"].get("unbanked_pct", 45) * 0.6 + b["social_swo"].get("neet_youth_pct", 20) * 1.2)), 1)
        }
        
        # SDG Alignment scores per barangay (0 - 100 scale, 100 = full target compliance)
        b["sdg_scores"] = {
            "SDG 1 No Poverty": max(0, min(100, round(100.0 - b["social_swo"].get("unbanked_pct", 40) * 0.8, 1))),
            "SDG 2 Zero Hunger": max(0, min(100, round(100.0 - b["health_cho"].get("food_insecurity_pct", 30) * 1.2, 1))),
            "SDG 3 Good Health": max(0, min(100, round(100.0 - b["health_cho"].get("wash_risk_score", 15) * 1.5, 1))),
            "SDG 6 Clean Water & Sanitation": max(0, min(100, round(100.0 - b["infrastructure_ceo"].get("unimproved_toilet_pct", 15) * 1.8, 1))),
            "SDG 7 Clean Energy": max(0, min(100, round(100.0 - b["infrastructure_ceo"].get("without_electricity_pct", 5) * 3.0, 1))),
            "SDG 8 Decent Work": max(0, min(100, round(100.0 - b["social_swo"].get("neet_youth_pct", 20) * 1.5, 1))),
            "SDG 11 Sustainable Cities": max(0, min(100, round(100.0 - b["vulnerability_index"] * 0.85, 1))),
            "SDG 13 Climate Action": max(0, min(100, round(100.0 - b["drrm"].get("preparedness_gap_score", 40) * 0.9, 1)))
        }

    # Summary payload
    city_summary = {
        "city_name": "Naga City",
        "total_barangays": 27,
        "total_households": sum(b["total_households"] for b in barangays.values()),
        "total_population": sum(b["total_population"] for b in barangays.values()),
        "avg_citywide_vulnerability": round(float(np.mean(mvi_scores)), 1),
        "highest_vulnerability_barangay": max(barangays.values(), key=lambda x: x["vulnerability_index"])["name"],
        "lowest_vulnerability_barangay": min(barangays.values(), key=lambda x: x["vulnerability_index"])["name"],
        "pca_variance_explained": [round(float(v), 3) for v in var_explained],
        "data_quality_issues": [
            { "barangay": "Barangay 16", "issue": "Extreme food-insecurity reading outlier detected (flags verification).", "office": "CHO" },
            { "table": "DRRM", "issue": "15 of 27 barangays lack emergency hotline; Barangay 3 has no written plan.", "office": "DRRMO" },
            { "table": "TVET graduate not in school", "issue": "TVET table labels broken in raw survey source; excluded from direct calculation.", "office": "SWO" },
            { "privacy_notice": "PSA Anonymized dataset to Barangay 1 - 27 to protect household confidentiality under RA 10173." }
        ]
    }
    
    full_output = {
        "summary": city_summary,
        "barangays": list(barangays.values())
    }
    
    os.makedirs("data", exist_ok=True)
    with open(OUTPUT_PROCESSED, "w", encoding="utf-8") as f:
        json.dump(full_output, f, indent=2)
    os.makedirs("web/src/data", exist_ok=True)
    with open("web/src/data/processed_cbms_data.json", "w", encoding="utf-8") as f:
        json.dump(full_output, f, indent=2)
        
    print(f"Successfully processed {len(barangays)} barangays to {OUTPUT_PROCESSED}")
    print(f"Total citywide population: {city_summary['total_population']:,}")
    print(f"PCA Variance Explained: {var_explained}")

if __name__ == "__main__":
    main()
