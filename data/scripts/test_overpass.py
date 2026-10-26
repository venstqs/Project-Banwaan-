import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

# 1. Try Overpass API for Naga City (relation admin_level=10)
overpass_query = """
[out:json][timeout:30];
area["name"="Naga"]["admin_level"="7"]->.a;
rel(area.a)["admin_level"="10"];
out geom;
"""

url = "https://overpass-api.de/api/interpreter?data=" + urllib.parse.quote(overpass_query)
print("Querying Overpass API...")
try:
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
    with urllib.request.urlopen(req, context=ctx, timeout=20) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        elements = data.get("elements", [])
        print(f"Overpass returned {len(elements)} elements")
        for el in elements:
            print(el.get("tags", {}).get("name"))
except Exception as e:
    print(f"Overpass query error: {e}")
