import urllib.request
import urllib.parse
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

# Test 1: GitHub API for Naga City GeoJSON
gh_url = "https://api.github.com/search/code?q=filename:naga+extension:geojson"
print("Searching GitHub for naga geojson...")
try:
    req = urllib.request.Request(gh_url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, context=ctx, timeout=15) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        items = data.get("items", [])
        print(f"Found {len(items)} items on GitHub:")
        for item in items[:8]:
            print(item["name"], item["html_url"])
except Exception as e:
    print(f"GitHub search error: {e}")

# Test 2: Overpass with POST
overpass_url = "https://overpass-api.de/api/interpreter"
q = """[out:json][timeout:25];
relation["name"="Naga"]["admin_level"="7"];
rel(r)["admin_level"="10"];
out tags;"""
print("Querying Overpass via POST...")
try:
    data_bytes = urllib.parse.urlencode({"data": q}).encode("utf-8")
    req = urllib.request.Request(overpass_url, data=data_bytes, headers={"User-Agent": "ProjectBanwaan/1.0"})
    with urllib.request.urlopen(req, context=ctx, timeout=20) as resp:
        res = json.loads(resp.read().decode('utf-8'))
        elems = res.get("elements", [])
        print(f"Overpass POST returned {len(elems)} barangays:")
        for el in elems:
            print(el.get("tags", {}).get("name"))
except Exception as e:
    print(f"Overpass POST error: {e}")
