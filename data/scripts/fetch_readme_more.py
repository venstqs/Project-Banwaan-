import urllib.request
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = "https://raw.githubusercontent.com/faeldon/philippines-json-maps/master/README.md"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
with urllib.request.urlopen(req, context=ctx, timeout=10) as resp:
    text = resp.read().decode('utf-8')
    print("README lines 20-80:")
    lines = text.split("\n")
    print("\n".join(lines[20:70]))
