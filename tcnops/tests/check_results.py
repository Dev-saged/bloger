"""يفشل الفحص إذا ظهر تمدد أفقي أو خطأ JavaScript في نتائج test.py."""
import re, sys
bad = []
for f in sys.argv[1:]:
    for line in open(f, encoding="utf-8"):
        m = re.match(r"^(home|item) (\d+) \{'sw': (\d+)", line)
        if not m: continue
        if int(m.group(3)) > int(m.group(2)): bad.append("%s: overflow %s" % (f, line[:60]))
        errs = line.rstrip().rsplit("} ", 1)[-1]
        if errs not in ("[]", ""): bad.append("%s: js errors %s" % (f, errs[:200]))
n = sum(1 for f in sys.argv[1:] for l in open(f, encoding="utf-8") if re.match(r"^(home|item) \d+ ", l))
print("checked", n, "page/width runs")
if n < 10 or bad:
    print("\n".join(bad) or "too few runs"); sys.exit(1)
