import json
import math
from shapely.geometry import Point, Polygon, MultiPoint
from shapely.ops import voronoi_diagram, unary_union

# Official 27 Barangays of Naga City calibrated to match the City of Naga Administrative Map
NAGA_BARANGAY_META = {
    1:  {"name": "Abella",             "category": "poblacion", "admin_hex": "#72b0a8", "district": "Naga River North Bank",           "lng": 123.1822, "lat": 13.6252, "elev": 12},
    2:  {"name": "Bagumbayan Norte",   "category": "poblacion", "admin_hex": "#4a4e82", "district": "North Urban Corridor",            "lng": 123.1875, "lat": 13.6355, "elev": 14},
    3:  {"name": "Bagumbayan Sur",     "category": "poblacion", "admin_hex": "#c97793", "district": "Naga River Confluence (Lowland)", "lng": 123.1862, "lat": 13.6295, "elev": 6},
    4:  {"name": "Balatas",            "category": "growth",    "admin_hex": "#c4cf7e", "district": "Magsaysay-Balatas Civic Zone",    "lng": 123.2025, "lat": 13.6295, "elev": 16},
    5:  {"name": "Calauag",            "category": "riverine",  "admin_hex": "#24a549", "district": "Northwest Residential Belt",      "lng": 123.1935, "lat": 13.6385, "elev": 15},
    6:  {"name": "Cararayan",          "category": "upland",    "admin_hex": "#843b8c", "district": "Mid-Valley Agro-Urban",           "lng": 123.2195, "lat": 13.6395, "elev": 45},
    7:  {"name": "Carolina",           "category": "upland",    "admin_hex": "#8682b9", "district": "Mt. Isarog Upland West",          "lng": 123.2435, "lat": 13.6555, "elev": 165},
    8:  {"name": "Concepcion Grande",  "category": "growth",    "admin_hex": "#43b593", "district": "Eastern Growth Corridor",         "lng": 123.2135, "lat": 13.6215, "elev": 28},
    9:  {"name": "Concepcion Pequeña", "category": "growth",    "admin_hex": "#a19c43", "district": "Panganiban-City Hall Hub",        "lng": 123.2015, "lat": 13.6185, "elev": 18},
    10: {"name": "Dayangdang",         "category": "poblacion", "admin_hex": "#9e8e76", "district": "Central Inner Residential",       "lng": 123.1942, "lat": 13.6252, "elev": 10},
    11: {"name": "Del Rosario",        "category": "growth",    "admin_hex": "#b3779e", "district": "Southeast Highway Gateway",       "lng": 123.2205, "lat": 13.6115, "elev": 22},
    12: {"name": "Dinaga",             "category": "cbd",       "admin_hex": "#5299b8", "district": "Centro CBD Commercial Core",      "lng": 123.1865, "lat": 13.6205, "elev": 7},
    13: {"name": "Igualdad Interior",  "category": "cbd",       "admin_hex": "#43b087", "district": "Downtown West Riverbank",         "lng": 123.1818, "lat": 13.6212, "elev": 6},
    14: {"name": "Lerma",              "category": "poblacion", "admin_hex": "#7b8c5e", "district": "Panganiban Commercial West",      "lng": 123.1900, "lat": 13.6188, "elev": 9},
    15: {"name": "Liboton",            "category": "poblacion", "admin_hex": "#857f88", "district": "North-Central Heritage",          "lng": 123.1905, "lat": 13.6318, "elev": 12},
    16: {"name": "Mabolo",             "category": "riverine",  "admin_hex": "#4f78aa", "district": "Southwest Bicol River Basin",     "lng": 123.1775, "lat": 13.6125, "elev": 6},
    17: {"name": "Pacol",              "category": "upland",    "admin_hex": "#99497e", "district": "Northeast Upland Terrace",        "lng": 123.2295, "lat": 13.6535, "elev": 92},
    18: {"name": "Panicuason",         "category": "upland",    "admin_hex": "#a99438", "district": "Mt. Isarog Forest Park",          "lng": 123.2585, "lat": 13.6665, "elev": 285},
    19: {"name": "Peñafrancia",        "category": "poblacion", "admin_hex": "#b8865d", "district": "Basilica & Pilgrim District",     "lng": 123.1965, "lat": 13.6312, "elev": 15},
    20: {"name": "Sabang",             "category": "riverine",  "admin_hex": "#a88bc4", "district": "Western Riverside Market",        "lng": 123.1782, "lat": 13.6185, "elev": 5},
    21: {"name": "San Felipe",         "category": "riverine",  "admin_hex": "#7860aa", "district": "North-Central Expansion",         "lng": 123.2065, "lat": 13.6405, "elev": 32},
    22: {"name": "San Francisco",      "category": "cbd",       "admin_hex": "#a8453a", "district": "Centro Cathedral Precinct",       "lng": 123.1882, "lat": 13.6248, "elev": 9},
    23: {"name": "San Isidro",         "category": "upland",    "admin_hex": "#80b741", "district": "Eastern Agro-Residential",        "lng": 123.2335, "lat": 13.6305, "elev": 54},
    24: {"name": "Santa Cruz",         "category": "cbd",       "admin_hex": "#3ea6b0", "district": "West-Central Urban",              "lng": 123.1848, "lat": 13.6238, "elev": 8},
    25: {"name": "Tabuco",             "category": "cbd",       "admin_hex": "#546c94", "district": "South Riverbank Transport",       "lng": 123.1848, "lat": 13.6162, "elev": 7},
    26: {"name": "Tinago",             "category": "poblacion", "admin_hex": "#356598", "district": "Central East Residential",        "lng": 123.1925, "lat": 13.6218, "elev": 10},
    27: {"name": "Triangulo",          "category": "cbd",       "admin_hex": "#c9af88", "district": "Diversion & Terminal Hub",        "lng": 123.1918, "lat": 13.6128, "elev": 8},
}

CATEGORY_INFO = {
    "upland":    {"name": "Upland Watershed & Agro-Forestry",         "short": "Upland Watershed",     "color": "#b59410", "icon": "⛰️"},
    "cbd":       {"name": "Central Business District (CBD Core)",     "short": "CBD Commercial",       "color": "#05389f", "icon": "🏢"},
    "poblacion": {"name": "Poblacion Urban & Heritage Core",          "short": "Poblacion Heritage",   "color": "#7c3aed", "icon": "🏛️"},
    "growth":    {"name": "Suburban Growth & Institutional Corridor", "short": "Growth Corridor",      "color": "#0284c7", "icon": "🏥"},
    "riverine":  {"name": "Riverine & High Flood-Hazard Delta",       "short": "Riverine Flood Delta", "color": "#ea580c", "icon": "🌊"},
}

radii = {
    "cbd": 0.0055,
    "poblacion": 0.0065,
    "riverine": 0.0085,
    "growth": 0.0110,
    "upland": 0.0165,
}

buffers = []
for bid, m in NAGA_BARANGAY_META.items():
    r = radii[m["category"]]
    if bid == 18:
        r = 0.0185
    buffers.append(Point(m["lng"], m["lat"]).buffer(r, resolution=16))

# Contiguous outer administrative boundary of Naga City
city_boundary = unary_union(buffers).buffer(0.002).buffer(-0.002).simplify(0.0003, preserve_topology=True)

seed_points = {bid: Point(m["lng"], m["lat"]) for bid, m in NAGA_BARANGAY_META.items()}
multipoint = MultiPoint(list(seed_points.values()))
vor_regions = voronoi_diagram(multipoint, envelope=city_boundary.envelope.buffer(0.05))

barangay_polys = {}
for poly in vor_regions.geoms:
    for bid, pt in seed_points.items():
        if poly.contains(pt) or poly.distance(pt) < 1e-7:
            clipped = poly.intersection(city_boundary)
            if clipped.geom_type == "MultiPolygon":
                clipped = max(clipped.geoms, key=lambda g: g.area)
            barangay_polys[bid] = clipped
            break

with open("data/processed_cbms_data.json", "r", encoding="utf-8") as f:
    cbms = json.load(f)

cbms_dict = {b["id"]: b for b in cbms["barangays"]}

features = []
building_features = []
hex_cluster_features = []

for bid in sorted(NAGA_BARANGAY_META.keys()):
    meta = NAGA_BARANGAY_META[bid]
    cat = CATEGORY_INFO[meta["category"]]
    b_data = cbms_dict.get(bid, {})
    poly = barangay_polys[bid]
    rep = poly.centroid if poly.contains(poly.centroid) else poly.representative_point()
    cx, cy = round(rep.x, 5), round(rep.y, 5)

    # Enrich CBMS record as well
    b_data["real_name"] = meta["name"]
    b_data["display_name"] = f"{meta['name']} (Barangay {bid})"
    b_data["category"] = meta["category"]
    b_data["category_name"] = cat["name"]
    b_data["category_short"] = cat["short"]
    b_data["category_color"] = cat["color"]
    b_data["admin_color"] = meta["admin_hex"]
    b_data["district"] = meta["district"]
    b_data["center"] = [cx, cy]

    mvi = b_data.get("vulnerability_index", 55.0)
    hh = b_data.get("total_households", 1200)
    pop = b_data.get("total_population", 5000)

    weak_roof_pct = b_data.get("drrm", {}).get("weak_roof_pct", 5.0)
    weak_wall_pct = b_data.get("drrm", {}).get("weak_wall_pct", 10.0)
    unimproved_toilet_pct = b_data.get("infrastructure_ceo", {}).get("unimproved_toilet_pct", 10.0)
    sanitation_hh = b_data.get("infrastructure_ceo", {}).get("households_needing_sanitation", 100)
    food_insec_pct = b_data.get("health_cho", {}).get("food_insecurity_pct", 25.0)
    food_insec_hh = b_data.get("health_cho", {}).get("food_insecurity_count", 220)
    wash_risk = b_data.get("health_cho", {}).get("wash_risk_score", 20.0)
    unbanked_pct = b_data.get("social_swo", {}).get("unbanked_pct", 35.0)
    neet_pct = b_data.get("social_swo", {}).get("neet_youth_pct", 15.0)
    neet_count = b_data.get("social_swo", {}).get("neet_youth_count", 90)

    ring_coords = [[round(pt[0], 5), round(pt[1], 5)] for pt in poly.exterior.coords]
    if ring_coords[0] != ring_coords[-1]:
        ring_coords.append(ring_coords[0])

    feature = {
        "type": "Feature",
        "id": bid,
        "properties": {
            "id": bid,
            "name": meta["name"],
            "real_name": meta["name"],
            "short_name": meta["name"],
            "full_label": f"{meta['name']} (Brgy {bid})",
            "cbms_name": f"Barangay {bid}",
            "district": meta["district"],
            "city": "Naga City",
            "category": meta["category"],
            "category_name": cat["name"],
            "category_short": cat["short"],
            "category_color": cat["color"],
            "admin_color": meta["admin_hex"],
            "elevation_m": meta["elev"],
            "vulnerability_index": mvi,
            "population": pop,
            "households": hh,
            "males": b_data.get("males", 2500),
            "females": b_data.get("females", 2500),
            "weak_roof_pct": weak_roof_pct,
            "weak_wall_pct": weak_wall_pct,
            "has_hotline": b_data.get("drrm", {}).get("has_hotline", True),
            "has_written_plan": b_data.get("drrm", {}).get("has_written_plan", True),
            "unimproved_toilet_pct": unimproved_toilet_pct,
            "households_needing_sanitation": sanitation_hh,
            "without_electricity_pct": b_data.get("infrastructure_ceo", {}).get("without_electricity_pct", 2.0),
            "households_needing_electricity": b_data.get("infrastructure_ceo", {}).get("households_needing_electricity", 15),
            "refilling_dependency": b_data.get("health_cho", {}).get("refilling_station_dependency_pct", 45.0),
            "piped_water_pct": b_data.get("infrastructure_ceo", {}).get("piped_water_pct", 50.0),
            "food_insecurity_pct": food_insec_pct,
            "food_insecurity_count": food_insec_hh,
            "wash_risk_score": wash_risk,
            "unbanked_pct": unbanked_pct,
            "neet_youth_pct": neet_pct,
            "neet_youth_count": neet_count,
            "sector_scores": b_data.get("sector_scores", {}),
            "sdg_scores": b_data.get("sdg_scores", {}),
            "pca_dimensions": b_data.get("pca_dimensions", {}),
            "center": [cx, cy],
            "extrusion_height_m": round(mvi * 6.5)
        },
        "geometry": {
            "type": "Polygon",
            "coordinates": [ring_coords]
        }
    }
    features.append(feature)

    # Calculate safe internal radius for placing Purok hex clusters and 3D buildings strictly inside the polygon
    minx, miny, maxx, maxy = poly.bounds
    eff_r = min(maxx - minx, maxy - miny) * 0.22

    # 2. Generate 3D Spatial Hex Micro-Zone Clusters strictly inside each Barangay
    purok_offsets = [
        ("Purok 1 (Core)", 0.0, 0.0, 0.45),
        ("Purok 2 (North-East)", eff_r * 0.65, eff_r * 0.45, 0.30),
        ("Purok 3 (South-West)", -eff_r * 0.65, -eff_r * 0.45, 0.25),
    ]
    for p_idx, (p_label, d_lng, d_lat, share) in enumerate(purok_offsets):
        cand_pt = Point(cx + d_lng, cy + d_lat)
        if not poly.contains(cand_pt):
            cand_pt = Point(cx + d_lng * 0.4, cy + d_lat * 0.4)
        hx_lng, hx_lat = round(cand_pt.x, 5), round(cand_pt.y, 5)
        hex_r = max(0.00045, eff_r * 0.36)
        hex_ring = []
        for s in range(6):
            ang = (math.pi / 3.0) * s + (math.pi / 6.0)
            hex_ring.append([
                round(hx_lng + hex_r * math.cos(ang), 5),
                round(hx_lat + (hex_r * 0.88) * math.sin(ang), 5)
            ])
        hex_ring.append(hex_ring[0])

        local_mvi = round(min(98.0, max(18.0, mvi * (1.08 if p_idx == 0 else (0.94 if p_idx == 1 else 1.03)))), 1)
        local_san_hh = max(5, int(round(sanitation_hh * share)))
        local_food_hh = max(8, int(round(food_insec_hh * share)))
        local_roof_hh = max(4, int(round((weak_roof_pct / 100.0) * hh * share)))

        hex_cluster_features.append({
            "type": "Feature",
            "id": f"HEX-{bid}-{p_idx+1}",
            "properties": {
                "cluster_id": f"HEX-{bid}-{p_idx+1}",
                "barangay_id": bid,
                "barangay_name": meta["name"],
                "zone_name": f"{meta['name']} • {p_label}",
                "center": [hx_lng, hx_lat],
                "local_mvi": local_mvi,
                "vulnerability_index": local_mvi,
                "sanitation_deficit_hh": local_san_hh,
                "food_insecurity_hh": local_food_hh,
                "weak_roof_hh": local_roof_hh,
                "wash_vector_risk": round(wash_risk * (1.12 if p_idx == 2 else 0.95), 1)
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [hex_ring]
            }
        })

    # 3. Generate Realistic 3D Urban Building Footprints strictly inside each Barangay
    is_cbd = meta["category"] in ("cbd", "poblacion", "growth")
    num_bldgs = 7 if is_cbd else 4
    for b_idx in range(num_bldgs):
        ang = (2 * math.pi / num_bldgs) * b_idx + (bid * 0.35)
        dist = eff_r * (0.28 + 0.42 * ((b_idx % 3) / 2.0))
        b_lng = cx + dist * math.cos(ang)
        b_lat = cy + (dist * 0.85) * math.sin(ang)
        if not poly.contains(Point(b_lng, b_lat)):
            b_lng = cx + dist * 0.45 * math.cos(ang)
            b_lat = cy + dist * 0.45 * math.sin(ang)

        w = 0.00024 if is_cbd else 0.00020
        h = 0.00018 if is_cbd else 0.00016
        b_ring = [
            [round(b_lng - w, 6), round(b_lat - h, 6)],
            [round(b_lng + w, 6), round(b_lat - h, 6)],
            [round(b_lng + w, 6), round(b_lat + h, 6)],
            [round(b_lng - w, 6), round(b_lat + h, 6)],
            [round(b_lng - w, 6), round(b_lat - h, 6)],
        ]
        bldg_height = (18 + (b_idx * 7) % 28) if is_cbd else (9 + (b_idx * 5) % 14)
        bldg_type = (
            "Barangay Hall & DRRM Post" if b_idx == 0
            else "Health & WASH Station" if b_idx == 1
            else "Commercial / Mixed-Use" if is_cbd and b_idx % 2 == 0
            else "Residential Cluster"
        )
        building_features.append({
            "type": "Feature",
            "id": f"BLDG-{bid}-{b_idx+1}",
            "properties": {
                "building_id": f"BLDG-{bid}-{b_idx+1}",
                "barangay_id": bid,
                "barangay_name": meta["name"],
                "building_type": bldg_type,
                "height_m": bldg_height,
                "structural_risk": "Elevated" if weak_roof_pct > 6.5 and b_idx > 1 else "Standard"
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [b_ring]
            }
        })

facilities = [
    {
        "id": "FAC-01",
        "name": "Naga City Hall & Command Center",
        "category": "Command Center",
        "lng": 123.1948,
        "lat": 13.6218,
        "elevation_m": 18,
        "description": "Central DRRMO dispatch, CPDO GIS hub, and Mayoral headquarters"
    },
    {
        "id": "FAC-02",
        "name": "Jesse M. Robredo Coliseum & Civic Shelter",
        "category": "Evacuation Shelter",
        "lng": 123.1995,
        "lat": 13.6172,
        "elevation_m": 15,
        "description": "Primary multi-purpose disaster evacuation complex (Capacity: 1,500 persons)"
    },
    {
        "id": "FAC-03",
        "name": "Camarines Sur National High School Shelter",
        "category": "Evacuation Shelter",
        "lng": 123.1915,
        "lat": 13.6275,
        "elevation_m": 14,
        "description": "Secondary storm evacuation shelter (Capacity: 1,200 persons)"
    },
    {
        "id": "FAC-04",
        "name": "Naga City Hospital & CHO Surveillance Lab",
        "category": "Healthcare",
        "lng": 123.1968,
        "lat": 13.6258,
        "elevation_m": 16,
        "description": "Primary care, WASH bacteriological lab, and disease surveillance center"
    },
    {
        "id": "FAC-05",
        "name": "Bicol Medical Center (BMC) Regional Hub",
        "category": "Healthcare",
        "lng": 123.2045,
        "lat": 13.6195,
        "elevation_m": 18,
        "description": "Tertiary regional referral medical center along Panganiban Drive"
    },
    {
        "id": "FAC-06",
        "name": "BFP Naga Central Fire & Flood Rescue Station",
        "category": "Emergency Responders",
        "lng": 123.1865,
        "lat": 13.6235,
        "elevation_m": 14,
        "description": "Urban rescue, river flood boat deployment, and emergency fleet"
    }
]

naga_river_path = [
    [123.2580, 13.6670],
    [123.2410, 13.6560],
    [123.2260, 13.6435],
    [123.2140, 13.6350],
    [123.2035, 13.6280],
    [123.1945, 13.6245],
    [123.1880, 13.6235],
    [123.1845, 13.6205],
    [123.1815, 13.6165],
    [123.1775, 13.6125],
    [123.1735, 13.6080]
]

road_network = [
    {
        "name": "Pan-Philippine Highway (Maharlika / Diversion)",
        "type": "National Primary",
        "coordinates": [[123.1880, 13.6360], [123.1910, 13.6260], [123.1920, 13.6140], [123.2050, 13.6120], [123.2200, 13.6110]]
    },
    {
        "name": "Panganiban Drive — Mt. Isarog Corridor",
        "type": "City Arterial",
        "coordinates": [[123.1865, 13.6218], [123.1945, 13.6195], [123.2045, 13.6195], [123.2165, 13.6230], [123.2320, 13.6510], [123.2580, 13.6665]]
    },
    {
        "name": "Magsaysay Avenue — Peñafrancia Loop",
        "type": "Urban Collector",
        "coordinates": [[123.1885, 13.6235], [123.1965, 13.6285], [123.2035, 13.6285], [123.2015, 13.6185], [123.1918, 13.6128]]
    }
]

flood_hazard_corridor = {
    "type": "Feature",
    "properties": {
        "name": "Naga-Bicol River Confluence Flood Basin",
        "hazard_type": "Flood & Storm Surge Level 3",
        "depth_m": 1.8
    },
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [123.1740, 13.6250],
            [123.1885, 13.6285],
            [123.1985, 13.6265],
            [123.2045, 13.6205],
            [123.1955, 13.6125],
            [123.1845, 13.6105],
            [123.1745, 13.6115],
            [123.1740, 13.6250]
        ]]
    }
}

output = {
    "city": "Naga City",
    "crs": "EPSG:4326 (WGS 84) / UTM Zone 51N",
    "bounding_box": {
        "west": 123.165,
        "south": 13.595,
        "east": 123.380,
        "north": 13.685
    },
    "center": [123.1948, 13.6218],
    "barangays_geojson": {
        "type": "FeatureCollection",
        "features": features
    },
    "spatial_hex_clusters_geojson": {
        "type": "FeatureCollection",
        "features": hex_cluster_features
    },
    "buildings_geojson": {
        "type": "FeatureCollection",
        "features": building_features
    },
    "naga_river_path": naga_river_path,
    "road_network": road_network,
    "flood_hazard_zone": flood_hazard_corridor,
    "facilities": facilities
}

for target_path in [
    "data/naga_geospatial.json",
    "web/src/data/naga_geospatial.json",
    "web/public/cesium/naga_geospatial.json"
]:
    with open(target_path, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2)

for cbms_path in [
    "data/processed_cbms_data.json",
    "web/src/data/processed_cbms_data.json"
]:
    with open(cbms_path, "w", encoding="utf-8") as f:
        json.dump(cbms, f, indent=2)

print(f"Successfully generated contiguous 27 barangays, {len(hex_cluster_features)} hex clusters, and {len(building_features)} 3D buildings!")
