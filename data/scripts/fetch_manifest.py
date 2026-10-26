import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = "https://raw.githubusercontent.com/faeldon/philippines-json-maps/master/latest/manifest.json"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
with urllib.request.urlopen(req, context=ctx, timeout=10) as resp:
    data = json.loads(resp.read().decode('utf-8'))
    print("Manifest keys:", data.keys() if isinstance(data, dict) else len(data))
    if isinstance(data, dict):
        for k in list(data.keys())[:10]:
            print(k, "->", str(data[k])[:80])
    elif isinstance(data, list):
        print("First 5 entries:")
        for it in data[:5]:
            print(it)
