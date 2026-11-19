import json, sys, re
import os
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
DIST = os.path.join(HERE, "..", "dist", "TCNOPS-2026.xml")
from mockrender import render
from playwright.sync_api import sync_playwright
IMG = "https://cdn.jsdelivr.net/gh/Dev-saged/bloger@7efcbee7486f17dacb38d80b3199bf8a61026252/images/articles/"
H = "https://tcnops.blogspot.com/"
RAW = [("2026/11/island.html", "تطبيق Island لتحويل تقليل استخدام الهاتف إلى لعبة تشجيعية", "island-app-gamifies-screen-time-reduction-cover.jpg", "تطبيقات"),
       ("2026/11/blog-post.html", "أمان ماك: ضوابط جديدة تحميك من مخاطر الذكاء الاصطناعي", "apple-mac-security-controls-ai-agents-cover.jpg", "أخبار"),
       ("2026/11/corma.html", "Corma تصل إلى تقييم مليار دولار في ثلاثة أشهر بسرعة غير مسبوقة", "corma-billion-valuation-three-months-cover.jpg", "أخبار"),
       ("2026/11/meta.html", "غرامة Meta الأوروبية تكشف مخاطر الخصوصية على وسائل التواصل", "european-fine-meta-privacy-risks-cover.jpg", "خصوصية بيانات"),
       ("2017/02/blog-post.html", "تطبيق لتغيير إصدار هاتفك وتحميل التطبيقات غير المتوافقة مع جهازك", "bring-jensen-back-nvidia-analysis-cover.jpg", "تطبيقات")]
BODY = "".join("<h2>القسم %d: تفاصيل مهمة</h2><p>%s</p><p>%s</p>" % (i, "نص عربي تجريبي طويل يشرح الفكرة بوضوح ويقدم معلومات مفيدة للقارئ حول الموضوع التقني. " * 6, "فقرة إضافية لاختبار التخطيط والقراءة المريحة على الشاشات المختلفة. " * 5) for i in range(1, 5)) + "<pre><code>print('hello')</code></pre><table><tr><th>الميزة</th><th>القيمة</th></tr><tr><td>السرعة</td><td>عالية</td></tr></table>"
posts = []
for i in range(9):
    u, t, im, lb = RAW[i % 5]
    posts.append({"url": H + u, "title": t, "firstImageUrl": IMG + im, "snippet": "ملخص قصير للمقال يوضح فكرته الأساسية للقارئ بشكل مباشر ومختصر.",
                  "labels": [{"name": lb, "url": H + "search/label/" + lb}], "timestampISO8601": "2026-11-1%dT10:00:00+02:00" % (7 - i % 7),
                  "lastUpdatedISO8601": "2026-11-18T10:00:00+02:00", "timestamp": "11/17/2026", "numComments": i % 3, "author": "Saged Al Abadla",
                  "authorPhoto": {"url": ""}, "id": str(i), "body": BODY, "allowComments": False})
LABELS = [{"name": n, "url": H + "search/label/" + n, "count": c} for n, c in [("أخبار", 17), ("أنترنت", 16), ("مقالات", 10), ("تطبيقات", 5), ("ذكاء اصطناعي", 1)]]
W = {"Label": {"labels": LABELS}, "PopularPosts": {"posts": [{"href": p["url"], "title": p["title"], "thumbnail": p["firstImageUrl"]} for p in posts[:5]]},
     "Header": {"title": "TCNOPS", "useImage": False, "sourceUrl": ""}}
def data(kind):
    b = {"homepageUrl": H, "title": "TCNOPS", "blogspotFaviconUrl": H + "favicon.ico", "feedLinks": "", "searchQuery": "", "searchLabel": ""}
    if kind == "home": b.update(url=H, pageType="index", pageName=""); ps = posts
    else: b.update(url=posts[1]["url"], pageType="item", pageName=posts[1]["title"]); ps = [posts[1]]
    return {"blog": b, "view": {"url": {"canonical": b["url"]}, "description": "", "featuredImage": ps[0]["firstImageUrl"]},
            "posts": ps, "numPosts": len(ps), "olderPageUrl": H + "search?updated-max=x", "newerPageUrl": posts[2]["url"] if kind == "item" else "",
            "newerPageTitle": posts[2]["title"], "olderPageTitle": posts[3]["title"]}
FEED = {"feed": {"openSearch$totalResults": {"$t": "105"}, "category": [{"term": n} for n in ["أخبار", "أنترنت", "تطبيقات", "ذكاء اصطناعي"]], "entry": [{"title": {"$t": p["title"]}, "link": [{"rel": "alternate", "href": p["url"]}],
        "published": {"$t": p["timestampISO8601"]}, "content": {"$t": '<img src="%s"> نص' % p["firstImageUrl"]}, "category": [{"term": p["labels"][0]["name"]}]} for p in posts[:6]]}}

import os
if os.environ.get("NOWIDGETS"):
    import re as _re
    _x=open(DIST,encoding="utf-8").read()
    for _w in ["Label20","Label21","PopularPosts5"]:
        _x=_re.sub(r"<b:widget id='%s'.*?</b:widget>"%_w,"",_x,flags=_re.S)
    open("/tmp/nw.xml","w",encoding="utf-8").write(_x)
XMLP="/tmp/nw.xml" if os.environ.get("NOWIDGETS") else DIST
posts[1]["labels"] = posts[1]["labels"] + [{"name": "سلسلة: دليل الأمان", "url": H + "search/label/x"}, {"name": "تم التحقق", "url": H + "search/label/y"}]
posts[1]["timestampISO8601"] = "2026-11-10T10:00:00+02:00"
pages = {k: render(XMLP, data(k), W) for k in ("home", "item")}
for k, v in pages.items(): open("/tmp/mock_%s.html" % k, "w").write(v)
lang = sys.argv[1] if len(sys.argv) > 1 else "ar"
with sync_playwright() as p:
    b = p.chromium.launch(**({"executable_path": "/usr/bin/google-chrome"} if os.path.exists("/usr/bin/google-chrome") and not os.environ.get("CI") else {}), args=["--no-sandbox"])
    for kind in ("home", "item"):
        for w in (320, 390, 768, 1024, 1440):
            c = b.new_context(viewport={"width": w, "height": 900}, locale="en-US" if lang == "en" else "ar",
                              user_agent="Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/126 Mobile Safari/537.36")
            pg = c.new_page(); errs = []
            pg.on("pageerror", lambda e: errs.append(str(e)[:160])); pg.on("console", lambda m: m.type == "error" and errs.append(m.text[:160]))
            K = kind
            def route(r):
                u = r.request.url
                if "rss2json" in u:
                    src = "aitnews" if "aitnews" in u else ("tech-wd" if "tech-wd" in u else "arabhardware")
                    return r.fulfill(status=200, content_type="application/json", headers={"Access-Control-Allow-Origin": "*"}, body=json.dumps({"status": "ok", "feed": {"title": src}, "items": [{"title": "خبر من %s رقم %d عن الذكاء الاصطناعي والهواتف" % (src, k), "link": "https://%s.com/n%d" % (src, k), "pubDate": "2026-11-19 0%d:00:00" % k} for k in range(1, 7)]}))
                if "raw.githubusercontent.com" in u:
                    return r.fulfill(status=200, content_type="application/json", headers={"Access-Control-Allow-Origin": "*"}, body=json.dumps({"v": 1, "items": [{"t": "خبر جاهز %d من GitHub" % k, "u": "https://aitnews.com/%d" % k, "d": "2026-11-19T0%d:00:00Z" % k, "s": "البوابة التقنية"} for k in range(1, 9)]}))
                if "/feeds/" in u and "start-index=" in u and "start-index=1&" not in u and not u.endswith("start-index=1"):
                    return r.fulfill(status=200, content_type="application/json", body=json.dumps({"feed": {"openSearch$totalResults": {"$t": "6"}}}))
                if "/feeds/" in u: return r.fulfill(status=200, content_type="application/json", body=json.dumps(FEED))
                if u.startswith(H) and r.request.resource_type == "document": return r.fulfill(status=200, content_type="text/html", body=pages[K])
                if "jsdelivr" in u:
                    import zlib; hue = zlib.crc32(u.encode()) % 360
                    return r.fulfill(status=200, content_type="image/svg+xml", body="<svg xmlns='http://www.w3.org/2000/svg' width='960' height='600'><defs><linearGradient id='g' x2='1' y2='1'><stop offset='0' stop-color='hsl(%d 60%% 35%%)'/><stop offset='1' stop-color='hsl(%d 70%% 60%%)'/></linearGradient></defs><rect width='960' height='600' fill='url(#g)'/><circle cx='700' cy='200' r='140' fill='rgba(255,255,255,.15)'/></svg>" % (hue, (hue + 40) % 360))
                return r.abort()
            pg.route("**/*", route)
            pg.goto((H + ("?archive" if os.environ.get("ARCHIVE") else "")) if kind == "home" else posts[1]["url"], wait_until="domcontentloaded"); pg.wait_for_timeout(600)
            pg.mouse.wheel(0, 3000); pg.wait_for_timeout(700); pg.evaluate("scrollTo(0,0)"); pg.wait_for_timeout(300)
            info = pg.evaluate("""()=>({sw:document.documentElement.scrollWidth,ticker:document.querySelectorAll('[data-ticker] li:not([aria-hidden])').length,own:document.querySelectorAll('[data-ticker] li.own:not([aria-hidden])').length,ready:[...document.querySelectorAll('[data-ticker] .tt')].some(e=>e.textContent.includes('GitHub')),arc:document.querySelectorAll('.arc-m li').length,tkd:getComputedStyle(document.querySelector('[data-ticker]')||document.body).getPropertyValue('--tick-d'),chips:document.querySelectorAll('.chips a').length,pop:document.querySelectorAll('.pop a').length,
              hsec:document.querySelectorAll('.hsec .hcard').length,rel:document.querySelectorAll('.related .hcard').length,toc:!!document.querySelector('.toc'),
              rt:(document.querySelector('[data-rt]')||{}).textContent,zones:document.querySelectorAll('.zone').length,stat:(document.querySelector('[data-stat] strong')||{}).textContent,
              dir:document.documentElement.dir,bnav:!document.querySelector('.bnav')?.hidden, h1:(document.querySelector('h1')||{}).textContent?.trim().slice(0,20),dg:document.querySelectorAll('.digest li').length,acts:[...document.querySelectorAll('.act:not([hidden])')].length,series:(document.querySelector('.series .s-n')||{}).textContent,vb:!!document.querySelector('.vbadge:not([hidden])'),upd:!!document.querySelector('[data-updated]:not([hidden])'),sv:!!document.querySelector('[data-saved-open]:not([hidden])'),tags:document.querySelectorAll('.post-tags a').length})""")
            if kind == "item" and w == 390:
                pg.click("[data-save]"); pg.click("[data-readmode]"); pg.wait_for_timeout(300)
                info["after"] = pg.evaluate("({saved:document.querySelector('[data-saved-count]').textContent,rm:document.documentElement.classList.contains('read-mode'),side:getComputedStyle(document.querySelector('.side')).display})")
                pg.screenshot(path="/tmp/readmode.png"); pg.click("[data-readmode]")
            print(kind, w, info, [e for e in errs if "ERR_FAILED" not in e])
            if w in (390, 1440): pg.screenshot(path="/tmp/%s_%s_%d.png" % (lang, kind, w), full_page=True)
            c.close()
    b.close()
