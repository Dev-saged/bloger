"""يجمع أخبار المصادر التقنية في ملف JSON واحد لشريط TCNOPS. مكتبة بايثون القياسية فقط."""
import json, os, re, sys, time, html, urllib.request
import xml.etree.ElementTree as ET
from email.utils import parsedate_to_datetime
from datetime import datetime, timezone

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = json.load(open(os.path.join(HERE, "sources.json"), encoding="utf-8"))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "ticker.json")
UA = "Mozilla/5.0 (compatible; TCNOPS-FeedBot/1.0; +https://tcnops.blogspot.com)"
NS = {"atom": "http://www.w3.org/2005/Atom", "media": "http://search.yahoo.com/mrss/"}

def iso(s):
    s = (s or "").strip()
    if not s: return ""
    try: dt = parsedate_to_datetime(s)
    except Exception:
        try: dt = datetime.fromisoformat(s.replace("Z", "+00:00"))
        except Exception: return ""
    if dt.tzinfo is None: dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

def clean(s):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", s or ""))).strip()

def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/rss+xml, application/xml;q=0.9, */*;q=0.8"})
    with urllib.request.urlopen(req, timeout=25) as r:
        return r.read()

def parse(raw, name, limit):
    root = ET.fromstring(raw)
    items = []
    for it in root.iter("item"):
        t, u, d = clean(it.findtext("title")), (it.findtext("link") or "").strip(), iso(it.findtext("pubDate"))
        if t and u: items.append({"t": t, "u": u, "d": d, "s": name})
    for it in root.iter("{%s}entry" % NS["atom"]):
        ln = it.find("atom:link[@rel='alternate']", NS)
        if ln is None: ln = it.find("atom:link", NS)
        t = clean(it.findtext("atom:title", default="", namespaces=NS))
        u = ln.get("href") if ln is not None else ""
        d = iso(it.findtext("atom:published", default="", namespaces=NS) or it.findtext("atom:updated", default="", namespaces=NS))
        if t and u: items.append({"t": t, "u": u, "d": d, "s": name})
    return items[:limit]

def main():
    allitems, report = [], []
    for s in SRC["sources"]:
        try:
            got = parse(fetch(s["url"]), s["name"], SRC.get("per_source", 10))
            allitems += got; report.append({"name": s["name"], "ok": True, "count": len(got)})
        except Exception as e:
            report.append({"name": s["name"], "ok": False, "error": str(e)[:160]})
    seen, uniq = set(), []
    for x in sorted(allitems, key=lambda x: x["d"], reverse=True):
        k = re.sub(r"\W+", "", x["t"])
        if k in seen: continue
        seen.add(k); uniq.append(x)
    data = {"v": 1, "updated": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"), "sources": report, "items": uniq[:SRC.get("max_items", 40)]}
    if not uniq and os.path.exists(OUT):
        print("no items fetched; keeping previous file"); return 0
    json.dump(data, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print(json.dumps(report, ensure_ascii=False))
    return 0

if __name__ == "__main__":
    sys.exit(main())
