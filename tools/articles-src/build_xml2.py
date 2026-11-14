import sys, re, html, os
sys.path.insert(0, '/home/claude/bloger/tools/articles-src')
import a1, a2, a3, a4, b1, b2, b3
from bidi import wrap
from xml.sax.saxutils import escape

SHA = sys.argv[1]
CDN = f'https://cdn.jsdelivr.net/gh/Dev-saged/bloger@{SHA}/images/articles/'
A = b1.B + b2.B
T = {a['slug']: a['title'] for a in a1.A + a2.A + a3.A + a4.A}
T.update({a['slug']: a['title'] for a in A})
for a in A:
    for r in a['related']:
        assert r in T, (a['slug'], r)

def fig(slug, kind, alt, cap=None, first=False):
    src = f'{CDN}{slug}-{kind}.jpg'
    c = f'<figcaption>{html.escape(cap)}</figcaption>' if cap else ''
    fp = ' fetchpriority="high"' if first else ' loading="lazy"'
    return (f'<figure style="margin:0 0 1.2em;text-align:center"><img src="{src}" alt="{html.escape(alt)}" width="1200" height="630" '
            f'style="max-width:100%;height:auto;border-radius:18px"{fp}/>{c}</figure>')

def body(a):
    s = a['slug']
    parts = [f'<p><strong>الخلاصة السريعة:</strong> {a["tldr"]}</p>', a['intro'], fig(s, 'cover', a['title'], first=True)]
    for i, (h, t) in enumerate(a['sections']):
        parts.append(f'<h2>{h}</h2>{t}')
        if i == 1:
            parts.append(fig(s, 'info', a['infotitle'] + ' — سبورت لايف 24', cap=a['infotitle']))
    h, t = b3.E[s]
    parts.append(f'<h2>{h}</h2>{t}')
    faq = ''.join(f'<h3>{q}</h3><p>{an}</p>' for q, an in a['faq'])
    parts.append(f'<h2>أسئلة شائعة</h2>{faq}')
    parts.append(f"<h2>الخلاصة</h2>{a['outro']}")
    if a['sources']:
        li = ''.join(f'<li><a href="{u}" rel="noopener nofollow" target="_blank">{html.escape(n)}</a></li>' for n, u in a['sources'])
        parts.append(f'<h2>المصادر</h2><ul>{li}</ul><p><em>آخر مراجعة للمعلومات: 14 نوفمبر 2026. الأرقام الجارية (جداول الدوريات) تتغير مع كل جولة.</em></p>')
    else:
        parts.append('<p><em>شرح عام يستند إلى معرفة متداولة في تحليل كرة القدم، والأرقام المحددة قابلة للتحديث. آخر مراجعة: 14 نوفمبر 2026.</em></p>')
    rel = ''.join(f'<li><a href="/2026/11/{r}.html">{html.escape(T[r])}</a></li>' for r in a['related'])
    parts.append(f'<h2>اقرأ أيضاً</h2><ul>{rel}</ul>')
    return wrap(''.join(parts))

def entry(i, a):
    mm = 2 * i
    ts = f'2026-11-14T10:{mm:02d}:00.000+02:00'
    cats = ''.join(f"<category scheme='http://www.blogger.com/atom/ns#' term='{escape(l)}'/>" for l in a['labels'])
    return f'''<entry>
<id>tag:blogger.com,1999:blog-8100000000000000001.post-{4200000000000000000 + i}</id>
<published>{ts}</published>
<updated>{ts}</updated>
<category scheme='http://schemas.google.com/g/2005#kind' term='http://schemas.google.com/blogger/2008/kind#post'/>
{cats}
<title type='text'>{escape(a['title'])}</title>
<content type='html'>{escape(body(a))}</content>
<author><name>ساجد العبادلة</name></author>
<blogger:type>POST</blogger:type>
<blogger:status>LIVE</blogger:status>
<blogger:filename>/2026/11/{a['slug']}.html</blogger:filename>
<blogger:metaDescription>{escape(a['desc'])}</blogger:metaDescription>
</entry>'''

src = open('/home/claude/bloger/tools/articles-src/build_xml.py', encoding='utf8').read()
head = src[src.index("head = '''") + 10: src.index("'''\nout =")]
head = head.replace('2026-11-12T19:40:00.000+02:00', '2026-11-14T11:00:00.000+02:00')
out = head + '\n'.join(entry(i, a) for i, a in enumerate(A)) + '\n</feed>\n'
path = '/home/claude/bloger/articles/sport-live-24-articles-batch-2.xml'
open(path, 'w', encoding='utf8').write(out)
tot = []
for a in A:
    n = len(re.sub('<[^>]+>', ' ', body(a)).split()); tot.append((n, a['slug']))
print('articles', len(A), 'min', min(tot), 'avg', sum(n for n, _ in tot) // len(tot), 'bytes', len(out.encode('utf8')))
print(sorted(tot)[:8])
