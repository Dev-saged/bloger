"""يلخص تقارير Lighthouse في audit.json و audit.md (عربي)."""
import json, os, sys, glob, datetime
src, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
CAT = {"performance": "الأداء", "accessibility": "إمكانية الوصول", "best-practices": "أفضل الممارسات", "seo": "السيو"}
MET = {"largest-contentful-paint": "LCP", "cumulative-layout-shift": "CLS", "total-blocking-time": "TBT", "first-contentful-paint": "FCP", "speed-index": "Speed Index"}
res = {}
for f in sorted(glob.glob(os.path.join(src, "*.json"))):
    try: r = json.load(open(f, encoding="utf-8"))
    except Exception: continue
    k = os.path.basename(f)[:-5]
    res[k] = {"url": r.get("finalDisplayedUrl") or r.get("requestedUrl"),
              "scores": {c: round((r["categories"][c]["score"] or 0) * 100) for c in CAT if c in r.get("categories", {})},
              "metrics": {MET[m]: r["audits"][m]["displayValue"] for m in MET if m in r.get("audits", {})},
              "opportunities": [{"id": a, "title": r["audits"][a]["title"], "saving": r["audits"][a].get("displayValue", "")}
                                for a in r["audits"] if r["audits"][a].get("details", {}).get("type") == "opportunity" and (r["audits"][a].get("score") or 1) < 0.9][:8],
              "failed": [r["audits"][a]["title"] for c in ("seo", "accessibility", "best-practices") if c in r.get("categories", {})
                         for ref in r["categories"][c]["auditRefs"] for a in [ref["id"]] if r["audits"].get(a, {}).get("score") == 0][:12]}
stamp = datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")
json.dump({"date": stamp, "results": res}, open(os.path.join(out, "audit.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
md = ["# قياس TCNOPS — " + stamp, ""]
for k, v in res.items():
    md += ["## " + k, v["url"] or "", "", " · ".join("%s %s" % (CAT[c], s) for c, s in v["scores"].items()), "", " · ".join("%s %s" % kv for kv in v["metrics"].items()), ""]
    md += ["- " + o["title"] + (" (" + o["saving"] + ")" if o["saving"] else "") for o in v["opportunities"]] + [""]
open(os.path.join(out, "audit.md"), "w", encoding="utf-8").write("\n".join(md))
print("\n".join(md))
