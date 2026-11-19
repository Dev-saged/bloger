import re, io, sys, urllib.parse
import os
B = os.path.dirname(os.path.abspath(__file__)) + "/"
rd = lambda p: io.open(B + p, encoding="utf-8").read()
t = rd("src/skeleton.xml")

cmt = rd("src/comments.xml").rstrip("\n")

# ---- icons (one family: 24px grid, 1.8 stroke, round caps) ----
SPRITE = """<svg aria-hidden='true' height='0' style='position:absolute' width='0'>
<symbol id='i-search' viewBox='0 0 24 24'><circle cx='11' cy='11' r='6.5'/><path d='m16 16 4.5 4.5'/></symbol>
<symbol id='i-moon' viewBox='0 0 24 24'><path d='M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z'/></symbol>
<symbol id='i-sun' viewBox='0 0 24 24'><circle cx='12' cy='12' r='4'/><path d='M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4'/></symbol>
<symbol id='i-menu' viewBox='0 0 24 24'><path d='M4 7h16M4 12h16M4 17h10'/></symbol>
<symbol id='i-home' viewBox='0 0 24 24'><path d='M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1Z'/></symbol>
<symbol id='i-grid' viewBox='0 0 24 24'><rect height='6.5' rx='1.6' width='6.5' x='4' y='4'/><rect height='6.5' rx='1.6' width='6.5' x='13.5' y='4'/><rect height='6.5' rx='1.6' width='6.5' x='4' y='13.5'/><rect height='6.5' rx='1.6' width='6.5' x='13.5' y='13.5'/></symbol>
<symbol id='i-up' viewBox='0 0 24 24'><path d='M12 19V5M6 11l6-6 6 6'/></symbol>
<symbol id='i-down' viewBox='0 0 24 24'><path d='m6 9 6 6 6-6'/></symbol>
<symbol id='i-next' viewBox='0 0 24 24'><path d='m9 6 6 6-6 6'/></symbol>
<symbol id='i-close' viewBox='0 0 24 24'><path d='M6 6l12 12M18 6 6 18'/></symbol>
<symbol id='i-clock' viewBox='0 0 24 24'><circle cx='12' cy='12' r='8.5'/><path d='M12 7.5V12l3 2'/></symbol>
<symbol id='i-book' viewBox='0 0 24 24'><path d='M4 5.5A1.5 1.5 0 0 1 5.5 4H11v15H5.5A1.5 1.5 0 0 0 4 20.5ZM20 5.5A1.5 1.5 0 0 0 18.5 4H13v15h5.5a1.5 1.5 0 0 1 1.5 1.5Z'/></symbol>
<symbol id='i-chat' viewBox='0 0 24 24'><path d='M5 18.5 4 21l3.5-1.5A8.5 8.5 0 1 0 5 18.5Z'/></symbol>
<symbol id='i-link' viewBox='0 0 24 24'><path d='M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7L11.5 6.8M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.5-1.5'/></symbol>
<symbol id='i-share' viewBox='0 0 24 24'><circle cx='17.5' cy='5.5' r='2.5'/><circle cx='6.5' cy='12' r='2.5'/><circle cx='17.5' cy='18.5' r='2.5'/><path d='m8.7 10.8 6.6-4M8.7 13.2l6.6 4'/></symbol>
<symbol id='i-pause' viewBox='0 0 24 24'><path d='M9 6v12M15 6v12'/></symbol>
<symbol id='i-play' viewBox='0 0 24 24'><path d='M8 5.5v13l10-6.5Z'/></symbol>
<symbol id='i-download' viewBox='0 0 24 24'><path d='M12 4v11M7 10.5l5 5 5-5M5 19.5h14'/></symbol>
<symbol id='i-bookmark' viewBox='0 0 24 24'><path d='M7 4h10a1 1 0 0 1 1 1v15l-6-4-6 4V5a1 1 0 0 1 1-1Z'/></symbol>
<symbol id='i-spark' viewBox='0 0 24 24'><path d='M12 3.5 13.8 10 20.5 12l-6.7 2L12 20.5 10.2 14 3.5 12l6.7-2Z'/></symbol>
<symbol id='i-refresh' viewBox='0 0 24 24'><path d='M19.5 12a7.5 7.5 0 1 1-2.2-5.3M19.5 4.5v4h-4'/></symbol>
<symbol id='i-shield' viewBox='0 0 24 24'><path d='M12 3.5 19 6v6c0 4.2-3 7.2-7 8.5-4-1.3-7-4.3-7-8.5V6Z'/><path d='m9 12 2.2 2.2L15.5 10'/></symbol>
<symbol id='i-headphones' viewBox='0 0 24 24'><path d='M4.5 15v-3a7.5 7.5 0 0 1 15 0v3'/><rect height='6' rx='1.5' width='4' x='3.5' y='14'/><rect height='6' rx='1.5' width='4' x='16.5' y='14'/></symbol>
<symbol id='i-eye' viewBox='0 0 24 24'><path d='M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z'/><circle cx='12' cy='12' r='3'/></symbol>
<symbol id='i-sliders' viewBox='0 0 24 24'><path d='M4 7h9M17 7h3M4 17h3M11 17h9'/><circle cx='15' cy='7' r='2'/><circle cx='9' cy='17' r='2'/></symbol>
<symbol id='i-bolt' viewBox='0 0 24 24'><path d='M13 3 5 13.5h6L10 21l8-10.5h-6Z'/></symbol>
<symbol id='s-wa' viewBox='0 0 24 24'><path d='M4.5 19.5 5.6 16A8 8 0 1 1 8.4 18.6Z'/><path d='M9.2 8.6c.2 2.6 3.6 6 6.2 6.2l1.1-1.3-1.7-.9-.8.8c-1-.4-2.3-1.7-2.7-2.7l.8-.8-.9-1.7Z'/></symbol>
<symbol id='s-tg' viewBox='0 0 24 24'><path d='M3.5 11.4 20 4.5l-2.8 15-5.4-4-2.6 2.4.3-3.8 7-6.3-8.8 5.1Z'/></symbol>
<symbol id='s-x' viewBox='0 0 24 24'><path d='M5 4.5h3.7l10.3 15h-3.7ZM18.6 4.5 13.3 10.6M5.4 19.5l5.5-6.3'/></symbol>
<symbol id='s-fb' viewBox='0 0 24 24'><path d='M14.5 20.5v-7h2.4l.4-3h-2.8V8.8c0-.9.3-1.5 1.5-1.5h1.4V4.6a18 18 0 0 0-2-.1c-2.1 0-3.6 1.3-3.6 3.6v2.4H9.5v3h2.3v7'/></symbol>
<symbol id='s-ig' viewBox='0 0 24 24'><rect height='16' rx='4.5' width='16' x='4' y='4'/><circle cx='12' cy='12' r='3.6'/><path d='M16.8 7.2h.01'/></symbol>
<symbol id='s-yt' viewBox='0 0 24 24'><rect height='13' rx='4' width='19' x='2.5' y='5.5'/><path d='m10.2 9.3 4.6 2.7-4.6 2.7Z'/></symbol>
<symbol id='s-gh' viewBox='0 0 24 24'><path d='M9 19.5c-4 1.2-4-2-5.5-2.5M14.5 21v-3.4a3 3 0 0 0-.8-2.3c2.7-.3 5.5-1.3 5.5-6a4.7 4.7 0 0 0-1.3-3.2 4.3 4.3 0 0 0-.1-3.2s-1-.3-3.4 1.3a11.6 11.6 0 0 0-6 0C6 2.6 5 2.9 5 2.9a4.3 4.3 0 0 0-.1 3.2A4.7 4.7 0 0 0 3.6 9.3c0 4.6 2.8 5.7 5.5 6a3 3 0 0 0-.8 2.3V21'/></symbol>
</svg>"""

SOC = [("فيسبوك", "https://www.facebook.com/saged.t", "fb"), ("إنستغرام", "https://www.instagram.com/sajedd.0", "ig"),
       ("إكس", "https://x.com/saged_al", "x"), ("يوتيوب", "https://www.youtube.com/@sajed0", "yt"),
       ("جيت هب", "https://github.com/Dev-saged", "gh"), ("واتساب", "https://wa.me/972597857250", "wa"),
       ("تيليجرام", "https://t.me/+972597857250", "tg")]
socials = "<ul class='socials'>" + "".join(
    "<li><a aria-label='%s' href='%s' rel='noopener me' target='_blank'><svg class='ico'><use href='#s-%s'/></svg></a></li>" % s for s in SOC) + "</ul>"
socials_html = socials.replace("'", '"')

sys.path.insert(0, B)
import schema as SCH, json
SETTINGS = SCH.settings_text()
SELMAP = {k: x for g in SCH.GROUPS for (k, y, v, t, dd, x) in g[3] if isinstance(x, str)}
xesc = lambda z: z.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

def links(items):
    out = []
    for i, (name, href) in enumerate(items):
        out.append("<b:widget-setting name='link-%d'>%s</b:widget-setting><b:widget-setting name='text-%d'>%s</b:widget-setting>" % (i, href, i, name))
    return "\n          ".join(out)
lab = lambda s: "/search/label/" + urllib.parse.quote(s)
NAV = [("الرئيسية", "/"), ("الذكاء الاصطناعي", lab("ذكاء اصطناعي")), ("أخبار التقنية", lab("أخبار")),
       ("تطبيقات وأدوات", lab("تطبيقات")), ("الإنترنت", lab("أنترنت")), ("مقالات", lab("مقالات"))]
PAGES = [("من نحن", "/p/about.html"), ("سياسة التحرير", "/p/editorial-policy.html"), ("سياسة الخصوصية", "/p/privacy-policy.html"),
         ("إخلاء المسؤولية", "/p/disclaimer.html"), ("اتصل بنا", "/p/contact-us.html")]
SECS = NAV[1:]

ABOUT = "<p>TCNOPS منصة عربية مستقلة تتابع أخبار الذكاء الاصطناعي والتقنية والتطبيقات والأمن الرقمي، بتغطية موثّقة وشروحات عملية.</p>" + socials_html
FOOTABOUT = "<p>أخبار التقنية والذكاء الاصطناعي بلغة عربية واضحة، من غزة إلى العالم العربي.</p>" + socials_html

def ad(m):
    sid, name, wid, cls, move, where = m.group(1), m.group(2), m.group(3), m.group(4), m.group(5), m.group(6)
    attrs = ""
    if move: attrs += " data-move='%s' data-only='1'" % move
    if where: attrs += " data-where='%s'" % where
    return """<div class='zone'%s id='%s'>
<b:section class='zone-s' id='%s-s' name='%s' showaddelement='yes'>
  <b:widget id='%s' locked='false' title='' type='HTML' version='1' visible='true'>
    <b:widget-settings><b:widget-setting name='content'/></b:widget-settings>
    <b:includable id='main'><b:if cond='data:content != &quot;&quot;'><div class='adbox %s'><span class='adl'>إعلان</span><data:content/></div></b:if></b:includable>
  </b:widget>
</b:section>
</div>""" % (attrs, sid, sid, name, wid, cls)
t = re.sub(r"\{\{AD:([^:]+):([^:]+?: [^:]+):([^:]+):([^:]*):([^:]*):([^:}]*)\}\}", ad, t)

def hsec(m):
    wid, title, label = m.group(1), m.group(2), m.group(3)
    return """<b:widget id='%s' locked='false' title='%s' type='HTML' version='1' visible='true'>
        <b:widget-settings><b:widget-setting name='content'>%s</b:widget-setting></b:widget-settings>
        <b:includable id='main'>
          <b:if cond='data:blog.url == data:blog.homepageUrl and data:content != &quot;&quot;'>
            <section class='hsec' expr:data-hsec='data:content' data-n='4'>
              <div class='wh'><h2><data:title/></h2><a expr:href='data:blog.homepageUrl + &quot;search/label/&quot; + data:content'>عرض الكل <svg class='ico ico-s flip'><use href='#i-next'/></svg></a></div>
              <div class='hgrid'/>
            </section>
          </b:if>
        </b:includable>
      </b:widget>""" % (wid, title, label)
t = re.sub(r"\{\{HSEC:([^:]+):([^:]+):([^}]+)\}\}", hsec, t)

blogx = rd("src/blog.xml").replace("{{SOCIALS}}", socials)
for a, b in [("'img'", "'tcnImg'"), ("'lbl'", "'tcnLbl'"), ("'meta'", "'tcnMeta'"), ("'row'", "'tcnRow'"), ("'full'", "'tcnFull'")]:
    blogx = blogx.replace("id=" + a, "id=" + b).replace("name=" + a, "name=" + b)

css = rd("src/style.css") + "\n.tcn-panel{display:none}\n"
for k, v in {"{{CSS}}": css, "{{SPRITE}}": SPRITE, "{{SETTINGS}}": SETTINGS, "{{NAVLINKS}}": links(NAV),
             "{{PAGELINKS}}": links(PAGES), "{{SECLINKS}}": links(SECS), "{{ABOUT}}": ABOUT, "{{FOOTABOUT}}": FOOTABOUT,
             "{{BLOG}}": blogx, "{{CMT}}": cmt, "{{APP}}": rd("src/app.js").replace("  localizeTimes(d);\n  h.classList.add(\"js\");", rd("src/archive.js") + "\n  localizeTimes(d);\n  h.classList.add(\"js\");"), "{{I18N}}": rd("src/i18n.js"), "{{EARLY}}": rd("src/early.js"), "{{SEL}}": xesc(json.dumps(SELMAP, ensure_ascii=False)), "{{SCHEMA}}": xesc(SCH.schema_json())}.items():
    assert k in t, k
    t = t.replace(k, v)
assert "أرشيف المقالات" in t, "archive not injected"
t = t.replace("{{VER}}", SCH.VERSION)
assert "{{" not in t, re.findall(r"\{\{[^}]*\}\}", t)[:3]
io.open(B + "dist/TCNOPS-2026.xml", "w", encoding="utf-8").write(t)
print("built", len(t))
