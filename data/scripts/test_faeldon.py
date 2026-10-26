import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

# Check GitHub repository tree for faeldon/philippines-json-maps
tree_url = "https://raw.githubusercontent.com/faeldon/philippines-json-maps/master/2023/geojson/barangays/lowres/051724000.json"
urls_to_try = [
    "https://raw.githubusercontent.com/faeldon/philippines-json-maps/master/2023/geojson/barangays/lowres/051724000.json",
    "https://raw.githubusercontent.com/faeldon/philippines-json-maps/master/2023/geojson/barangay/lowres/051724000.json",
    "https://raw.githubusercontent.com/faeldon/philippines-json-maps/master/geojson/barangays/051724000.json",
    "https://raw.githubusercontent.com/faeldon/philippines-json-maps/master/geojson/barangays/051724.json",
    "https://raw.githubusercontent.com/faeldon/philippines-json-maps/master/2023/geojson/municipality/lowres/051724000.json"
]

for url in urls_to_try:
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, context=ctx, timeout=10) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            print("SUCCESS on", url)
            print("Keys:", data.keys() if isinstance(data, dict) else len(data))
            if "features" in data:
                print("Num features:", len(data["features"]))
                for f in data["features"][:5]:
                    print("  Prop:", f.get("properties"))
            break
    except Exception as e:
        print(f"Failed {url}: {e}")
